# @zhanghongping/json-sage-workflow-cli

[English](#english) | [中文](#中文)

# English

A command-line interface tool for the intelligent JSON processing workflow system. This CLI tool provides a convenient command-line interface that allows you to easily access the core functionality of json-sage-workflow.

## Features

- 🚀 Rapid JSON Schema Generation
- ✨ Intelligent JSON Validation
- 🔄 Automated Workflow Processing
- 🎯 Intuitive Command Line Interface
- 📝 Detailed Error Reporting

## Installation

```bash
npm install -g @zhanghongping/json-sage-workflow-cli
```

## Usage

After installation, you can access the CLI tool's functionality using the `json-sage-workflow` command.

### Basic Commands

1. Generate JSON Schema:
```bash
json-sage-workflow generate <input-file> [options]
```

2. Validate JSON Data:
```bash
json-sage-workflow validate <json-file> <schema-file>
```

### Options

- `-o, --output <file>` - Specify output file
- `-f, --format` - Format output
- `-v, --verbose` - Show detailed information
- `-h, --help` - Display help information

### Examples

1. Generate JSON Schema:
```bash
# Generate schema from JSON file
json-sage-workflow generate input.json -o schema.json

# Use formatted output
json-sage-workflow generate input.json -f
```

2. Validate JSON Data:
```bash
# Validate JSON file against schema
json-sage-workflow validate data.json schema.json

# Show detailed validation information
json-sage-workflow validate data.json schema.json -v
```

## Configuration

You can customize the CLI tool's behavior by creating a `.jsonsagerc.json` file in your project root:

```json
{
  "indent": 2,
  "format": true,
  "verbose": false,
  "outputDir": "./schemas"
}
```

## Requirements

- Node.js >= 14.0.0
- @zhanghongping/json-sage-workflow >= 1.0.13

## Contributing

Issues and pull requests are welcome! Please make sure to follow our contribution guidelines.

## License

MIT © Zhang Hongping

## Related Projects

- [@zhanghongping/json-sage-workflow](https://www.npmjs.com/package/@zhanghongping/json-sage-workflow) - Core Library

---

# 中文

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
