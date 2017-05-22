const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const snapshots = require('./snapshots.js');

const httpPort = process.env.HTTP_PORT || 1337;

const serverMineUrl = `${process.env.SERVER}/mineBlock` || 'http://localhost:3001/mineBlock';

class Permission {
  constructor(entity, level, resource) {
    this.entity = entity;
    this.level = level;
    this.resource = resource;
  }
}

let batch = [];

const PermissionLevel = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  READWRITE: 3,
};

const isValidPermission = (entity, level, resource) => {
  if (entity === null || level === null || resource === null) {
    return false;
  } else if (level !== PermissionLevel.NONE &&
           level !== PermissionLevel.READ &&
           level !== PermissionLevel.WRITE &&
           level !== PermissionLevel.READWRITE) {
    return false;
  }
  return true;
};

const addPermission = (entity, level, resource) => {
  batch = batch.filter((obj) => {
    if (obj.entity === entity && obj.resource === resource) {
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
      (error, response) => {
        if (!error && response.statusCode === 200) {
          batch = [];
          console.log(`OK ${response.statusCode}`);
          return true;
        }
        console.log(`NOT OK ${response.statusCode}`);
        return false;
      });
  } else {
    console.log('Empty batch.');
  }
};

const initHttpServer = () => {
  const app = express();
  app.use(bodyParser.json());

  /* Add permission */
  app.post('/addRule', (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.status(400).json({ err: 'Empty request.' });
    }
    console.log(req.body);
    if (isValidPermission(req.body.entity, req.body.level, req.body.resource)) {
      addPermission(req.body.entity, req.body.level, req.body.resource);
      res.send();
    } else {
      res.status(400).json({ err: 'Invalid rule.' });
    }
  });

  /* Add array of permissions */
  app.post('/addRules', (req, res) => {
    const tempPermissions = [];
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.status(400).json({ err: 'Empty request.' });
      return;
    }
    req.body.forEach((rule) => {
      if (!isValidPermission(rule.entity, rule.level, rule.resource)) {
        res.status(400).json({ err: 'Invalid rule(s).' });
      } else {
        tempPermissions.push(rule);
      }
    });

    tempPermissions.forEach(rule => addPermission(rule.entity, rule.level, rule.resource));
    console.log(batch);
    res.send();
  });

  /* Get batch content */
  app.get('/currentRules', (req, res) => {
    res.json(batch);
  });

  /* Commit batch rules */
  app.get('/commitRules', (req, res) => {
    if (commitBatch()) {
      res.json({ msg: 'OK' });
    } else {
      res.status(400).json({ err: 'Can not commit.' });
    }
  });

  /* Make and return snapshot */
  app.get('/snapshot', (req, res) => {
    Promise.resolve(snapshots.getSnapshot()).then((snapshot) => {
      console.log(snapshot);
      res.json(snapshot);
    });
  });

  /* Get Blocks of Snapshot blockchain */
  app.get('/getSnapshotChain', (req, res) => {
    res.json(snapshots.getSnapshotChain);
  });

  /* Is Up? */
  app.get('/ping', (req, res) => {
    res.send('pong');
  });

  /* Open server */
  app.listen(httpPort, () => console.info(`Listening http on port: ${httpPort}`));
};

initHttpServer();
