import { Entity } from "./entity";
import { Consensus, Status } from "./enums";
/**
*
*
* @class Document
*/
export class Document {
    private readonly _id: string;
    private _data: string;
    private _owner: Entity;
    private _keepers: Entity[];
    private _consensus: Consensus;
    private _status: Status;
    /**
     * Creates an instance of Document.
     * @param {string} id 
     * @param {string} data 
     * @param {Entity} owner 
     * @param {Entity[]} keepers 
     * @param {Consensus} consensus 
     * @memberof Document
     */
    constructor(id: string, data: string, owner: Entity, keepers: Entity[], consensus: Consensus) {
        this._id = id;
        this._data = data;
        this._owner = owner;
        this._keepers = keepers;
        this._consensus = consensus;
    }
    /**
    * 
    * 
    * @readonly
    * @type {string}
    * @memberof Document
    */
    public get id(): string {
        return this._id;
    }
    /**
    * 
    * 
    * @memberof Document
    */
    public set data(data: string) {
        this._data = data;
    }
    /**
    * 
    * 
    * @readonly
    * @type {string}
    * @memberof Document
    */
    public get data(): string {
        return this._data;
    }
    /**
    * 
    * 
    * @memberof Document
    */
    public set owner(owner: Entity) {
        this._owner = owner;
    }
    /**
    * 
    * 
    * @readonly
    * @type {Entity}
    * @memberof Document
    */
    public get owner(): Entity {
        return this._owner;
    }
    /**
    * 
    * 
    * @memberof Document
    */
    public set keepers(keepers: Entity[]) {
        this._keepers = keepers;
    }
    /**
    * 
    * 
    * @readonly
    * @type {Entity[]}
    * @memberof Document
    */
    public get keepers(): Entity[] {
        return this._keepers;
    }
    /**
    * 
    * 
    * @memberof Document
    */
    public set consensus(consensus: Consensus) {
        this._consensus = consensus;
    }
    /**
    * 
    * 
    * @readonly
    * @type {Consensus}
    * @memberof Document
    */
    public get consensus(): Consensus {
        return this._consensus;
    }
    protected addKeeper(keeper: Entity) {
        this._keepers.push(keeper);
    }
    /* protected editAndUpdate() {
    } */
}
