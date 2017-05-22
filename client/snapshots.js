const crypto = require('crypto');
const rp = require('request-promise');

const serverBlocks = `${process.env.SERVER}/blocks` || 'http://localhost:3001/blocks';

const calculateHash = (index, lastSnapshotHash, lastIndex, lastHash, rules) => crypto.createHash('sha256')
    .update(index + lastSnapshotHash + lastIndex + lastHash + rules).digest('hex');

class BlockchainSnapshot {
  constructor(index, lastSnapshotHash, lastIndex, lastHash, rules) {
    this.index = index;
    this.lastSnapshotHash = lastSnapshotHash;
    this.lastIndex = lastIndex;
    this.lastHash = lastHash;
    this.rules = rules;
    this.hash = calculateHash(index, lastSnapshotHash, lastIndex, lastHash, rules);
  }
}

const requestBlocks = {
  uri: serverBlocks,
  headers: { 'User-Agent': 'Request-Promise' },
  json: true, // Automatically parses the JSON string in the response
};

const snapshots = [new BlockchainSnapshot(0, 0, 0, 0, [])];

const getChainSnapshot = async () => {
  const blocks = await rp(requestBlocks);

  const lastblock = blocks[blocks.length - 1];

  const lastSnapshot = snapshots[snapshots.length - 1];

  let rules = [];
  for (let j = 0; j < blocks.length; j += 1) {
    const currentBlock = blocks[j].data;
    for (let k = 0; k < currentBlock.length; k += 1) {
      const newSnapshot = rules.filter((obj) => {
        if (
            obj.entity === currentBlock[k].entity &&
            obj.resource === currentBlock[k].resource
        ) {
          return false;
        }
        return true;
      });
      newSnapshot.push(currentBlock[k]);
      rules = newSnapshot;
    }
  }

  const newSnapshotBlock = new BlockchainSnapshot(lastSnapshot.index + 1,
                                lastSnapshot.hash,
                                lastblock.index,
                                lastblock.hash,
                                rules);

  snapshots.push(newSnapshotBlock);
  return rules;
};

module.exports = {
  getSnapshot: getChainSnapshot,
  getSnapshotChain: snapshots,
};

