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
      //Document id
      this._id = id;
      //Document data
      this._data = data;
      //Document owner
      this._owner = owner;
      //Document responsible entities
      this._keepers = [];
      //Consensus flag: ALL, MAJORITY, ONE, N...
      this._CONSENSUS;
    }
    //Gets document id
    getId() {
      return this._id;
    }
    //Sets document keepers
    setKeepers(keepers) {
      this._keepers = [keepers];
    }
    //Gets document keepers
    getKeepers() {
      return this._keepers;
    }
  }

  class Entity {
    constructor(id) {
      this._id = id;
    }
  }

  var uid20 = new Entity('uid20');
  var uid21 = new Entity('uid21');
  var uid22 = new Entity('uid22');
  var uid30 = new Entity('uid30');
  var uid31 = new Entity('uid31');
  var uid40 = new Entity('uid40');
  var uid990 = new Entity('uid990');
  var doc1 = new Document('doc1', 'payload', uid20);
  var doc2 = new Document('doc2', 'payload', uid30);
  var doc3 = new Document('doc3', 'payload', uid40);
  const store = [
    { doc: doc1 },
    // keepers: [new Entity('uid20'), new Entity('uid21'), new Entity('uid22')] },
    { doc: doc2 },
    // keepers: [new Entity('uid30'), new Entity('uid31')] },
    { doc: doc3 },
    // keepers: [ent] },
  ];

  var settingKeepers = function (docID, keepers) {
    store.forEach(function (element) {
      if (element.doc.getId() === docID) {
        element.doc.setKeepers(keepers);
      }
    });
  }(doc3.getId(), [uid40,uid30,uid31]);

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
      switch (this._type) {
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
    applyRequest() {
      let tempTransactions = [];
      store.forEach(function (element) {
        if (element.doc.getId() === this._document.getId()) {
          tempTransactions = element.doc.getKeepers();
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
    equals(anotherTransaction){
      if(this._type === anotherTransaction._type && 
          this._document === anotherTransaction._document && 
            this._thirdEntity === anotherTransaction._thirdEntity && 
              this._keepers === anotherTransaction._keepers){
                return true;
              }
      return false;
    }
  }

  const x1 = new Transaction({
    type: TransactionType.REQUEST,
    document: doc3,
    thirdEntity: uid990,
  });

  // x1._document.setKeepers(([new Entity('uid40')]));

  const x2 = new Transaction({
    type: TransactionType.REQUIRE,
    document: doc3,
    thirdEntity: uid990,
    keepers: doc3.getKeepers(),
  });

  /* const x3 = [new Transaction({
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
  }); */

/*   console.log("X1")
  console.log(x1);
  console.log("X1.apllytransaction")
  console.log(x1.applyTransaction());
  console.log("X2")
 */
  console.log(x1.applyTransaction().equals(x2));

        /* x2.applyTransaction = x3;

        x3.applyTransactions = x4;

        x4.applyTransaction = x5;
        */