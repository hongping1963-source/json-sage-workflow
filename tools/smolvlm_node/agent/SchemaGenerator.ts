import { NLUResult } from '../types';

export interface JSONSchema {
    $schema: string;
    type: string;
    title?: string;
    description?: string;
    properties: {
        [key: string]: {
            type: string;
            description?: string;
            format?: string;
            minimum?: number;
            maximum?: number;
            minLength?: number;
            maxLength?: number;
            pattern?: string;
            enum?: any[];
            items?: any;
        };
    };
    required?: string[];
    additionalProperties?: boolean;
}

export class SchemaGenerator {
    private readonly commonPatterns = {
        email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        url: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$',
        phone: '^\\+?[1-9]\\d{1,14}$',
        date: '^\\d{4}-\\d{2}-\\d{2}$',
        time: '^\\d{2}:\\d{2}(:\\d{2})?$',
        datetime: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?(Z|[+-]\\d{2}:?\\d{2})?$'
    };

    private readonly fieldNameMap: { [key: string]: string } = {
        '名称': 'name',
        '姓名': 'name',
        '标题': 'title',
        '价格': 'price',
        '描述': 'description',
        '年龄': 'age',
        '邮箱': 'email',
        '电话': 'phone',
        '地址': 'address',
        '创建时间': 'createdAt',
        '更新时间': 'updatedAt',
        '状态': 'status',
        '类型': 'type',
        '标签': 'tags',
        '备注': 'remarks'
    };

    async generate(nluResult: NLUResult): Promise<JSONSchema> {
        if (!nluResult.fields || nluResult.fields.length === 0) {
            throw new Error('Fields cannot be empty');
        }

        const schema: JSONSchema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            title: `${nluResult.entity} Schema`,
            description: `Schema for ${nluResult.entity}`,
            properties: {},
            required: [],
            additionalProperties: false
        };

        nluResult.fields.forEach(field => {
            const fieldName = this.fieldNameMap[field.name] || this.camelCase(field.name);
            schema.required!.push(fieldName);

            const property: any = {
                type: this.normalizeType(field.type),
                description: `${field.name}字段`
            };

            // 根据字段名和类型添加验证规则
            this.addValidationRules(property, fieldName, field.type, field.format);

            schema.properties[fieldName] = property;
        });

        return schema;
    }

    private normalizeType(type: string): string {
        const typeMap: { [key: string]: string } = {
            'string': 'string',
            'text': 'string',
            'number': 'number',
            'integer': 'integer',
            'boolean': 'boolean',
            'array': 'array',
            'object': 'object',
            'date': 'string',
            'datetime': 'string',
            'time': 'string',
            'email': 'string',
            'url': 'string',
            'phone': 'string'
        };

        return typeMap[type.toLowerCase()] || 'string';
    }

    private addValidationRules(property: any, fieldName: string, type: string, format?: string) {
        // 添加格式验证
        if (format) {
            property.format = format;
        }

        // 根据字段名添加特定验证规则
        switch (fieldName) {
            case 'email':
                property.format = 'email';
                property.pattern = this.commonPatterns.email;
                break;
            case 'url':
                property.format = 'uri';
                property.pattern = this.commonPatterns.url;
                break;
            case 'phone':
                property.pattern = this.commonPatterns.phone;
                break;
            case 'price':
            case 'amount':
                property.minimum = 0;
                property.type = 'number';
                break;
            case 'age':
                property.minimum = 0;
                property.maximum = 150;
                property.type = 'integer';
                break;
            case 'createdAt':
            case 'updatedAt':
                property.format = 'date-time';
                property.pattern = this.commonPatterns.datetime;
                break;
            case 'status':
                property.enum = ['active', 'inactive', 'pending', 'deleted'];
                break;
            case 'tags':
                property.type = 'array';
                property.items = { type: 'string' };
                property.minItems = 0;
                property.uniqueItems = true;
                break;
        }

        // 根据类型添加通用验证规则
        if (property.type === 'string' && !property.pattern) {
            property.minLength = 1;
            property.maxLength = 1000;
        }
    }

    private camelCase(str: string): string {
        return str
            .replace(/[\s-_]+(.)/g, (_, c) => c.toUpperCase())
            .replace(/^(.)/, c => c.toLowerCase())
            .replace(/[^\w\s]/gi, '');
    }
}
