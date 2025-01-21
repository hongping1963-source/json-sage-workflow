# @zhanghongping/json-sage-workflow-cli

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
