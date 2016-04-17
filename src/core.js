"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var _ = require('lodash');
var array_1 = require("./common/array");
var assert = require('assert');
function rebuildInstance(type, doc, dontDeserialize) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!doc) {
            return doc;
        }
        var typeName = type.name;
        assert(typeName);
        if (!dontDeserialize) {
            doc = type.prototype._deserialize(doc);
        }
        Object.setPrototypeOf(doc, type.prototype);
        var keys = Object.keys(doc);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (exports.__documents[typeName]['references'][key]) {
                if (array_1.isArray(doc[key])) {
                    var docs = [];
                    for (var _i = 0, _a = doc[key]; _i < _a.length; _i++) {
                        var el = _a[_i];
                        //docs.push(await Collection.get<any>(el).bind({__type: __documents[typeName]['references'][key]}));
                        docs.push(yield exports.__documents[typeName]['references'][key].get(el));
                    }
                    doc[key] = docs;
                }
                else {
                    doc[key] = yield exports.__documents[typeName]['references'][key].get(doc[key]);
                }
            }
            else if (exports.__documents[typeName]['embeds'][key]) {
                doc[key] = exports.__documents[typeName]['embeds'][key].prototype._deserialize(doc[key]);
                if (array_1.isArray(doc[key])) {
                    var docs = [];
                    for (var _b = 0, _c = doc[key]; _b < _c.length; _b++) {
                        var el = _c[_b];
                        docs.push(yield rebuildInstance(exports.__documents[typeName]['embeds'][key], el));
                    }
                    doc[key] = docs;
                }
                else {
                    doc[key] = yield rebuildInstance(exports.__documents[typeName]['embeds'][key], doc[key], true);
                }
            }
        }
        return doc;
    });
}
exports.rebuildInstance = rebuildInstance;
function setupDocument(type) {
    if (!type.name) {
        throw new Error('type is not valid'); // TODO
    }
    if (!exports.__documents[type.name]) {
        exports.__documents[type.name] = { references: {}, embeds: {}, type: type };
    }
    else {
        if (exports.__documents[type.name].type != type) {
            throw new Error('Type ' + type.name + ' registered twice');
        }
    }
    type.prototype._toDb = Document.prototype._toDb;
    if (!type.prototype._serialize) {
        type.prototype._serialize = Document.prototype._serialize;
    }
    if (!type.prototype._deserialize) {
        type.prototype._deserialize = Document.prototype._deserialize;
    }
    if (type.find) {
        type.find = type.find.bind(_.extend(type, {
            __type: type
        }));
    }
}
exports.setupDocument = setupDocument;
exports.__documents = {};
exports.collections = {};
