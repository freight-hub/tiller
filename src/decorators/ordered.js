"use strict";
var core_1 = require("../core");
var _ = require("lodash");
var assert = require('assert');
function ordered(fields, order) {
    return function (target, propertyKey, descriptor) {
        if (order && fields.length != order.length) {
            throw new Error('If order of fields in @ordered is given, the order of all fields must be specified.');
        }
        core_1.setupDocument(target.constructor);
        core_1.__documents[target.constructor.name]['ordered'][propertyKey] = {
            fields: fields,
            order: order
        };
    };
}
exports.ordered = ordered;
function orderArray(array, order) {
    return _.orderBy(array, order.map(function (o) { return Object.keys(o)[0]; }), order.map(function (o) { return o[Object.keys(o)[0]]; }));
}
exports.orderArray = orderArray;
