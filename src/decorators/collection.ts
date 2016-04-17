import {setupDocument} from '../core'

export function collection(name?:string):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        let collectionName = name || target.name.toLowerCase() + 's';
        target._collectionName = collectionName;
        target.prototype._collectionName = collectionName;

        setupDocument(target)
    };
}