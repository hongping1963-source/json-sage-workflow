import { DeepSeekService, SchemaGenerationOptions } from './DeepSeekService';
import { analyzeJsonStructure } from './analyzer';
import { ConfigManager, DeepSeekConfig } from './config/ConfigManager';

export interface SchemaGeneratorOptions {
    useAI?: boolean;
    aiOptions?: SchemaGenerationOptions;
    deepseek?: DeepSeekConfig;
    caching?: boolean;
}

export class SchemaGenerator {
    private deepseek?: DeepSeekService;
    private schemaCache: Map<string, any> = new Map();
    private configManager: ConfigManager;

    constructor(private options: SchemaGeneratorOptions = {}) {
        this.configManager = ConfigManager.getInstance();
        this.initializeDeepSeek();
    }

    /**
     * 初始化 DeepSeek 服务
     */
    private initializeDeepSeek(): void {
        const useAI = this.options.useAI ?? false;
        if (useAI) {
            // 合并配置优先级：选项 > 配置文件/环境变量
            const deepseekConfig = {
                ...this.configManager.getDeepSeekConfig(),
                ...this.options.deepseek
            };

            if (deepseekConfig.apiKey) {
                this.deepseek = new DeepSeekService(deepseekConfig);
            } else {
                console.warn('DeepSeek AI is enabled but no API key is provided');
            }
        }
    }

    /**
     * 生成 JSON Schema
     * @param json JSON 字符串或对象
     * @param options 生成选项
     * @returns 生成的 Schema
     */
    public async generateSchema(json: string | object, options: SchemaGenerationOptions = {}): Promise<string> {
        const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);

        // 检查缓存
        if (this.options.caching) {
            const cached = this.schemaCache.get(jsonString);
            if (cached) return cached;
        }

        try {
            let schema: string;

            if (this.options.useAI && this.deepseek) {
                // 使用 DeepSeek AI 生成 Schema
                schema = await this.generateSchemaWithAI(jsonString, options);
            } else {
                // 使用传统方法生成 Schema
                schema = await this.generateSchemaTraditionally(jsonString);
            }

            // 缓存结果
            if (this.options.caching) {
                this.schemaCache.set(jsonString, schema);
            }

            return schema;
        } catch (error) {
            throw new Error(`Failed to generate schema: ${error.message}`);
        }
    }

    /**
     * 使用 DeepSeek AI 生成 Schema
     */
    private async generateSchemaWithAI(json: string, options: SchemaGenerationOptions): Promise<string> {
        if (!this.deepseek) {
            throw new Error('DeepSeek service is not configured');
        }
        return this.deepseek.generateSchema(json, {
            ...this.options.aiOptions,
            ...options
        });
    }

    /**
     * 使用传统方法生成 Schema
     */
    private async generateSchemaTraditionally(json: string): Promise<string> {
        const structure = await analyzeJsonStructure(json);
        return JSON.stringify(this.convertToJsonSchema(structure), null, 2);
    }

    /**
     * 将分析结果转换为 JSON Schema
     */
    private convertToJsonSchema(structure: any): any {
        const schema: any = {
            $schema: "http://json-schema.org/draft-07/schema#"
        };

        if (Array.isArray(structure)) {
            schema.type = "array";
            if (structure.length > 0) {
                const itemTypes = new Set(structure.map(item => typeof item));
                if (itemTypes.size === 1) {
                    schema.items = { type: itemTypes.values().next().value };
                } else {
                    schema.items = {};
                }
            }
        } else if (typeof structure === 'object' && structure !== null) {
            schema.type = "object";
            schema.properties = {};
            schema.required = [];

            for (const [key, value] of Object.entries(structure)) {
                schema.properties[key] = this.convertToJsonSchema(value);
                schema.required.push(key);
            }
        } else {
            schema.type = typeof structure;
            if (typeof structure === 'string') {
                // 尝试检测特殊格式
                if (/^\d{4}-\d{2}-\d{2}/.test(structure)) {
                    schema.format = 'date-time';
                } else if (/^[^@]+@[^@]+\.[^@]+$/.test(structure)) {
                    schema.format = 'email';
                } else if (/^(http|https):\/\//.test(structure)) {
                    schema.format = 'uri';
                }
            }
        }

        return schema;
    }

    /**
     * 清除缓存
     */
    public clearCache(): void {
        this.schemaCache.clear();
    }

    /**
     * 获取缓存统计信息
     */
    public getCacheStats(): { size: number } {
        return {
            size: this.schemaCache.size
        };
    }
}
