import { json } from '@zhanghongping/json-sage-workflow';
import { AgentConfig, SchemaGenerationTask, AgentResult } from '../types';

export class JsonSageAgent {
    private workflow: any;
    private config: AgentConfig;

    constructor(config: AgentConfig) {
        this.config = config;
        this.initializeWorkflow();
    }

    private initializeWorkflow() {
        this.workflow = json.createWorkflow({
            schema: {
                useAI: true,
                deepseek: {
                    apiKey: this.config.deepseekApiKey,
                    model: this.config.model || 'deepseek-chat',
                    maxTokens: this.config.maxTokens || 2000,
                    temperature: this.config.temperature || 0.7
                },
                caching: this.config.caching !== false
            }
        });
    }

    async executeTask(task: SchemaGenerationTask): Promise<AgentResult> {
        const startTime = Date.now();
        const steps: string[] = [];

        try {
            // Step 1: Generate Schema
            steps.push('Generating JSON Schema');
            const schema = await this.workflow.generateSchema(task.jsonData, {
                format: task.options.format || 'draft-07',
                includeExamples: task.options.includeExamples !== false,
                includeDescriptions: task.options.includeDescriptions !== false,
                temperature: task.options.temperature || this.config.temperature,
                maxTokens: task.options.maxTokens || this.config.maxTokens
            });

            // Step 2: Generate Field Descriptions
            steps.push('Generating field descriptions');
            const descriptions = await this.workflow.deepseek.generateFieldDescriptions(task.jsonData);

            // Step 3: Generate Examples
            steps.push('Generating examples');
            const examples = await this.workflow.deepseek.generateExamples(schema);

            const executionTime = Date.now() - startTime;

            return {
                schema,
                descriptions,
                examples,
                metadata: {
                    executionTime,
                    steps
                }
            };
        } catch (error) {
            console.error('Agent execution failed:', error);
            throw new Error(`Agent execution failed: ${error.message}`);
        }
    }

    async validateSchema(schema: any, jsonData: any): Promise<boolean> {
        try {
            // Add schema validation logic here
            return true;
        } catch (error) {
            console.error('Schema validation failed:', error);
            return false;
        }
    }

    getConfig(): AgentConfig {
        return { ...this.config };
    }
}
