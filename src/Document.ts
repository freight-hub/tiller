import {__documents, populateReference, fromDB} from "./core";
import {isArray} from "./common/array";
import {Collection} from "./Collection";
import {ValidateOptions, ValidationResult, validateDocument} from "./decorators/validate";
let assert = require('assert');

export class Document {
    __schema:any

    protected async toDB(saveDeep?:boolean):Promise<Object> {
        var copy:any = {};
        let keys = Object.keys(this);
        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];
            let __document = __documents[(<any>this).constructor.name];

            if (!this[key]) {
                copy[key] = this[key];
                continue;
            }

            // Ignore keys, prefixed with "__"
            if (key.indexOf('__') >= 0) {
                continue;
            }

            // this[key] holds an object that is a referenced document
            else if (!isArray(this[key]) && __document && __document['references'][key]) {
                if (saveDeep && this[key].isNew()) {
                    await this[key].save(saveDeep);
                }
                copy[key + '_id'] = this[key]._id;
            }

            // this[key] is an array, holding referenced documents
            else if (isArray(this[key]) && __document['references'][key]) {
                copy[key + '_id'] = [];
                for (var v of this[key]) {
                    if (saveDeep && v.isNew()) {
                        await v.save(saveDeep)
                    }
                    copy[key + '_id'].push(v ? v._id : null);
                }
            }

            // this[key] holds an object that is an embedded document
            else if (!isArray(this[key]) && __documents[this[key].constructor.name] && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await this[key].toDB(saveDeep);
            }

            // this[key] is an array, holding embedded docments
            else if (isArray(this[key]) && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await Promise.all(this[key].map((v:Document) => v ? v.toDB(saveDeep) : v));
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

    async validate() {
        return validateDocument(this);
    }

    async isValid():Promise<boolean> {
        return (await this.validate()).valid();
    }

    async loadReference(property) {
        await populateReference(this, property);
        return this;
    }
}
