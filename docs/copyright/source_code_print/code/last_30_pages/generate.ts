/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { Command } from 'commander';
import { JsonSageAI } from '@json-sage-ai/core';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { handleError } from '../utils/error-handler';

// 创建generate命令
export const generateCommand = new Command('generate')
    .description('Generate JSON Schema from description or existing JSON')
    .option('-d, --description <text>', 'Natural language description of the schema')
    .option('-f, --file <path>', 'Input JSON file path')
    .option('-o, --output <path>', 'Output schema file path')
    .option('--title <title>', 'Schema title')
    .option('--required', 'Mark all properties as required')
    .option('--no-additional-properties', 'Disable additional properties')
    .action(async (options) => {
        try {
            // 验证输入
            if (!options.description && !options.file) {
                throw new Error('Either description or file must be provided');
            }

            // 初始化JsonSageAI
            const apiKey = process.env.DEEPSEEK_API_KEY;
            if (!apiKey) {
                throw new Error('DEEPSEEK_API_KEY environment variable is required');
            }

            const jsonSage = new JsonSageAI({ deepseekApiKey: apiKey });

            let schema;
            if (options.description) {
                // 从描述生成Schema
                schema = await jsonSage.generateSchema(options.description, {
                    title: options.title,
                    required: options.required,
                    additionalProperties: options.additionalProperties
                });
            } else {
                // 从JSON文件生成Schema
                const jsonContent = readFileSync(resolve(options.file), 'utf-8');
                schema = await jsonSage.convertJsonToSchema(jsonContent, {
                    inferTypes: true,
                    includeExamples: true,
                    addDescriptions: true
                });
            }

            // 输出Schema
            const output = JSON.stringify(schema, null, 2);
            if (options.output) {
                writeFileSync(resolve(options.output), output);
                console.log(`Schema has been saved to ${options.output}`);
            } else {
                console.log(output);
            }
        } catch (error) {
            handleError(error);
        }
    });
