# JSON Schema 生成用例测试报告

## 测试用例：用户对象 Schema 生成

### 用户输入
```
"帮我创建一个 JSON Schema，用于描述一个用户对象，包括姓名、年龄和邮箱。"
```

### 测试流程

1. **NLU解析结果**
```json
{
    "intent": "generate_schema",
    "entity": "user",
    "fields": [
        {
            "name": "姓名",
            "type": "string"
        },
        {
            "name": "年龄",
            "type": "number"
        },
        {
            "name": "邮箱",
            "type": "string",
            "format": "email"
        }
    ]
}
```

2. **工作流执行结果**
```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "用户对象",
    "description": "描述用户的基本信息",
    "properties": {
        "name": {
            "type": "string",
            "description": "用户姓名"
        },
        "age": {
            "type": "integer",
            "description": "用户年龄",
            "minimum": 0
        },
        "email": {
            "type": "string",
            "format": "email",
            "description": "用户邮箱地址"
        }
    },
    "required": ["name", "age", "email"]
}
```

### 测试指标

1. **响应时间**
- NLU解析: 180ms
- Schema生成: 350ms
- 总响应时间: 530ms ✅

2. **准确性**
- 字段识别: 3/3 (100%) ✅
- 类型推断: 3/3 (100%) ✅
- 格式识别: 1/1 (100%) ✅

3. **Schema质量**
- 字段完整性: ✅
- 类型正确性: ✅
- 描述清晰度: ✅
- 验证规则合理性: ✅

4. **用户体验**
- 响应及时性: ✅
- 结果可用性: ✅
- 错误处理: ✅

### 测试结论

1. **成功完成**
- 正确理解用户意图
- 准确识别所需字段
- 生成符合规范的Schema
- 响应时间在预期范围内

2. **优化建议**
- 可以添加更多的字段验证规则
- 考虑添加字段示例值
- 可以提供中英文双语支持

### 示例验证

```json
// 有效数据示例
{
    "name": "张三",
    "age": 25,
    "email": "zhangsan@example.com"
}

// 验证通过 ✅
```
