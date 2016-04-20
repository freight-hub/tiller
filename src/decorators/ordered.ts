import {setupDocument, __documents} from "../core";
let assert = require('assert');

export function ordered(order:any):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        if(!order) {
            throw new Error('Parameter of @ordered decorator at '+target.constructor.name+':'+propertyKey+' must be provided');
        }

        setupDocument(target.constructor);
        
        __documents[target.constructor.name]['ordered'][propertyKey] = order;
    };
}
