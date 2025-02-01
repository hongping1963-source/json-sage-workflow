/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { Command } from 'commander';
import { generateCommand } from './commands/generate';
import { validateCommand } from './commands/validate';
import { displayWelcome } from './utils/welcome';
import { handleError } from './utils/error-handler';

// 创建CLI程序
const program = new Command();

// 设置基本信息
program
    .name('jsage')
    .description('JsonSageAI - AI-powered JSON Schema Generator and Validator')
    .version('1.0.0');

// 显示欢迎信息
displayWelcome();

// 注册命令
program
    .addCommand(generateCommand)
    .addCommand(validateCommand);

// 错误处理
program.exitOverride();
try {
    // 解析命令行参数
    program.parse(process.argv);
} catch (err) {
    handleError(err);
}

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
