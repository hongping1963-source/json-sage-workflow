# @zhanghongping/json-sage-workflow-cli

命令行界面工具，用于智能JSON处理工作流系统。这个CLI工具提供了便捷的命令行接口，让您能够轻松地使用json-sage-workflow的核心功能。

## 特性

- 🚀 快速生成JSON Schema
- ✨ 智能验证JSON数据
- 🔄 自动化的工作流处理
- 🎯 直观的命令行界面
- 📝 详细的错误提示

## 安装

```bash
npm install -g @zhanghongping/json-sage-workflow-cli
```

## 使用方法

安装后，您可以使用 `json-sage-workflow` 命令来访问CLI工具的功能。

### 基本命令

1. 生成JSON Schema：
```bash
json-sage-workflow generate <input-file> [options]
```

2. 验证JSON数据：
```bash
json-sage-workflow validate <json-file> <schema-file>
```

### 选项

- `-o, --output <file>` - 指定输出文件
- `-f, --format` - 格式化输出
- `-v, --verbose` - 显示详细信息
- `-h, --help` - 显示帮助信息

### 示例

1. 生成JSON Schema：
```bash
# 从JSON文件生成schema
json-sage-workflow generate input.json -o schema.json

# 使用格式化输出
json-sage-workflow generate input.json -f
```

2. 验证JSON数据：
```bash
# 验证JSON文件是否符合schema
json-sage-workflow validate data.json schema.json

# 显示详细的验证信息
json-sage-workflow validate data.json schema.json -v
```

## 配置

您可以通过在项目根目录创建 `.jsonsagerc.json` 文件来自定义CLI工具的行为：

```json
{
  "indent": 2,
  "format": true,
  "verbose": false,
  "outputDir": "./schemas"
}
```

## 依赖

- Node.js >= 14.0.0
- @zhanghongping/json-sage-workflow >= 1.0.13

## 贡献

欢迎提交问题和拉取请求！请确保遵循我们的贡献指南。

## 许可证

MIT © Zhang Hongping

## 相关项目

- [@zhanghongping/json-sage-workflow](https://www.npmjs.com/package/@zhanghongping/json-sage-workflow) - 核心库
