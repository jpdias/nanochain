const request = require('request');
const rp = require('request-promise');

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
        } else {
          console.log(`NOT OK ${response.statusCode} : ${body}`);
        }
      });
  } else {
    console.log('Empty batch.');
  }
};

// addPermission('xA', PermissionLevel.READ, 'rA');
// addPermission('xA', PermissionLevel.READ, 'rB');
addPermission('xB', PermissionLevel.READ, 'rA');
addPermission('xA', PermissionLevel.NONE, 'rB');
addPermission('xA', PermissionLevel.NONE, 'rB');
addPermission('xA', PermissionLevel.NONE, 'rB');
addPermission('xA', PermissionLevel.READ, 'rB');
addPermission('xC', PermissionLevel.READ, 'rA');
// addPermission('xA', PermissionLevel.READWRITE, 'rB');
commitBatch();

// Snapshots

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

Promise.resolve(getSnapshot()).then(x => console.log(x));

