/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { Command } from 'commander';
import { JsonSageAI } from '@json-sage-ai/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { handleError } from '../utils/error-handler';

// 创建validate命令
export const validateCommand = new Command('validate')
    .description('Validate JSON data against a schema')
    .option('-d, --data <path>', 'JSON data file path')
    .option('-s, --schema <path>', 'JSON Schema file path')
    .option('--schema-string <schema>', 'JSON Schema string')
    .option('--data-string <data>', 'JSON data string')
    .action(async (options) => {
        try {
            // 验证输入
            if ((!options.data && !options.dataString) || 
                (!options.schema && !options.schemaString)) {
                throw new Error('Both data and schema must be provided');
            }

            // 初始化JsonSageAI
            const apiKey = process.env.DEEPSEEK_API_KEY;
            if (!apiKey) {
                throw new Error('DEEPSEEK_API_KEY environment variable is required');
            }

            const jsonSage = new JsonSageAI({ deepseekApiKey: apiKey });

            // 读取Schema
            let schema;
            if (options.schema) {
                const schemaContent = readFileSync(resolve(options.schema), 'utf-8');
                schema = JSON.parse(schemaContent);
            } else {
                schema = JSON.parse(options.schemaString);
            }

            // 读取数据
            let data;
            if (options.data) {
                const dataContent = readFileSync(resolve(options.data), 'utf-8');
                data = dataContent;
            } else {
                data = options.dataString;
            }

            // 验证数据
            const result = await jsonSage.validateJson(data, schema);

            // 输出结果
            if (result.valid) {
                console.log('✓ Validation passed');
            } else {
                console.error('✗ Validation failed');
                console.error('Errors:');
                result.errors.forEach((error, index) => {
                    console.error(`  ${index + 1}. ${error}`);
                });
                process.exit(1);
            }
        } catch (error) {
            handleError(error);
        }
    });
