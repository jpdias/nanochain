//Transaction Type
//declare var myTransaction: TransactionType;
//declare var cas TransactionType: ;
//{a: number; b: number | string; c: 'ola' | 'adeus'}
//enum TransactionType {REQUEST, REQUIRE, REVOKE, Auth, Differed};
var Consensus;
(function (Consensus) {
    Consensus[Consensus["ALL"] = 0] = "ALL";
    Consensus[Consensus["MAJORITY"] = 1] = "MAJORITY";
    Consensus[Consensus["ONE"] = 2] = "ONE";
    Consensus[Consensus["ONLY_OWNER"] = 3] = "ONLY_OWNER";
})(Consensus || (Consensus = {}));
;
console.log(TransactionType.REQUEST);
var Entity = /** @class */ (function () {
    function Entity(id) {
        this._id = id;
    }
    return Entity;
}());
var myDocument = /** @class */ (function () {
    function myDocument(id, data, owner, consensus) {
        this._id = id;
        this._data = data;
        this._owner = owner;
        this._keepers = [];
        this._consensus = consensus;
    }
    myDocument.prototype.setId = function (id) {
        this._id = id;
    };
    myDocument.prototype.getId = function () {
        return this._id;
    };
    myDocument.prototype.setData = function (data) {
        this._data = data;
    };
    myDocument.prototype.getData = function () {
        return this._data;
    };
    myDocument.prototype.setOwner = function (owner) {
        this._owner = owner;
    };
    myDocument.prototype.getOwner = function () {
        return this._owner;
    };
    myDocument.prototype.setKeepers = function (keepers) {
        this._keepers = keepers;
    };
    myDocument.prototype.getKeepers = function () {
        return this._keepers;
    };
    myDocument.prototype.setConsensus = function (consensus) {
        this._consensus = consensus;
    };
    myDocument.prototype.getConsensus = function () {
        return this._consensus;
    };
    return myDocument;
}());
var uid20 = new Entity('uid20');
var uid21 = new Entity('uid21');
var uid22 = new Entity('uid22');
var uid30 = new Entity('uid30');
var uid31 = new Entity('uid31');
var uid40 = new Entity('uid40');
var uid990 = new Entity('uid990');
var doc1 = new myDocument('doc1', 'payload', uid20, Consensus.ALL);
var doc2 = new myDocument('doc2', 'payload', uid30, Consensus.ALL);
var doc3 = new myDocument('doc3', 'payload', uid40, Consensus.ALL);
var documentStore = [
    { doc: doc1 },
    { doc: doc2 },
    { doc: doc3 },
];
var settingKeepers = function (docId, keepers) {
    documentStore.forEach(function (element) {
        if (element.doc.getId() === docId) {
            element.doc.setKeepers(keepers);
        }
    });
}(doc3.getId(), [uid40, uid30, uid31]);
var Transaction = /** @class */ (function () {
    function Transaction(type, document, thirdEntity, keepers) {
        this._type = type;
        this._document = document;
        this._thirdEntity = thirdEntity;
        if (keepers !== undefined) {
            this._keepers = keepers;
        }
    }
    Transaction.prototype.setType = function (type) {
        this._type = type;
    };
    Transaction.prototype.getType = function () {
        return this._type;
    };
    Transaction.prototype.setDocumentId = function (documentId) {
        this._document = documentId;
    };
    Transaction.prototype.getDocumentId = function () {
        return this._document;
    };
    Transaction.prototype.setThirdEntity = function (thirdEntity) {
        this._thirdEntity = thirdEntity;
    };
    Transaction.prototype.getThirdEntity = function () {
        return this._thirdEntity;
    };
    Transaction.prototype.setKeepers = function (keepers) {
        this._keepers = keepers;
    };
    Transaction.prototype.getKeepers = function () {
        return this._keepers;
    };
    Transaction.prototype.applyTransaction = function () {
        switch (this.getType()) {
            case TransactionType.REQUEST:
                return this.applyRequest();
            case TransactionType.REQUIRE:
                return this.applyRequire();
            case TransactionType.DIFFERED:
                return this.applyAllow();
            /* case DENY:
                return this.applyDeny(); */
            case TransactionType.AUTH:
                return this.applyAuth();
            case TransactionType.REVOKE:
                return this.applyRevoke();
            default:
                return this;
        }
    };
    Transaction.prototype.applyRequest = function () {
        var tempTransactions = [];
        documentStore.forEach(function (element) {
            if (element.doc.getId() === this.getDocumentId()) {
                tempTransactions = element.doc.getKeepers();
            }
        }, this);
        return new Transaction(TransactionType.REQUIRE, this.getDocumentId(), this.getThirdEntity(), tempTransactions);
    };
    Transaction.prototype.applyRequire = function () {
        var allowedKeepers = [];
        var document = null;
        documentStore.forEach(function (element) {
            if (this.getDocumentId() === element.doc.getId()) {
                document = element.doc;
            }
        }, this);
        // console.log(document);
        //Message to document keepers and owner
        /* transactionStore.forEach(function (element) {
            if (document.getKeepers() === (element.tra._document._keepers) &&
                this.getThirdEntity() === element.tra.getThirdEntity()) {
                if (element.tra._type === DifferedType.ALLOW) {
                    allowedKeepers.push(element.tra._keepers);
                }
            }
        }, this); */
        return new Transaction(TransactionType.DIFFERED, this.getDocumentId(), this.getThirdEntity(), allowedKeepers);
        //Criar array de transactions com lenght = keepers.lenght
        //Para cada transaction, ver no historico se existe ou nao permissao
        //Criar uma store de transactions (para simular os blocos)
        //Testar para os diversos cenarios de CONSENSUS
    };
    Transaction.prototype.applyAuth = function () {
        return this;
    };
    Transaction.prototype.applyAllow = function () {
        return this;
    };
    Transaction.prototype.applyDeny = function () {
        return this;
    };
    Transaction.prototype.applyRevoke = function () {
        return this;
    };
    Transaction.prototype.equals = function (anotherTransaction) {
        return (this.getType() === anotherTransaction.getType() &&
            this.getDocumentId() === anotherTransaction.getDocumentId() &&
            this.getThirdEntity() === anotherTransaction.getThirdEntity() &&
            this.getKeepers() === anotherTransaction.getKeepers());
    };
    return Transaction;
}());
var t1 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());
var t2 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());
var t3 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());
var transactionStore = [
    { tra: t1 },
    { tra: t2 },
    { tra: t3 },
];
var x1 = new Transaction(TransactionType.REQUEST, doc3.getId(), uid990);
var x2 = new Transaction(TransactionType.REQUIRE, doc3.getId(), uid990, doc3.getKeepers());
var x3 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());
