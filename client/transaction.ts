//Transaction Type

/* interface Auth { AUTH_OK: 'auth-ok', AUTH_DENY: 'auth-deny'}
interface Differed {ALLOW: 'allow', DENY: 'deny'} */
interface TransactionType {REQUEST: 'request', REQUIRE: 'require', REVOKE: 'revoke', AUTH: 'auth', DIFFERED: 'differed'}  
//declare var myTransaction: TransactionType;
//declare var cas TransactionType: ;
//{a: number; b: number | string; c: 'ola' | 'adeus'}
//enum TransactionType {REQUEST, REQUIRE, REVOKE, Auth, Differed};
enum Consensus {ALL, MAJORITY, ONE, ONLY_OWNER};
console.log(TransactionType.REQUEST)


// Sample A
declare var myPoint: { x: number; y: number; };

// Sample B
interface Point {
    x: number; y: number;
}
declare var myPoint: Point;



class Entity {
    private _id: Entity;
    constructor(id) {
        this._id = id;
    }
}

class myDocument {
    private _id: string;
    private _data: string;
    private _owner: Entity;
    private _keepers: Entity[];
    private _consensus: Consensus;

    constructor(id: string, data: string, owner: Entity, consensus: Consensus) {
        this._id = id;
        this._data = data;
        this._owner = owner;
        this._keepers = [];
        this._consensus = consensus;
    }

    setId(id: string) {
        this._id = id;
    }
    getId() {
        return this._id;
    }
    setData(data: string) {
        this._data = data;
    }
    getData() {
        return this._data;
    }
    setOwner(owner: Entity) {
        this._owner = owner;
    }
    getOwner() {
        return this._owner;
    }
    setKeepers(keepers: Entity[]) {
        this._keepers = keepers;
    }
    getKeepers() {
        return this._keepers;
    }
    setConsensus(consensus: Consensus) {
        this._consensus = consensus;
    }
    getConsensus() {
        return this._consensus;
    }
}

let uid20 = new Entity('uid20');
let uid21 = new Entity('uid21');
let uid22 = new Entity('uid22');
let uid30 = new Entity('uid30');
let uid31 = new Entity('uid31');
let uid40 = new Entity('uid40');
let uid990 = new Entity('uid990');
let doc1 = new myDocument('doc1', 'payload', uid20, Consensus.ALL);
let doc2 = new myDocument('doc2', 'payload', uid30, Consensus.ALL);
let doc3 = new myDocument('doc3', 'payload', uid40, Consensus.ALL);

const documentStore = [
    { doc: doc1 },
    { doc: doc2 },
    { doc: doc3 },
];

let settingKeepers = function (docId: string, keepers: Entity[]) {
    documentStore.forEach(function (element) {
        if (element.doc.getId() === docId) {
            element.doc.setKeepers(keepers);
        }
    });
}(doc3.getId(), [uid40, uid30, uid31]);

class Transaction {
    private _type: string;
    private _document: string;
    private _thirdEntity: Entity;
    private _keepers: Entity[];

    constructor(type: string, document: string, thirdEntity: Entity, keepers?: Entity[]) {
        this._type = type;
        this._document = document;
        this._thirdEntity = thirdEntity;
        if (keepers !== undefined) {
            this._keepers = keepers;
        }
    }
    setType(type: string) {
        this._type = type;
    }
    getType() {
        return this._type;
    }
    setDocumentId(documentId: string) {
        this._document = documentId;
    }
    getDocumentId() {
        return this._document;
    }
    setThirdEntity(thirdEntity: Entity) {
        this._thirdEntity = thirdEntity;
    }
    getThirdEntity() {
        return this._thirdEntity;
    }
    setKeepers(keepers: Entity[]) {
        this._keepers = keepers;
    }
    getKeepers() {
        return this._keepers;
    }
    applyTransaction() {
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
    }
    applyRequest() {
        let tempTransactions = [];
        documentStore.forEach(function (element) {
            if (element.doc.getId() === this.getDocumentId()) {
                tempTransactions = element.doc.getKeepers();
            }
        }, this);

        return new Transaction(TransactionType.REQUIRE, this.getDocumentId(), this.getThirdEntity(), tempTransactions);
    }
    applyRequire() {
        let allowedKeepers = [];
        let document = null;
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
    equals(anotherTransaction: Transaction) {
        return (this.getType() === anotherTransaction.getType() &&
            this.getDocumentId() === anotherTransaction.getDocumentId() &&
            this.getThirdEntity() === anotherTransaction.getThirdEntity() &&
            this.getKeepers() === anotherTransaction.getKeepers())
    }
}
let t1 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());

let t2 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());

let t3 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());


const transactionStore = [
    { tra: t1 },
    { tra: t2 },
    { tra: t3 },
];

const x1 = new Transaction(TransactionType.REQUEST, doc3.getId(), uid990);

const x2 = new Transaction(TransactionType.REQUIRE, doc3.getId(), uid990, doc3.getKeepers());

const x3 = new Transaction(TransactionType.DIFFERED, doc3.getId(), uid990, doc3.getKeepers());

