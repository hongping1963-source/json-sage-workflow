# JSON Sage Workflow API Documentation

## Core APIs

### Workflow

#### Creating a Workflow

```typescript
import { JSONWorkflow } from 'json-sage-workflow';

const workflow = new JSONWorkflow({
  name: 'my-workflow',
  version: '1.0.0',
  config: {
    // Global workflow configuration
  }
});
```

#### Workflow Methods

- `addNode(id: string, node: BaseNode): JSONWorkflow`
- `addEdge(from: string, to: string, condition?: EdgeCondition): JSONWorkflow`
- `execute(input: any): Promise<WorkflowResult>`
- `getNode(id: string): BaseNode`
- `getContext(): WorkflowContext`

### Nodes

#### Base Node Interface

```typescript
interface INode {
  execute(context: WorkflowContext): Promise<void>;
  validate(context: WorkflowContext): Promise<boolean>;
  cleanup(context: WorkflowContext): Promise<void>;
  handleError(error: Error, context: WorkflowContext): Promise<void>;
}
```

#### Built-in Nodes

1. **ValidationNode**
```typescript
import { ValidationNode } from 'json-sage-workflow/nodes';

const validator = new ValidationNode({
  schema: {
    type: 'object',
    properties: {
      // JSON Schema definition
    }
  }
});
```

2. **TransformNode**
```typescript
import { TransformNode } from 'json-sage-workflow/nodes';

const transformer = new TransformNode({
  transform: (data: any) => {
    // Transform logic
    return transformedData;
  }
});
```

3. **AIEnrichmentNode**
```typescript
import { AIEnrichmentNode } from 'json-sage-workflow/nodes';

const enricher = new AIEnrichmentNode({
  service: 'deepseek',
  config: {
    apiKey: 'your-api-key',
    model: 'model-name'
  }
});
```

### Context

#### Context Methods

- `getData(key: string): any`
- `setData(key: string, value: any): void`
- `getConfig(path: string): any`
- `getHistory(): ExecutionHistory`
- `getErrors(): ErrorRecord[]`

#### Using Context in Custom Nodes

```typescript
class CustomNode extends BaseNode {
  async execute(context: WorkflowContext) {
    // Access input data
    const input = context.getData('input');
    
    // Access node configuration
    const config = context.getConfig('customNode');
    
    // Process data
    const result = await this.processData(input, config);
    
    // Store result
    context.setData('output', result);
  }
}
```

## Error Handling

### Error Types

1. **NodeError**: Errors occurring within a node
2. **ValidationError**: Schema validation failures
3. **ConfigurationError**: Invalid configuration
4. **RuntimeError**: Execution environment issues

### Error Handling Methods

```typescript
class CustomNode extends BaseNode {
  async handleError(error: Error, context: WorkflowContext) {
    if (error instanceof ValidationError) {
      // Handle validation errors
      context.setData('validationErrors', error.details);
      return;
    }
    
    // Log error
    context.log.error('Error in CustomNode', error);
    
    // Attempt recovery
    await this.recover(context);
    
    // Or rethrow if unrecoverable
    throw error;
  }
}
```

### Global Error Handlers

```typescript
workflow.setErrorHandler((error: Error, context: WorkflowContext) => {
  // Global error handling logic
});
```

## Events

### Available Events

- `nodeStart`: Node execution started
- `nodeComplete`: Node execution completed
- `nodeError`: Error occurred in node
- `workflowStart`: Workflow execution started
- `workflowComplete`: Workflow execution completed
- `workflowError`: Workflow-level error occurred

### Event Handling

```typescript
workflow.on('nodeComplete', (nodeId: string, context: WorkflowContext) => {
  // Handle node completion
});

workflow.on('workflowError', (error: Error, context: WorkflowContext) => {
  // Handle workflow error
});
```

## Custom Node Development

### Creating a Custom Node

```typescript
import { BaseNode, WorkflowContext } from 'json-sage-workflow';

class CustomProcessingNode extends BaseNode {
  constructor(config: CustomNodeConfig) {
    super();
    this.config = config;
  }

  async validate(context: WorkflowContext): Promise<boolean> {
    // Validate input data and configuration
    const input = context.getData('input');
    return this.validateInput(input);
  }

  async execute(context: WorkflowContext): Promise<void> {
    // Main processing logic
    const input = context.getData('input');
    const result = await this.process(input);
    context.setData('output', result);
  }

  async cleanup(context: WorkflowContext): Promise<void> {
    // Cleanup resources
    await this.releaseResources();
  }

  private async process(data: any): Promise<any> {
    // Implementation of custom processing logic
  }
}
```

### Node Configuration

```typescript
interface CustomNodeConfig {
  // Node-specific configuration options
  option1: string;
  option2: number;
  // ...
}

// Usage
const customNode = new CustomProcessingNode({
  option1: 'value1',
  option2: 42
});
```

### Best Practices

1. **Input Validation**
   - Always validate input data
   - Check configuration parameters
   - Verify dependencies are available

2. **Error Handling**
   - Implement proper error handling
   - Use appropriate error types
   - Provide meaningful error messages

3. **Resource Management**
   - Clean up resources in cleanup method
   - Handle timeouts appropriately
   - Implement retry logic if needed

4. **Testing**
   - Write unit tests for node logic
   - Test error handling scenarios
   - Test with various input types

5. **Documentation**
   - Document configuration options
   - Provide usage examples
   - Explain error scenarios and handling
