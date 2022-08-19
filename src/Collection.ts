import {DB} from "./DB";
import {fromDB} from "./core";
import {Document} from "./Document";
import * as mongodb from "mongodb";
import {Filter} from "mongodb";
import {ValidationError} from "./decorators/validate";
import * as Bluebird from "bluebird";

export abstract class Collection extends Document {
    _id: any;
    __isSaved: boolean;

    static _collectionName: string;
    static __type: Function;

    constructor() {
        super();
        this.__isSaved = false;
        Object.defineProperty(this, "__isSaved", {
            enumerable: false,
        });
    }

    static async create<Type extends Collection>(obj: any): Promise<Type> {
        let type = this.__type || (this._collectionName ? this : null);
        return fromDB<Type>(type, obj);
    }

    /**
     * Allows "mass-override" of properties, using a plain JavaScript object/hierarchy.
     *
     * @param obj
     * @returns {Collection}
     */
    async updateProperties<Type extends Collection>(obj) {
        let doc = await fromDB(this.constructor, obj);
        for (var key of Object.keys(doc)) {
            if (key.indexOf("__") == 0) {
                continue;
            }
            this[key] = doc[key];
        }
        return this;
    }

    static async get<Type extends Collection>(_id: any): Promise<Type> {
        return this.findOne<Type>({_id: _id});
    }

    static async findOne<Type extends Collection>(selector: any): Promise<Type> {
        return (await this.find<Type>(selector, 1))[0];
    }

    static async find<Type extends Collection>(
        selector: any,
        limit?: number,
        sort?: any
    ): Promise<Array<Type>> {
        let type = this.__type || (this._collectionName ? this : null);
        let coll = await DB.collection((<any>type)._collectionName);
        let cursor = coll.find(selector);
        if (typeof limit == "number") {
            cursor = cursor.limit(limit);
        }
        if (sort) {
            cursor = cursor.sort(sort);
        }
        let docs = await cursor.toArray();
        return Bluebird.map<any, Type>(docs, async (doc) => {
            doc = await fromDB(type, doc);
            doc.__isSaved = true;
            return doc;
        });
    }

    static async all<Type extends Collection>(): Promise<Array<Type>> {
        return await this.find<Type>({});
    }

    static async count<T>(selector?: Filter<T>): Promise<number> {
        let type = this.__type || (this._collectionName ? this : null);
        let coll = await DB.collection((<any>type)._collectionName);
        return coll.countDocuments(selector);
    }

    /**
     * Saves a new model instance or updates an existing one.
     *
     * @param deep Whether dependant, i.e. `@reference`'d documents should also be saved
     * @param upsert Whether an upsert operation should be performed. This is helpful, if this object was created
     *  with `new`, but the _id already exists in the database.
     * @returns {Collection}
     */
    async save(deep?: boolean, upsert?: boolean) {
        let validation = await this.validate();
        if (!validation.valid()) {
            throw new ValidationError(
                this.constructor.name +
                (this.isSaved() ? "#" + this._id : "") +
                " is not valid: " +
                validation.toString(),
                validation
            );
        }

        await this.beforeSave();

        let collectionName = (<any>this)._collectionName;
        let coll = await DB.collection(collectionName);
        let doc = await this.toDB(deep);
        if (this.isNew() && !upsert) {
            let result = await coll.insertOne(doc);
            this._id = result.insertedId;
        } else {
            if (!this._id) {
                throw new Error("To update or upsert a document an _id is required");
            }
            await coll.replaceOne({_id: this._id}, doc, {upsert: upsert});
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
    async upsert(deep?: boolean) {
        return this.save(deep, true);
    }

    async destroy() {
        if (!this._id) {
            throw new Error("Models without an _id cannot be destroyed");
        }

        await this.beforeDestroy();

        let collectionName = (<any>this)._collectionName;
        let coll = await DB.collection(collectionName);
        await coll.deleteOne({_id: this._id});

        await this.afterDestroy();
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

    _collectionName(): string {
        return (<any>this)._collectionName;
    }

    async _collection(): Promise<mongodb.Collection> {
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
