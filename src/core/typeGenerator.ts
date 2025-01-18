import { JSONSchema7 } from 'json-schema';

interface TypeGeneratorOptions {
    interfaceName?: string;
    exportType?: boolean;
    strictNullChecks?: boolean;
}

export class TypeGenerator {
    constructor(private options: TypeGeneratorOptions = {
        interfaceName: 'GeneratedType',
        exportType: true,
        strictNullChecks: true
    }) {}

    generateTypeDefinitions(jsonSchema: JSONSchema7): string {
        const { interfaceName = 'GeneratedType', exportType = true } = this.options;
        const exportKeyword = exportType ? 'export ' : '';
        
        return this.generateTypeFromSchema(jsonSchema, interfaceName, exportKeyword);
    }

    private generateTypeFromSchema(
        schema: JSONSchema7,
        typeName: string,
        exportKeyword: string,
        indent: string = ''
    ): string {
        if (!schema) return 'any';

        if (schema.type === 'object' && schema.properties) {
            const properties = Object.entries(schema.properties)
                .map(([key, prop]) => {
                    const isRequired = schema.required?.includes(key);
                    const propertyType = this.getPropertyType(prop as JSONSchema7);
                    return `${indent}  ${key}${isRequired ? '' : '?'}: ${propertyType};`;
                })
                .join('\n');

            return `${exportKeyword}interface ${typeName} {\n${properties}\n${indent}}`;
        }

        if (schema.type === 'array' && schema.items) {
            const itemType = this.getPropertyType(schema.items as JSONSchema7);
            return `${itemType}[]`;
        }

        return this.getPrimitiveType(schema.type as string);
    }

    private getPropertyType(schema: JSONSchema7): string {
        if (schema.type === 'object' && schema.properties) {
            const nestedTypeName = 'Nested' + Math.random().toString(36).substring(7);
            return this.generateTypeFromSchema(schema, nestedTypeName, '', '  ');
        }

        if (schema.type === 'array' && schema.items) {
            return `${this.getPropertyType(schema.items as JSONSchema7)}[]`;
        }

        if (schema.enum) {
            return schema.enum.map(value => {
                if (typeof value === 'string') return `'${value}'`;
                return value;
            }).join(' | ');
        }

        return this.getPrimitiveType(schema.type as string);
    }

    private getPrimitiveType(type: string): string {
        const typeMap: Record<string, string> = {
            'string': 'string',
            'number': 'number',
            'integer': 'number',
            'boolean': 'boolean',
            'null': 'null',
            'any': 'any'
        };

        return typeMap[type] || 'any';
    }
}

export const generateTypeDefinitions = async (
    jsonSchema: JSONSchema7,
    options?: TypeGeneratorOptions
): Promise<string> => {
    const generator = new TypeGenerator(options);
    return generator.generateTypeDefinitions(jsonSchema);
};
