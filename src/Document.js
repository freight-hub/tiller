"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var core_1 = require("./core");
var array_1 = require("./common/array");
var assert = require('assert');
var Document = (function () {
    function Document() {
    }
    Document.prototype._toDb = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var copy = {};
            var keys = Object.keys(this);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (!this[key]) {
                    copy[key] = this[key];
                    continue;
                }
                // Ignore keys, prefixed with "__"
                if (key.indexOf('__') >= 0) {
                    continue;
                }
                else if (!array_1.isArray(this[key]) && core_1.__documents[this.constructor.name] && core_1.__documents[this.constructor.name]['references'][key]) {
                    if (this[key].isNew()) {
                        yield this[key].save();
                    }
                    assert(this[key]._id);
                    copy[key] = this[key]._id;
                }
                else if (array_1.isArray(this[key]) && core_1.__documents[this.constructor.name]['references'][key]) {
                    var p = this[key].map(function (v) {
                        if (v.isNew()) {
                            return v.save();
                        }
                        else {
                            return Promise.resolve(v);
                        }
                    });
                    copy[key] = (yield Promise.all(p)).map(function (v) { return v._id; });
                }
                else if (!array_1.isArray(this[key]) && core_1.__documents[this[key].constructor.name] && core_1.__documents[this.constructor.name]['embeds'][key]) {
                    copy[key] = yield this[key]._toDb();
                }
                else if (array_1.isArray(this[key]) && core_1.__documents[this.constructor.name]['embeds'][key]) {
                    copy[key] = yield Promise.all(this[key].map(function (v) { return v._toDb(); }));
                }
                else {
                    copy[key] = this[key];
                }
            }
            return this._serialize(copy);
        });
    };
    Document.prototype._serialize = function (obj) {
        return obj;
    };
    Document.prototype._deserialize = function (doc) {
        return doc;
    };
    return Document;
}());
exports.Document = Document;
