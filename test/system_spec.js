const supertest = require('supertest');
const should = require('should');
const shell = require('shelljs');

const logFile = 'docker-logs.log';

const numOfNodes = 3;
const clientStartPort = 1337;

before((done) => {
  console.log('Global setup:');

  if (!shell.which('docker')) {
    shell.echo('Sorry, this script requires docker');
    shell.exit(1);
  }
  if (!shell.which('docker-compose')) {
    shell.echo('Sorry, this script requires docker-compose');
    shell.exit(1);
  }
  if (shell.exec('docker-compose -f docker-compose.yaml up -d').code !== 0) {
    shell.echo('Error: docker-compose down failed');
    shell.exit(1);
  } else {
    shell.echo('Docker-compose running.');
  }
  setTimeout(() => {
    shell.exec(`docker-compose logs -f -t --no-color > ${logFile}`, { async: true });
    done();
  }, 5000);
});

after(() => {
  console.log('Global teardown:');
  if (shell.exec('docker-compose -f docker-compose.yaml down --rmi all').code !== 0) {
    shell.echo('Error: docker-compose down failed');
    shell.exit(1);
  }
});

const isAlive = (server, node) => {
  describe(`Check server is alive (ping): ${node}`, () => {
    it('should respond with pong', (done) => {
      server
      .get('/ping')
      .expect('Content-type', /text/)
      .expect(200)
      .end((err, res) => {
        if (err) done(err);
        else {
          res.text.should.equal('pong');
          done();
        }
      });
    });
  });
};

const addrules = (server, rules, node) => {
  describe(`Add access rules: ${node}`, () => {
    it('should respond with 200', (done) => {
      server
      .post('/addRules')
      .send(rules)
      .expect(200)
      .end((err) => {
        if (err) done(err);
        else done();
      });
    });
  });
};


const commitRules = (server, node) => {
  describe(`Get commitRules: ${node}`, () => {
    it('should commit new rules', (done) => {
      server
      .get('/commitRules')
      .expect(200) // THis is HTTP response
      .end((err) => {
        if (err) done(err);
        else done();
      });
    });
  });
};


const snapshot = (server, rules, node) => {
  describe(`Get snapshot: ${node}`, () => {
    it('should return snapshot', (done) => {
      server
      .get('/snapshot')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        if (err) done(err);
        else {
          res.body.should.be.containDeep(rules);
          done();
        }
      });
    });
  });
};

const addrule = (server, rule, node) => {
  describe(`Add access rule: ${node}`, () => {
    it('should respond with 200', (done) => {
      server
      .post('/addRule')
      .send(rule)
      .expect(200)
      .end((err) => {
        if (err) done(err);
        else done();
      });
    });
  });
};

const commitrule = (server, node) => {
  describe(`Get commitRule: ${node}`, () => {
    it('should commit new rule', (done) => {
      server
      .get('/commitRules')
      .expect(200) // THis is HTTP response
      .end((err) => {
        if (err) done(err);
        else done();
      });
    });
  });
};

const snapshot2 = (rules, rule, server, node) => {
  describe(`Get snapshot: ${node}`, () => {
    it('should return snapshot with changed rule', (done) => {
      server
      .get('/snapshot')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        if (err) done(err);
        else {
          res.body.should.not.be.containDeep(rules);
          res.body.should.be.containDeep([rule]);
          done();
        }
      });
    });
  });
};

for (let i = 0; i < numOfNodes; i += 1) {
  const rules = [
    { entity: `entityA${i}`,
      level: 1,
      resource: `serverA${i}` },
    { entity: `entityB${i}`,
      level: 3,
      resource: `serverB${i}` },
    { entity: `entityC${i}`,
      level: 2,
      resource: `serverC${i}` },
  ];

  const rule = {
    entity: `entityA${i}`,
    level: 0,
    resource: `serverA${i}`,
  };

  const server = supertest.agent(`http://localhost:${clientStartPort + i}`);

  isAlive(server, `node${i}`);

  addrules(server, rules, `node${i}`);

  commitRules(server, `node${i}`);

  snapshot(server, rules, `node${i}`);

  addrule(server, rule, `node${i}`);

  commitrule(server, `node${i}`);

  snapshot2(rules, rule, server, `node${i}`);
}

