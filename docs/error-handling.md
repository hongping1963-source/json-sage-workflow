# Error Handling in JSON Sage Workflow

## Overview

Error handling is a critical aspect of JSON Sage Workflow. This guide explains how errors are handled at different levels and provides best practices for implementing error handling in your workflows.

## Error Types

### 1. NodeError

```typescript
class NodeError extends Error {
  constructor(message: string, options?: { cause?: Error; nodeId?: string }) {
    super(message);
    this.name = 'NodeError';
    this.cause = options?.cause;
    this.nodeId = options?.nodeId;
  }
}
```

Used for errors that occur within a node during execution.

### 2. ValidationError

```typescript
class ValidationError extends Error {
  constructor(message: string, public details: ValidationErrorDetails) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

Thrown when data validation fails.

### 3. ConfigurationError

```typescript
class ConfigurationError extends Error {
  constructor(message: string, public config: any) {
    super(message);
    this.name = 'ConfigurationError';
  }
}
```

Indicates invalid configuration settings.

### 4. WorkflowError

```typescript
class WorkflowError extends Error {
  constructor(message: string, public workflow: any) {
    super(message);
    this.name = 'WorkflowError';
  }
}
```

Represents workflow-level errors.

## Error Handling Levels

### 1. Node Level

Nodes handle their specific errors:

```typescript
class CustomNode extends BaseNode {
  async handleError(error: Error, context: WorkflowContext): Promise<void> {
    // Log error
    context.log.error('Error in CustomNode', error);

    // Store error details
    context.setData('lastError', {
      message: error.message,
      timestamp: new Date().toISOString(),
      nodeId: this.getId()
    });

    // Attempt recovery based on error type
    if (error instanceof ValidationError) {
      await this.handleValidationError(error, context);
    } else if (error instanceof ConfigurationError) {
      await this.handleConfigError(error, context);
    } else {
      throw error; // Unhandled error types are propagated
    }
  }

  private async handleValidationError(error: ValidationError, context: WorkflowContext) {
    // Implement validation error recovery
    const input = context.getData('input');
    if (this.canFixValidation(input, error.details)) {
      const fixedInput = await this.fixValidation(input, error.details);
      context.setData('input', fixedInput);
      await this.execute(context);
    } else {
      throw error;
    }
  }

  private async handleConfigError(error: ConfigurationError, context: WorkflowContext) {
    // Implement configuration error recovery
    if (this.hasDefaultConfig()) {
      this.useDefaultConfig();
      await this.execute(context);
    } else {
      throw error;
    }
  }
}
```

### 2. Workflow Level

Workflows can have global error handlers:

```typescript
const workflow = new JSONWorkflow()
  .setErrorHandler(async (error: Error, context: WorkflowContext) => {
    // Log workflow error
    context.log.error('Workflow Error', error);

    // Store error state
    context.setData('workflowError', {
      message: error.message,
      timestamp: new Date().toISOString(),
      type: error.name
    });

    // Implement recovery strategy
    if (error instanceof WorkflowError) {
      await handleWorkflowError(error, context);
    } else {
      // Fallback error handling
      await handleGenericError(error, context);
    }
  });
```

### 3. Application Level

Application-wide error handling:

```typescript
try {
  const result = await workflow.execute(input);
} catch (error) {
  if (error instanceof WorkflowError) {
    // Handle workflow errors
    await handleWorkflowError(error);
  } else if (error instanceof NodeError) {
    // Handle node errors
    await handleNodeError(error);
  } else {
    // Handle unexpected errors
    await handleUnexpectedError(error);
  }
}
```

## Error Recovery Strategies

### 1. Retry Strategy

```typescript
class RetryStrategy {
  constructor(private maxRetries: number, private delay: number) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await this.wait(this.delay * attempt);
        }
      }
    }
    
    throw lastError;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage in node
class RetryableNode extends BaseNode {
  private retryStrategy = new RetryStrategy(3, 1000);

  async execute(context: WorkflowContext): Promise<void> {
    await this.retryStrategy.execute(async () => {
      // Node execution logic
    });
  }
}
```

### 2. Fallback Strategy

```typescript
class FallbackStrategy {
  constructor(private fallbackOperation: () => Promise<any>) {}

  async execute<T>(
    primaryOperation: () => Promise<T>,
    context: WorkflowContext
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      context.log.warn('Primary operation failed, using fallback', error);
      return await this.fallbackOperation();
    }
  }
}

// Usage in node
class FallbackNode extends BaseNode {
  private fallbackStrategy = new FallbackStrategy(async () => {
    // Fallback logic
    return defaultValue;
  });

  async execute(context: WorkflowContext): Promise<void> {
    const result = await this.fallbackStrategy.execute(
      async () => {
        // Primary operation
      },
      context
    );
    context.setData('output', result);
  }
}
```

## Best Practices

### 1. Error Logging

```typescript
class ErrorLogger {
  static log(error: Error, context: WorkflowContext) {
    const errorDetails = {
      message: error.message,
      type: error.name,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      context: {
        nodeId: context.getCurrentNode()?.getId(),
        workflowId: context.getWorkflowId(),
        state: context.getState()
      }
    };

    // Log to appropriate destination
    context.log.error('Error occurred', errorDetails);
  }
}
```

### 2. Error Recovery

```typescript
class ErrorRecovery {
  static async recover(error: Error, context: WorkflowContext): Promise<boolean> {
    // Log recovery attempt
    context.log.info('Attempting error recovery', { error: error.message });

    // Implement recovery logic based on error type
    if (error instanceof ValidationError) {
      return await this.recoverFromValidation(error, context);
    } else if (error instanceof ConfigurationError) {
      return await this.recoverFromConfig(error, context);
    }

    return false;
  }

  private static async recoverFromValidation(
    error: ValidationError,
    context: WorkflowContext
  ): Promise<boolean> {
    // Implement validation recovery logic
    return false;
  }

  private static async recoverFromConfig(
    error: ConfigurationError,
    context: WorkflowContext
  ): Promise<boolean> {
    // Implement configuration recovery logic
    return false;
  }
}
```

### 3. Error Prevention

```typescript
class ErrorPrevention {
  static validateInput(input: any): void {
    if (!input) {
      throw new ValidationError('Input is required');
    }

    if (typeof input !== 'object') {
      throw new ValidationError('Input must be an object');
    }
  }

  static validateConfig(config: any): void {
    if (!config) {
      throw new ConfigurationError('Configuration is required');
    }

    // Add more specific validation
  }
}
```

## Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle validation errors', async () => {
    const node = new CustomNode();
    const context = new WorkflowContext();

    // Set invalid input
    context.setData('input', null);

    try {
      await node.execute(context);
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('Input is required');
    }
  });

  it('should recover from recoverable errors', async () => {
    const node = new CustomNode();
    const context = new WorkflowContext();

    // Mock recovery scenario
    const error = new ValidationError('Recoverable error');
    const recovered = await ErrorRecovery.recover(error, context);

    expect(recovered).toBe(true);
  });
});
```
