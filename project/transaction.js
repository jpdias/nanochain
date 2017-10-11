"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Dividir as classes em diferentes ficheiros
// Adicionar 2 transaçoes (outra maquina de estados) issuePolicies(add and remove keepers) e criar documento e
// adicioná-lo à store (documento criado com lista de keepers)
// updateDocument para atulizar dados keepers (tudo menos id)
// Documentos têm de ter um campo status (enable ou disabled) para saber se podem ou não ser consultados
const uuid_1 = require("uuid");
const enums_1 = require("./enums");
const stores_1 = require("./stores");
class Transaction {
    /**
     * Creates an instance of Transaction.
     * @param {TransactionType} type
     * @param {string} document
     * @param {Entity} thirdEntity
     * @memberof Transaction
     */
    constructor(type, document, thirdEntity, keepers) {
        this._id = uuid_1.v4();
        this._type = type;
        this._document = document;
        this._thirdEntity = thirdEntity;
        if (keepers !== undefined) {
            this._keepers = keepers;
        }
        /* documentStore.forEach(element => {
          if (element.id === document) {
            this._keepers = element.keepers;
          }
        }); */
    }
    /**
     *
     *
     * @memberof Transaction
     */
    set document(value) {
        this._document = value;
    }
    /**
     *
     *
     * @readonly
     * @type {string}
     * @memberof Transaction
     */
    get document() {
        return this._document;
    }
    // To be removed
    set id(value) {
        this._id = value;
    }
    /**
     *
     *
     * @type {string}
     * @memberof Transaction
     */
    get id() {
        return this._id;
    }
    /**
     *
     *
     * @memberof Transaction
     */
    set type(value) {
        this._type = value;
    }
    /**
     *
     *
     * @readonly
     * @type {TransactionType}
     * @memberof Transaction
     */
    get type() {
        return this._type;
    }
    /**
     *
     *
     * @memberof Transaction
     */
    set thirdEntity(thirdEntity) {
        this._thirdEntity = thirdEntity;
    }
    /**
     *
     *
     * @readonly
     * @memberof Transaction
     */
    get thirdEntity() {
        return this._thirdEntity;
    }
    /**
     *
     *
     * @memberof Transaction
     */
    set keepers(keepers) {
        this._keepers = keepers;
    }
    /**
     *
     *
     * @readonly
     * @type {Entity[]}
     * @memberof Transaction
     */
    get keepers() {
        return this._keepers;
    }
    /**
     *
     *
     * @returns {Transaction}
     * @memberof Transaction
     */
    applyTransaction() {
        switch (this.type) {
            case enums_1.TransactionType.REQUEST:
                return this.applyRequest();
            case enums_1.TransactionType.REQUIRE:
                return this.applyRequire();
            case enums_1.TransactionType.ALLOW:
                return this.applyAllow();
            case enums_1.TransactionType.DENY:
                return this.applyDeny();
            case enums_1.TransactionType.AUTH_GRANT:
            case enums_1.TransactionType.AUTH_DENY:
                return this.applyAuth();
            case enums_1.TransactionType.REVOKE:
                return this.applyRevoke();
            default:
                return this;
        }
    }
    /**
     *
     *
     * @returns {Transaction}
     * @memberof Transaction
     */
    clone() {
        const cloneObj = new Transaction(this.type, this.document, this.thirdEntity, this.keepers);
        cloneObj._id = this.id;
        return cloneObj;
    }
    /**
     *
     *
     * @param {Transaction} anotherTransaction
     * @returns {boolean}
     * @memberof Transaction
     */
    equals(anotherTransaction) {
        return (this.id === anotherTransaction.id &&
            this.type === anotherTransaction.type &&
            this.document === anotherTransaction.document &&
            this.thirdEntity === anotherTransaction.thirdEntity &&
            this.keepers === anotherTransaction.keepers);
    }
    /**
     *
     *
     * @private
     * @returns {Transaction}
     * @memberof Transaction
     */
    applyRequest() {
        let tempTransactions = [];
        const self = this;
        stores_1.documentStore.forEach(element => {
            if (element.id === self.document) {
                tempTransactions = element.keepers;
            }
        }, self);
        self.type = enums_1.TransactionType.REQUIRE;
        self.keepers = tempTransactions;
        return self;
    }
    /**
     *
     *
     * @private
     * @returns {Transaction}
     * @memberof Transaction
     */
    applyRequire() {
        const self = this;
        let foundPrevious = false;
        const consensusNeeded = extractConsensus(self);
        stores_1.transactionStore.forEach(element => {
            if (self.id === element.id) {
                self.type = element.type;
                foundPrevious = true;
            }
        }, self);
        if (!foundPrevious) {
            if (evaluateConsensus(self, consensusNeeded)) {
                self.type = enums_1.TransactionType.AUTH_GRANT;
            }
            else {
                self.type = enums_1.TransactionType.AUTH_DENY;
            }
        }
        stores_1.transactionStore.push(self);
        return self;
        // Check Concensus and update type
        // If cenas not present in transaction store, ver em permissions store, as permissoes de cada keeper
        // Check Concensus and update type
        // adicionar a transaction store e prosseguir
    }
    /**
     *
     *
     * @private
     * @returns {Transaction}
     * @memberof Transaction
     */
    applyAuth() {
        const self = this;
        if (self.type === enums_1.TransactionType.AUTH_GRANT) {
            self.type = enums_1.TransactionType.ALLOW;
        }
        else {
            self.type = enums_1.TransactionType.DENY;
        }
        return self;
    }
    /**
     *
     *
     * @private
     * @returns {Transaction}
     * @memberof Transaction
     */
    applyAllow() {
        return this;
    }
    /**
     *
     *
     * @private
     * @returns {Transaction}
     * @memberof Transaction
     */
    applyDeny() {
        return this;
    }
    /**
     *
     *
     * @private
     * @returns {Transaction}
     * @memberof Transaction
     */
    applyRevoke() {
        return this;
    }
}
exports.Transaction = Transaction;
/* Use function in the global scope and for Object.prototype properties.
Use class for object constructors.
Use => everywhere else. */
/**
 *
 *
 * @param {Transaction} transaction
 * @param {number} consensusNeeded
 * @returns {boolean}
 */
function evaluateConsensus(transaction, consensusNeeded) {
    if (consensusNeeded === 0) {
        let docOwner;
        let whatToReturn = false;
        stores_1.documentStore.forEach(element => {
            if (transaction.document === element.id) {
                docOwner = element.owner;
            }
        });
        stores_1.permissionStore.forEach(element => {
            if (element.keepers[0] === docOwner) {
                if (element.type === enums_1.TransactionType.ALLOW) {
                    whatToReturn = true;
                }
            }
        });
        return whatToReturn;
    }
    else {
        let consensusAchieved = 0;
        for (const permission of stores_1.permissionStore) {
            if (transaction.document === permission.document &&
                transaction.thirdEntity === permission.thirdEntity) {
                if (permission.type === enums_1.TransactionType.ALLOW) {
                    consensusAchieved++;
                }
            }
        }
        if (consensusAchieved >= consensusNeeded) {
            return true;
        }
    }
    return false;
}
/**
 *
 *
 * @param {Transaction} transaction
 * @returns {number}
 */
function extractConsensus(transaction) {
    let consensusNeeded = -1;
    stores_1.documentStore.forEach(element => {
        if (element.id === transaction.document) {
            if (element.consensus === enums_1.Consensus.ALL) {
                consensusNeeded = element.keepers.length;
            }
            else if (element.consensus === enums_1.Consensus.MAJORITY) {
                const isInt = Number.isInteger(element.keepers.length / 2);
                if (isInt) {
                    consensusNeeded = (element.keepers.length / 2) + 1;
                }
                else {
                    consensusNeeded = Math.ceil(element.keepers.length / 2);
                }
                consensusNeeded = element.keepers.length / 2;
            }
            else if (element.consensus === enums_1.Consensus.ONLY_OWNER) {
                consensusNeeded = 1;
            }
            else {
                consensusNeeded = 0;
            }
        }
    }, transaction);
    if (consensusNeeded === -1) {
        alert("Something was wrong, could not find consensus");
    }
    return consensusNeeded;
}
