import {setupDocument, __documents} from "../core";
let assert = require('assert');

export function embed(type:Function):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        if(!type) {
            throw new Error('Type of @embeds decorator at '+target.constructor.name+':'+propertyKey+' is undefined');
        }

        setupDocument(target.constructor);
        assert(__documents[target.constructor.name]);

        __documents[target.constructor.name]['embeds'][propertyKey] = type;
    };
}
