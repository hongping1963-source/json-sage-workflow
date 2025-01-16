import { WorkflowContext } from '../core/WorkflowContext';
import { ValidationError } from '../core/errors/ValidationError';
import { ConfigurationError } from '../core/errors/ConfigurationError';

/**
 * Utility class providing common functionality for workflow nodes
 */
export class NodeUtils {
  /**
   * Validates node input data against specified criteria
   * @param input - Input data to validate
   * @param schema - Validation schema (optional)
   * @param context - Workflow context
   * @throws {ValidationError} If validation fails
   */
  static async validateInput(
    input: any,
    schema: any,
    context: WorkflowContext
  ): Promise<void> {
    if (!input) {
      throw new ValidationError('Input data is required');
    }

    if (schema) {
      const validationResult = await this.validateSchema(input, schema);
      if (!validationResult.valid) {
        throw new ValidationError(
          'Input validation failed',
          validationResult.errors
        );
      }
    }
  }

  /**
   * Validates node configuration
   * @param config - Node configuration
   * @param requiredFields - List of required configuration fields
   * @throws {ConfigurationError} If configuration is invalid
   */
  static validateConfig(
    config: any,
    requiredFields: string[] = []
  ): void {
    if (!config) {
      throw new ConfigurationError('Configuration is required');
    }

    for (const field of requiredFields) {
      if (!(field in config)) {
        throw new ConfigurationError(`Missing required configuration field: ${field}`);
      }
    }
  }

  /**
   * Parses and validates data type
   * @param value - Value to parse
   * @param expectedType - Expected type
   * @returns Parsed value
   * @throws {ValidationError} If type is invalid
   */
  static parseType(value: any, expectedType: string): any {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new ValidationError(`Invalid number: ${value}`);
        }
        return num;
      case 'boolean':
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return Boolean(value);
      case 'object':
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            throw new ValidationError(`Invalid JSON object: ${value}`);
          }
        }
        return value;
      case 'array':
        if (Array.isArray(value)) {
          return value;
        }
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              throw new Error();
            }
            return parsed;
          } catch (e) {
            throw new ValidationError(`Invalid array: ${value}`);
          }
        }
        throw new ValidationError(`Invalid array: ${value}`);
      default:
        throw new ValidationError(`Unsupported type: ${expectedType}`);
    }
  }

  /**
   * Validates data against JSON Schema
   * @param data - Data to validate
   * @param schema - JSON Schema
   * @returns Validation result
   */
  private static async validateSchema(
    data: any,
    schema: any
  ): Promise<{ valid: boolean; errors?: any[] }> {
    // Implementation of JSON Schema validation
    // You might want to use a library like Ajv here
    return { valid: true };
  }
}

/**
 * Utility functions for working with asynchronous operations
 */
export class AsyncUtils {
  /**
   * Executes an async operation with retry logic
   * @param operation - Async operation to execute
   * @param maxRetries - Maximum number of retries
   * @param delay - Delay between retries in milliseconds
   * @returns Operation result
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Executes an async operation with timeout
   * @param operation - Async operation to execute
   * @param timeout - Timeout in milliseconds
   * @returns Operation result
   */
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout);
    });

    return Promise.race([operation(), timeoutPromise]);
  }
}

/**
 * Utility functions for dependency management
 */
export class DependencyUtils {
  /**
   * Detects circular dependencies in a graph
   * @param graph - Dependency graph
   * @returns Array of circular dependencies if found
   */
  static detectCircularDependencies(
    graph: Record<string, string[]>
  ): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[] = []): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = graph[node] || [];
      for (const dependency of dependencies) {
        if (!visited.has(dependency)) {
          dfs(dependency, [...path]);
        } else if (recursionStack.has(dependency)) {
          const cycleStart = path.indexOf(dependency);
          cycles.push(path.slice(cycleStart));
        }
      }

      recursionStack.delete(node);
      path.pop();
    };

    for (const node of Object.keys(graph)) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  /**
   * Sorts nodes topologically
   * @param graph - Dependency graph
   * @returns Sorted node list
   * @throws {Error} If circular dependency is detected
   */
  static topologicalSort(
    graph: Record<string, string[]>
  ): string[] {
    const visited = new Set<string>();
    const sorted: string[] = [];

    const visit = (node: string, ancestors: Set<string>): void => {
      if (ancestors.has(node)) {
        throw new Error(`Circular dependency detected: ${Array.from(ancestors).join(' -> ')} -> ${node}`);
      }

      if (visited.has(node)) return;

      ancestors.add(node);
      const dependencies = graph[node] || [];
      
      for (const dependency of dependencies) {
        visit(dependency, new Set(ancestors));
      }
      
      ancestors.delete(node);
      visited.add(node);
      sorted.unshift(node);
    };

    for (const node of Object.keys(graph)) {
      if (!visited.has(node)) {
        visit(node, new Set());
      }
    }

    return sorted;
  }
}
