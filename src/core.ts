import {Collection} from "./Collection";
import {isArray, pmap} from "./common/array";
import {Document} from "./Document";
import {DB} from "./DB";
import {EventEmitter} from "events";
import * as _ from 'lodash';
let assert = require('assert');

// TODO This can be optimized with $lookup and also $in
export async function populateReference(doc:any, key:string) {
    let docTypeName = doc.constructor.name;
    let referenceSpec = __documents[docTypeName]['references'][key];
    doc[key] = await unwind(referenceSpec.type, doc[key + '_id'], (targetType, value) => {
        return targetType.get(value)
    })

    let D = __documents[docTypeName];
    let orderSpec = __documents[docTypeName]['ordered'] ? __documents[docTypeName]['ordered'][key] : null;
    if(orderSpec && doc[key]) {
        doc[key] = _.orderBy(doc[key], orderSpec.fields, orderSpec.order);
    }
}

/**
 * Takes a value from the database and a target type (potentially nested structures, i.e. runtime version of `ReferenceType`) and
 * rebuilds a target-type'd object hierarchy based on that. The actual values are resolved with the function `resolveValue`.
 *
 * @param targetType
 * @param value
 * @param resolveValue
 * @returns {any}
 */
async function unwind(targetType, value, resolveValue:(targetType, v:any) => Promise<any>) {
    if (!value) {
        return value;
    }

    if (isArray(targetType)) {
        if (!isArray(value)) {
            throw new Error('Expecting array, got: ' + value.constructor);
        }

        return await pmap(value, async function (v, i) {
            return await unwind(targetType[0], v, resolveValue)
        })
    } else {
        return await resolveValue(targetType, value);
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

            if (!referenceOptions.lazy || resolveLazyReferences === true || (isArray(resolveLazyReferences) && ~(<Array<string>>resolveLazyReferences).indexOf(key))) {
                await populateReference(doc, key);
            }
        } else if (__documents[typeName]['embeds'][key]) {
            let embeddedType = __documents[typeName]['embeds'][key];

            doc[key] = await unwind(embeddedType, doc[key], (targetType, value) => {
                return fromDB<any>(targetType, value)
            });
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
    for (var prop of Object.getOwnPropertyNames(__documents)) {
        if (__documents[prop].type._collectionName) {
            collections[prop] = __documents[prop];
        }
    }
    return collections;
}

export var __documents = {}