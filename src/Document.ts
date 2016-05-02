import {__documents, populateReference} from "./core";
import {isArray} from "./common/array";
import {Collection} from "./Collection";
import {ValidateOptions, ValidationResult, validateDocument} from "./decorators/validate";
let assert = require('assert');

export class Document {
    __schema:any

    protected async _toDb(saveDeep?:boolean):Promise<Object> {
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
                // if the property at `key` has not the right type it's a not loaded, lazy ref (else branch)
                if(this[key] && this[key].constructor == __document['references'][key].type) {
                    if (saveDeep && this[key].isNew()) {
                        await this[key].save(saveDeep);
                    }
                    copy[key] = this[key]._id;
                } else {
                    copy[key] = this[key]
                }
            }

            // this[key] is an array, holding referenced documents
            else if (isArray(this[key]) && __document['references'][key]) {
                copy[key] = [];
                for(var v of this[key]) {
                    if(v && v.constructor == __document['references'][key].type) {
                        if (saveDeep && v.isNew()) {
                            await v.save(saveDeep)
                        }
                        copy[key].push(v._id);
                    } else {
                        copy[key].push(v);
                    }
                }
            }

            // this[key] holds an object that is an embedded document
            else if (!isArray(this[key]) && __documents[this[key].constructor.name] && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await this[key]._toDb(saveDeep);
            }

            // this[key] is an array, holding embedded docments
            else if (isArray(this[key]) && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await Promise.all(this[key].map((v:Document) => v ? v._toDb(saveDeep) : v));
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
