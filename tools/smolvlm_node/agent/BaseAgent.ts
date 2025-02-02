import { AgentConfig } from '../types';

export abstract class BaseAgent {
    protected config: AgentConfig;

    constructor(config: AgentConfig) {
        this.validateConfig(config);
        this.config = this.normalizeConfig(config);
    }

    private validateConfig(config: AgentConfig): void {
        if (!config.deepseekApiKey) {
            throw new Error('DeepSeek API key is required');
        }
    }

    private normalizeConfig(config: AgentConfig): AgentConfig {
        return {
            ...config,
            model: config.model || 'deepseek-chat',
            maxTokens: config.maxTokens || 2000,
            temperature: config.temperature || 0.7,
            caching: config.caching !== false
        };
    }

    protected getConfig(): AgentConfig {
        return { ...this.config };
    }
}
