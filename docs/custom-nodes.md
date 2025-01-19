# Creating Custom Nodes in JSON Sage Workflow

## Overview

Custom nodes allow you to extend JSON Sage Workflow with your own processing logic. This guide provides a complete example of creating a custom node and explains each component in detail.

## Complete Example

Here's a complete example of a custom node that processes JSON data:

```typescript
import { BaseNode, WorkflowContext, NodeError } from 'json-sage-workflow';

interface DataTransformerConfig {
  fieldMapping: Record<string, string>;
  defaultValues?: Record<string, any>;
  validation?: {
    required?: string[];
    types?: Record<string, string>;
  };
}

class DataTransformerNode extends BaseNode {
  private config: DataTransformerConfig;

  constructor(config: DataTransformerConfig) {
    super();
    this.config = this.validateConfig(config);
  }

  private validateConfig(config: DataTransformerConfig): DataTransformerConfig {
    if (!config.fieldMapping || typeof config.fieldMapping !== 'object') {
      throw new NodeError('Invalid configuration: fieldMapping is required and must be an object');
    }
    return config;
  }

  async validate(context: WorkflowContext): Promise<boolean> {
    const input = context.getData('input');
    
    // Validate input exists
    if (!input || typeof input !== 'object') {
      throw new NodeError('Invalid input: expected an object');
    }

    // Validate required fields
    if (this.config.validation?.required) {
      for (const field of this.config.validation.required) {
        if (!(field in input)) {
          throw new NodeError(`Missing required field: ${field}`);
        }
      }
    }

    // Validate field types
    if (this.config.validation?.types) {
      for (const [field, expectedType] of Object.entries(this.config.validation.types)) {
        if (field in input && typeof input[field] !== expectedType) {
          throw new NodeError(
            `Invalid type for field ${field}: expected ${expectedType}, got ${typeof input[field]}`
          );
        }
      }
    }

    return true;
  }

  async execute(context: WorkflowContext): Promise<void> {
    try {
      const input = context.getData('input');
      const output: Record<string, any> = {};

      // Apply field mapping
      for (const [targetField, sourceField] of Object.entries(this.config.fieldMapping)) {
        output[targetField] = input[sourceField];
      }

      // Apply default values
      if (this.config.defaultValues) {
        for (const [field, defaultValue] of Object.entries(this.config.defaultValues)) {
          if (output[field] === undefined) {
            output[field] = defaultValue;
          }
        }
      }

      // Store the transformed data
      context.setData('output', output);

      // Log success
      context.log.info('Data transformation completed successfully');
    } catch (error) {
      throw new NodeError('Error during data transformation', { cause: error });
    }
  }

  async cleanup(context: WorkflowContext): Promise<void> {
    // Clean up any temporary data
    context.removeData('temp');
  }

  async handleError(error: Error, context: WorkflowContext): Promise<void> {
    // Log the error
    context.log.error('Error in DataTransformerNode', error);

    // Store error details in context
    context.setData('error', {
      message: error.message,
      timestamp: new Date().toISOString(),
      nodeId: this.getId()
    });

    // Attempt recovery if possible
    if (error instanceof NodeError) {
      await this.attemptRecovery(context);
    } else {
      throw error; // Rethrow unhandled errors
    }
  }

  private async attemptRecovery(context: WorkflowContext): Promise<void> {
    // Implement recovery logic
    const input = context.getData('input');
    if (input) {
      try {
        // Attempt basic transformation without validation
        const output = {};
        for (const [targetField, sourceField] of Object.entries(this.config.fieldMapping)) {
          if (input[sourceField] !== undefined) {
            output[targetField] = input[sourceField];
          }
        }
        context.setData('output', output);
        context.log.info('Recovery successful');
      } catch (error) {
        context.log.error('Recovery failed', error);
        throw error;
      }
    }
  }
}

// Usage Example
const transformerNode = new DataTransformerNode({
  fieldMapping: {
    'firstName': 'name.first',
    'lastName': 'name.last',
    'email': 'contact.email'
  },
  defaultValues: {
    'status': 'active',
    'role': 'user'
  },
  validation: {
    required: ['name.first', 'contact.email'],
    types: {
      'name.first': 'string',
      'contact.email': 'string'
    }
  }
});

// Using the node in a workflow
const workflow = new JSONWorkflow()
  .addNode('transform', transformerNode)
  .addEdge('input', 'transform')
  .addEdge('transform', 'output');

// Execute the workflow
const result = await workflow.execute({
  input: {
    name: {
      first: 'John',
      last: 'Doe'
    },
    contact: {
      email: 'john@example.com'
    }
  }
});
```

## Method Explanations

### Constructor

The constructor initializes the node with its configuration and validates it:
- Takes configuration parameters
- Validates configuration format
- Stores configuration for use during execution

### validate()

The validate method checks input data before processing:
- Verifies input data exists and has correct format
- Checks required fields are present
- Validates field types
- Returns true if validation passes, throws error if not

### execute()

The execute method contains the main processing logic:
- Retrieves input data from context
- Performs data transformation
- Handles errors during processing
- Stores results in context
- Logs operation status

### cleanup()

The cleanup method handles resource management:
- Removes temporary data
- Closes connections if any
- Frees up resources
- Called after execution completes

### handleError()

The error handler provides error recovery:
- Logs error details
- Stores error information in context
- Attempts recovery if possible
- Throws unrecoverable errors

## Best Practices

1. **Configuration Validation**
   - Always validate configuration in constructor
   - Use TypeScript interfaces for type safety
   - Provide clear error messages for invalid config

2. **Input Validation**
   - Validate all input data before processing
   - Check data types and required fields
   - Use custom validation rules when needed

3. **Error Handling**
   - Implement comprehensive error handling
   - Provide detailed error messages
   - Include recovery mechanisms
   - Log errors appropriately

4. **Resource Management**
   - Clean up resources in cleanup method
   - Handle memory usage carefully
   - Implement proper disposal patterns

5. **Testing**
   - Write unit tests for all methods
   - Test error scenarios
   - Test with various input types
   - Test recovery mechanisms

6. **Documentation**
   - Document configuration options
   - Provide usage examples
   - Explain error scenarios
   - Include performance considerations
