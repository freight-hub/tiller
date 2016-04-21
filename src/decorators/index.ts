import {__documents, setupDocument} from "../core";
import {DB} from "../DB";
import {__collections} from "../core";
let assert = require('assert');

export function index(options?:IndexOptions):any {
    return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
        setupDocument(target.constructor);

        __documents[target.constructor.name]['indexes'][propertyKey] = options || {};
    };
}

export interface IndexOptions {
    unique?:boolean
}

DB.on('connected', () => {
    function it(typeName, path) {
        var paths = [];
        let indexes = __documents[typeName]['indexes'];
        for (var prop in indexes) {
            paths.push({
                path: (path ? path + '.' : '') + prop,
                options: indexes[prop]
            })
        }

        let embeds = __documents[typeName]['embeds'];
        for (var prop in embeds) {
            paths = paths.concat(it(embeds[prop].name, (path ? path + '.' : '') + prop));
        }
        return paths;
    }

    var promises = [];
    var collections = __collections();
    for (var collectionTypeName in collections) {
        let indexes = it(collectionTypeName, null);
        for (var index of indexes) {
            let collectionName = collections[collectionTypeName].type._collectionName;

            var spec = {};
            spec[index.path] = 1;

            let options = index.options;
            options.background = false;

            promises.push(DB.db.createIndex(collectionName, spec, options))
        }
    }

    Promise.all(promises).then((r) => {
        DB.emit('indexesCreated', r);
    }).catch((e) => {
        console.error(e.stack);
    })
});