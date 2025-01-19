import { JsonSageAI } from '../src';

async function main() {
    // 创建JsonSageAI实例
    const ai = JsonSageAI.create({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || 'your-api-key',
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 2000,
        caching: true
    });

    // 准备示例JSON数据
    const jsonData = {
        user: {
            name: "John Doe",
            age: 30,
            email: "john@example.com",
            preferences: {
                theme: "dark",
                notifications: true
            }
        },
        settings: {
            language: "en",
            timezone: "UTC-5"
        }
    };

    // 定义任务
    const task = {
        jsonData,
        options: {
            format: 'draft-07',
            includeExamples: true,
            includeDescriptions: true
        }
    };

    try {
        // 执行Schema生成工作流
        const result = await ai.generateSchema(task);
        
        // 输出结果
        console.log('Generated Schema:', JSON.stringify(result.schema, null, 2));
        console.log('Field Descriptions:', result.descriptions);
        console.log('Generated Examples:', result.examples);
        console.log('Execution Metadata:', result.metadata);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// 运行示例
main().catch(console.error);
