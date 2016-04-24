import {DB} from "./DB";
import {pmap} from "./common/array";
import {rebuildInstance} from "./core";
import {Document} from "./Document";
import * as mongodb from 'mongodb';
import {InsertOneWriteOpResult} from "mongodb";
import {ValidationError} from "./decorators/validate";

export abstract class Collection extends Document {
    _id:any
    __isSaved:boolean

    static _collectionName:string;
    static __type:Function;

    constructor() {
        super();
        this.__isSaved = false;
    }

    static async get<Type extends Collection>(_id:any):Promise<Type> {
        return this.findOne<Type>({_id: _id});
    }

    static async findOne<Type extends Collection>(selector:any):Promise<Type> {
        return (await this.find<Type>(selector, 1))[0];
    }

    static async find<Type extends Collection>(selector:any, limit?:number, sort?:any):Promise<Array<Type>> {
        let type = this.__type || (this._collectionName ? this : null);
        let coll = await DB.collection((<any>type)._collectionName);
        let cursor = coll.find(selector);
        if (typeof(limit) == 'number') {
            cursor = cursor.limit(limit);
        }
        if (sort) {
            cursor = cursor.sort(sort);
        }
        let docs = await cursor.toArray();
        return pmap<any, Type>(docs, doc => rebuildInstance(type, doc));
    }

    static async all<Type extends Collection>():Promise<Array<Type>> {
        return (await this.find<Type>({}));
    }

    async save(deep?:boolean, upsert?:boolean) {
        let collectionName = (<any>this)._collectionName;
        if (!collectionName) {
            throw new Error(this.constructor.name + ' does not seem to be a collection');
        }

        let validation = await this.validate();
        if(!validation.valid()) {
            throw new ValidationError(this.constructor.name+(this.isSaved() ? '#'+this._id : '')+' is not valid: '+validation.toString(), validation);
        }

        await this.beforeSave()

        let coll = await DB.collection(collectionName)
        let doc = await this._toDb(deep)
        if (this.isNew() && !upsert) {
            let result:InsertOneWriteOpResult = await coll.insertOne(doc)
            this._id = result.insertedId;
        } else {
            await coll.updateOne({_id: this._id}, doc, {upsert: upsert});
        }

        await this.afterSave();

        this.__isSaved = true;
        return this;
    }

    isNew() {
        return !this.__isSaved;
    }

    /**
     * Returns true if this object is persisted in the database,
     * e.g. save() was called at least once or the object was fetched
     * from the database.
     *
     * @returns {boolean}
     */
    isSaved() {
        return this.__isSaved;
    }

    _collectionName():string {
        return (<any>this)._collectionName;
    }

    async _collection():Promise < mongodb.Collection > {
        return DB.collection(this._collectionName());
    }

    async beforeSave() {

    }

    async afterSave() {

    }
}