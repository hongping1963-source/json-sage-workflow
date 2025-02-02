const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class JsonValidator {
    constructor(options = {}) {
        this.strict = options.strict || false;
        this.coerceTypes = options.coerceTypes || true;
        this.autoRepair = options.autoRepair || false;

        this.ajv = new Ajv({
            strict: this.strict,
            coerceTypes: this.coerceTypes,
            useDefaults: true,
            removeAdditional: true
        });
        addFormats(this.ajv);
    }

    validate(data, schema) {
        const validate = this.ajv.compile(schema);
        const valid = validate(data);

        if (valid) {
            return {
                valid: true,
                data
            };
        }

        const result = {
            valid: false,
            errors: validate.errors
        };

        if (this.autoRepair) {
            result.repairedData = this.repairData(data, schema, validate.errors);
        }

        return result;
    }

    repairData(data, schema, errors) {
        let repairedData = JSON.parse(JSON.stringify(data));

        for (const error of errors) {
            const path = error.instancePath.split('/').slice(1);
            const value = this.getValueFromPath(repairedData, path);
            const repairedValue = this.repairValue(value, error, schema);

            if (path.length === 0) {
                repairedData = repairedValue;
            } else {
                this.setValueAtPath(repairedData, path, repairedValue);
            }
        }

        return repairedData;
    }

    repairValue(value, error, schema) {
        switch (error.keyword) {
            case 'type':
                return this.coerceType(value, error.params.type);
            case 'required':
                return this.addRequiredProperties(value, error, schema);
            case 'additionalProperties':
                return this.removeAdditionalProperties(value, schema);
            case 'format':
                return this.repairFormat(value, error.params.format);
            default:
                return value;
        }
    }

    coerceType(value, targetType) {
        switch (targetType) {
            case 'string':
                return String(value);
            case 'number':
                return Number(value);
            case 'boolean':
                return Boolean(value);
            case 'array':
                return Array.isArray(value) ? value : [value];
            case 'object':
                return typeof value === 'object' ? value : {};
            default:
                return value;
        }
    }

    addRequiredProperties(obj, error, schema) {
        const result = { ...obj };
        const required = error.params.missingProperty;
        const propertySchema = schema.properties[required];

        if (propertySchema) {
            result[required] = this.getDefaultValue(propertySchema.type);
        }

        return result;
    }

    removeAdditionalProperties(obj, schema) {
        const result = {};
        const allowedProps = Object.keys(schema.properties || {});

        for (const prop of allowedProps) {
            if (obj.hasOwnProperty(prop)) {
                result[prop] = obj[prop];
            }
        }

        return result;
    }

    repairFormat(value, format) {
        // 处理常见的格式
        switch (format) {
            case 'date-time':
                return new Date(value).toISOString();
            case 'date':
                return new Date(value).toISOString().split('T')[0];
            case 'email':
                return typeof value === 'string' ? value.toLowerCase() : '';
            case 'uri':
                try {
                    return new URL(value).toString();
                } catch {
                    return '';
                }
            default:
                return value;
        }
    }

    getDefaultValue(type) {
        switch (type) {
            case 'string':
                return '';
            case 'number':
                return 0;
            case 'boolean':
                return false;
            case 'array':
                return [];
            case 'object':
                return {};
            default:
                return null;
        }
    }

    getValueFromPath(obj, path) {
        return path.reduce((current, key) => current && current[key], obj);
    }

    setValueAtPath(obj, path, value) {
        const lastKey = path.pop();
        const target = path.reduce((current, key) => {
            if (!current[key]) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
}

module.exports = { JsonValidator };
