import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { JSONSchema7 } from 'json-schema';

interface ValidationOptions {
    strict?: boolean;
    coerceTypes?: boolean;
    removeAdditional?: boolean;
    useDefaults?: boolean;
    autoRepair?: boolean;
}

export class JsonValidator {
    private ajv: Ajv;
    private schemas: Map<string, any> = new Map();
    private repairStrategies: Map<string, (value: any) => any> = new Map();

    constructor(private options: ValidationOptions = {}) {
        this.ajv = new Ajv({
            strict: options.strict ?? false,
            coerceTypes: options.coerceTypes ?? true,
            removeAdditional: options.removeAdditional ?? true,
            useDefaults: options.useDefaults ?? true,
            allErrors: true
        });
        
        addFormats(this.ajv);
        this.initializeRepairStrategies();
    }

    validate(data: any, schema: JSONSchema7): ValidationResult {
        const validate = this.ajv.compile(schema);
        const valid = validate(data);

        if (valid) {
            return {
                valid: true,
                data: data
            };
        }

        const errors = validate.errors || [];
        let repairedData = data;

        if (this.options.autoRepair) {
            repairedData = this.repairData(data, errors, schema);
        }

        return {
            valid: false,
            errors: this.formatErrors(errors),
            repairedData: repairedData
        };
    }

    private initializeRepairStrategies() {
        // 数字修复策略
        this.repairStrategies.set('number', (value) => {
            if (typeof value === 'string') {
                const num = parseFloat(value);
                return isNaN(num) ? 0 : num;
            }
            return typeof value === 'number' ? value : 0;
        });

        // 字符串修复策略
        this.repairStrategies.set('string', (value) => {
            if (value === null || value === undefined) return '';
            return String(value);
        });

        // 布尔值修复策略
        this.repairStrategies.set('boolean', (value) => {
            if (typeof value === 'string') {
                return value.toLowerCase() === 'true';
            }
            return Boolean(value);
        });

        // 数组修复策略
        this.repairStrategies.set('array', (value) => {
            if (Array.isArray(value)) return value;
            return value ? [value] : [];
        });

        // 对象修复策略
        this.repairStrategies.set('object', (value) => {
            return typeof value === 'object' && value !== null ? value : {};
        });
    }

    private repairData(data: any, errors: any[], schema: JSONSchema7): any {
        let repairedData = { ...data };

        for (const error of errors) {
            const path = error.instancePath.split('/').filter(Boolean);
            const type = this.getExpectedType(error, schema);
            
            if (type && this.repairStrategies.has(type)) {
                const repair = this.repairStrategies.get(type)!;
                this.updateValueAtPath(repairedData, path, repair);
            }
        }

        return repairedData;
    }

    private getExpectedType(error: any, schema: JSONSchema7): string | null {
        if (error.keyword === 'type') {
            return error.params.type;
        }

        // 从schema中查找期望的类型
        const schemaPath = error.schemaPath.split('/').filter(Boolean);
        let currentSchema: any = schema;
        
        for (const part of schemaPath) {
            currentSchema = currentSchema[part];
            if (!currentSchema) break;
        }

        return currentSchema?.type || null;
    }

    private updateValueAtPath(obj: any, path: string[], repair: (value: any) => any) {
        let current = obj;
        
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }

        const lastKey = path[path.length - 1];
        if (lastKey) {
            current[lastKey] = repair(current[lastKey]);
        }
    }

    private formatErrors(errors: any[]): ValidationError[] {
        return errors.map(error => ({
            path: error.instancePath,
            message: error.message || 'Unknown error',
            keyword: error.keyword,
            params: error.params
        }));
    }
}

export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
    repairedData?: any;
    data?: any;
}

export interface ValidationError {
    path: string;
    message: string;
    keyword: string;
    params: any;
}
