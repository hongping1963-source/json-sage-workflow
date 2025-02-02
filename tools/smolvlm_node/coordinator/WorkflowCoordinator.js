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
exports.WorkflowCoordinator = void 0;
var agent_1 = require("../agent");
var WorkflowCoordinator = /** @class */ (function () {
    function WorkflowCoordinator(config) {
        this.schemaAgent = new agent_1.SchemaAgent(config);
        this.descriptionAgent = new agent_1.DescriptionAgent(config);
        this.exampleAgent = new agent_1.ExampleAgent(config);
    }
    WorkflowCoordinator.prototype.executeWorkflow = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var steps, startTime, schemaResult, schema, descriptionResult, descriptions, exampleResult, examples, executionTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        steps = [];
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        // Step 1: Generate Schema
                        steps.push('Generating Schema');
                        return [4 /*yield*/, this.schemaAgent.generateSchema(task)];
                    case 2:
                        schemaResult = _a.sent();
                        schema = schemaResult.schema;
                        // Step 2: Generate Descriptions
                        steps.push('Generating Field Descriptions');
                        return [4 /*yield*/, this.descriptionAgent.generateDescriptions(task.jsonData)];
                    case 3:
                        descriptionResult = _a.sent();
                        descriptions = descriptionResult.descriptions;
                        // Step 3: Generate Examples
                        steps.push('Generating Examples');
                        return [4 /*yield*/, this.exampleAgent.generateExamples(schema)];
                    case 4:
                        exampleResult = _a.sent();
                        examples = exampleResult.examples;
                        executionTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                schema: schema,
                                descriptions: descriptions,
                                examples: examples,
                                metadata: {
                                    executionTime: executionTime,
                                    steps: steps
                                }
                            }];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Workflow execution failed:', error_1);
                        throw new Error("Workflow execution failed: ".concat(error_1.message));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return WorkflowCoordinator;
}());
exports.WorkflowCoordinator = WorkflowCoordinator;
