import { WorkflowContext } from './WorkflowContext';
import { NodeUtils, AsyncUtils } from '../utils/NodeUtils';
import { NodeError } from './errors/NodeError';

/**
 * Abstract base class for all workflow nodes
 */
export abstract class BaseNode {
  protected id: string;
  protected config: any;
  protected timeout: number = 30000; // Default timeout: 30 seconds

  /**
   * Creates a new node instance
   * @param config - Node configuration
   */
  constructor(config?: any) {
    if (config) {
      NodeUtils.validateConfig(config);
      this.config = config;
    }
  }

  /**
   * Sets the node ID
   * @param id - Node identifier
   */
  setId(id: string): void {
    this.id = id;
  }

  /**
   * Gets the node ID
   * @returns Node identifier
   */
  getId(): string {
    return this.id;
  }

  /**
   * Sets node configuration
   * @param config - Node configuration
   */
  setConfig(config: any): void {
    NodeUtils.validateConfig(config);
    this.config = config;
  }

  /**
   * Gets node configuration
   * @returns Node configuration
   */
  getConfig(): any {
    return this.config;
  }

  /**
   * Sets operation timeout
   * @param timeout - Timeout in milliseconds
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Executes the node's main logic
   * @param context - Workflow context
   */
  async execute(context: WorkflowContext): Promise<void> {
    try {
      // Validate input
      const input = context.getData('input');
      await NodeUtils.validateInput(input, this.config?.schema, context);

      // Execute with timeout
      await AsyncUtils.withTimeout(
        async () => await this.processNode(context),
        this.timeout
      );
    } catch (error) {
      await this.handleError(error as Error, context);
    }
  }

  /**
   * Validates node state and configuration
   * @param context - Workflow context
   * @returns true if validation passes
   */
  async validate(context: WorkflowContext): Promise<boolean> {
    const input = context.getData('input');
    await NodeUtils.validateInput(input, this.config?.schema, context);
    return true;
  }

  /**
   * Cleans up node resources
   * @param context - Workflow context
   */
  async cleanup(context: WorkflowContext): Promise<void> {
    // Default implementation - override if needed
  }

  /**
   * Handles node errors
   * @param error - Error that occurred
   * @param context - Workflow context
   */
  async handleError(error: Error, context: WorkflowContext): Promise<void> {
    context.log.error(`Error in node ${this.id}:`, error);
    
    if (this.config?.errorHandler) {
      await this.config.errorHandler(error, context);
    } else {
      throw new NodeError(`Node ${this.id} execution failed: ${error.message}`, {
        cause: error,
        nodeId: this.id
      });
    }
  }

  /**
   * Main node processing logic - must be implemented by concrete nodes
   * @param context - Workflow context
   */
  protected abstract processNode(context: WorkflowContext): Promise<void>;
}
