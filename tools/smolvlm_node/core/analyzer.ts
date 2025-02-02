import { readFile } from 'fs/promises';
import { JSONSchema7 } from 'json-schema';

interface AnalyzerOptions {
    maxDepth?: number;
    sampleSize?: number;
    inferTypes?: boolean;
}

export class JsonAnalyzer {
    constructor(private options: AnalyzerOptions = {
        maxDepth: 10,
        sampleSize: 100,
        inferTypes: true
    }) {}

    async analyzeJsonStructure(filePath: string): Promise<JSONSchema7> {
        try {
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            return this.generateSchema(data);
        } catch (error) {
            console.error(`Error analyzing JSON file ${filePath}:`, error);
            throw error;
        }
    }

    private generateSchema(data: any, depth: number = 0): JSONSchema7 {
        if (depth > (this.options.maxDepth || 10)) {
            return { type: 'any' };
        }

        if (data === null) {
            return { type: 'null' };
        }

        switch (typeof data) {
            case 'string':
                return this.analyzeString(data);
            case 'number':
                return this.analyzeNumber(data);
            case 'boolean':
                return { type: 'boolean' };
            case 'object':
                if (Array.isArray(data)) {
                    return this.analyzeArray(data, depth);
                }
                return this.analyzeObject(data, depth);
            default:
                return { type: 'any' };
        }
    }

    private analyzeString(value: string): JSONSchema7 {
        // 检测日期格式
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return {
                type: 'string',
                format: 'date-time'
            };
        }

        // 检测邮箱格式
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return {
                type: 'string',
                format: 'email'
            };
        }

        // 检测URL格式
        if (/^https?:\/\//.test(value)) {
            return {
                type: 'string',
                format: 'uri'
            };
        }

        return { type: 'string' };
    }

    private analyzeNumber(value: number): JSONSchema7 {
        return {
            type: Number.isInteger(value) ? 'integer' : 'number'
        };
    }

    private analyzeArray(arr: any[], depth: number): JSONSchema7 {
        if (arr.length === 0) {
            return {
                type: 'array',
                items: { type: 'any' }
            };
        }

        // 分析数组元素类型
        const sampleSize = Math.min(arr.length, this.options.sampleSize || 100);
        const samples = arr.slice(0, sampleSize);
        const itemSchemas = samples.map(item => this.generateSchema(item, depth + 1));

        // 合并相似的模式
        const mergedSchema = this.mergeSchemas(itemSchemas);

        return {
            type: 'array',
            items: mergedSchema
        };
    }

    private analyzeObject(obj: Record<string, any>, depth: number): JSONSchema7 {
        const properties: Record<string, JSONSchema7> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(obj)) {
            properties[key] = this.generateSchema(value, depth + 1);
            if (value !== undefined && value !== null) {
                required.push(key);
            }
        }

        return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined
        };
    }

    private mergeSchemas(schemas: JSONSchema7[]): JSONSchema7 {
        if (schemas.length === 0) return { type: 'any' };
        if (schemas.length === 1) return schemas[0];

        // 如果所有模式类型相同，合并它们
        const types = new Set(schemas.map(s => s.type));
        if (types.size === 1) {
            const type = schemas[0].type;
            if (type === 'object') {
                return this.mergeObjectSchemas(schemas as JSONSchema7[]);
            }
            if (type === 'array') {
                return this.mergeArraySchemas(schemas as JSONSchema7[]);
            }
        }

        // 如果类型不同，使用联合类型
        return {
            anyOf: schemas
        };
    }

    private mergeObjectSchemas(schemas: JSONSchema7[]): JSONSchema7 {
        const allProperties = new Set<string>();
        schemas.forEach(schema => {
            if (schema.properties) {
                Object.keys(schema.properties).forEach(key => allProperties.add(key));
            }
        });

        const properties: Record<string, JSONSchema7> = {};
        const required: string[] = [];

        allProperties.forEach(prop => {
            const propSchemas = schemas
                .filter(s => s.properties && s.properties[prop])
                .map(s => s.properties![prop]);
            
            properties[prop] = this.mergeSchemas(propSchemas);
            
            // 如果所有模式都将此属性标记为必需
            if (schemas.every(s => s.required && s.required.includes(prop))) {
                required.push(prop);
            }
        });

        return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined
        };
    }

    private mergeArraySchemas(schemas: JSONSchema7[]): JSONSchema7 {
        const itemSchemas = schemas
            .filter(s => s.items)
            .map(s => s.items as JSONSchema7);

        return {
            type: 'array',
            items: this.mergeSchemas(itemSchemas)
        };
    }
}

export const analyzeJsonStructure = async (
    filePath: string,
    options?: AnalyzerOptions
): Promise<JSONSchema7> => {
    const analyzer = new JsonAnalyzer(options);
    return analyzer.analyzeJsonStructure(filePath);
};
