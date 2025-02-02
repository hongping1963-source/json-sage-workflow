import axios, { AxiosInstance } from 'axios';
import { DeepSeekConfig } from '../config/ConfigManager';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionRequest {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: ChatMessage;
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class DeepSeekClient {
    private client: AxiosInstance;
    private defaultModel: string;

    constructor(private config: DeepSeekConfig) {
        this.defaultModel = config.model || 'deepseek-chat';
        this.client = axios.create({
            baseURL: config.apiBaseUrl || 'https://api.deepseek.com/v1',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => this.handleApiError(error)
        );
    }

    /**
     * 创建聊天完成
     */
    public async createChatCompletion(
        request: Omit<ChatCompletionRequest, 'model'> & { model?: string }
    ): Promise<ChatCompletionResponse> {
        const payload: ChatCompletionRequest = {
            ...request,
            model: request.model || this.defaultModel,
            temperature: request.temperature ?? this.config.temperature ?? 0.7,
            max_tokens: request.max_tokens ?? this.config.maxTokens ?? 2000
        };

        try {
            const response = await this.client.post<ChatCompletionResponse>(
                '/chat/completions',
                payload
            );
            return response.data;
        } catch (error) {
            throw this.handleApiError(error);
        }
    }

    /**
     * 处理 API 错误
     */
    private handleApiError(error: any): never {
        if (error.response) {
            // API 响应的错误
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 401:
                    throw new Error('Invalid API key. Please check your DeepSeek API credentials.');
                case 403:
                    throw new Error('API key does not have permission to access this resource.');
                case 429:
                    throw new Error('Rate limit exceeded. Please try again later.');
                default:
                    throw new Error(
                        `DeepSeek API error (${status}): ${
                            data.error?.message || 'Unknown error'
                        }`
                    );
            }
        } else if (error.request) {
            // 请求发送失败
            throw new Error(
                'Failed to connect to DeepSeek API. Please check your internet connection.'
            );
        } else {
            // 其他错误
            throw new Error(`Error: ${error.message}`);
        }
    }

    /**
     * 生成系统提示
     */
    public static generateSystemPrompt(format: string = 'draft-07'): string {
        return `You are a JSON Schema expert. Your task is to analyze JSON data and generate accurate JSON Schema definitions.
Please follow these guidelines:
1. Use JSON Schema ${format} format
2. Include detailed descriptions for each field
3. Add appropriate examples where possible
4. Infer proper types and formats
5. Include validation rules when obvious from the data
6. Keep the schema concise but comprehensive`;
    }

    /**
     * 生成用户提示
     */
    public static generateUserPrompt(json: string): string {
        return `Please generate a JSON Schema for the following JSON data. Include detailed descriptions and examples:

${json}

Please provide only the JSON Schema as output, without any additional text or explanations.`;
    }
}
