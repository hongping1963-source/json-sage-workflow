import { JsonSageAIConfig, SchemaGenerationOptions, ValidationResult, ConversionOptions, JsonSchema } from './types';
import { validateSchema, generateSchemaFromJson, enhanceSchemaWithAI } from './utils';

export class JsonSageAI {
    private config: JsonSageAIConfig;
    private generationCount: number = 0;  // 添加生成次数计数器

    constructor(config: JsonSageAIConfig) {
        this.config = {
            model: 'deepseek-chat',
            maxTokens: 2048,
            temperature: 0.7,
            maxGenerations: 100,  // 默认最大生成次数为100
            ...config
        };

        if (!this.config.deepseekApiKey) {
            throw new Error('DeepSeek API key is required');
        }
    }

    /**
     * 从自然语言描述生成JSON Schema
     */
    async generateSchema(description: string, options: SchemaGenerationOptions = {}): Promise<JsonSchema> {
        try {
            // 检查生成次数是否超过限制
            if (this.generationCount >= this.config.maxGenerations) {
                throw new Error('Maximum generation limit reached. Please contact administrator for more generations.');
            }
            
            // 增加生成次数计数
            this.generationCount++;

            // 使用AI生成初始schema
            const prompt = `Generate a JSON Schema for the following description: ${description}`;
            const response = await this.callDeepSeekAPI(prompt);
            const initialSchema = JSON.parse(response);

            // 增强schema
            return await enhanceSchemaWithAI(initialSchema, description, this.config);
        } catch (error) {
            throw new Error(`Failed to generate schema: ${error.message}`);
        }
    }

    /**
     * 验证JSON Schema
     */
    async validateSchema(schema: string): Promise<ValidationResult> {
        try {
            return validateSchema(schema);
        } catch (error) {
            return {
                valid: false,
                errors: [error.message]
            };
        }
    }

    /**
     * 将JSON转换为Schema
     */
    async convertJsonToSchema(json: string, options: ConversionOptions = {}): Promise<JsonSchema> {
        try {
            // 解析JSON并生成基础schema
            const parsedJson = JSON.parse(json);
            const baseSchema = generateSchemaFromJson(parsedJson, options);

            // 使用AI增强schema
            if (options.addDescriptions) {
                return await enhanceSchemaWithAI(baseSchema, '', this.config);
            }

            return baseSchema;
        } catch (error) {
            throw new Error(`Failed to convert JSON to schema: ${error.message}`);
        }
    }

    /**
     * 验证JSON数据是否符合Schema
     */
    async validateJson(json: string, schema: JsonSchema): Promise<ValidationResult> {
        try {
            const parsedJson = JSON.parse(json);
            // 使用AJV验证
            const Ajv = require('ajv');
            const ajv = new Ajv();
            const validate = ajv.compile(schema);
            const valid = validate(parsedJson);

            return {
                valid: valid,
                errors: valid ? [] : validate.errors.map(err => err.message)
            };
        } catch (error) {
            return {
                valid: false,
                errors: [error.message]
            };
        }
    }

    private async callDeepSeekAPI(prompt: string): Promise<string> {
        // 这里实现与DeepSeek API的集成
        // 使用this.config中的配置
        try {
            const deepseek = require('deepseek-chat');
            const client = new deepseek.DeepSeekChat({
                apiKey: this.config.deepseekApiKey
            });

            const response = await client.complete({
                prompt,
                model: this.config.model,
                maxTokens: this.config.maxTokens,
                temperature: this.config.temperature
            });

            return response.choices[0].text;
        } catch (error) {
            throw new Error(`DeepSeek API call failed: ${error.message}`);
        }
    }
}
