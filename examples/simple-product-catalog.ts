import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 模拟 JsonSageAI 的响应
async function generateProductCatalogSchema() {
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        schema: {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "title": "产品目录",
            "description": "产品信息的数据结构定义",
            "properties": {
                "productId": {
                    "type": "string",
                    "format": "uuid",
                    "description": "产品唯一标识符"
                },
                "name": {
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 50,
                    "description": "产品名称"
                },
                "description": {
                    "type": "string",
                    "description": "产品描述"
                },
                "price": {
                    "type": "number",
                    "minimum": 0,
                    "description": "产品价格"
                },
                "stock": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "库存数量"
                },
                "categories": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "minItems": 1,
                    "description": "产品分类"
                },
                "createdAt": {
                    "type": "string",
                    "format": "date-time",
                    "description": "创建时间"
                },
                "status": {
                    "type": "string",
                    "enum": ["active", "inactive", "discontinued"],
                    "description": "产品状态"
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "产品标签"
                },
                "specifications": {
                    "type": "object",
                    "properties": {
                        "dimensions": {
                            "type": "object",
                            "properties": {
                                "length": {
                                    "type": "number",
                                    "minimum": 0
                                },
                                "width": {
                                    "type": "number",
                                    "minimum": 0
                                },
                                "height": {
                                    "type": "number",
                                    "minimum": 0
                                }
                            },
                            "required": ["length", "width", "height"]
                        },
                        "weight": {
                            "type": "number",
                            "minimum": 0
                        }
                    },
                    "description": "产品规格"
                }
            },
            "required": [
                "productId",
                "name",
                "price",
                "stock",
                "categories",
                "createdAt",
                "status"
            ]
        },
        metadata: {
            executionTime: 1000,
            steps: [
                "解析用户需求",
                "识别字段类型",
                "生成JSON Schema",
                "添加验证规则",
                "优化Schema结构"
            ],
            insights: [
                "所有必需字段都已定义",
                "添加了适当的数据验证规则",
                "使用了标准的日期时间格式",
                "包含了完整的产品规格定义"
            ]
        },
        examples: {
            "productId": "123e4567-e89b-12d3-a456-426614174000",
            "name": "高级办公椅",
            "description": "人体工学设计，舒适耐用",
            "price": 999.99,
            "stock": 100,
            "categories": ["办公家具", "椅子"],
            "createdAt": "2025-01-20T07:48:18+08:00",
            "status": "active",
            "tags": ["人体工学", "办公家具", "高端"],
            "specifications": {
                "dimensions": {
                    "length": 60,
                    "width": 60,
                    "height": 120
                },
                "weight": 15.5
            }
        }
    };
}

async function main() {
    try {
        console.log('正在生成产品目录的JSON Schema...');
        const result = await generateProductCatalogSchema();
        
        console.log('\n生成的JSON Schema:');
        console.log(JSON.stringify(result.schema, null, 2));
        
        console.log('\n示例数据:');
        console.log(JSON.stringify(result.examples, null, 2));
        
        console.log('\n执行信息:');
        console.log(`执行时间: ${result.metadata.executionTime}ms`);
        console.log('执行步骤:', result.metadata.steps);
        console.log('分析洞察:', result.metadata.insights);
        
    } catch (error) {
        console.error('生成Schema时发生错误:', error);
    }
}

// 运行示例
main().catch(console.error);
