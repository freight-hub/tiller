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
var core_1 = require("../core");
var array_1 = require("../common/array");
var schema = require('js-schema');
function validate(options) {
    return function (target, propertyKey, descriptor) {
        if (!options) {
            throw new Error('Options of @validate decorator at ' + target.constructor.name + ':' + propertyKey + ' are undefined');
        }
        core_1.setupDocument(target.constructor);
        core_1.__documents[target.constructor.name]['validate'][propertyKey] = options;
    };
}
exports.validate = validate;
function validateDocument(doc) {
    return __awaiter(this, void 0, void 0, function () {
        function validateEmbedded(v, doc) {
            return __awaiter(this, void 0, void 0, function () {
                var embedValidation, _i, doc_1, el, embedValidation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!doc)
                                return [2 /*return*/];
                            if (!!array_1.isArray(doc)) return [3 /*break*/, 2];
                            return [4 /*yield*/, doc.validate()];
                        case 1:
                            embedValidation = _a.sent();
                            v.addErrors(embedValidation.errors, prop);
                            return [3 /*break*/, 6];
                        case 2:
                            _i = 0, doc_1 = doc;
                            _a.label = 3;
                        case 3:
                            if (!(_i < doc_1.length)) return [3 /*break*/, 6];
                            el = doc_1[_i];
                            if (!el) return [3 /*break*/, 5];
                            return [4 /*yield*/, validateEmbedded(v, el)];
                        case 4:
                            embedValidation = _a.sent();
                            _a.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }
        var v, embeds, _i, _a, prop, validate, references, schemaOpts, requiredLazyRefProps, _b, requiredLazyRefProps_1, requiredLazyRefProp, errors, _c, _d, propertyName;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!(typeof (doc.beforeValidation) == 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, doc.beforeValidation()];
                case 1:
                    _e.sent();
                    _e.label = 2;
                case 2:
                    v = new ValidationResult();
                    embeds = core_1.__documents[doc.constructor.name]['embeds'];
                    _i = 0, _a = Object.getOwnPropertyNames(embeds);
                    _e.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    prop = _a[_i];
                    return [4 /*yield*/, validateEmbedded(v, doc[prop])];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    validate = core_1.__documents[doc.constructor.name]['validate'];
                    references = core_1.__documents[doc.constructor.name]['references'];
                    if (!doc.__schema) {
                        schemaOpts = {};
                        Object.getOwnPropertyNames(validate).forEach(function (p) {
                            var validateOptions = validate[p];
                            if (validateOptions.required && !validateOptions.type) {
                                schemaOpts[p] = undefined;
                            }
                            else if (validateOptions.required && validateOptions.type) {
                                schemaOpts[p] = validateOptions.type;
                            }
                            else if (!validateOptions.required && !validateOptions.type) {
                            }
                            else if (!validateOptions.required && validateOptions.type) {
                                schemaOpts['?' + p] = [validateOptions.type];
                            }
                        });
                        Object.defineProperty(doc, '__schema', {
                            enumerable: false,
                            value: Object.keys(schemaOpts).length > 0 ? schema(schemaOpts) : { errors: function () { } }
                        });
                    }
                    requiredLazyRefProps = Object.keys(validate)
                        .map(function (prop) {
                        return { prop: prop, validate: validate[prop], reference: references[prop] };
                    })
                        .filter(function (v) { return v.validate.required && v.reference && v.reference.lazy; });
                    _b = 0, requiredLazyRefProps_1 = requiredLazyRefProps;
                    _e.label = 7;
                case 7:
                    if (!(_b < requiredLazyRefProps_1.length)) return [3 /*break*/, 10];
                    requiredLazyRefProp = requiredLazyRefProps_1[_b];
                    if (!(!doc[requiredLazyRefProp.prop] && doc[requiredLazyRefProp.prop + '_id'])) return [3 /*break*/, 9];
                    return [4 /*yield*/, doc.loadReference(requiredLazyRefProp.prop)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9:
                    _b++;
                    return [3 /*break*/, 7];
                case 10:
                    errors = doc.__schema.errors(doc) || {};
                    for (_c = 0, _d = Object.getOwnPropertyNames(errors); _c < _d.length; _c++) {
                        propertyName = _d[_c];
                        if (errors[propertyName].constructor == Array) {
                            errors[propertyName].forEach(function (e) { return v.add(propertyName, e); });
                        }
                        else {
                            v.add(propertyName, errors[propertyName]);
                        }
                    }
                    return [2 /*return*/, v];
            }
        });
    });
}
exports.validateDocument = validateDocument;
var ValidationResult = (function () {
    function ValidationResult(errors) {
        this.errors = {};
        this.errors = errors || {};
    }
    ValidationResult.prototype.add = function (property, error) {
        (this.errors[property] || (this.errors[property] = [])).push(error);
    };
    ValidationResult.prototype.addErrors = function (errors, prefix) {
        var _this = this;
        for (var _i = 0, _a = Object.keys(errors || {}); _i < _a.length; _i++) {
            var prop = _a[_i];
            errors[prop].forEach(function (e) { return _this.add(prefix + '.' + prop, e); });
        }
    };
    ValidationResult.prototype.valid = function () {
        return Object.getOwnPropertyNames(this.errors).length == 0;
    };
    ValidationResult.prototype.toString = function () {
        var str = [];
        for (var _i = 0, _a = Object.keys(this.errors || {}); _i < _a.length; _i++) {
            var key = _a[_i];
            str.push(key + ': ' + this.errors[key].join(','));
        }
        return str.join('\n');
    };
    return ValidationResult;
}());
exports.ValidationResult = ValidationResult;
var ValidationError = (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, validationResult) {
        var _this = _super.call(this, message) || this;
        _this.validationResult = validationResult;
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
