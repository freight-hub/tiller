"use strict";
var core_1 = require("../core");
var assert = require('assert');
function embed(type) {
    return function (target, propertyKey, descriptor) {
        if (!type) {
            throw new Error('Type of @embeds decorator at ' + target.constructor.name + ':' + propertyKey + ' is undefined');
        }
        core_1.setupDocument(target.constructor);
        assert(core_1.__documents[target.constructor.name]);
        core_1.__documents[target.constructor.name]['embeds'][propertyKey] = type;
    };
}
exports.embed = embed;
