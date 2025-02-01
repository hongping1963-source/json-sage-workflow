export interface JsonSageAIConfig {
    deepseekApiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    maxGenerations?: number; // 最大生成次数限制，默认为100
}

export interface SchemaGenerationOptions {
    title?: string;
    description?: string;
    required?: boolean;
    additionalProperties?: boolean;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface ConversionOptions {
    inferTypes?: boolean;
    includeExamples?: boolean;
    addDescriptions?: boolean;
}

export interface JsonSchema {
    $schema?: string;
    type: string;
    title?: string;
    description?: string;
    properties?: Record<string, JsonSchemaProperty>;
    required?: string[];
    additionalProperties?: boolean;
}

export interface JsonSchemaProperty {
    type: string;
    title?: string;
    description?: string;
    format?: string;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    enum?: any[];
    items?: JsonSchemaProperty;
    properties?: Record<string, JsonSchemaProperty>;
    required?: string[];
}
