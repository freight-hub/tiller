"use strict";
var Promise = require("bluebird");
function isArray(obj) {
    return obj && obj.constructor == Array;
}
exports.isArray = isArray;
