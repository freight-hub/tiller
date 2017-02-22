import {setupDocument, __documents, unwindType} from "../core";
import {ReferenceType, ReferenceOptions} from "./reference";
let assert = require('assert');

export function embed(type:ReferenceType, options?: EmbedOptions):any {
    options = options || {}

    if (!type) {
        let stack = new Error().stack
            .split('\n')
            .filter(l => !!l.match(/\.ts/))
            .map(l => l.match(/[^\/]+\.ts:[0-9]+:[0-9]+/)[0])
        throw new Error('type is undefined (transitive cyclic import in ' + stack.join(' -> ') + ', consider using import option)')
    }

    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        if(!unwindType(type)) {
            throw new Error('Type of @embeds decorator at '+target.constructor.name+':'+propertyKey+' is undefined');
        }

        setupDocument(target.constructor);
        assert(__documents[target.constructor.name]);

        __documents[target.constructor.name]['embeds'][propertyKey] = function () {
            let t = type;
            if (options.import) {
                t = t[options.import]
                if (!t) {
                    throw new Error('embedded type could not be resolved')
                }
            }
            return t;
        }
    };
}

export interface EmbedOptions {
    import?: string
}