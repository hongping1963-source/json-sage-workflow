import { json } from '@zhanghongping/json-sage-workflow';
import { BaseAgent } from './BaseAgent';
import { AgentConfig, SchemaGenerationTask } from '../types';

interface SchemaResult {
    schema: any;
    metadata: {
        executionTime: number;
        step: string;
    };
}

export class SchemaAgent extends BaseAgent {
    private workflow: any;

    constructor(config: AgentConfig) {
        super(config);
        this.initializeWorkflow();
    }

    private initializeWorkflow(): void {
        this.workflow = json.createWorkflow({
            schema: {
                useAI: true,
                deepseek: {
                    apiKey: this.config.deepseekApiKey,
                    model: this.config.model,
                    maxTokens: this.config.maxTokens,
                    temperature: this.config.temperature
                },
                caching: this.config.caching
            }
        });
    }

    async generateSchema(task: SchemaGenerationTask): Promise<SchemaResult> {
        try {
            const startTime = Date.now();
            console.log('Starting schema generation...');

            const schema = await this.workflow.generateSchema(task.jsonData, {
                format: task.options.format || 'draft-07',
                includeExamples: task.options.includeExamples !== false,
                includeDescriptions: task.options.includeDescriptions !== false,
                temperature: task.options.temperature || this.config.temperature,
                maxTokens: task.options.maxTokens || this.config.maxTokens
            });

            const executionTime = Date.now() - startTime;
            console.log(`Schema generation completed in ${executionTime}ms`);

            return {
                schema,
                metadata: {
                    executionTime,
                    step: 'Schema Generation'
                }
            };
        } catch (error) {
            console.error('Schema generation failed:', error);
            throw new Error(`Schema generation failed: ${error.message}`);
        }
    }
}
