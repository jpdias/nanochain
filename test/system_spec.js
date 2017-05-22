const supertest = require('supertest');
const should = require('should');
const shell = require('shelljs');

before(() => {
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
  if (shell.exec('sleep 2').code !== 0) {
    shell.echo('Error: sleep');
    shell.exit(1);
  }
});

after(() => {
  console.log('Global teardown:');
  if (shell.exec('docker-compose -f docker-compose.yaml down --rmi all').code !== 0) {
    shell.echo('Error: docker-compose down failed');
    shell.exit(1);
  }
});

/*describe('Get snapshot', () => {
  it('should return empty snapshot (first one)', (done) => {
    server
  .get('/snapshot')
  .expect('Content-type', /json/)
  .expect(200) // THis is HTTP response
  .end((err, res) => {
    if (err) done(err);
    res.body.should.be.an.Array();
    res.body.should.be.deepEqual([]);
    done();
  });
  });
});*/

const addrules = (server, rules) => {
  describe('Add access rules', () => {
    it('should respond with 200', (done) => {
      server
        .post('/addRules')
        .send(rules)
        .expect(200)
        .end((err, res) => {
          console.log(res.body);
          if (err) done(err);
          else done();
        });
    });
  });
};


const commitRules = (server) => {
  describe('Get commitRules', () => {
    it('should commit new rules', (done) => {
      server
      .get('/commitRules')
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        console.log(res.body);
        if (err) done(err);
        else done();
      });
    });
  });
};


const snapshot = (server, rules) => {
  describe('Get snapshot', () => {
    it('should return snapshot', (done) => {
      server
    .get('/snapshot')
    .expect('Content-type', /json/)
    .expect(200) // THis is HTTP response
    .end((err, res) => {
      console.log(res.body);
      if (err) done(err);
      else done();
    });
    });
  });
};

const addrule = (server, rule) => {
  describe('Add access rule', () => {
    it('should respond with 200', (done) => {
      server
      .post('/addRule')
      .send(rule)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        if (err) done(err);
        else done();
      });
    });
  });
};

const commitrule = (server) => {
  describe('Get commitRule', () => {
    it('should commit new rule', (done) => {
      server
      .get('/commitRules')
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        console.log(res.body);
        if (err) done(err);
        else done();
      });
    });
  });
};

const snapshot2 = (rules, rule, server) => {
  describe('Get snapshot', () => {
    it('should return snapshot with changed rule', (done) => {
      server
    .get('/snapshot')
    .expect('Content-type', /json/)
    .expect(200) // THis is HTTP response
    .end((err, res) => {
      if (err) return done(err);
      res.body.should.not.be.containDeep(rules);
      res.body.should.be.containDeep([rule]);
      return done();
    });
    });
  });
};

for (let i = 0; i < 3; i += 1) {
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

  const server = supertest.agent(`http://localhost:${1337 + i}`);

  addrules(server, rules);

  commitRules(server);

  snapshot(server, rules);

  addrule(server, rule);

  commitrule(server);

  snapshot2(rules, rule, server);
}

