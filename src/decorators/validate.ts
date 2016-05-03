import {setupDocument, __documents} from "../core";
import {Document} from "../Document";
import {isArray} from "../common/array";
let schema = require('js-schema');

export function validate(options:ValidateOptions):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        if (!options) {
            throw new Error('Options of @validate decorator at ' + target.constructor.name + ':' + propertyKey + ' are undefined');
        }

        setupDocument(target.constructor);

        __documents[target.constructor.name]['validate'][propertyKey] = options;
    };
}

export async function validateDocument(doc:any):Promise<ValidationResult> {
    if(typeof(doc.beforeValidation) == 'function') {
        await doc.beforeValidation();
    }

    let v = new ValidationResult();

    let embeds = __documents[doc.constructor.name]['embeds'];
    for(var prop of Object.getOwnPropertyNames(embeds)) {
        if(doc[prop]) {
            if(!isArray(doc[prop])) {
                let embedValidation = await doc[prop].validate();
                v.addErrors(embedValidation.errors, prop);
            } else {
                for(var el of doc[prop]) {
                  if(el) {
                    let embedValidation = await el.validate();
                    v.addErrors(embedValidation.errors, prop);
                  }
                }
            }
        }
    }

    let validate = __documents[doc.constructor.name]['validate'];
    let references = __documents[doc.constructor.name]['references'];

    if (!doc.__schema) {
        var schemaOpts = {};
        Object.getOwnPropertyNames(validate).forEach(p => {
            let validateOptions:ValidateOptions = validate[p];
            if (validateOptions.required && !validateOptions.type) {
                schemaOpts[p] = undefined;
            } else if (validateOptions.required && validateOptions.type) {
                schemaOpts[p] = validateOptions.type;
            } else if (!validateOptions.required && !validateOptions.type) {

            } else if (!validateOptions.required && validateOptions.type) {
                schemaOpts['?' + p] = [validateOptions.type];
            }
        })
        doc.__schema = schema(schemaOpts);
    }

    let requiredLazyRefProps = Object.keys(validate)
        .map(prop => {return {prop: prop, validate: validate[prop], reference: references[prop]}})
        .filter(v => v.validate.required && v.reference && v.reference.lazy);

    for(var requiredLazyRefProp of requiredLazyRefProps) {
        if(!doc[requiredLazyRefProp.prop] && doc[requiredLazyRefProp.prop+'_id']) {
            await doc.loadReference(requiredLazyRefProp.prop);
        }
    }

    let errors = doc.__schema.errors(doc) || {};
    for (var propertyName of Object.getOwnPropertyNames(errors)) {
        if (errors[propertyName].constructor == Array) {
            errors[propertyName].forEach(e => v.add(propertyName, e))
        } else {
            v.add(propertyName, errors[propertyName])
        }
    }

    return v;
}

export interface ValidateOptions {
    required?:boolean
    type?:Object // TODO Check that this is one of the ten types supported by js-schema
}

export class ValidationResult {
    errors:{[property:string]:Array<string>} = {}

    constructor(errors?) {
        this.errors = errors || {};
    }

    add(property:string, error:string) {
        (this.errors[property] || (this.errors[property] = [])).push(error);
    }

    addErrors(errors:{[property:string]:Array<string>}, prefix:string) {
        for(var prop of Object.keys(errors || {})) {
            errors[prop].forEach(e => this.add(prefix+'.'+prop, e))
        }
    }

    valid() {
        return Object.getOwnPropertyNames(this.errors).length == 0;
    }

    toString() {
        let str = [];
        for(var key of Object.keys(this.errors || {})) {
            str.push(key+': '+this.errors[key].join(','));
        }
        return str.join('\n');
    }
}

export class ValidationError extends Error {
    validationResult:ValidationResult

    constructor(message:string, validationResult:ValidationResult) {
        super(message);
        this.validationResult = validationResult;
    }
}
