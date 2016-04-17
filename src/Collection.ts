import {DB} from "./DB";
import {pmap} from "./common/array";
import {rebuildInstance} from "./core";
import {Document} from "./Document";
import * as mongodb from 'mongodb';

export abstract class Collection extends Document {
    _id:any

    static _collectionName:string;
    static __type:Function;

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
        if (limit !== undefined) {
            cursor = cursor.limit(limit);
        }
        if (sort) {
            cursor = cursor.sort(sort);
        }
        let docs = await cursor.toArray();
        return pmap<any, Type>(docs, doc => rebuildInstance(type, doc));
    }

    static async all<Type extends Collection>(type:Function):Promise<Array<Type>> {
        return (await this.find<Type>({}));
    }

    constructor() {
        super();
        //this.__isNew = true;
    }

    isNew():boolean {
        //return this.__isNew;
        return !this._id;
    }

    save(upsert?:boolean) {
        var self = this;
        return new Promise((resolve, reject) => {
            let collectionName = (<any>this)._collectionName;
            if (!collectionName) {
                throw new Error(this.constructor.name + ' does not seem to be a collection');
            }
            let collection = DB.collection(collectionName).then((coll) => {
                this._toDb().then((doc) => {
                    if (this.isNew()) {
                        coll.insertOne(doc, (err:Error, result:any) => {
                            if (err) {
                                return reject(err);
                            }
                            //self.__isNew = false;
                            self._id = result.insertedId;
                            resolve(self);
                        })
                    } else {
                        coll.updateOne({_id: this._id}, doc, {upsert: upsert}, (err:Error, result:any) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(self);
                        })
                    }
                }).catch(reject)
            }).catch(reject)
        })
    }

    async upsert() {
        await this.save(true);
    }

    _collectionName():string {
        return (<any>this)._collectionName;
    }

    async _collection():Promise<mongodb.Collection> {
        return DB.collection(this._collectionName());
    }
}
