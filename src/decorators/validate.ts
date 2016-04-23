import {setupDocument, __documents} from "../core";

export function validate(options:ValidateOptions):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        if(!options) {
            throw new Error('Options of @validate decorator at '+target.constructor.name+':'+propertyKey+' are undefined');
        }

        setupDocument(target.constructor);

        __documents[target.constructor.name]['validate'][propertyKey] = options;
    };
}

export interface ValidateOptions {
    required?:boolean
    type?:Object // TODO Check that this is one of the ten types supported by js-schema
}
