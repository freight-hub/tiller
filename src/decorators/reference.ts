import {__documents, setupDocument} from "../core";
let assert = require('assert');

export interface CompoundReferenceType {
    types:Array<any>
}
export type ScalarReferenceType = Function | CompoundReferenceType;
export type ReferenceType = ScalarReferenceType | Array<ScalarReferenceType> | Array<Array<ScalarReferenceType>> | Array<Array<Array<ScalarReferenceType>>>;

export function reference(type:ReferenceType, options?:ReferenceOptions):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        setupDocument(target.constructor);
        assert(__documents[target.constructor.name]);

        __documents[target.constructor.name]['references'][propertyKey] = options || {};
        __documents[target.constructor.name]['references'][propertyKey].type = type;
    };
}

export interface ReferenceOptions {
    lazy?:boolean
    type?:ReferenceType
}