import { AgentConfig } from '../types';

export interface WorkflowConfig {
    schema: {
        useAI: boolean;
        deepseek: {
            apiKey: string;
            model: string;
            maxTokens?: number;
            temperature?: number;
        };
        caching?: boolean;
    };
}

export class Workflow {
    private config: WorkflowConfig;
    private tokenUsage: number = 0;
    private lastResponseCached: boolean = false;

    constructor(config: WorkflowConfig) {
        this.config = config;
    }

    async generateSchema(data: any, options: any): Promise<any> {
        // 模拟生成schema
        return {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: '产品名称'
                },
                price: {
                    type: 'number',
                    description: '产品价格'
                },
                description: {
                    type: 'string',
                    description: '产品描述'
                }
            },
            required: ['name', 'price']
        };
    }

    getLastTokenUsage(): number {
        return this.tokenUsage;
    }

    wasLastResponseCached(): boolean {
        return this.lastResponseCached;
    }
}
