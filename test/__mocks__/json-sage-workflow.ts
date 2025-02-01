export interface DeepSeekConfig {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface SchemaGenerationOptions {
    format?: string;
    includeExamples?: boolean;
    includeDescriptions?: boolean;
    [key: string]: any;
}

export interface WorkflowConfig {
    schema?: {
        useAI?: boolean;
        deepseek?: DeepSeekConfig;
        caching?: boolean;
    };
}

export interface Workflow {
    generateSchema: (data: any, options?: SchemaGenerationOptions) => Promise<any>;
    deepseek: {
        generateFieldDescriptions: (data: any) => Promise<Record<string, string>>;
        generateExamples: (schema: any) => Promise<any>;
    };
}

export const json = {
    createWorkflow: jest.fn((config?: WorkflowConfig): Workflow => ({
        generateSchema: jest.fn(),
        deepseek: {
            generateFieldDescriptions: jest.fn(),
            generateExamples: jest.fn()
        }
    }))
};
