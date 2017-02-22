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
var array_1 = require("./common/array");
var Document_1 = require("./Document");
var _ = require("lodash");
var Bluebird = require("bluebird");
var assert = require('assert');
// TODO This can be optimized with $lookup and also $in
function populateReference(doc, key) {
    return __awaiter(this, void 0, void 0, function () {
        var docTypeName, referenceSpec, _a, _b, D, orderSpec;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (doc[key])
                        return [2 /*return*/];
                    docTypeName = doc.constructor.name;
                    referenceSpec = exports.__documents[docTypeName]['references'][key];
                    _a = doc;
                    _b = key;
                    return [4 /*yield*/, unwind(referenceSpec.type(), doc[key + '_id'], function (targetType, value) {
                            return targetType.get(value);
                        })];
                case 1:
                    _a[_b] = _c.sent();
                    D = exports.__documents[docTypeName];
                    orderSpec = exports.__documents[docTypeName]['ordered'] ? exports.__documents[docTypeName]['ordered'][key] : null;
                    if (orderSpec && doc[key]) {
                        doc[key] = _.orderBy(doc[key], orderSpec.fields, orderSpec.order);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.populateReference = populateReference;
/**
 * Takes a value from the database and a target type (potentially nested structures, i.e. runtime version of `ReferenceType`) and
 * rebuilds a target-type'd object hierarchy based on that. The actual values are resolved with the function `resolveValue`.
 *
 * @param targetType
 * @param value
 * @param resolveValue
 * @returns {any}
 */
function unwind(targetType, value, resolveValue) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!value) {
                        return [2 /*return*/, value];
                    }
                    if (!array_1.isArray(targetType)) return [3 /*break*/, 2];
                    if (!array_1.isArray(value)) {
                        throw new Error('Expecting array, got: ' + value.constructor);
                    }
                    return [4 /*yield*/, Bluebird.map(value, function (v, i) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, unwind(targetType[0], v, resolveValue)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            });
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, resolveValue(targetType, value)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function fromDB(type, doc, dontDeserialize, resolveLazyReferences) {
    return __awaiter(this, void 0, void 0, function () {
        var typeName, keys, i, key, referenceOptions, i, key, embeddedType, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!doc) {
                        return [2 /*return*/, doc];
                    }
                    typeName = type.name;
                    assert(typeName);
                    if (!dontDeserialize) {
                        doc = type.prototype._deserialize(doc);
                    }
                    Object.setPrototypeOf(doc, type.prototype);
                    keys = Object.keys(exports.__documents[typeName]['references']);
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < keys.length)) return [3 /*break*/, 4];
                    key = keys[i];
                    if (doc[key] === undefined && doc[key + '_id'] === undefined)
                        return [3 /*break*/, 3];
                    referenceOptions = exports.__documents[typeName]['references'][key];
                    if (!(!referenceOptions.lazy || resolveLazyReferences === true || (array_1.isArray(resolveLazyReferences) && ~resolveLazyReferences.indexOf(key)))) return [3 /*break*/, 3];
                    return [4 /*yield*/, populateReference(doc, key)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    keys = Object.keys(exports.__documents[typeName]['embeds']);
                    i = 0;
                    _c.label = 5;
                case 5:
                    if (!(i < keys.length)) return [3 /*break*/, 8];
                    key = keys[i];
                    if (doc[key] === undefined)
                        return [3 /*break*/, 7];
                    embeddedType = exports.__documents[typeName]['embeds'][key];
                    _a = doc;
                    _b = key;
                    return [4 /*yield*/, unwind(embeddedType, doc[key], function (targetType, value) { return fromDB(targetType, value); })];
                case 6:
                    _a[_b] = _c.sent();
                    _c.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8: return [2 /*return*/, doc];
            }
        });
    });
}
exports.fromDB = fromDB;
function setupDocument(type) {
    if (!type.name) {
        throw new Error('Type ' + type + ' cannot be resolved ');
    }
    if (!exports.__documents[type.name]) {
        exports.__documents[type.name] = {
            references: {},
            embeds: {},
            type: type,
            ordered: {},
            validate: {},
            indexes: {}
        };
    }
    else {
        if (exports.__documents[type.name].type != type) {
            throw new Error('Type ' + type.name + ' registered twice');
        }
    }
    type.prototype.toDB = Document_1.Document.prototype.toDB;
    if (!type.prototype._serialize) {
        type.prototype._serialize = Document_1.Document.prototype._serialize;
    }
    if (!type.prototype._deserialize) {
        type.prototype._deserialize = Document_1.Document.prototype._deserialize;
    }
    if (!type.prototype.validate) {
        type.prototype.validate = Document_1.Document.prototype.validate;
    }
    if (!type.prototype.loadReference) {
        type.prototype.loadReference = Document_1.Document.prototype.loadReference;
    }
    if (type.find) {
        type.find = type.find.bind(_.extend(type, {
            __type: type
        }));
    }
}
exports.setupDocument = setupDocument;
function __collections() {
    var collections = {};
    for (var _i = 0, _a = Object.getOwnPropertyNames(exports.__documents); _i < _a.length; _i++) {
        var prop = _a[_i];
        if (exports.__documents[prop].type._collectionName) {
            collections[prop] = exports.__documents[prop];
        }
    }
    return collections;
}
exports.__collections = __collections;
exports.__documents = {};
/**
 * Takes a type and flattens it
 *
 * @param type
 * @returns {any}
 */
function unwindType(type) {
    return array_1.isArray(type) ? unwindType(type[0]) : type;
}
exports.unwindType = unwindType;
