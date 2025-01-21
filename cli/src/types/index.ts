export interface SchemaOptions {
    includeDescriptions?: boolean;
    includeExamples?: boolean;
    required?: string[];
    format?: boolean;
}

export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
