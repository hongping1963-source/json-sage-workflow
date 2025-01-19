export interface AgentConfig {
    deepseekApiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    caching?: boolean;
}

export interface SchemaGenerationTask {
    jsonData: any;
    options: {
        format?: string;
        includeExamples?: boolean;
        includeDescriptions?: boolean;
        temperature?: number;
        maxTokens?: number;
    };
}

export interface AgentResult {
    schema: any;
    descriptions?: Record<string, string>;
    examples?: any;
    metadata?: {
        executionTime: number;
        steps: string[];
    };
}
