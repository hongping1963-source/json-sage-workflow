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
exports.JsonAnalyzer = void 0;
var JsonAnalyzer = /** @class */ (function () {
    function JsonAnalyzer() {
        this.commonPatterns = {
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
            phone: /^\+?[1-9]\d{1,14}$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            time: /^\d{2}:\d{2}(:\d{2})?$/,
            datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:?\d{2})?$/,
            uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        };
    }
    JsonAnalyzer.prototype.analyze = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var insights, metrics, fields, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.analyzeStructure(data)];
                    case 1:
                        insights = _a.sent();
                        metrics = this.calculateMetrics(data);
                        fields = this.getFieldInfo(data);
                        return [2 /*return*/, {
                                insights: insights.map(function (i) { return i.message; }),
                                metrics: metrics,
                                fields: fields
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error analyzing JSON data:', error_1);
                        throw new Error("JSON analysis failed: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JsonAnalyzer.prototype.analyzeStructure = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var insights, fieldCount, _i, _a, _b, key, value, elementTypes, complexity;
            return __generator(this, function (_c) {
                insights = [];
                try {
                    // 检查数据类型
                    if (typeof data !== 'object' || data === null) {
                        insights.push({
                            type: 'data_quality',
                            message: '输入数据必须是对象类型',
                            severity: 'error'
                        });
                        return [2 /*return*/, insights];
                    }
                    fieldCount = Object.keys(data).length;
                    if (fieldCount === 0) {
                        insights.push({
                            type: 'data_quality',
                            message: '输入数据不能为空对象',
                            severity: 'error'
                        });
                    }
                    else if (fieldCount > 100) {
                        insights.push({
                            type: 'performance',
                            message: '字段数量过多可能影响性能',
                            severity: 'warning'
                        });
                    }
                    // 分析字段类型和命名
                    for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        // 检查字段名格式
                        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
                            insights.push({
                                type: 'naming',
                                message: "\u5B57\u6BB5\u540D \"".concat(key, "\" \u4E0D\u7B26\u5408\u547D\u540D\u89C4\u8303"),
                                severity: 'warning'
                            });
                        }
                        // 检查字段值类型
                        if (value === undefined) {
                            insights.push({
                                type: 'data_quality',
                                message: "\u5B57\u6BB5 \"".concat(key, "\" \u7684\u503C\u4E0D\u80FD\u4E3Aundefined"),
                                severity: 'error'
                            });
                        }
                        // 检查数组类型的一致性
                        if (Array.isArray(value) && value.length > 0) {
                            elementTypes = new Set(value.map(function (v) { return typeof v; }));
                            if (elementTypes.size > 1) {
                                insights.push({
                                    type: 'data_quality',
                                    message: "\u5B57\u6BB5 \"".concat(key, "\" \u7684\u6570\u7EC4\u5143\u7D20\u7C7B\u578B\u4E0D\u4E00\u81F4"),
                                    severity: 'warning'
                                });
                            }
                        }
                        // 检查嵌套对象的复杂度
                        if (typeof value === 'object' && value !== null) {
                            complexity = this.calculateComplexity(value);
                            if (complexity > 5) {
                                insights.push({
                                    type: 'complexity',
                                    message: "\u5B57\u6BB5 \"".concat(key, "\" \u7684\u5D4C\u5957\u5C42\u7EA7\u8FC7\u6DF1"),
                                    severity: 'warning'
                                });
                            }
                        }
                    }
                    return [2 /*return*/, insights];
                }
                catch (error) {
                    insights.push({
                        type: 'system',
                        message: '分析数据结构时发生错误',
                        severity: 'error',
                        details: error
                    });
                    return [2 /*return*/, insights];
                }
                return [2 /*return*/];
            });
        });
    };
    JsonAnalyzer.prototype.getFieldInfo = function (data) {
        var fieldInfo = [];
        if (typeof data !== 'object' || data === null) {
            return fieldInfo;
        }
        for (var _i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            var info = {
                path: key,
                type: this.getFieldType(value),
                isRequired: true,
                format: this.detectFormat(value)
            };
            fieldInfo.push(info);
        }
        return fieldInfo;
    };
    JsonAnalyzer.prototype.calculateMetrics = function (data) {
        var typeDistribution = new Map();
        var nullCount = 0;
        var depth = 0;
        var arrayDepth = 0;
        var traverse = function (value, currentDepth, currentArrayDepth) {
            var type = typeof value;
            typeDistribution.set(type, (typeDistribution.get(type) || 0) + 1);
            if (value === null) {
                nullCount++;
            }
            else if (Array.isArray(value)) {
                arrayDepth = Math.max(arrayDepth, currentArrayDepth + 1);
                value.forEach(function (item) { return traverse(item, currentDepth + 1, currentArrayDepth + 1); });
            }
            else if (typeof value === 'object') {
                depth = Math.max(depth, currentDepth + 1);
                Object.values(value).forEach(function (v) { return traverse(v, currentDepth + 1, currentArrayDepth); });
            }
        };
        traverse(data, 0, 0);
        return {
            depth: depth,
            arrayDepth: arrayDepth,
            nullCount: nullCount,
            fieldCount: Object.keys(data).length,
            typeDistribution: typeDistribution,
            mixedTypes: this.findMixedTypeArrays(data)
        };
    };
    JsonAnalyzer.prototype.calculateComplexity = function (data) {
        var complexity = 1;
        if (typeof data !== 'object' || data === null) {
            return complexity;
        }
        for (var _i = 0, _a = Object.values(data); _i < _a.length; _i++) {
            var value = _a[_i];
            if (typeof value === 'object' && value !== null) {
                complexity += this.calculateComplexity(value);
            }
        }
        return complexity;
    };
    JsonAnalyzer.prototype.getFieldType = function (value) {
        if (value === null)
            return 'null';
        if (Array.isArray(value)) {
            if (value.length === 0)
                return 'array';
            var elementType = this.getFieldType(value[0]);
            return "array<".concat(elementType, ">");
        }
        return typeof value;
    };
    JsonAnalyzer.prototype.detectFormat = function (value) {
        if (typeof value !== 'string')
            return '';
        for (var _i = 0, _a = Object.entries(this.commonPatterns); _i < _a.length; _i++) {
            var _b = _a[_i], format = _b[0], pattern = _b[1];
            if (pattern.test(value)) {
                return format;
            }
        }
        return '';
    };
    JsonAnalyzer.prototype.findMixedTypeArrays = function (data) {
        var mixedTypes = [];
        var checkArray = function (value, path) {
            if (value.length > 1) {
                var types = new Set(value.map(function (v) { return typeof v; }));
                if (types.size > 1) {
                    mixedTypes.push("".concat(path, ": ").concat(Array.from(types).join('|')));
                }
            }
        };
        var traverse = function (obj, path) {
            if (path === void 0) { path = ''; }
            if (Array.isArray(obj)) {
                checkArray(obj, path);
                obj.forEach(function (item, index) {
                    if (typeof item === 'object' && item !== null) {
                        traverse(item, "".concat(path, "[").concat(index, "]"));
                    }
                });
            }
            else if (typeof obj === 'object' && obj !== null) {
                Object.entries(obj).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    var newPath = path ? "".concat(path, ".").concat(key) : key;
                    if (typeof value === 'object' && value !== null) {
                        traverse(value, newPath);
                    }
                });
            }
        };
        traverse(data);
        return mixedTypes;
    };
    return JsonAnalyzer;
}());
exports.JsonAnalyzer = JsonAnalyzer;
