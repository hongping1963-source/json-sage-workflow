"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showWelcome = showWelcome;
const chalk_1 = __importDefault(require("chalk"));
const boxen_1 = __importDefault(require("boxen"));
const package_json_1 = require("../../package.json");
function showWelcome() {
    const message = chalk_1.default.cyan(`
JsonSageAI CLI v${package_json_1.version}
Generate JSON Schema using natural language

Type ${chalk_1.default.green('json-sage --help')} to see available commands
    `);
    console.log((0, boxen_1.default)(message, {
        padding: 1,
        margin: 1,
        borderColor: 'blue',
        borderStyle: 'round'
    }));
}
