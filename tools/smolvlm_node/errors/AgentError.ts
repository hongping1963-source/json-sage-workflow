export class AgentError extends Error {
    constructor(message: string, public details?: any) {
        super(message);
        this.name = 'AgentError';
    }
}

export class ValidationError extends AgentError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'ValidationError';
    }
}

export class SchemaGenerationError extends AgentError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'SchemaGenerationError';
    }
}

export class APIError extends AgentError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'APIError';
    }
}

export class ConfigurationError extends AgentError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'ConfigurationError';
    }
}
