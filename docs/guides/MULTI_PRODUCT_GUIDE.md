# JsonSageAI 多产品支持指南

本指南详细介绍了如何使用 JsonSageAI 处理多产品场景，包括不同产品类型的支持、库存管理和数据分析。

## 1. 基本概念

### 1.1 产品类型
JsonSageAI 支持多种产品类型，每种类型都有其特定的属性和验证规则：

- **电子产品** (EL)
  - 特有属性：品牌、规格（功率、电压）
  - ID格式：EL + 6位数字

- **书籍** (BK)
  - 特有属性：ISBN、作者、出版信息
  - ID格式：BK + 6位数字

- **数字产品** (DG)
  - 特有属性：许可证类型、下载链接、版本
  - ID格式：DG + 6位数字

### 1.2 通用属性
所有产品类型共享的基本属性：
- ID（符合特定格式）
- 名称
- 价格
- 类型标识

## 2. Schema 结构

### 2.1 产品定义
```typescript
{
    "type": "object",
    "properties": {
        "products": {
            "type": "array",
            "items": {
                "type": "object",
                "oneOf": [
                    // 电子产品 Schema
                    // 书籍 Schema
                    // 数字产品 Schema
                ]
            }
        }
    }
}
```

### 2.2 库存管理
```typescript
{
    "inventory": {
        "stockLevels": {
            // 产品库存信息
        },
        "warehouses": [
            // 仓库信息
        ]
    }
}
```

### 2.3 元数据
```typescript
{
    "metadata": {
        "lastUpdated": "datetime",
        "statistics": {
            // 统计信息
        }
    }
}
```

## 3. 使用示例

### 3.1 基本使用
```typescript
const agent = new JsonSageAI({
    deepseekApiKey: 'your-api-key'
});

const schema = await agent.generateSchema({
    type: 'multi-product',
    options: {
        includeInventory: true,
        includeStatistics: true
    }
});
```

### 3.2 添加新产品类型
```typescript
const schema = await agent.generateSchema({
    type: 'multi-product',
    productTypes: ['electronic', 'book', 'digital'],
    customTypes: [{
        name: 'furniture',
        prefix: 'FN',
        properties: {
            // 家具特有属性
        }
    }]
});
```

## 4. 最佳实践

### 4.1 产品ID管理
- 使用前缀区分产品类型
- 保持ID格式一致性
- 验证ID引用关系

### 4.2 库存管理
- 定期更新库存信息
- 设置合理的补货点
- 监控库存变动

### 4.3 数据分析
- 关注价格区间分布
- 跟踪产品类型占比
- 分析库存周转率

## 5. 高级功能

### 5.1 产品关联
- 相关产品推荐
- 配套商品管理
- 产品组合优惠

### 5.2 库存优化
- 多仓库调配
- 智能补货提醒
- 库存预警

### 5.3 统计分析
- 销售趋势分析
- 库存周转分析
- 价格区间分析

## 6. 注意事项

### 6.1 性能考虑
- 合理设置缓存
- 优化查询性能
- 控制数据量

### 6.2 数据一致性
- 验证产品关联
- 保持库存准确
- 及时更新统计

## 7. 常见问题

### Q1: 如何添加新的产品类型？
通过 `customTypes` 配置添加新类型，定义其特有属性和验证规则。

### Q2: 如何处理产品关联？
使用 `relatedProducts` 数组存储相关产品ID，确保ID存在且格式正确。

### Q3: 如何优化库存管理？
设置合理的补货点，启用库存预警，定期同步多仓库数据。

## 8. 更多资源

- [完整API文档](../api/API_REFERENCE.md)
- [示例代码](../../examples/enhanced-multi-products.ts)
- [技术规格](../TECHNICAL_SPEC.md)
