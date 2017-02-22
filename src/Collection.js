"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var DB_1 = require("./DB");
var core_1 = require("./core");
var Document_1 = require("./Document");
var validate_1 = require("./decorators/validate");
var Bluebird = require("bluebird");
var Collection = (function (_super) {
    __extends(Collection, _super);
    function Collection() {
        var _this = _super.call(this) || this;
        _this.__isSaved = false;
        Object.defineProperty(_this, '__isSaved', {
            enumerable: false
        });
        return _this;
    }
    Collection.create = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var type;
            return __generator(this, function (_a) {
                type = this.__type || (this._collectionName ? this : null);
                return [2 /*return*/, core_1.fromDB(type, obj)];
            });
        });
    };
    /**
     * Allows "mass-override" of properties, using a plain JavaScript object/hierarchy.
     *
     * @param obj
     * @returns {Collection}
     */
    Collection.prototype.updateProperties = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var doc, _i, _a, key;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, core_1.fromDB(this.constructor, obj)];
                    case 1:
                        doc = _b.sent();
                        for (_i = 0, _a = Object.keys(doc); _i < _a.length; _i++) {
                            key = _a[_i];
                            if (key.indexOf('__') == 0) {
                                continue;
                            }
                            this[key] = doc[key];
                        }
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Collection.get = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findOne({ _id: _id })];
            });
        });
    };
    Collection.findOne = function (selector) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find(selector, 1)];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    Collection.find = function (selector, limit, sort) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var type, coll, cursor, docs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = this.__type || (this._collectionName ? this : null);
                        return [4 /*yield*/, DB_1.DB.collection(type._collectionName)];
                    case 1:
                        coll = _a.sent();
                        cursor = coll.find(selector);
                        if (typeof (limit) == 'number') {
                            cursor = cursor.limit(limit);
                        }
                        if (sort) {
                            cursor = cursor.sort(sort);
                        }
                        return [4 /*yield*/, cursor.toArray()];
                    case 2:
                        docs = _a.sent();
                        return [2 /*return*/, Bluebird.map(docs, function (doc) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, core_1.fromDB(type, doc)];
                                        case 1:
                                            doc = _a.sent();
                                            doc.__isSaved = true;
                                            return [2 /*return*/, doc];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    Collection.all = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find({})];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Collection.count = function (selector) {
        return __awaiter(this, void 0, void 0, function () {
            var type, coll, cursor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = this.__type || (this._collectionName ? this : null);
                        return [4 /*yield*/, DB_1.DB.collection(type._collectionName)];
                    case 1:
                        coll = _a.sent();
                        cursor = coll.find(selector || {});
                        return [4 /*yield*/, cursor.count(false)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Saves a new model instance or updates an existing one.
     *
     * @param deep Whether dependant, i.e. `@reference`'d documents should also be saved
     * @param upsert Whether an upsert operation should be performed. This is helpful, if this object was created
     *  with `new`, but the _id already exists in the database.
     * @returns {Collection}
     */
    Collection.prototype.save = function (deep, upsert) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, collectionName, coll, doc, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validate()];
                    case 1:
                        validation = _a.sent();
                        if (!validation.valid()) {
                            throw new validate_1.ValidationError(this.constructor.name + (this.isSaved() ? '#' + this._id : '') + ' is not valid: ' + validation.toString(), validation);
                        }
                        return [4 /*yield*/, this.beforeSave()];
                    case 2:
                        _a.sent();
                        collectionName = this._collectionName;
                        return [4 /*yield*/, DB_1.DB.collection(collectionName)];
                    case 3:
                        coll = _a.sent();
                        return [4 /*yield*/, this.toDB(deep)];
                    case 4:
                        doc = _a.sent();
                        if (!(this.isNew() && !upsert)) return [3 /*break*/, 6];
                        return [4 /*yield*/, coll.insertOne(doc)];
                    case 5:
                        result = _a.sent();
                        this._id = result.insertedId;
                        return [3 /*break*/, 8];
                    case 6:
                        if (!this._id) {
                            throw new Error('To update or upsert a document an _id is required');
                        }
                        return [4 /*yield*/, coll.updateOne({ _id: this._id }, doc, { upsert: upsert })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [4 /*yield*/, this.afterSave()];
                    case 9:
                        _a.sent();
                        this.__isSaved = true;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Performs an upsert operation with this model.
     * Equivalent to `save(deep, true)`;
     *
     * @param deep
     * @returns {Promise<Collection>}
     */
    Collection.prototype.upsert = function (deep) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.save(deep, true)];
            });
        });
    };
    Collection.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var collectionName, coll;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._id) {
                            throw new Error('Models without an _id cannot be destroyed');
                        }
                        return [4 /*yield*/, this.beforeDestroy()];
                    case 1:
                        _a.sent();
                        collectionName = this._collectionName;
                        return [4 /*yield*/, DB_1.DB.collection(collectionName)];
                    case 2:
                        coll = _a.sent();
                        return [4 /*yield*/, coll.deleteOne({ _id: this._id })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.afterDestroy()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Collection.prototype.isNew = function () {
        return !this.__isSaved;
    };
    /**
     * Returns true if this object is persisted in the database,
     * e.g. save() was called at least once or the object was fetched
     * from the database.
     *
     * @returns {boolean}
     */
    Collection.prototype.isSaved = function () {
        return this.__isSaved;
    };
    Collection.prototype._collectionName = function () {
        return this._collectionName;
    };
    Collection.prototype._collection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, DB_1.DB.collection(this._collectionName())];
            });
        });
    };
    Collection.prototype.beforeSave = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Collection.prototype.afterSave = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Collection.prototype.beforeDestroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Collection.prototype.afterDestroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return Collection;
}(Document_1.Document));
exports.Collection = Collection;
