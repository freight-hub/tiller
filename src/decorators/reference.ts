import {__documents, setupDocument} from "../core";
let assert = require('assert');

export interface CompoundReferenceType {
    types:Array<any>
}
export type ScalarReferenceType = Function | CompoundReferenceType;
export type ReferenceType = ScalarReferenceType | Array<ScalarReferenceType> | Array<Array<ScalarReferenceType>> | Array<Array<Array<ScalarReferenceType>>>;

export function reference(type:ReferenceType, options?:ReferenceOptions):any {
    options = options || {};

    if(!type) {
        let stack = new Error().stack
            .split('\n')
            .filter(l => !!l.match(/\.ts/))
            .map(l => l.match(/[^\/]+\.ts:[0-9]+:[0-9]+/)[0])
        throw new Error('type is undefined (transitive cyclic import in '+stack.join(' -> ')+', consider using import option)')
    }

    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {


        setupDocument(target.constructor);
        assert(__documents[target.constructor.name]);

        __documents[target.constructor.name]['references'][propertyKey] = options;
        __documents[target.constructor.name]['references'][propertyKey].type = function() {
            let t = type;
            if(options.import) {
                t = t[options.import]
                if(!t) {
                    throw new Error('referenced type could not be resolved')
                }
            }
            return t;
        }
    };
}

export interface ReferenceOptions {
    lazy?:boolean
    type?:ReferenceType
    import?:string
}