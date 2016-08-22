const Promise = require("bluebird");

export function isArray(obj:any) {
    return obj && obj.constructor == Array;
}
