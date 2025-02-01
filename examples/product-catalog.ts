import { JsonSageAI } from '../src/agent/JsonSageAI';
import { AgentConfig, SchemaGenerationOptions } from '../src/types';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function main() {
    // 初始化 JsonSageAI
    const config: AgentConfig = {
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048,
        temperature: 0.7,
        caching: true
    };

    const agent = new JsonSageAI(config);

    // 示例1：生成产品目录的JSON Schema
    const options: SchemaGenerationOptions = {
        includeDescriptions: true,
        includeExamples: true
    };

    const jsonData = {
        description: `我需要一个产品目录的JSON Schema，包含以下字段：
            - 产品ID（必填，字符串，UUID格式）
            - 产品名称（必填，字符串，2-50个字符）
            - 产品描述（可选，字符串）
            - 价格（必填，数字，最小值0）
            - 库存数量（必填，整数，最小值0）
            - 分类（必填，字符串数组，至少一个分类）
            - 创建时间（必填，日期时间格式）
            - 状态（必填，枚举：'active'、'inactive'、'discontinued'）
            - 标签（可选，字符串数组）
            - 规格（可选，对象类型，包含尺寸和重量）`,
        required: ['productId', 'name', 'price', 'stock', 'categories', 'createdAt', 'status']
    };

    try {
        console.log('正在生成产品目录的JSON Schema...');
        const result = await agent.generateSchema({
            jsonData,
            options
        });
        
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
        console.log(`执行时间: ${result.metadata.executionTime}ms`);
        console.log('执行步骤:', result.metadata.steps);
        console.log('分析洞察:', result.metadata.insights);
        
        if (result.metadata.errors?.length) {
            console.log('警告/错误:', result.metadata.errors);
        }
        
    } catch (error) {
        console.error('生成Schema时发生错误:', error);
    }
}

// 运行示例
main().catch(console.error);
