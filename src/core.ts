import {Collection} from "./Collection";
import * as _ from 'lodash';
import {isArray} from "./common/array";
import {Document} from "./Document";
let assert = require('assert');

export async function rebuildInstance<Type extends Collection>(type:Function, doc:any, dontDeserialize?:boolean):Promise<Type> {
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
        let key = keys[i];
        if (__documents[typeName]['references'][key]) {
            if (isArray(doc[key])) {
                var docs:Array<any> = [];
                for (var el of doc[key]) {
                    //docs.push(await Collection.get<any>(el).bind({__type: __documents[typeName]['references'][key]}));
                    docs.push(await __documents[typeName]['references'][key].get(el));
                }
                doc[key] = docs;
            } else {
                doc[key] = await __documents[typeName]['references'][key].get(doc[key])
            }
        } else if (__documents[typeName]['embeds'][key]) {
            doc[key] = __documents[typeName]['embeds'][key].prototype._deserialize(doc[key]);
            if (isArray(doc[key])) {
                var docs:Array<any> = [];
                for (var el of doc[key]) {
                    docs.push(await rebuildInstance<any>(__documents[typeName]['embeds'][key], el));
                }
                doc[key] = docs;
            } else {
                doc[key] = await rebuildInstance<any>(__documents[typeName]['embeds'][key], doc[key], true)
            }
        }
    }
    return doc;
}

export function setupDocument(type:Function) {
    if (!type.name) {
        throw new Error('Type '+type+' cannot be resolved ');
    }

    if (!__documents[type.name]) {
        __documents[type.name] = {references: {}, embeds: {}, type: type};
    } else {
        if (__documents[type.name].type != type) {
            throw new Error('Type ' + type.name + ' registered twice')
        }
    }

    type.prototype._toDb = (<any>Document.prototype)._toDb;

    if (!type.prototype._serialize) {
        type.prototype._serialize = (<any>Document.prototype)._serialize;
    }
    if (!type.prototype._deserialize) {
        type.prototype._deserialize = (<any>Document.prototype)._deserialize;
    }

    if ((<any>type).find) {
        (<any>type).find = (<any>type).find.bind(_.extend(type, {
            __type: type
        }))
    }
}

export var __documents = {}
export var collections = {};