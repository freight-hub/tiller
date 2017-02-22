"use strict";
var core_1 = require("../core");
function collection(name) {
    return function (target, propertyKey, descriptor) {
        var collectionName = name || target.name.toLowerCase() + 's';
        target._collectionName = collectionName;
        target.prototype._collectionName = collectionName;
        core_1.setupDocument(target);
    };
}
exports.collection = collection;
