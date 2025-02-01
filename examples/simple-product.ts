import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 简单产品对象的 Schema 生成器
async function generateSimpleProductSchema() {
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        schema: {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "title": "产品",
            "description": "简单产品对象的数据结构定义",
            "properties": {
                "name": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 100,
                    "description": "产品名称"
                },
                "price": {
                    "type": "number",
                    "minimum": 0,
                    "description": "产品价格"
                },
                "description": {
                    "type": "string",
                    "description": "产品描述"
                }
            },
            "required": ["name", "price"]
        },
        metadata: {
            executionTime: 500,
            steps: [
                "解析用户需求",
                "生成基础Schema",
                "添加验证规则"
            ],
            insights: [
                "已设置name和price为必填字段",
                "添加了基本的数据验证"
            ]
        },
        examples: {
            "name": "超级笔记本",
            "price": 4999.99,
            "description": "高性能商务笔记本电脑"
        }
    };
}

async function main() {
    try {
        console.log('正在生成简单产品对象的JSON Schema...\n');
        const result = await generateSimpleProductSchema();
        
        console.log('生成的JSON Schema:');
        console.log(JSON.stringify(result.schema, null, 2));
        
        console.log('\n示例数据:');
        console.log(JSON.stringify(result.examples, null, 2));
        
        console.log('\n执行信息:');
        console.log(`执行时间: ${result.metadata.executionTime}ms`);
        console.log('执行步骤:', result.metadata.steps.join(', '));
        console.log('分析洞察:', result.metadata.insights.join(', '));
        
    } catch (error) {
        console.error('生成Schema时发生错误:', error);
    }
}

// 运行示例
main().catch(console.error);
