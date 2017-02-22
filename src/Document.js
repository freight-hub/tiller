"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var core_1 = require("./core");
var array_1 = require("./common/array");
var validate_1 = require("./decorators/validate");
var assert = require('assert');
function mapObjectHierarchy(obj, processScalar) {
    return __awaiter(this, void 0, void 0, function () {
        var mapped, i, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(obj && array_1.isArray(obj))) return [3 /*break*/, 5];
                    mapped = [];
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < obj.length)) return [3 /*break*/, 4];
                    _b = (_a = mapped).push;
                    return [4 /*yield*/, mapObjectHierarchy(obj[i], processScalar)];
                case 2:
                    _b.apply(_a, [_d.sent()]);
                    _d.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, mapped];
                case 5: return [2 /*return*/, processScalar(obj)];
            }
        });
    });
}
var Document = (function () {
    function Document() {
    }
    Document.prototype.toDB = function (saveDeep) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var copy, keys, i, key, __document, _i, _a, v, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        copy = {};
                        keys = Object.keys(this);
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < keys.length)) return [3 /*break*/, 15];
                        key = keys[i];
                        __document = core_1.__documents[this.constructor.name];
                        if (!this[key]) {
                            copy[key] = this[key];
                            return [3 /*break*/, 14];
                        }
                        if (!(key.indexOf('__') >= 0)) return [3 /*break*/, 2];
                        return [3 /*break*/, 14];
                    case 2:
                        if (!(!array_1.isArray(this[key]) && __document && __document['references'][key])) return [3 /*break*/, 5];
                        if (!(saveDeep && this[key].isNew())) return [3 /*break*/, 4];
                        return [4 /*yield*/, this[key].save(saveDeep)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        copy[key + '_id'] = this[key]._id;
                        this[key + '_id'] = this[key]._id;
                        return [3 /*break*/, 14];
                    case 5:
                        if (!(array_1.isArray(this[key]) && __document['references'][key])) return [3 /*break*/, 11];
                        copy[key + '_id'] = [];
                        this[key + '_id'] = [];
                        _i = 0, _a = this[key];
                        _d.label = 6;
                    case 6:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        v = _a[_i];
                        if (!(saveDeep && v.isNew())) return [3 /*break*/, 8];
                        return [4 /*yield*/, v.save(saveDeep)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        copy[key + '_id'].push(v ? v._id : null);
                        this[key + '_id'].push(v ? v._id : null);
                        _d.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10: return [3 /*break*/, 14];
                    case 11:
                        if (!__document['embeds'][key]) return [3 /*break*/, 13];
                        //copy[key] = await Promise.all(this[key].map((v:Document) => v ? v.toDB(saveDeep) : v));
                        _b = copy;
                        _c = key;
                        return [4 /*yield*/, mapObjectHierarchy(this[key], function (obj) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, obj ? obj.toDB(saveDeep) : obj];
                            }); }); })];
                    case 12:
                        //copy[key] = await Promise.all(this[key].map((v:Document) => v ? v.toDB(saveDeep) : v));
                        _b[_c] = _d.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        copy[key] = this[key];
                        _d.label = 14;
                    case 14:
                        i++;
                        return [3 /*break*/, 1];
                    case 15: return [2 /*return*/, this._serialize(copy)];
                }
            });
        });
    };
    Document.prototype._serialize = function (obj) {
        return obj;
    };
    Document.prototype._deserialize = function (doc) {
        return doc;
    };
    Document.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, validate_1.validateDocument(this)];
            });
        });
    };
    Document.prototype.isValid = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validate()];
                    case 1: return [2 /*return*/, (_a.sent()).valid()];
                }
            });
        });
    };
    Document.prototype.loadReference = function (property) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, core_1.populateReference(this, property)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return Document;
}());
exports.Document = Document;
