# JsonSageAI

An AI-powered framework for generating JSON schemas, field descriptions, and example values.

## Features

- 🤖 AI-powered schema generation
- 📝 Intelligent field descriptions
- 🎯 Smart example value generation
- 🔄 Workflow coordination
- 🎨 Beautiful documentation

## Quick Start

```bash
npm install json-sage-ai-agent
```

```typescript
import { JsonSageAI } from 'json-sage-ai-agent';

const agent = new JsonSageAI({
  deepseekApiKey: 'your-api-key'
});

const result = await agent.generateSchema({
  jsonData: {
    user: {
      name: "张三",
      age: 25
    }
  }
});
```

## Documentation

Check out our [documentation](https://hongping1963-source.github.io/json-sage-workflow/) for detailed guides and API reference.
