"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var DB_1 = require("./DB");
var array_1 = require("./common/array");
var core_1 = require("./core");
var Document_1 = require("./Document");
var Collection = (function (_super) {
    __extends(Collection, _super);
    function Collection() {
        _super.call(this);
        //this.__isNew = true;
    }
    Collection.get = function (_id) {
        return __awaiter(this, void 0, Promise, function* () {
            return this.findOne({ _id: _id });
        });
    };
    Collection.findOne = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            return (yield this.find(selector, 1))[0];
        });
    };
    Collection.find = function (selector, limit, sort) {
        return __awaiter(this, void 0, Promise, function* () {
            var type = this.__type || (this._collectionName ? this : null);
            var coll = yield DB_1.DB.collection(type._collectionName);
            var cursor = coll.find(selector);
            if (limit !== undefined) {
                cursor = cursor.limit(limit);
            }
            if (sort) {
                cursor = cursor.sort(sort);
            }
            var docs = yield cursor.toArray();
            return array_1.pmap(docs, function (doc) { return core_1.rebuildInstance(type, doc); });
        });
    };
    Collection.all = function (type) {
        return __awaiter(this, void 0, Promise, function* () {
            return (yield this.find({}));
        });
    };
    Collection.prototype.isNew = function () {
        //return this.__isNew;
        return !this._id;
    };
    Collection.prototype.save = function (upsert) {
        var _this = this;
        var self = this;
        return new Promise(function (resolve, reject) {
            var collectionName = _this._collectionName;
            if (!collectionName) {
                throw new Error(_this.constructor.name + ' does not seem to be a collection');
            }
            var collection = DB_1.DB.collection(collectionName).then(function (coll) {
                _this._toDb().then(function (doc) {
                    if (_this.isNew()) {
                        coll.insertOne(doc, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            //self.__isNew = false;
                            self._id = result.insertedId;
                            resolve(self);
                        });
                    }
                    else {
                        coll.updateOne({ _id: _this._id }, doc, { upsert: upsert }, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(self);
                        });
                    }
                }).catch(reject);
            }).catch(reject);
        });
    };
    Collection.prototype.upsert = function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.save(true);
        });
    };
    Collection.prototype._collectionName = function () {
        return this._collectionName;
    };
    Collection.prototype._collection = function () {
        return __awaiter(this, void 0, Promise, function* () {
            return DB_1.DB.collection(this._collectionName());
        });
    };
    return Collection;
}(Document_1.Document));
exports.Collection = Collection;
