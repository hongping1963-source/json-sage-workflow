"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaGenerator = void 0;
var SchemaGenerator = /** @class */ (function () {
    function SchemaGenerator() {
        this.commonPatterns = {
            email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            url: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$',
            phone: '^\\+?[1-9]\\d{1,14}$',
            date: '^\\d{4}-\\d{2}-\\d{2}$',
            time: '^\\d{2}:\\d{2}(:\\d{2})?$',
            datetime: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?(Z|[+-]\\d{2}:?\\d{2})?$'
        };
        this.fieldNameMap = {
            '名称': 'name',
            '姓名': 'name',
            '标题': 'title',
            '价格': 'price',
            '描述': 'description',
            '年龄': 'age',
            '邮箱': 'email',
            '电话': 'phone',
            '地址': 'address',
            '创建时间': 'createdAt',
            '更新时间': 'updatedAt',
            '状态': 'status',
            '类型': 'type',
            '标签': 'tags',
            '备注': 'remarks'
        };
    }
    SchemaGenerator.prototype.generate = function (nluResult) {
        return __awaiter(this, void 0, void 0, function () {
            var schema;
            var _this = this;
            return __generator(this, function (_a) {
                if (!nluResult.fields || nluResult.fields.length === 0) {
                    throw new Error('Fields cannot be empty');
                }
                schema = {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    title: "".concat(nluResult.entity, " Schema"),
                    description: "Schema for ".concat(nluResult.entity),
                    properties: {},
                    required: [],
                    additionalProperties: false
                };
                nluResult.fields.forEach(function (field) {
                    var fieldName = _this.fieldNameMap[field.name] || _this.camelCase(field.name);
                    schema.required.push(fieldName);
                    var property = {
                        type: _this.normalizeType(field.type),
                        description: "".concat(field.name, "\u5B57\u6BB5")
                    };
                    // 根据字段名和类型添加验证规则
                    _this.addValidationRules(property, fieldName, field.type, field.format);
                    schema.properties[fieldName] = property;
                });
                return [2 /*return*/, schema];
            });
        });
    };
    SchemaGenerator.prototype.normalizeType = function (type) {
        var typeMap = {
            'string': 'string',
            'text': 'string',
            'number': 'number',
            'integer': 'integer',
            'boolean': 'boolean',
            'array': 'array',
            'object': 'object',
            'date': 'string',
            'datetime': 'string',
            'time': 'string',
            'email': 'string',
            'url': 'string',
            'phone': 'string'
        };
        return typeMap[type.toLowerCase()] || 'string';
    };
    SchemaGenerator.prototype.addValidationRules = function (property, fieldName, type, format) {
        // 添加格式验证
        if (format) {
            property.format = format;
        }
        // 根据字段名添加特定验证规则
        switch (fieldName) {
            case 'email':
                property.format = 'email';
                property.pattern = this.commonPatterns.email;
                break;
            case 'url':
                property.format = 'uri';
                property.pattern = this.commonPatterns.url;
                break;
            case 'phone':
                property.pattern = this.commonPatterns.phone;
                break;
            case 'price':
            case 'amount':
                property.minimum = 0;
                property.type = 'number';
                break;
            case 'age':
                property.minimum = 0;
                property.maximum = 150;
                property.type = 'integer';
                break;
            case 'createdAt':
            case 'updatedAt':
                property.format = 'date-time';
                property.pattern = this.commonPatterns.datetime;
                break;
            case 'status':
                property.enum = ['active', 'inactive', 'pending', 'deleted'];
                break;
            case 'tags':
                property.type = 'array';
                property.items = { type: 'string' };
                property.minItems = 0;
                property.uniqueItems = true;
                break;
        }
        // 根据类型添加通用验证规则
        if (property.type === 'string' && !property.pattern) {
            property.minLength = 1;
            property.maxLength = 1000;
        }
    };
    SchemaGenerator.prototype.camelCase = function (str) {
        return str
            .replace(/[\s-_]+(.)/g, function (_, c) { return c.toUpperCase(); })
            .replace(/^(.)/, function (c) { return c.toLowerCase(); })
            .replace(/[^\w\s]/gi, '');
    };
    return SchemaGenerator;
}());
exports.SchemaGenerator = SchemaGenerator;
