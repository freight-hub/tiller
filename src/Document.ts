import {__documents} from "./core";
import {isArray} from "./common/array";
import {Collection} from "./Collection";
import {ValidateOptions, ValidationResult, validateDocument} from "./decorators/validate";
let assert = require('assert');

export type HookType = "beforeValidation" | "beforeSave" | "afterSave";

export class Document {
    __schema:any
    __hooks:{[type:string]: Array<() => Promise<any>>}

    protected async _toDb(saveDeep?:boolean):Promise<Object> {
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
                if (saveDeep && this[key].isNew()) {
                    await this[key].save(saveDeep);
                }
                copy[key] = this[key]._id;
            }

            // this[key] is an array, holding referenced documents
            else if (isArray(this[key]) && __documents[(<any>this).constructor.name]['references'][key]) {
                let p = this[key].map((v:Collection) => {
                    if (saveDeep && v.isNew()) {
                        return v.save(saveDeep);
                    } else {
                        return Promise.resolve(v);
                    }
                });

                copy[key] = (await Promise.all(p)).map((v:any) => v._id);
            }

            // this[key] holds an object that is an embedded document
            else if (!isArray(this[key]) && __documents[this[key].constructor.name] && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await this[key]._toDb(saveDeep);
            }

            // this[key] is an array, holding embedded docments
            else if (isArray(this[key]) && __documents[(<any>this).constructor.name]['embeds'][key]) {
                copy[key] = await Promise.all(this[key].map((v:Document) => v._toDb(saveDeep)));
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

    addHook(type:HookType, hook:() => Promise<any>) {
        this.__hooks = this.__hooks || {};
        if(!this.__hooks[type]) {
            this.__hooks[type] = [];
        }

        this.__hooks[type].push(hook);
    }

    async runHooks(type:HookType) {
        this.__hooks = this.__hooks || {};
        for(var fn of (this.__hooks[type] || [])) {
            await fn.bind(this)();
        }
    }
}
