"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var mongodb_1 = require("mongodb");
var _DB = (function () {
    function _DB() {
    }
    _DB.prototype.connect = function (dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dbName = dbName;
            if (this.db) {
                Promise.resolve(this.db);
            }
            else {
                var url = 'mongodb://localhost:27017/' + this.dbName;
                var options = { server: { socketOptions: { autoReconnect: true } } };
                this.db = yield mongodb_1.MongoClient.connect(url, options);
            }
        });
    };
    _DB.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.close();
        });
    };
    _DB.prototype.isConnected = function () {
        return this.db != null;
    };
    _DB.prototype.collection = function (collectionName) {
        return __awaiter(this, void 0, Promise, function* () {
            return this.db.collection(collectionName);
        });
    };
    _DB.prototype.command = function (command) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.command(command);
        });
    };
    return _DB;
}());
exports._DB = _DB;
exports.DB = new _DB();
