# JsonSageAI CLI 工具指南

## 简介

JsonSageAI CLI 是一个命令行工具，它让用户能够使用自然语言轻松生成和验证 JSON Schema。该工具特别适合不熟悉编程或需要快速生成 Schema 的用户。

## 安装

```bash
npm install -g @json-sage-ai/cli
```

## 主要功能

### 1. 生成 Schema

#### 交互式模式
```bash
json-sage generate -i
```

#### 直接模式
```bash
json-sage generate -d "创建产品对象"
```

#### 保存到文件
```bash
json-sage generate -d "用户资料" -o schema.json
```

### 2. 验证 Schema
```bash
json-sage validate schema.json
```

### 3. 查看示例
```bash
json-sage examples
```

## 命令详解

### generate 命令
生成 JSON Schema

选项：
- `-i, --interactive`: 交互式模式
- `-d, --description`: Schema 描述
- `-o, --output`: 输出文件路径
- `-f, --format`: 格式化输出

### validate 命令
验证现有的 JSON Schema

参数：
- `<file>`: Schema 文件路径

## 错误处理

CLI 工具内置了智能的错误处理机制：

1. **自动重试**
   - 最大重试次数：3次
   - 初始延迟：1秒
   - 最大延迟：10秒
   - 使用指数退避策略

2. **错误类型**
   - API 错误（502、503、504）
   - 认证错误（401）
   - 限流错误（429）

## 使用示例

### 示例 1：创建电商产品 Schema

```bash
$ json-sage generate -i

? Please describe your data structure: 创建一个电子商务产品对象，包含以下字段：
- 产品ID（必填，字符串）
- 产品名称（必填，字符串）
- 价格（必填，数字，最小0）
- 描述（可选，字符串）
- 库存数量（必填，整数，最小0）
- 分类（必填，字符串数组）
- 创建时间（必填，日期时间）
- 图片URL（可选，字符串数组）
- 规格（可选，对象，包含颜色和尺寸）

? Would you like to format the output? Yes
? Where would you like to save the schema? product-schema.json
```

生成的 Schema：
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "productId",
    "name",
    "price",
    "stock",
    "categories",
    "createdAt"
  ],
  "properties": {
    "productId": {
      "type": "string",
      "description": "产品唯一标识符"
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
    "description": {
      "type": "string",
      "description": "产品描述"
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
      "description": "产品分类"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "产品创建时间"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "uri"
      },
      "description": "产品图片URL列表"
    },
    "specifications": {
      "type": "object",
      "properties": {
        "color": {
          "type": "string",
          "description": "产品颜色"
        },
        "size": {
          "type": "string",
          "description": "产品尺寸"
        }
      },
      "description": "产品规格"
    }
  }
}
```

### 示例 2：错误处理演示

```bash
$ json-sage generate -d "创建用户资料Schema"
Attempt 1 failed: API服务暂时不可用 (502 Bad Gateway)
Retrying in 1 seconds...
Schema generated successfully!
```

## 最佳实践

1. **使用交互式模式**
   - 适合首次使用
   - 提供更多选项和引导

2. **保存常用 Schema**
   - 使用 `-o` 选项保存到文件
   - 方便重复使用和共享

3. **验证已有 Schema**
   - 使用 validate 命令
   - 确保 Schema 符合规范

## 常见问题

1. **API 密钥配置**
   ```bash
   export DEEPSEEK_API_KEY=your_api_key
   ```

2. **输出格式化**
   - 使用 `-f` 选项
   - 提高可读性

3. **错误处理**
   - 自动重试机制
   - 清晰的错误提示

## 技术支持

如遇问题，请：
1. 查看错误信息
2. 检查 API 密钥
3. 确认网络连接
4. 查看文档
5. 提交 Issue
