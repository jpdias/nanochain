"use strict";
const crypto = require('crypto');
const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const fs = require('fs');

const genesisBlock = require("./genesisBlock.json");


const http_port = process.env.HTTP_PORT || 3001;
const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(",") : [];

//Block Structure
class Block {
    constructor(index, previousHash, nonce, hashMask, timestamp, data, signature, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.nonce = nonce;
        this.timestamp = timestamp;
        this.data = data;
        this.signatureature = signature;
        this.hash = hash.toString();
        this.hashMask = hashMask.toString();
    }
}

let sockets = [];

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};


const getGenesisBlock = () => {
    return new Block(genesisBlock.index,
        genesisBlock.previousHash,
        genesisBlock.nonce,
        genesisBlock.hashMask,
        genesisBlock.timestamp,
        genesisBlock.data,
        genesisBlock.signature,
        genesisBlock.hash);
};

let blockchain = [getGenesisBlock()];


const initHttpServer = () => {
    let app = express();
    app.use(bodyParser.json());

    app.get("/blocks", (req, res) => res.send(JSON.stringify(blockchain)));
    app.post("/mineBlock", (req, res) => {
        let newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.info(`Block added: ${ JSON.stringify(newBlock) }`);
        res.send();
    });
    app.get("/peers", (req, res) => {
        res.send(sockets.map(s => `${ s._socket.remoteAddress } : ${ s._socket.remotePort }`));
    });
    app.post("/addPeer", (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.info(`Listening http on port: ${ http_port }`));
};


const initP2PServer = () => {
    let server = new WebSocket.Server({
        port: p2p_port
    });
    server.on("connection", ws => initConnection(ws));
    console.info(`Listening websocket p2p port on: ${ p2p_port }`);

};

const initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

const initMessageHandler = (ws) => {
    ws.on("message", (data) => {
        let message = JSON.parse(data);
        console.info(`Received message: ${ JSON.stringify(message) }`);
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

const initErrorHandler = (ws) => {
    let closeConnection = (ws) => {
        console.info(`Connection failed to peer: ${ ws.url }`);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on("close", () => closeConnection(ws));
    ws.on("error", () => closeConnection(ws));
};

const getPrivateKey = () => {
    return fs.readFileSync('keys/private_key.pem', 'utf8');
}

const getSignature = (data) => {
    const sign = crypto.createSign('RSA-SHA256');

    sign.write(data);
    sign.end();

    const privateKey = getPrivateKey();

    return sign.sign(privateKey, 'hex')
}

const generateNextBlock = (blockData) => {
    let previousBlock = getLatestBlock();
    let nextIndex = previousBlock.index + 1;
    let nextTimestamp = new Date().getTime() / 1000;
    let signature = getSignature(blockData);
    let nextHash = calculateNextHash(nextIndex, previousBlock.hash, previousBlock.hashMask, nextTimestamp, blockData, signature);
    return new Block(nextIndex, previousBlock.hash, nextHash.nonce, previousBlock.hashMask, nextTimestamp, blockData, signature, nextHash.hash);
};


const calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.hashMask, block.nonce, block.timestamp, block.data, block.signatureature);
};

const randomIntInc = (low, high) => {
    return Math.floor(Math.random() * (high - low + 1) + low);
};

const calculateHash = (index, previousHash, hashMask, nonce, timestamp, data, signature) => {
    let hash = crypto.createHash('sha256').update(index + previousHash + nonce + timestamp + data + signature).digest('hex');
    return hash;
};


const calculateNextHash = (index, previousHash, hashMask, timestamp, data, signature) => {
    let hash = "";
    let nonce = 0;
    while (!hash.startsWith(hashMask)) {
        nonce = randomIntInc(0, 999999);
        hash = crypto.createHash('sha256').update(index + previousHash + nonce + timestamp + data + signature).digest('hex');
    }
    return {
        "nonce": nonce,
        "hash": hash
    };
};

const addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

const isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.error("Invalid index.");
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.error("Invalid previoushash.");
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.info(`Types: ${ typeof(newBlock.hash) } -- ${ typeof calculateHashForBlock(newBlock) }`);
        console.error(`Invalid hash: ${ calculateHashForBlock(newBlock) } !=  ${ newBlock.hash }`);
        return false;
    } else {
        console.info("Everything is valid.");
        return true;
    }

};

const connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        let ws = new WebSocket(peer);
        ws.on("open", () => initConnection(ws));
        ws.on("error", () => {
            console.error("Connection failed.");
        });
    });
};

const handleBlockchainResponse = (message) => {
    let receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    let latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    let latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.warn(`Blockchain possibly behind. We got: ${ latestBlockHeld.index } - Peer got: ${ latestBlockReceived.index }`);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.info("We can append the received block to our chain.");
            blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.info("We have to query the chain from our peer.");
            broadcast(queryAllMsg());
        } else {
            console.info("Received blockchain is longer than current blockchain.");
            replaceChain(receivedBlocks);
        }
    } else {
        console.info("Received blockchain is not longer than received blockchain. Do nothing.");
    }
};

const replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.info("Received blockchain is valid. Replacing current blockchain with received blockchain.");
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.error("Received blockchain invalid.");
    }
};

const isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }
    let tempBlocks = [blockchainToValidate[0]];
    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

const getLatestBlock = () => blockchain[blockchain.length - 1];

const queryChainLengthMsg = () => ({
    "type": MessageType.QUERY_LATEST
});

const queryAllMsg = () => ({
    "type": MessageType.QUERY_ALL
});

const responseChainMsg = () => ({
    "type": MessageType.RESPONSE_BLOCKCHAIN,
    "data": JSON.stringify(blockchain)
});

const responseLatestMsg = () => ({
    "type": MessageType.RESPONSE_BLOCKCHAIN,
    "data": JSON.stringify([getLatestBlock()])
});

const write = (ws, message) => ws.send(JSON.stringify(message));

const broadcast = (message) => sockets.forEach(socket => write(socket, message));

connectToPeers(initialPeers);
initHttpServer();
initP2PServer();