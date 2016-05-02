import {__documents, setupDocument} from "../core";
let assert = require('assert');

export function reference(type:Function, options?:ReferenceOptions):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        setupDocument(target.constructor);
        assert(__documents[target.constructor.name]);

        __documents[target.constructor.name]['references'][propertyKey] = options || {};
        __documents[target.constructor.name]['references'][propertyKey].type = type;
    };
}

export interface ReferenceOptions {
    lazy:boolean
}