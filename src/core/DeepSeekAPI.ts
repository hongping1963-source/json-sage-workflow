import axios from 'axios';

interface DeepSeekConfig {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

export class DeepSeekAPI {
    private readonly apiKey: string;
    private readonly model: string;
    private readonly maxTokens: number;
    private readonly temperature: number;
    private readonly baseUrl = 'https://api.deepseek.com/v1';

    constructor(apiKey: string, config: Partial<DeepSeekConfig> = {}) {
        this.apiKey = apiKey;
        this.model = config.model || 'deepseek-chat';
        this.maxTokens = config.maxTokens || 2048;
        this.temperature = config.temperature || 0.7;
    }

    async complete(prompt: string): Promise<string> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的JSON Schema生成助手，擅长理解用户需求并生成准确的JSON Schema。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: this.maxTokens,
                    temperature: this.temperature
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling DeepSeek API:', error);
            throw new Error(`DeepSeek API call failed: ${error.message}`);
        }
    }

    async analyze(text: string, task: string): Promise<any> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/analyze`,
                {
                    model: this.model,
                    text,
                    task
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error analyzing text with DeepSeek API:', error);
            throw new Error(`DeepSeek API analysis failed: ${error.message}`);
        }
    }
}
