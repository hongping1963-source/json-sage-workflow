import { json } from '@zhanghongping/json-sage-workflow';
import { BaseAgent } from './BaseAgent';
import { AgentConfig } from '../types';

export class ExampleAgent extends BaseAgent {
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

    async generateExamples(schema: any): Promise<any> {
        try {
            const startTime = Date.now();
            console.log('Starting example generation...');

            const examples = await this.workflow.deepseek.generateExamples(schema);

            const executionTime = Date.now() - startTime;
            console.log(`Example generation completed in ${executionTime}ms`);

            return {
                examples,
                metadata: {
                    executionTime,
                    step: 'Example Generation'
                }
            };
        } catch (error) {
            console.error('Example generation failed:', error);
            throw new Error(`Example generation failed: ${error.message}`);
        }
    }
}
