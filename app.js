const request = require('request');
const rp = require('request-promise');

let serverMineUrl = "http://localhost:3001/mineBlock"
let serverBlocks = "http://localhost:3001/blocks"
let batch = [];

const PermissionLevel = {
    NONE: 0,
    READ: 1,
    WRITE: 2,
    READWRITE: 3
};

class Permission {
    constructor(entity, level, resource) {
        this.entity = entity;
        this.level = level;
        this.resource = resource;
    }
}

const addPermission = (entity,level,resource) => {
    batch.push(
        new Permission(entity,level,resource)
    )
}

const commitBatch = () => {
    request.post(
        serverMineUrl,
        { json: { data: batch } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(`OK ${ response.statusCode }`)
            } else {
                console.log(`NOT OK ${ response.statusCode } : ${ body }`)
            }
        }
    );
}

addPermission('xA',PermissionLevel.READ,'rA');
addPermission('xA',PermissionLevel.READ,'rB');
addPermission('xB',PermissionLevel.READ,'rA');
commitBatch();

// Snapshots


var options = {
    uri: serverBlocks,
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};



const getSnapshot = () => {

    rp(options)
        .then(function (blocks) {
            for (let id in blocks) {
                console.log(blocks[id].data)
            }
        })
        .catch(function (err) {
            // API call failed...
        });
}

getSnapshot();