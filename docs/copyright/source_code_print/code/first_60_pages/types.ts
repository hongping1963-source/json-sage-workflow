/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

/**
 * JsonSageAI配置接口
 * 定义了AI功能和基本行为的配置选项
 */
export interface JsonSageAIConfig {
    /** DeepSeek API密钥 */
    deepseekApiKey: string;
    /** 使用的模型名称 */
    model?: string;
    /** 最大token数量 */
    maxTokens?: number;
    /** 温度参数，控制输出的随机性 */
    temperature?: number;
}

/**
 * Schema生成选项接口
 * 定义了生成JSON Schema时的各种选项
 */
export interface SchemaGenerationOptions {
    /** Schema的标题 */
    title?: string;
    /** Schema的描述 */
    description?: string;
    /** 是否将所有属性标记为必需 */
    required?: boolean;
    /** 是否允许额外的属性 */
    additionalProperties?: boolean;
}

/**
 * 验证结果接口
 * 定义了Schema验证的结果格式
 */
export interface ValidationResult {
    /** 是否验证通过 */
    valid: boolean;
    /** 错误信息列表 */
    errors: string[];
}

/**
 * JSON转换选项接口
 * 定义了JSON转换为Schema时的选项
 */
export interface ConversionOptions {
    /** 是否推断类型 */
    inferTypes?: boolean;
    /** 是否包含示例 */
    includeExamples?: boolean;
    /** 是否添加描述 */
    addDescriptions?: boolean;
}

/**
 * JSON Schema接口
 * 定义了JSON Schema的基本结构
 */
export interface JsonSchema {
    /** Schema版本 */
    $schema?: string;
    /** 数据类型 */
    type: string;
    /** Schema标题 */
    title?: string;
    /** Schema描述 */
    description?: string;
    /** 属性定义 */
    properties?: Record<string, JsonSchemaProperty>;
    /** 必需属性列表 */
    required?: string[];
    /** 是否允许额外属性 */
    additionalProperties?: boolean;
}

/**
 * JSON Schema属性接口
 * 定义了Schema中每个属性的结构
 */
export interface JsonSchemaProperty {
    /** 属性类型 */
    type: string;
    /** 属性标题 */
    title?: string;
    /** 属性描述 */
    description?: string;
    /** 格式约束 */
    format?: string;
    /** 正则表达式模式 */
    pattern?: string;
    /** 最小值 */
    minimum?: number;
    /** 最大值 */
    maximum?: number;
    /** 最小长度 */
    minLength?: number;
    /** 最大长度 */
    maxLength?: number;
    /** 枚举值列表 */
    enum?: any[];
    /** 数组项定义 */
    items?: JsonSchemaProperty;
    /** 对象属性定义 */
    properties?: Record<string, JsonSchemaProperty>;
    /** 必需的子属性列表 */
    required?: string[];
}
