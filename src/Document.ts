import {__documents} from "./core";
import {isArray} from "./common/array";
import {Collection} from "./Collection";
let assert = require('assert');

export class Document {
    protected async _toDb():Promise<Object> {
        var copy:any = {};
        let keys = Object.keys(this);
        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];

            if (!this[key]) {
                copy[key] = this[key];
                continue;
            }

            // Ignore keys, prefixed with "__"
            if (key.indexOf('__') >= 0) {
                continue;
            }

            // this[key] holds an object that is a referenced document
            else if (!isArray(this[key]) && __documents[(<any>this).constructor.name] && __documents[(<any>this).constructor.name]['references'][key]) {
                if (this[key].isNew()) {
                    await this[key].save();
                }
                assert(this[key]._id)
                copy[key] = this[key]._id;
            }

            // this[key] is an array, holding referenced documents
            else if (isArray(this[key]) && __documents[(<any>this).constructor.name]['references'][key]) {
                let p = this[key].map((v:Collection) => {
                    if (v.isNew()) {
                        return v.save();
                    } else {
                        return Promise.resolve(v);
                    }
                });

                copy[key] = (await Promise.all(p)).map((v:any) => v._id);
            }

            // this[key] holds an object that is an embedded document
            else if (!isArray(this[key]) && __documents[this[key].constructor.name] && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await this[key]._toDb();
            }

            // this[key] is an array, holding embedded docments
            else if (isArray(this[key]) && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await Promise.all(this[key].map((v:Document) => v._toDb()));
            }

            else {
                copy[key] = this[key];
            }
        }
        return this._serialize(copy);
    }

    public _serialize(obj:any) {
        return obj;
    }

    public _deserialize(doc:any) {
        return doc;
    }
}