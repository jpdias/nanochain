const supertest = require('supertest');
const should = require('should');

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

describe('Get snapshot', () => {
  it('should return snapshot', (done) => {
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
