"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
*
*
* @class Document
*/
class Document {
    /**
     * Creates an instance of Document.
     * @param {string} id
     * @param {string} data
     * @param {Entity} owner
     * @param {Entity[]} keepers
     * @param {Consensus} consensus
     * @memberof Document
     */
    constructor(id, data, owner, keepers, consensus) {
        this._id = id;
        this._data = data;
        this._owner = owner;
        this._keepers = keepers;
        this._consensus = consensus;
    }
    /**
    *
    *
    * @param {string} id
    * @memberof Document
    */
    set id(id) {
        this._id = id;
    }
    /**
    *
    *
    * @readonly
    * @type {string}
    * @memberof Document
    */
    get id() {
        return this._id;
    }
    /**
    *
    *
    * @memberof Document
    */
    set data(data) {
        this._data = data;
    }
    /**
    *
    *
    * @readonly
    * @type {string}
    * @memberof Document
    */
    get data() {
        return this._data;
    }
    /**
    *
    *
    * @memberof Document
    */
    set owner(owner) {
        this._owner = owner;
    }
    /**
    *
    *
    * @readonly
    * @type {Entity}
    * @memberof Document
    */
    get owner() {
        return this._owner;
    }
    /**
    *
    *
    * @memberof Document
    */
    set keepers(keepers) {
        this._keepers = keepers;
    }
    /**
    *
    *
    * @readonly
    * @type {Entity[]}
    * @memberof Document
    */
    get keepers() {
        return this._keepers;
    }
    /**
    *
    *
    * @memberof Document
    */
    set consensus(consensus) {
        this._consensus = consensus;
    }
    /**
    *
    *
    * @readonly
    * @type {Consensus}
    * @memberof Document
    */
    get consensus() {
        return this._consensus;
    }
    addKeeper(keeper) {
        this._keepers.push(keeper);
    }
}
exports.Document = Document;
