/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { CommanderError } from 'commander';

/**
 * 处理CLI错误
 * @param error - 错误对象
 */
export function handleError(error: any): void {
    if (error instanceof CommanderError) {
        // Commander错误（例如：无效的命令或选项）
        console.error(`Error: ${error.message}`);
        process.exit(1);
    } else if (error instanceof SyntaxError) {
        // JSON解析错误
        console.error('Invalid JSON format:');
        console.error(`  ${error.message}`);
        process.exit(1);
    } else {
        // 其他错误
        console.error('An error occurred:');
        console.error(`  ${error.message}`);
        if (process.env.DEBUG) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    }
}
