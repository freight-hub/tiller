import {setupDocument} from "../core";

export function document():any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        setupDocument(target)
    };
}