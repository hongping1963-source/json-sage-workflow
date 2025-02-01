"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SchemaAgent = void 0;
var BaseAgent_1 = require("./BaseAgent");
var NLUParser_1 = require("./NLUParser");
var SchemaGenerator_1 = require("./SchemaGenerator");
var JsonAnalyzer_1 = require("./JsonAnalyzer");
var SchemaAgent = /** @class */ (function (_super) {
    __extends(SchemaAgent, _super);
    function SchemaAgent(config) {
        var _this = _super.call(this, config) || this;
        _this.nluParser = new NLUParser_1.NLUParser(config.deepseekApiKey);
        _this.schemaGenerator = new SchemaGenerator_1.SchemaGenerator();
        _this.jsonAnalyzer = new JsonAnalyzer_1.JsonAnalyzer();
        return _this;
    }
    SchemaAgent.prototype.generateSchema = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, steps, insights, analysis, nluResult, schema, executionTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        steps = [];
                        insights = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        // Step 1: Analyze input data
                        steps.push('Analyzing input data');
                        return [4 /*yield*/, this.jsonAnalyzer.analyze(task.jsonData)];
                    case 2:
                        analysis = _a.sent();
                        insights.push.apply(insights, analysis.insights);
                        // Step 2: Process natural language understanding
                        steps.push('Processing natural language understanding');
                        return [4 /*yield*/, this.nluParser.parse(JSON.stringify(task.jsonData))];
                    case 3:
                        nluResult = _a.sent();
                        // Step 3: Generate JSON Schema
                        steps.push('Generating JSON Schema');
                        return [4 /*yield*/, this.schemaGenerator.generate(nluResult)];
                    case 4:
                        schema = _a.sent();
                        // Step 4: Apply additional options and customizations
                        steps.push('Applying customizations');
                        this.applyCustomizations(schema, task.options);
                        // Step 5: Validate the generated schema
                        steps.push('Validating schema');
                        return [4 /*yield*/, this.validateSchema(schema)];
                    case 5:
                        _a.sent();
                        executionTime = Date.now() - startTime;
                        console.log("Schema generation completed in ".concat(executionTime, "ms"));
                        return [2 /*return*/, {
                                schema: schema,
                                metadata: {
                                    executionTime: executionTime,
                                    steps: steps,
                                    insights: insights
                                }
                            }];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Error generating schema:', error_1);
                        throw new Error("Schema generation failed: ".concat(error_1.message));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SchemaAgent.prototype.applyCustomizations = function (schema, options) {
        if (!options)
            return;
        // Apply format version
        if (options.format) {
            schema.$schema = "http://json-schema.org/draft-".concat(options.format, "/schema#");
        }
        // Apply required fields
        if (options.required && Array.isArray(options.required)) {
            schema.required = options.required;
        }
        // Apply additional properties setting
        if (typeof options.additionalProperties === 'boolean') {
            schema.additionalProperties = options.additionalProperties;
        }
        // Apply property-specific customizations
        if (options.properties) {
            Object.entries(options.properties).forEach(function (_a) {
                var prop = _a[0], customizations = _a[1];
                if (schema.properties[prop]) {
                    Object.assign(schema.properties[prop], customizations);
                }
            });
        }
    };
    SchemaAgent.prototype.validateSchema = function (schema) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement schema validation
                // This could include:
                // 1. Syntax validation
                // 2. Semantic validation
                // 3. Best practices validation
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    return SchemaAgent;
}(BaseAgent_1.BaseAgent));
exports.SchemaAgent = SchemaAgent;
