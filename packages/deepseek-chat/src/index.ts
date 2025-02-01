import axios from 'axios';

export interface DeepSeekConfig {
    apiKey: string;
    baseURL?: string;
}

export interface CompletionOptions {
    prompt: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface CompletionResponse {
    choices: Array<{
        text: string;
        index: number;
    }>;
}

export class DeepSeekChat {
    private config: DeepSeekConfig;
    private baseURL: string;

    constructor(config: DeepSeekConfig) {
        this.config = config;
        this.baseURL = config.baseURL || 'https://api.deepseek.com/v1';
    }

    async complete(options: CompletionOptions): Promise<CompletionResponse> {
        try {
            const response = await axios.post(
                `${this.baseURL}/completions`,
                {
                    model: options.model || 'deepseek-chat',
                    prompt: options.prompt,
                    max_tokens: options.maxTokens || 2048,
                    temperature: options.temperature || 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                choices: response.data.choices.map((choice: any, index: number) => ({
                    text: choice.text,
                    index
                }))
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`DeepSeek API request failed: ${error.response?.data?.error || error.message}`);
            }
            throw error;
        }
    }
}
