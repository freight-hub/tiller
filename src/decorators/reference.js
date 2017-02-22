"use strict";
var core_1 = require("../core");
var assert = require('assert');
function reference(type, options) {
    options = options || {};
    if (!type) {
        var stack = new Error().stack
            .split('\n')
            .filter(function (l) { return !!l.match(/\.ts/); })
            .map(function (l) { return l.match(/[^\/]+\.ts:[0-9]+:[0-9]+/)[0]; });
        throw new Error('type is undefined (transitive cyclic import in ' + stack.join(' -> ') + ', consider using import option)');
    }
    return function (target, propertyKey, descriptor) {
        core_1.setupDocument(target.constructor);
        assert(core_1.__documents[target.constructor.name]);
        core_1.__documents[target.constructor.name]['references'][propertyKey] = options;
        core_1.__documents[target.constructor.name]['references'][propertyKey].type = function () {
            var t = type;
            if (options.import) {
                t = t[options.import];
                if (!t) {
                    throw new Error('referenced type could not be resolved');
                }
            }
            return t;
        };
    };
}
exports.reference = reference;
