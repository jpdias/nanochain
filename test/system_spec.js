const supertest = require('supertest');
const should = require('should');
const shell = require('shelljs');

const server = supertest.agent('http://localhost:1337');

const rules = [
  { entity: 'FEUP',
    level: 1,
    resource: 'server1' },
  { entity: 'INESC',
    level: 3,
    resource: 'server2' },
  { entity: 'INESC',
    level: 2,
    resource: 'server3' },
];

const rules1 = {
  entity: 'FEUP',
  level: 0,
  resource: 'server1',
};

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
});

after(() => {
  console.log('Global teardown:');
  if (shell.exec('docker-compose -f docker-compose.yaml down --rmi all').code !== 0) {
    shell.echo('Error: docker-compose down failed');
    shell.exit(1);
  }
});


describe('Get snapshot', () => {
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
});

describe('Add access rules', () => {
  it('should respond with 200', (done) => {
    server
      .post('/addRules')
      .send(rules)
      .expect(200)
      .end((err) => {
        if (err) done(err);
        done();
      });
  });
});

describe('Get commitRules', () => {
  it('should commit new rules', (done) => {
    server
    .get('/commitRules')
    .expect(200) // THis is HTTP response
    .end((err, res) => {
      if (err) done(err);
      done();
    });
  });
});

describe('Get snapshot', () => {
  it('should return snapshot', (done) => {
    server
    .get('/snapshot')
    .expect('Content-type', /json/)
    .expect(200) // THis is HTTP response
    .end((err, res) => {
      if (err) done(err);
      res.body.should.be.containDeep(rules);
      done();
    });
  });
});

describe('Add access rule', () => {
  it('should respond with 200', (done) => {
    server
      .post('/addRule')
      .send(rules1)
      .expect(200)
      .end((err) => {
        if (err) done(err);
        done();
      });
  });
});

describe('Get commitRules', () => {
  it('should commit new rule', (done) => {
    server
    .get('/commitRules')
    .expect(200) // THis is HTTP response
    .end((err, res) => {
      if (err) done(err);
      done();
    });
  });
});

describe('Get snapshot', () => {
  it('should return snapshot with changed rule', (done) => {
    server
    .get('/snapshot')
    .expect('Content-type', /json/)
    .expect(200) // THis is HTTP response
    .end((err, res) => {
      if (err) done(err);
      res.body.should.not.be.containDeep(rules);
      res.body.should.be.containDeep([rules1]);
      done();
    });
  });
});
