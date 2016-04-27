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

    static async count(selector?:any):Promise<number> {
        let type = this.__type || (this._collectionName ? this : null);
        let coll = await DB.collection((<any>type)._collectionName);
        let cursor = coll.find(selector || {});
        return await cursor.count(false);
    }

    /**
     * Saves a new model instance or updates an existing one.
     *
     * @param deep Whether dependant, i.e. `@reference`'d documents should also be saved
     * @param upsert Whether an upsert operation should be performed. This is helpful, if this object was created
     *  with `new`, but the _id already exists in the database.
     * @returns {Collection}
     */
    async save(deep?:boolean, upsert?:boolean) {
        let validation = await this.validate();
        if(!validation.valid()) {
            throw new ValidationError(this.constructor.name+(this.isSaved() ? '#'+this._id : '')+' is not valid: '+validation.toString(), validation);
        }

        await this.beforeSave()

        let collectionName = (<any>this)._collectionName;
        let coll = await DB.collection(collectionName)
        let doc = await this._toDb(deep)
        if (this.isNew() && !upsert) {
            let result:InsertOneWriteOpResult = await coll.insertOne(doc)
            this._id = result.insertedId;
        } else {
            if(!this._id) {
                throw new Error('To update or upsert a document an _id is required');
            }
            await coll.updateOne({_id: this._id}, doc, {upsert: upsert});
        }

        await this.afterSave();

        this.__isSaved = true;
        return this;
    }

    /**
     * Performs an upsert operation with this model.
     * Equivalent to `save(deep, true)`;
     *
     * @param deep
     * @returns {Promise<Collection>}
     */
    async upsert(deep?:boolean) {
        return this.save(deep, true);
    }

    async destroy() {
        if(!this._id) {
            throw new Error('Models without an _id cannot be destroyed');
        }

        await this.beforeDestroy()

        let collectionName = (<any>this)._collectionName;
        let coll = await DB.collection(collectionName);
        await coll.deleteOne({_id: this._id});

        await this.afterDestroy()
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

    async beforeDestroy() {

    }

    async afterDestroy() {

    }
}