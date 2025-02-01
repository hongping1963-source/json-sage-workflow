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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekAPI = void 0;
var axios_1 = __importDefault(require("axios"));
var DeepSeekAPI = /** @class */ (function () {
    function DeepSeekAPI(apiKey, config) {
        if (config === void 0) { config = {}; }
        this.baseUrl = 'https://api.deepseek.com/v1';
        this.apiKey = apiKey;
        this.model = config.model || 'deepseek-chat';
        this.maxTokens = config.maxTokens || 2048;
        this.temperature = config.temperature || 0.7;
    }
    DeepSeekAPI.prototype.complete = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/chat/completions"), {
                                model: this.model,
                                messages: [
                                    {
                                        role: 'system',
                                        content: '你是一个专业的JSON Schema生成助手，擅长理解用户需求并生成准确的JSON Schema。'
                                    },
                                    {
                                        role: 'user',
                                        content: prompt
                                    }
                                ],
                                max_tokens: this.maxTokens,
                                temperature: this.temperature
                            }, {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.choices[0].message.content];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error calling DeepSeek API:', error_1);
                        throw new Error("DeepSeek API call failed: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DeepSeekAPI.prototype.analyze = function (text, task) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/analyze"), {
                                model: this.model,
                                text: text,
                                task: task
                            }, {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error analyzing text with DeepSeek API:', error_2);
                        throw new Error("DeepSeek API analysis failed: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DeepSeekAPI;
}());
exports.DeepSeekAPI = DeepSeekAPI;
