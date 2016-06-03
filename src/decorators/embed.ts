import {setupDocument, __documents, unwindType} from "../core";
import {ReferenceType} from "./reference";
let assert = require('assert');

export function embed(type:ReferenceType):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        if(!unwindType(type)) {
            throw new Error('Type of @embeds decorator at '+target.constructor.name+':'+propertyKey+' is undefined');
        }

        setupDocument(target.constructor);
        assert(__documents[target.constructor.name]);

        __documents[target.constructor.name]['embeds'][propertyKey] = type;
    };
}
