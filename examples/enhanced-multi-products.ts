import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 增强版多产品场景的 Schema 生成器
async function generateEnhancedMultiProductSchema() {
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        schema: {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "title": "增强版产品目录",
            "description": "支持多种产品类型的增强版产品目录，包含更多产品类型和高级功能",
            "properties": {
                "products": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "oneOf": [
                            // 电子产品
                            {
                                "title": "电子产品",
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["electronic"],
                                        "description": "产品类型"
                                    },
                                    "id": {
                                        "type": "string",
                                        "pattern": "^EL\\d{6}$",
                                        "description": "产品ID (EL开头的6位数字)"
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
                                            },
                                            "warranty": {
                                                "type": "string",
                                                "description": "保修期"
                                            }
                                        }
                                    },
                                    "relatedProducts": {
                                        "type": "array",
                                        "items": {
                                            "type": "string",
                                            "pattern": "^EL\\d{6}$"
                                        },
                                        "description": "相关产品ID列表"
                                    }
                                },
                                "required": ["type", "id", "name", "price", "brand"]
                            },
                            // 书籍
                            {
                                "title": "书籍",
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["book"],
                                        "description": "产品类型"
                                    },
                                    "id": {
                                        "type": "string",
                                        "pattern": "^BK\\d{6}$",
                                        "description": "产品ID (BK开头的6位数字)"
                                    },
                                    "name": {
                                        "type": "string",
                                        "description": "书名"
                                    },
                                    "price": {
                                        "type": "number",
                                        "minimum": 0,
                                        "description": "价格"
                                    },
                                    "isbn": {
                                        "type": "string",
                                        "pattern": "^\\d{13}$",
                                        "description": "ISBN"
                                    },
                                    "author": {
                                        "type": "string",
                                        "description": "作者"
                                    },
                                    "publisher": {
                                        "type": "string",
                                        "description": "出版社"
                                    },
                                    "publishDate": {
                                        "type": "string",
                                        "format": "date",
                                        "description": "出版日期"
                                    },
                                    "format": {
                                        "type": "string",
                                        "enum": ["hardcover", "paperback", "digital"],
                                        "description": "图书形式"
                                    }
                                },
                                "required": ["type", "id", "name", "price", "isbn", "author"]
                            },
                            // 数字产品
                            {
                                "title": "数字产品",
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["digital"],
                                        "description": "产品类型"
                                    },
                                    "id": {
                                        "type": "string",
                                        "pattern": "^DG\\d{6}$",
                                        "description": "产品ID (DG开头的6位数字)"
                                    },
                                    "name": {
                                        "type": "string",
                                        "description": "产品名称"
                                    },
                                    "price": {
                                        "type": "number",
                                        "minimum": 0,
                                        "description": "价格"
                                    },
                                    "licenseType": {
                                        "type": "string",
                                        "enum": ["perpetual", "subscription", "one-time"],
                                        "description": "许可证类型"
                                    },
                                    "downloadUrl": {
                                        "type": "string",
                                        "format": "uri",
                                        "description": "下载链接"
                                    },
                                    "version": {
                                        "type": "string",
                                        "description": "版本号"
                                    },
                                    "compatibility": {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        },
                                        "description": "兼容性要求"
                                    }
                                },
                                "required": ["type", "id", "name", "price", "licenseType", "downloadUrl"]
                            }
                        ]
                    },
                    "minItems": 1,
                    "description": "产品列表"
                },
                "inventory": {
                    "type": "object",
                    "properties": {
                        "stockLevels": {
                            "type": "object",
                            "patternProperties": {
                                "^[A-Z]{2}\\d{6}$": {
                                    "type": "object",
                                    "properties": {
                                        "available": {
                                            "type": "integer",
                                            "minimum": 0,
                                            "description": "可用库存"
                                        },
                                        "reserved": {
                                            "type": "integer",
                                            "minimum": 0,
                                            "description": "预留库存"
                                        },
                                        "reorderPoint": {
                                            "type": "integer",
                                            "minimum": 0,
                                            "description": "补货点"
                                        },
                                        "lastUpdated": {
                                            "type": "string",
                                            "format": "date-time",
                                            "description": "最后更新时间"
                                        }
                                    },
                                    "required": ["available", "reserved", "reorderPoint", "lastUpdated"]
                                }
                            },
                            "description": "各产品库存水平"
                        },
                        "warehouses": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {
                                        "type": "string",
                                        "description": "仓库ID"
                                    },
                                    "name": {
                                        "type": "string",
                                        "description": "仓库名称"
                                    },
                                    "location": {
                                        "type": "string",
                                        "description": "仓库位置"
                                    }
                                }
                            },
                            "description": "仓库列表"
                        }
                    },
                    "required": ["stockLevels", "warehouses"]
                },
                "metadata": {
                    "type": "object",
                    "properties": {
                        "lastUpdated": {
                            "type": "string",
                            "format": "date-time",
                            "description": "最后更新时间"
                        },
                        "statistics": {
                            "type": "object",
                            "properties": {
                                "totalProducts": {
                                    "type": "integer",
                                    "minimum": 0,
                                    "description": "产品总数"
                                },
                                "productsByType": {
                                    "type": "object",
                                    "patternProperties": {
                                        "^[a-z]+$": {
                                            "type": "integer",
                                            "minimum": 0
                                        }
                                    },
                                    "description": "各类型产品数量"
                                },
                                "priceRanges": {
                                    "type": "object",
                                    "properties": {
                                        "min": {
                                            "type": "number",
                                            "description": "最低价格"
                                        },
                                        "max": {
                                            "type": "number",
                                            "description": "最高价格"
                                        },
                                        "average": {
                                            "type": "number",
                                            "description": "平均价格"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "required": ["lastUpdated", "statistics"]
                }
            },
            "required": ["products", "inventory", "metadata"]
        },
        examples: {
            "products": [
                {
                    "type": "electronic",
                    "id": "EL000001",
                    "name": "高性能笔记本电脑",
                    "price": 6999.99,
                    "brand": "TechPro",
                    "specifications": {
                        "power": "65W",
                        "voltage": "19V",
                        "warranty": "3年"
                    },
                    "relatedProducts": ["EL000002", "EL000003"]
                },
                {
                    "type": "book",
                    "id": "BK000001",
                    "name": "TypeScript实战指南",
                    "price": 89.99,
                    "isbn": "9787111111111",
                    "author": "张三",
                    "publisher": "技术图书出版社",
                    "publishDate": "2024-12-01",
                    "format": "paperback"
                },
                {
                    "type": "digital",
                    "id": "DG000001",
                    "name": "专业视频编辑软件",
                    "price": 299.99,
                    "licenseType": "perpetual",
                    "downloadUrl": "https://example.com/download/DG000001",
                    "version": "2.0.0",
                    "compatibility": ["Windows 10+", "macOS 12+"]
                }
            ],
            "inventory": {
                "stockLevels": {
                    "EL000001": {
                        "available": 50,
                        "reserved": 5,
                        "reorderPoint": 20,
                        "lastUpdated": "2025-01-20T08:00:41+08:00"
                    },
                    "BK000001": {
                        "available": 200,
                        "reserved": 10,
                        "reorderPoint": 50,
                        "lastUpdated": "2025-01-20T08:00:41+08:00"
                    }
                },
                "warehouses": [
                    {
                        "id": "WH001",
                        "name": "主仓库",
                        "location": "上海"
                    },
                    {
                        "id": "WH002",
                        "name": "电子产品仓库",
                        "location": "深圳"
                    }
                ]
            },
            "metadata": {
                "lastUpdated": "2025-01-20T08:00:41+08:00",
                "statistics": {
                    "totalProducts": 3,
                    "productsByType": {
                        "electronic": 1,
                        "book": 1,
                        "digital": 1
                    },
                    "priceRanges": {
                        "min": 89.99,
                        "max": 6999.99,
                        "average": 2463.32
                    }
                }
            }
        },
        metadata: {
            executionTime: 1000,
            steps: [
                "分析产品类型和结构",
                "创建基础Schema",
                "添加扩展产品类型",
                "添加库存管理",
                "添加统计分析",
                "生成验证规则",
                "添加示例数据"
            ],
            insights: [
                "支持电子产品、书籍和数字产品三种类型",
                "添加了完整的库存管理系统",
                "包含详细的产品统计信息",
                "实现了产品关联关系",
                "支持多仓库管理",
                "添加了价格区间分析"
            ]
        }
    };
}

async function main() {
    try {
        console.log('正在生成增强版多产品类型的JSON Schema...\n');
        const result = await generateEnhancedMultiProductSchema();
        
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
