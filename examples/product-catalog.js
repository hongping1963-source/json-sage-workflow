"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
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
var JsonSageAI_1 = require("../src/agent/JsonSageAI");
var dotenv = __importStar(require("dotenv"));
// 加载环境变量
dotenv.config();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var config, agent, options, jsonData, result, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = {
                        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
                        model: 'deepseek-chat',
                        maxTokens: 2048,
                        temperature: 0.7,
                        caching: true
                    };
                    agent = new JsonSageAI_1.JsonSageAI(config);
                    options = {
                        includeDescriptions: true,
                        includeExamples: true
                    };
                    jsonData = {
                        description: "\u6211\u9700\u8981\u4E00\u4E2A\u4EA7\u54C1\u76EE\u5F55\u7684JSON Schema\uFF0C\u5305\u542B\u4EE5\u4E0B\u5B57\u6BB5\uFF1A\n            - \u4EA7\u54C1ID\uFF08\u5FC5\u586B\uFF0C\u5B57\u7B26\u4E32\uFF0CUUID\u683C\u5F0F\uFF09\n            - \u4EA7\u54C1\u540D\u79F0\uFF08\u5FC5\u586B\uFF0C\u5B57\u7B26\u4E32\uFF0C2-50\u4E2A\u5B57\u7B26\uFF09\n            - \u4EA7\u54C1\u63CF\u8FF0\uFF08\u53EF\u9009\uFF0C\u5B57\u7B26\u4E32\uFF09\n            - \u4EF7\u683C\uFF08\u5FC5\u586B\uFF0C\u6570\u5B57\uFF0C\u6700\u5C0F\u503C0\uFF09\n            - \u5E93\u5B58\u6570\u91CF\uFF08\u5FC5\u586B\uFF0C\u6574\u6570\uFF0C\u6700\u5C0F\u503C0\uFF09\n            - \u5206\u7C7B\uFF08\u5FC5\u586B\uFF0C\u5B57\u7B26\u4E32\u6570\u7EC4\uFF0C\u81F3\u5C11\u4E00\u4E2A\u5206\u7C7B\uFF09\n            - \u521B\u5EFA\u65F6\u95F4\uFF08\u5FC5\u586B\uFF0C\u65E5\u671F\u65F6\u95F4\u683C\u5F0F\uFF09\n            - \u72B6\u6001\uFF08\u5FC5\u586B\uFF0C\u679A\u4E3E\uFF1A'active'\u3001'inactive'\u3001'discontinued'\uFF09\n            - \u6807\u7B7E\uFF08\u53EF\u9009\uFF0C\u5B57\u7B26\u4E32\u6570\u7EC4\uFF09\n            - \u89C4\u683C\uFF08\u53EF\u9009\uFF0C\u5BF9\u8C61\u7C7B\u578B\uFF0C\u5305\u542B\u5C3A\u5BF8\u548C\u91CD\u91CF\uFF09",
                        required: ['productId', 'name', 'price', 'stock', 'categories', 'createdAt', 'status']
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.log('正在生成产品目录的JSON Schema...');
                    return [4 /*yield*/, agent.generateSchema({
                            jsonData: jsonData,
                            options: options
                        })];
                case 2:
                    result = _b.sent();
                    console.log('\n生成的JSON Schema:');
                    console.log(JSON.stringify(result.schema, null, 2));
                    if (result.descriptions) {
                        console.log('\n字段描述:');
                        console.log(JSON.stringify(result.descriptions, null, 2));
                    }
                    if (result.examples) {
                        console.log('\n示例数据:');
                        console.log(JSON.stringify(result.examples, null, 2));
                    }
                    console.log('\n执行信息:');
                    console.log("\u6267\u884C\u65F6\u95F4: ".concat(result.metadata.executionTime, "ms"));
                    console.log('执行步骤:', result.metadata.steps);
                    console.log('分析洞察:', result.metadata.insights);
                    if ((_a = result.metadata.errors) === null || _a === void 0 ? void 0 : _a.length) {
                        console.log('警告/错误:', result.metadata.errors);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error('生成Schema时发生错误:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// 运行示例
main().catch(console.error);
