export interface AgentConfig {
    deepseekApiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    caching?: boolean;
}

export interface SchemaGenerationOptions {
    includeDescriptions?: boolean;
    includeExamples?: boolean;
    required?: string[];
}

export interface SchemaGenerationTask {
    jsonData: any;
    options?: SchemaGenerationOptions;
}

export interface JsonInsight {
    type: 'data_quality' | 'performance' | 'naming' | 'complexity' | 'pattern' | 'system';
    message: string;
    severity: 'info' | 'warning' | 'error';
    details?: any;
}

export interface AgentResult {
    schema: any;
    descriptions?: Record<string, string>;
    examples?: any;
    metadata: {
        executionTime: number;
        steps: string[];
        insights: string[];
        errors?: string[];
    };
}

export interface SuccessResponse<T> {
    success: true;
    data: T;
    metadata: {
        executionTime: number;
        warnings?: string[];
    };
}

export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        executionTime: number;
    };
}

export interface ErrorContext {
    operation: string;
    input: any;
    state: any;
    startTime: number;
}

export interface PerformanceMetrics {
    executionTime: number;
    tokenUsage: number;
    cacheHits: number;
    cacheMisses: number;
    successCount: number;
    errorCount: number;
    timestamp: number;
}

export interface PerformanceThresholds {
    executionTime: number;
    tokenUsage: number;
    errorRate: number;
    cacheHitRate: number;
}

export interface LearningFeedback {
    source: 'automated' | 'user';
    schemaQuality: number;
    descriptionQuality?: number;
    exampleQuality?: number;
    currentConfig: AgentConfig;
    timestamp: number;
}

export interface ModelAdaptation {
    timestamp: number;
    source: 'user' | 'automated';
    changes: {
        temperature?: number;
        maxTokens?: number;
        model?: string;
    };
    reasoning: string[];
}

export type SuggestionType = 'performance' | 'reliability' | 'quality' | 'optimization';

export interface OptimizationSuggestion {
    type: SuggestionType;
    message: string;
    priority: 'high' | 'medium' | 'low';
    impact?: string;
}

export interface LearningInsight {
    aspect: string;
    score: number;
    message: string;
    suggestion: string;
}

export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}

export interface AgentMetadata {
    executionTime: number;
    steps: string[];
    errors: string[];
    insights: string[];
}

export interface JsonMetrics {
    depth: number;
    arrayDepth: number;
    nullCount: number;
    mixedTypes: string[];
    fieldCount: number;
    typeDistribution: Map<string, number>;
}

export interface FieldInfo {
    path: string;
    type: string;
    isRequired: boolean;
    format: string;
}

export interface CommonPatterns {
    email: RegExp;
    phone: RegExp;
    url: RegExp;
    date: RegExp;
    datetime: RegExp;
    ipv4: RegExp;
    uuid: RegExp;
}

export interface ModelConfig {
    maxTokens: {
        min: number;
        max: number;
        default: number;
    };
    temperature: {
        min: number;
        max: number;
        default: number;
    };
}

export interface CacheConfig {
    enabled: boolean;
    maxAge?: number;
    maxSize?: number;
}

export interface ConfigAdaptation {
    timestamp: number;
    changes: Partial<AgentConfig>;
    reason: string;
}

export interface ErrorMetadata {
    timestamp: string;
    errorId: string;
    recoverable: boolean;
    contextual: {
        operation?: string;
        inputSummary?: any;
        stateSummary?: any;
    };
}

export interface NLUResult {
    intent: string;
    entity: string;
    fields: Array<{
        name: string;
        type: string;
        format?: string;
    }>;
}
