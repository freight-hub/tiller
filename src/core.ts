import {Collection} from "./Collection";
import * as _ from 'lodash';
import {isArray} from "./common/array";
import {Document} from "./Document";
import {DB} from "./DB";
import {EventEmitter} from "events";
let assert = require('assert');

export async function populateReference(doc:any, key:string) {
    let docTypeName = doc.constructor.name;
    let targetType:any = __documents[docTypeName]['references'][key].type;
    if (isArray(doc[key+'_id'])) {
        let order = __documents[docTypeName]['ordered'][key];
        doc[key] = await targetType.find({_id: {$in: doc[key+'_id']}}, null, order ? order : null);
    } else {
        doc[key] = await targetType.get(doc[key+'_id'])
    }
}

export async function fromDB<Type extends Collection>(type:Function, doc:any, dontDeserialize?:boolean, resolveLazyReferences?:(boolean | Array<string>)):Promise<Type> {
    if (!doc) {
        return doc;
    }

    let typeName = type.name;
    assert(typeName);

    if (!dontDeserialize) {
        doc = type.prototype._deserialize(doc);
    }
    Object.setPrototypeOf(doc, type.prototype);

    let keys = Object.keys(doc);
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i].replace(/\_id$/, '');
        if (__documents[typeName]['references'][key]) {
            let referenceOptions = __documents[typeName]['references'][key];
            if(!referenceOptions.lazy ||
                (typeof(resolveLazyReferences) == 'boolean' && resolveLazyReferences) ||
                (isArray(resolveLazyReferences) && ~(<Array<string>>resolveLazyReferences).indexOf(key))) {

                await populateReference(doc, key);
            }
        } else if (__documents[typeName]['embeds'][key]) {
            doc[key] = __documents[typeName]['embeds'][key].prototype._deserialize(doc[key]);
            if (isArray(doc[key])) {
                var docs:Array<any> = [];
                for (var el of doc[key]) {
                    docs.push(await fromDB<any>(__documents[typeName]['embeds'][key], el));
                }
                doc[key] = docs;
            } else {
                doc[key] = await fromDB<any>(__documents[typeName]['embeds'][key], doc[key], true)
            }
        }
    }
    
    return doc;
}

export function setupDocument(type:Function) {
    if (!type.name) {
        throw new Error('Type ' + type + ' cannot be resolved ');
    }

    if (!__documents[type.name]) {
        __documents[type.name] = {
            references: {},
            embeds: {},
            type: type,
            ordered: {},
            validate: {},
            indexes: {}
        };
    } else {
        if (__documents[type.name].type != type) {
            throw new Error('Type ' + type.name + ' registered twice')
        }
    }

    type.prototype.toDB = (<any>Document.prototype).toDB;

    if (!type.prototype._serialize) {
        type.prototype._serialize = (<any>Document.prototype)._serialize;
    }
    if (!type.prototype._deserialize) {
        type.prototype._deserialize = (<any>Document.prototype)._deserialize;
    }
    if (!type.prototype.validate) {
        type.prototype.validate = (<any>Document.prototype).validate;
    }

    if ((<any>type).find) {
        (<any>type).find = (<any>type).find.bind(_.extend(type, {
            __type: type
        }))
    }
}

export function __collections() {
    var collections = {};
    for(var prop of Object.getOwnPropertyNames(__documents)) {
        if(__documents[prop].type._collectionName) {
            collections[prop] = __documents[prop];
        }
    }
    return collections;
}

export var __documents = {}