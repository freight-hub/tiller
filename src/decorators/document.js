"use strict";
var core_1 = require("../core");
function document() {
    return function (target, propertyKey, descriptor) {
        core_1.setupDocument(target);
    };
}
exports.document = document;
