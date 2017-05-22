const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const fs = require('fs');
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('db.sqlite');

const genesisBlock = require('./genesisBlock.json');

const httpPort = process.env.HTTP_PORT || 3001;
const p2pPort = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// Block Structure
class Block {
  constructor(index, previousHash, nonce, hashMask, timestamp, data, signature, hash) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.nonce = nonce;
    this.timestamp = timestamp;
    this.data = data;
    this.signature = signature.toString();
    this.hash = hash.toString();
    this.hashMask = hashMask.toString();
  }
}

const sockets = [];

const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
};


const saveToDb = async (block) => {
  console.log('Saving to DB.');
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS blocks (id INTEGER PRIMARY KEY, data TEXT)');

    const stmt = db.prepare('INSERT INTO blocks(data) VALUES (?)');
    stmt.run(JSON.stringify(block));
    stmt.finalize();
  });
};

const getGenesisBlock = () => new Block(
  genesisBlock.index,
  genesisBlock.previousHash,
  genesisBlock.nonce,
  genesisBlock.hashMask,
  genesisBlock.timestamp,
  genesisBlock.data,
  genesisBlock.signature,
  genesisBlock.hash);

let blockchain = [];

const initBlockchain = () => new Promise((resolve) => {
  db.serialize(() => {
    db.all('SELECT * FROM blocks', (err, rows) => {
      if (rows !== undefined && rows !== null && rows.length > 0) {
        rows.forEach((row) => {
          blockchain.push(JSON.parse(row.data));
        }, resolve());
      } else {
        const genesis = getGenesisBlock();
        blockchain.push(genesis);
        saveToDb(genesis);
        resolve();
      }
    });
  });
});

const getPrivateKey = () => fs.readFileSync('./resources/keys/private_key.pem', 'utf8');

const saveNewChain = (blocks) => {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS blocks');
    blocks.forEach(block => saveToDb(block));
  });
};

const getLatestBlock = () => blockchain[blockchain.length - 1];

const randomIntInc = (low, high) => Math.floor((Math.random() * ((high - low) + 1)) + low);

const calculateNextHash = (index, previousHash, hashMask, timestamp, data, signature) => {
  let calcHash = '';
  let calcNonce = 0;
  while (!calcHash.startsWith(hashMask)) {
    calcNonce = randomIntInc(0, 999999);
    calcHash = crypto.createHash('sha256').update(index + previousHash + calcNonce + timestamp + data + signature).digest('hex');
  }
  return {
    nonce: calcNonce,
    hash: calcHash };
};

const getSignature = (data) => {
  const sign = crypto.createSign('RSA-SHA256');

  sign.write(data);
  sign.end();

  const privateKey = getPrivateKey();

  return sign.sign(privateKey, 'hex');
};

const generateNextBlock = (blockData) => {
  const previousBlock = getLatestBlock();
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = new Date().getTime() / 1000;
  const signature = getSignature(blockData.toString());
  const nextHash = calculateNextHash(
    nextIndex,
    previousBlock.hash,
    previousBlock.hashMask,
    nextTimestamp,
    blockData,
    signature);

  return new Block(
    nextIndex,
    previousBlock.hash,
    nextHash.nonce,
    previousBlock.hashMask,
    nextTimestamp,
    blockData,
    signature,
    nextHash.hash);
};

const write = (ws, message) => ws.send(JSON.stringify(message));

const broadcast = message => sockets.forEach(socket => write(socket, message));

const queryChainLengthMsg = () => ({
  type: MessageType.QUERY_LATEST,
});

const queryAllMsg = () => ({
  type: MessageType.QUERY_ALL,
});

const responseChainMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(blockchain),
});

const responseLatestMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify([getLatestBlock()]),
});

const closeConnection = (ws) => {
  console.info(`Connection failed to peer: ${ws.url}`);
  sockets.splice(sockets.indexOf(ws), 1);
};

const initErrorHandler = (ws) => {
  ws.on('close', () => closeConnection(ws));
  ws.on('error', () => closeConnection(ws));
};

const calculateHash = (index, previousHash, hashMask, nonce, timestamp, data, signature) => {
  const hash = crypto.createHash('sha256').update(index + previousHash + nonce + timestamp + data + signature).digest('hex');
  return hash;
};

const calculateHashForBlock = block => calculateHash(
  block.index,
  block.previousHash,
  block.hashMask,
  block.nonce,
  block.timestamp,
  block.data,
  block.signature);

const isValidNewBlock = (newBlock, previousBlock) => {
  const today = new Date();
  today.setHours(today.getHours() + 2);

  if (previousBlock.index + 1 !== newBlock.index) {
    console.error('Invalid index.');
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.error('Invalid previoushash.');
    return false;
  } else if (previousBlock.timestamp >= newBlock.timestamp) {
    console.error('Invalid timestamp.');
    return false;
  } else if (newBlock.timestamp >= (today.getTime() / 1000)) {
    console.error('Invalid timestamp. Too far in future.');
    return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    console.info(`Types: ${typeof (newBlock.hash)} -- ${typeof calculateHashForBlock(newBlock)}`);
    console.error(`Invalid hash: ${calculateHashForBlock(newBlock)} !=  ${newBlock.hash}`);
    return false;
  }
  console.info('Everything is valid.');
  return true;
};

const addBlock = (newBlock) => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    blockchain.push(newBlock);
    saveToDb(newBlock);
  }
};


const isValidChain = (blockchainToValidate) => {
  if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
    return false;
  }
  const tempBlocks = [blockchainToValidate[0]];
  for (let i = 1; i < blockchainToValidate.length; i += 1) {
    if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
      tempBlocks.push(blockchainToValidate[i]);
    } else {
      return false;
    }
  }
  return true;
};

const replaceChain = (newBlocks) => {
  if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
    console.info('Received blockchain is valid. Replacing current blockchain with received blockchain.');
    blockchain = newBlocks;
    saveNewChain(blockchain);
    broadcast(responseLatestMsg());
  } else {
    console.error('Received blockchain invalid.');
  }
};

const handleBlockchainResponse = (message) => {
  const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  const latestBlockHeld = getLatestBlock();
  if (latestBlockReceived.index > latestBlockHeld.index) {
    console.warn(`Blockchain possibly behind. We got: ${latestBlockHeld.index} - Peer got: ${latestBlockReceived.index}`);
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      console.info('We can append the received block to our chain.');
      blockchain.push(latestBlockReceived);
      saveToDb(latestBlockReceived);
      broadcast(responseLatestMsg());
    } else if (receivedBlocks.length === 1) {
      console.info('We have to query the chain from our peer.');
      broadcast(queryAllMsg());
    } else {
      console.info('Received blockchain is longer than current blockchain.');
      replaceChain(receivedBlocks);
    }
  } else {
    console.info('Received blockchain is not longer than received blockchain. Do nothing.');
  }
};

const initMessageHandler = (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.info(`Received message: ${JSON.stringify(message)}`);
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
      default:
        break;
    }
  });
};

const initConnection = (ws) => {
  sockets.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryChainLengthMsg());
};

const connectToPeers = newPeers => new Promise((resolve) => {
  newPeers.forEach((peer) => {
    const ws = new WebSocket(peer);
    ws.on('open', () => initConnection(ws));
    ws.on('error', () => {
      console.error('Connection failed.');
    });
  }, resolve());
});

const initHttpServer = () => {
  const app = express();
  app.use(bodyParser.json());

  /* Get All Blocks */
  app.get('/blocks', (req, res) => res.json(blockchain));

  /* Get Specific Blocks */
  app.get('/blocks/:index', (req, res) => res.json(blockchain[req.params.index]));

  /* Get all from certain id till the end */
  app.get('/blocks/fromId/:index', (req, res) => res.json(blockchain.slice(req.params.index, blockchain.length - 1)));

  /* Mine Recieved Block */
  app.post('/mineBlock', (req, res) => {
    // console.log(req.body);
    const newBlock = generateNextBlock(req.body.data);
    addBlock(newBlock);
    broadcast(responseLatestMsg());
    console.info(`Block added: ${JSON.stringify(newBlock)}`);
    res.send();
  });

  /* Get All Peers */
  app.get('/peers', (req, res) => {
    res.send(sockets.map(s => `${s._socket.remoteAddress} : ${s._socket.remotePort}`));
  });

  /* Add peer to the block */
  app.post('/addPeer', (req, res) => {
    connectToPeers([req.body.peer]);
    res.send();
  });

  /* Open server */
  app.listen(httpPort, () => console.info(`Listening http on port: ${httpPort}`));
};

const initP2PServer = () => new Promise((resolve) => {
  const server = new WebSocket.Server({
    port: p2pPort,
  });
  server.on('connection', ws => initConnection(ws));
  resolve(console.info(`Listening websocket p2p port on: ${p2pPort}`));
});

initBlockchain().then(() => {
  connectToPeers(initialPeers).then(() => {
    initP2PServer().then(() => {
      // console.log(blockchain);
      initHttpServer();
      console.log('Up and running.');
    });
  });
});
