"use strict";
var core_1 = require("../core");
var assert = require('assert');
function reference(type) {
    return function (target, propertyKey, descriptor) {
        core_1.setupDocument(target.constructor);
        assert(core_1.__documents[target.constructor.name]);
        core_1.__documents[target.constructor.name]['references'][propertyKey] = type;
    };
}
exports.reference = reference;
