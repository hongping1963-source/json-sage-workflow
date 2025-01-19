# JSON Sage Workflow

A powerful and flexible JSON processing workflow system with AI capabilities.

## Overview

JSON Sage Workflow is an advanced extension of the JSONSage library, providing a complete workflow system for JSON processing and transformation. It combines traditional JSON operations with AI-powered features through integration with services like DeepSeek.

## Key Features

- **Workflow System**: Build complex JSON processing pipelines
- **AI Integration**: Leverage AI for schema generation and data enrichment
- **Extensible Architecture**: Create custom nodes for specific needs
- **Error Handling**: Comprehensive error management and recovery
- **Performance Optimized**: Efficient processing of large JSON datasets

## Installation

```bash
npm install json-sage-workflow
```

## Quick Start

```typescript
import { JSONWorkflow, ValidationNode, TransformNode } from 'json-sage-workflow';

// Create a workflow
const workflow = new JSONWorkflow()
  .addNode('validate', new ValidationNode({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    }
  }))
  .addNode('transform', new TransformNode({
    transform: (data) => ({
      fullName: data.name,
      ageInMonths: data.age * 12
    })
  }));

// Execute workflow
const result = await workflow.execute({
  name: 'John Doe',
  age: 30
});
```

## Documentation

- [API Documentation](docs/api.md)
- [Custom Nodes Guide](docs/custom-nodes.md)
- [Error Handling](docs/error-handling.md)

## Features in Detail

### 1. Workflow System

Build complex JSON processing pipelines with:
- Multiple processing steps
- Conditional execution
- Parallel processing
- State management

### 2. AI Integration

Leverage AI capabilities for:
- Schema generation
- Data validation
- Content enrichment
- Pattern recognition

### 3. Custom Nodes

Create specialized nodes for:
- Data transformation
- Validation
- Enrichment
- External service integration

### 4. Error Handling

Comprehensive error management:
- Multiple recovery strategies
- Detailed error reporting
- Custom error handlers
- Automatic retries

## Configuration

### Environment Variables

```env
JSONSAGE_DEEPSEEK_API_KEY=your-api-key
JSONSAGE_DEEPSEEK_MODEL=model-name
JSONSAGE_CACHE_ENABLED=true
JSONSAGE_CACHE_TTL=3600
```

### Configuration File

```json
{
  "workflow": {
    "maxNodes": 100,
    "timeout": 30000
  },
  "ai": {
    "service": "deepseek",
    "config": {
      "temperature": 0.7,
      "maxTokens": 2000
    }
  }
}
```

## Examples

### Basic Data Transformation

```typescript
const workflow = new JSONWorkflow()
  .addNode('transform', new TransformNode({
    transform: (data) => ({
      user: {
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email.toLowerCase()
      }
    })
  }));

const result = await workflow.execute({
  firstName: 'John',
  lastName: 'Doe',
  email: 'JOHN@EXAMPLE.COM'
});
```

### AI-Powered Schema Generation

```typescript
const workflow = new JSONWorkflow()
  .addNode('schemaGen', new AISchemaNode({
    service: 'deepseek',
    config: {
      model: 'schema-gen-v1'
    }
  }));

const schema = await workflow.execute({
  user: {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  }
});
```

### Custom Data Validation

```typescript
const workflow = new JSONWorkflow()
  .addNode('validate', new ValidationNode({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        age: {
          type: 'number',
          minimum: 0,
          maximum: 120
        }
      },
      required: ['email', 'age']
    }
  }));

try {
  await workflow.execute({
    email: 'invalid-email',
    age: 150
  });
} catch (error) {
  console.log('Validation failed:', error.message);
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/json-sage-workflow.git
```

2. Install dependencies
```bash
npm install
```

3. Run tests
```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/json-sage-workflow/issues)
- Documentation: [Read the docs](docs/README.md)
- Community: [Join our Discord](https://discord.gg/jsonsage)
