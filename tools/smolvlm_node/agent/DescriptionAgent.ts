import { json } from '@zhanghongping/json-sage-workflow';
import { BaseAgent } from './BaseAgent';
import { AgentConfig } from '../types';

export class DescriptionAgent extends BaseAgent {
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

    async generateDescriptions(jsonData: any): Promise<Record<string, string>> {
        try {
            const startTime = Date.now();
            console.log('Starting field description generation...');

            const descriptions = await this.workflow.deepseek.generateFieldDescriptions(jsonData);

            const executionTime = Date.now() - startTime;
            console.log(`Description generation completed in ${executionTime}ms`);

            return {
                descriptions,
                metadata: {
                    executionTime,
                    step: 'Description Generation'
                }
            };
        } catch (error) {
            console.error('Description generation failed:', error);
            throw new Error(`Description generation failed: ${error.message}`);
        }
    }
}
