export class SmolVLMError extends Error {
    constructor(message: string, public code: string, public details?: any) {
        super(message);
        this.name = 'SmolVLMError';
    }
}

export class ModelLoadError extends SmolVLMError {
    constructor(message: string, details?: any) {
        super(message, 'MODEL_LOAD_ERROR', details);
        this.name = 'ModelLoadError';
    }
}

export class InferenceError extends SmolVLMError {
    constructor(message: string, details?: any) {
        super(message, 'INFERENCE_ERROR', details);
        this.name = 'InferenceError';
    }
}

export class ExportError extends SmolVLMError {
    constructor(message: string, details?: any) {
        super(message, 'EXPORT_ERROR', details);
        this.name = 'ExportError';
    }
}

export class OptimizationError extends SmolVLMError {
    constructor(message: string, details?: any) {
        super(message, 'OPTIMIZATION_ERROR', details);
        this.name = 'OptimizationError';
    }
}

export class ValidationError extends SmolVLMError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class ConfigurationError extends SmolVLMError {
    constructor(message: string, details?: any) {
        super(message, 'CONFIGURATION_ERROR', details);
        this.name = 'ConfigurationError';
    }
}

export class ResourceError extends SmolVLMError {
    constructor(message: string, details?: any) {
        super(message, 'RESOURCE_ERROR', details);
        this.name = 'ResourceError';
    }
}

export interface ErrorDetails {
    code: string;
    message: string;
    stack?: string;
    cause?: Error;
    context?: {
        operation?: string;
        input?: any;
        state?: any;
    };
}

export type ErrorCode = 
    | 'MODEL_LOAD_ERROR'
    | 'INFERENCE_ERROR'
    | 'EXPORT_ERROR'
    | 'OPTIMIZATION_ERROR'
    | 'VALIDATION_ERROR'
    | 'CONFIGURATION_ERROR'
    | 'RESOURCE_ERROR';
