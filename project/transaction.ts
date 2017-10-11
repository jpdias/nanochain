// Dividir as classes em diferentes ficheiros
// Adicionar 2 transaçoes (outra maquina de estados) issuePolicies(add and remove keepers) e criar documento e
// adicioná-lo à store (documento criado com lista de keepers)
// updateDocument para atulizar dados keepers (tudo menos id)
// Documentos têm de ter um campo status (enable ou disabled) para saber se podem ou não ser consultados
import { v4 } from "uuid";
import { Document } from "./document";
import {Entity} from "./entity";
import { Consensus, TransactionType } from "./enums";
import { documentStore, permissionStore, transactionStore } from "./stores";
export class Transaction {
  private _id: string;
  private _type: TransactionType;
  private _document: string;
  private _thirdEntity: Entity;
  private _keepers: Entity[];
  /**
   * Creates an instance of Transaction.
   * @param {TransactionType} type 
   * @param {string} document 
   * @param {Entity} thirdEntity 
   * @memberof Transaction
   */
  constructor(
    type: TransactionType,
    document: string,
    thirdEntity: Entity,
    keepers?: Entity[]
  ) {
    this._id = v4();
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
  public set document(value: string) {
    this._document = value;
  }
  /**
   * 
   * 
   * @readonly
   * @type {string}
   * @memberof Transaction
   */
  public get document(): string {
    return this._document;
  }
  // To be removed
  public set id(value: string) {
    this._id = value;
  }
  /**
   * 
   * 
   * @type {string}
   * @memberof Transaction
   */
  public get id(): string {
    return this._id;
  }
  /**
   * 
   * 
   * @memberof Transaction
   */
  public set type(value: TransactionType) {
    this._type = value;
  }
  /**
   * 
   * 
   * @readonly
   * @type {TransactionType}
   * @memberof Transaction
   */
  public get type(): TransactionType {
    return this._type;
  }
  /**
   * 
   * 
   * @memberof Transaction
   */
  public set thirdEntity(thirdEntity: Entity) {
    this._thirdEntity = thirdEntity;
  }
  /**
   * 
   * 
   * @readonly
   * @memberof Transaction
   */
  public get thirdEntity() {
    return this._thirdEntity;
  }
  /**
   * 
   * 
   * @memberof Transaction
   */
  public set keepers(keepers: Entity[]) {
    this._keepers = keepers;
  }
  /**
   * 
   * 
   * @readonly
   * @type {Entity[]}
   * @memberof Transaction
   */
  public get keepers(): Entity[] {
    return this._keepers;
  }
  /**
   * 
   * 
   * @returns {Transaction} 
   * @memberof Transaction
   */
  public applyTransaction(): Transaction {
    switch (this.type) {
      case TransactionType.REQUEST:
      return this.applyRequest();
      case TransactionType.REQUIRE:
      return this.applyRequire();
      case TransactionType.ALLOW:
      return this.applyAllow();
      case TransactionType.DENY:
      return this.applyDeny();
      case TransactionType.AUTH_GRANT:
      case TransactionType.AUTH_DENY:
      return this.applyAuth();
      case TransactionType.REVOKE:
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
  public clone(): Transaction {
    const cloneObj = new Transaction(
      this.type,
      this.document,
      this.thirdEntity,
      this.keepers
    );
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
  public equals(anotherTransaction: Transaction): boolean {
    return (
      this.id === anotherTransaction.id &&
      this.type === anotherTransaction.type &&
      this.document === anotherTransaction.document &&
      this.thirdEntity === anotherTransaction.thirdEntity &&
      this.keepers === anotherTransaction.keepers
    );
  }
  /**
   * 
   * 
   * @private
   * @returns {Transaction} 
   * @memberof Transaction
   */
  private applyRequest(): Transaction {
    let tempTransactions: Entity[] = [];
    const self = this;
    documentStore.forEach(element => {
      if (element.id === self.document) {
        tempTransactions = element.keepers;
      }
    }, self);
    self.type = TransactionType.REQUIRE;
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
  private applyRequire(): Transaction {
    const self = this;
    let foundPrevious: boolean = false;
    const consensusNeeded: number = extractConsensus(self);
    transactionStore.forEach(element => {
      if (self.id === element.id) {
        self.type = element.type;
        foundPrevious = true;
      }
    }, self);
    if (!foundPrevious) {
      if (evaluateConsensus(self, consensusNeeded)) {
        self.type = TransactionType.AUTH_GRANT;
      } else {
        self.type = TransactionType.AUTH_DENY;
      }
    }
    transactionStore.push(self);
    
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
  private applyAuth(): Transaction {
    const self = this;
    if (self.type === TransactionType.AUTH_GRANT) {
      self.type = TransactionType.ALLOW;
    } else {
      self.type = TransactionType.DENY;
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
  private applyAllow(): Transaction {
    return this;
  }
  /**
   * 
   * 
   * @private
   * @returns {Transaction} 
   * @memberof Transaction
   */
  private applyDeny(): Transaction {
    return this;
  }
  /**
   * 
   * 
   * @private
   * @returns {Transaction} 
   * @memberof Transaction
   */
  private applyRevoke(): Transaction {
    return this;
  }
}
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
function evaluateConsensus(transaction: Transaction, consensusNeeded: number): boolean {
  if (consensusNeeded === 0) {
    let docOwner: Entity;
    let whatToReturn: boolean = false;
    documentStore.forEach(element => {
      if (transaction.document === element.id) {
        docOwner = element.owner;
      }
    });
    permissionStore.forEach(element => {
      if (element.keepers[0] === docOwner) {
        if (element.type === TransactionType.ALLOW) {
          whatToReturn = true;
        }
      }
    });

    return whatToReturn;
  } else {
    let consensusAchieved: number = 0;
    for (const permission of permissionStore) {
      if (
        transaction.document === permission.document &&
        transaction.thirdEntity === permission.thirdEntity
      ) {
        if (permission.type === TransactionType.ALLOW) {
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
function extractConsensus(transaction: Transaction): number {
  let consensusNeeded: number = -1;
  documentStore.forEach(element => {
    if (element.id === transaction.document) {
      if (element.consensus === Consensus.ALL) {
        consensusNeeded = element.keepers.length;
      } else if (element.consensus === Consensus.MAJORITY) {
        const isInt = Number.isInteger(element.keepers.length / 2);
        if (isInt) {
          consensusNeeded = (element.keepers.length / 2) + 1;  
        } else {
          consensusNeeded = Math.ceil(element.keepers.length / 2);
        }
        consensusNeeded = element.keepers.length / 2;
      } else if (element.consensus === Consensus.ONLY_OWNER) {
        consensusNeeded = 1;
      } else {
        consensusNeeded = 0;
      }
    }
  }, transaction);
  if (consensusNeeded === -1) {
    alert("Something was wrong, could not find consensus");
  }
  
  return consensusNeeded;
}
