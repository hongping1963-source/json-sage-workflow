import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 多产品场景的 Schema 生成器
async function generateMultiProductSchema() {
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
        schema: {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "title": "产品目录",
            "description": "支持多种产品类型的产品目录",
            "properties": {
                "products": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "oneOf": [
                            {
                                "title": "电子产品",
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["electronic"],
                                        "description": "产品类型"
                                    },
                                    "name": {
                                        "type": "string",
                                        "description": "产品名称"
                                    },
                                    "price": {
                                        "type": "number",
                                        "minimum": 0,
                                        "description": "产品价格"
                                    },
                                    "brand": {
                                        "type": "string",
                                        "description": "品牌"
                                    },
                                    "specifications": {
                                        "type": "object",
                                        "properties": {
                                            "power": {
                                                "type": "string",
                                                "description": "功率"
                                            },
                                            "voltage": {
                                                "type": "string",
                                                "description": "电压"
                                            }
                                        }
                                    }
                                },
                                "required": ["type", "name", "price", "brand"]
                            },
                            {
                                "title": "服装",
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["clothing"],
                                        "description": "产品类型"
                                    },
                                    "name": {
                                        "type": "string",
                                        "description": "产品名称"
                                    },
                                    "price": {
                                        "type": "number",
                                        "minimum": 0,
                                        "description": "产品价格"
                                    },
                                    "size": {
                                        "type": "string",
                                        "enum": ["XS", "S", "M", "L", "XL", "XXL"],
                                        "description": "尺码"
                                    },
                                    "color": {
                                        "type": "string",
                                        "description": "颜色"
                                    },
                                    "material": {
                                        "type": "string",
                                        "description": "材质"
                                    }
                                },
                                "required": ["type", "name", "price", "size"]
                            },
                            {
                                "title": "食品",
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["food"],
                                        "description": "产品类型"
                                    },
                                    "name": {
                                        "type": "string",
                                        "description": "产品名称"
                                    },
                                    "price": {
                                        "type": "number",
                                        "minimum": 0,
                                        "description": "产品价格"
                                    },
                                    "weight": {
                                        "type": "number",
                                        "minimum": 0,
                                        "description": "重量(克)"
                                    },
                                    "expirationDate": {
                                        "type": "string",
                                        "format": "date",
                                        "description": "保质期"
                                    },
                                    "storage": {
                                        "type": "string",
                                        "description": "储存条件"
                                    }
                                },
                                "required": ["type", "name", "price", "expirationDate"]
                            }
                        ]
                    },
                    "minItems": 1,
                    "description": "产品列表"
                },
                "metadata": {
                    "type": "object",
                    "properties": {
                        "lastUpdated": {
                            "type": "string",
                            "format": "date-time",
                            "description": "最后更新时间"
                        },
                        "totalProducts": {
                            "type": "integer",
                            "minimum": 0,
                            "description": "产品总数"
                        }
                    },
                    "required": ["lastUpdated", "totalProducts"]
                }
            },
            "required": ["products", "metadata"]
        },
        examples: {
            "products": [
                {
                    "type": "electronic",
                    "name": "智能手机",
                    "price": 4999.99,
                    "brand": "TechBrand",
                    "specifications": {
                        "power": "20W",
                        "voltage": "5V"
                    }
                },
                {
                    "type": "clothing",
                    "name": "休闲T恤",
                    "price": 199.99,
                    "size": "L",
                    "color": "蓝色",
                    "material": "棉"
                },
                {
                    "type": "food",
                    "name": "有机饼干",
                    "price": 29.99,
                    "weight": 200,
                    "expirationDate": "2025-07-20",
                    "storage": "常温保存"
                }
            ],
            "metadata": {
                "lastUpdated": "2025-01-20T07:59:12+08:00",
                "totalProducts": 3
            }
        },
        metadata: {
            executionTime: 800,
            steps: [
                "分析产品类型",
                "创建基础Schema",
                "添加类型特定属性",
                "生成验证规则",
                "添加示例数据"
            ],
            insights: [
                "使用 oneOf 支持多种产品类型",
                "每种产品类型都有特定的必填字段",
                "添加了产品目录元数据",
                "包含了完整的示例数据"
            ]
        }
    };
}

async function main() {
    try {
        console.log('正在生成多产品类型的JSON Schema...\n');
        const result = await generateMultiProductSchema();
        
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
