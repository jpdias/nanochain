/* logic */

const TransactionType = Object.freeze({
  REQUEST: Symbol('request'),
  REQUIRE: Symbol('require'),
  AUTH_OK: Symbol('auth-ok'),
  AUTH_DENY: Symbol('auth-deny'),
  ALLOW: Symbol('allow'),
  DENY: Symbol('deny'),
  REVOKE: Symbol('revoke'),
});

class Document {
  constructor(id, data, owner) {
    this._id = id;
    this._data = data;
    this._owner = owner;
  }
  getId() {
    return this._id;
  }
}

class Entity {
  constructor(id) {
    this._id = id;
  }
}

const store = [
  { doc: new Document('doc1', 'payload', new Entity('uid20')),
    keepers: [new Entity('uid20'), new Entity('uid21'), new Entity('uid22')] },
  { doc: new Document('doc2', 'payload', new Entity('uid30')),
    keepers: [new Entity('uid30'), new Entity('uid31')] },
  { doc: new Document('doc3', 'payload', new Entity('uid40')),
    keepers: [new Entity('uid40')] },
];

class Transaction {
  constructor(details) {
    this._type = details.type;
    this._document = details.document;
    this._thirdEntity = details.thirdEntity;
    if (details.keepers !== undefined) {
      this._keepers = details.keepers;
    }
  }
  applyTransaction() {
    switch (this.type) {
      case TransactionType.REQUEST:
        return this.applyRequest();
      case TransactionType.REQUIRE:
        return this.applyRequire();
      case TransactionType.ALLOW:
        return this.applyAllow();
      case TransactionType.DENY:
        return this.applyDeny();
      case TransactionType.AUTH:
        return this.applyAuth();
      case TransactionType.REVOKE:
        return this.applyRevoke();
      default:
        return this;
    }
  }
  applyRequire() {
    let tempTransactions = [];
    store.forEach(function (element) {
      if (element.doc.getId() === this._document) {
        tempTransactions = this._keepers;
        console.log();
      }
    }, this);

    return new Transaction({
      type: TransactionType.REQUIRE,
      document: this._document,
      thirdEntity: this._thirdEntity,
      keepers: tempTransactions,
    });
  }
  applyAuth() {
    return this;
  }
  applyAllow() {
    return this;
  }
  applyDeny() {
    return this;
  }
  applyRevoke() {
    return this;
  }
}

const x1 = new Transaction({
  type: TransactionType.REQUEST,
  document: 'doc1',
  entity: new Entity('uid990'),
});

const x2 = new Transaction({
  type: TransactionType.REQUIRE,
  document: 'doc1',
  thirdEntity: new Entity('uid990'),
  keepers: [new Entity('uid1000'), new Entity('uid1001')],
});

const x3 = [new Transaction({
  type: TransactionType.ALLOW,
  document: 'doc1',
  thirdEntity: new Entity('uid990'),
  keepers: [new Entity('uid1000')],
}),
  new Transaction({
    type: TransactionType.ALLOW,
    document: 'doc1',
    thirdEntity: new Entity('uid990'),
    keepers: [new Entity('uid1001')],
  })];

const x4 = new Transaction({
  type: TransactionType.AUTH_GRANTED,
  document: 'doc1',
  thirdEntity: new Entity('uid990'),
});

const x5 = new Transaction({
  type: TransactionType.REVOKE,
  document: 'doc1',
  thirdEntity: new Entity('uid990'),
  keepers: [new Entity('uid1001')],
});

console.log(x1);
console.log(x1.applyTransaction());
console.log(x2);

x2.applyTransaction = x3;

x3.applyTransactions = x4;

x4.applyTransaction = x5;
