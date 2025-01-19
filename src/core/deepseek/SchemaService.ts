import { DeepSeekClient, ChatMessage } from './DeepSeekClient';
import { DeepSeekConfig } from '../config/ConfigManager';

export interface SchemaGenerationOptions {
    format?: 'draft-07' | 'draft-06' | 'draft-04';
    includeExamples?: boolean;
    includeDescriptions?: boolean;
    temperature?: number;
    maxTokens?: number;
}

export class SchemaService {
    private client: DeepSeekClient;

    constructor(config: DeepSeekConfig) {
        this.client = new DeepSeekClient(config);
    }

    /**
     * 生成 JSON Schema
     */
    public async generateSchema(
        json: string | object,
        options: SchemaGenerationOptions = {}
    ): Promise<string> {
        const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
        
        try {
            // 准备消息
            const messages: ChatMessage[] = [
                {
                    role: 'system',
                    content: DeepSeekClient.generateSystemPrompt(options.format || 'draft-07')
                },
                {
                    role: 'user',
                    content: DeepSeekClient.generateUserPrompt(jsonString)
                }
            ];

            // 调用 API
            const response = await this.client.createChatCompletion({
                messages,
                temperature: options.temperature,
                max_tokens: options.maxTokens
            });

            // 提取并验证 Schema
            const schemaString = response.choices[0]?.message?.content;
            if (!schemaString) {
                throw new Error('Failed to generate schema: Empty response from API');
            }

            try {
                // 验证生成的 Schema 是否为有效的 JSON
                const schema = JSON.parse(schemaString);
                return JSON.stringify(schema, null, 2);
            } catch (error) {
                throw new Error('Generated schema is not valid JSON');
            }
        } catch (error) {
            throw new Error(`Schema generation failed: ${error.message}`);
        }
    }

    /**
     * 生成字段描述
     */
    public async generateFieldDescriptions(
        json: string | object
    ): Promise<Record<string, string>> {
        const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
        
        try {
            const messages: ChatMessage[] = [
                {
                    role: 'system',
                    content: 'You are a JSON documentation expert. Your task is to analyze JSON data and provide clear, concise descriptions for each field.'
                },
                {
                    role: 'user',
                    content: `Please provide descriptions for each field in the following JSON. Return only a JSON object where keys are field paths and values are descriptions:

${jsonString}`
                }
            ];

            const response = await this.client.createChatCompletion({
                messages,
                temperature: 0.3 // 使用较低的温度以获得更一致的描述
            });

            const descriptionsString = response.choices[0]?.message?.content;
            if (!descriptionsString) {
                throw new Error('Failed to generate descriptions: Empty response from API');
            }

            try {
                return JSON.parse(descriptionsString);
            } catch (error) {
                throw new Error('Generated descriptions are not valid JSON');
            }
        } catch (error) {
            throw new Error(`Field description generation failed: ${error.message}`);
        }
    }

    /**
     * 生成示例值
     */
    public async generateExamples(
        schema: string | object
    ): Promise<Record<string, any>> {
        const schemaString = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);
        
        try {
            const messages: ChatMessage[] = [
                {
                    role: 'system',
                    content: 'You are a JSON Schema expert. Your task is to generate realistic example values that conform to the given JSON Schema.'
                },
                {
                    role: 'user',
                    content: `Please generate example values for the following JSON Schema. Return only a JSON object with example values:

${schemaString}`
                }
            ];

            const response = await this.client.createChatCompletion({
                messages,
                temperature: 0.5 // 使用中等温度以获得合理但多样的示例
            });

            const examplesString = response.choices[0]?.message?.content;
            if (!examplesString) {
                throw new Error('Failed to generate examples: Empty response from API');
            }

            try {
                return JSON.parse(examplesString);
            } catch (error) {
                throw new Error('Generated examples are not valid JSON');
            }
        } catch (error) {
            throw new Error(`Example generation failed: ${error.message}`);
        }
    }
}
