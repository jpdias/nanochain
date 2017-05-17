const request = require('request');
const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');

const httpPort = process.env.HTTP_PORT || 1337;

const serverMineUrl = 'http://localhost:3001/mineBlock';
const serverBlocks = 'http://localhost:3001/blocks';

let batch = [];

const PermissionLevel = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  READWRITE: 3,
};

class Permission {
  constructor(entity, level, resource) {
    this.entity = entity;
    this.level = level;
    this.resource = resource;
  }
}

const addPermission = (entity, level, resource) => {
  if (entity === null || level === null || resource === null) {
    return false;
  }
  batch = batch.filter((obj) => {
    if (
            obj.entity === entity &&
            obj.resource === resource
        ) {
      return false;
    }
    return true;
  });
  batch.push(new Permission(entity, level, resource));
  return true;
};

const commitBatch = () => {
  if (batch.length !== 0) {
    request.post(
      serverMineUrl,
      { json: { data: batch } }, // not allow equal ops
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          batch = [];
          console.log(`OK ${response.statusCode}`);
          return true;
        }
        console.log(`NOT OK ${response.statusCode} : ${body}`);
        return false;
      });
  } else {
    console.log('Empty batch.');
  }
};

const requestBlocks = {
  uri: serverBlocks,
  headers: { 'User-Agent': 'Request-Promise' },
  json: true, // Automatically parses the JSON string in the response
};


const getSnapshot = async () => {
  const blocks = await rp(requestBlocks);

  let snapshot = [];
  for (let j = 0; j < blocks.length; j += 1) {
    const currentBlock = blocks[j].data;
    for (let k = 0; k < currentBlock.length; k += 1) {
      const newSnapshot = snapshot.filter((obj) => {
        if (
            obj.entity === currentBlock[k].entity &&
            obj.resource === currentBlock[k].resource
        ) {
          return false;
        }
        return true;
      });
      newSnapshot.push(currentBlock[k]);
      snapshot = newSnapshot;
    }
  }
  return snapshot;
};


const initHttpServer = () => {
  const app = express();
  app.use(bodyParser.json());

  app.post('/addRule', (req, res) => {
    console.log(req.body);
    if (addPermission(req.body.entity, req.body.level, req.body.resource)) {
      res.send();
    } else {
      res.status(400).send('Bad Request');
    }
  });

  app.post('/addRules', (req, res) => {
    req.body.forEach(rule => addPermission(rule.entity, rule.level, rule.resource));
    res.send();
  });

  app.get('/currentRules', (req, res) => {
    res.json(batch);
  });

  app.get('/commitRules', (req, res) => {
    commitBatch();
    res.send();
  });

  app.get('/snapshot', (req, res) => {
    Promise.resolve(getSnapshot()).then((snapshot) => {
      console.log(snapshot);
      res.json(snapshot);
    });
  });

  /* Open server */
  app.listen(httpPort, () => console.info(`Listening http on port: ${httpPort}`));
};

initHttpServer();
