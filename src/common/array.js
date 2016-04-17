"use strict";
function isArray(obj) {
    return obj && obj.constructor == Array;
}
exports.isArray = isArray;
function pmap(array, fn) {
    return Promise.all(array.map(function (v, i, a) {
        return fn(v, i, a);
    }));
}
exports.pmap = pmap;
