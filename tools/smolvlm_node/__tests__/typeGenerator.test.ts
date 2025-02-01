import { TypeGenerator } from '../core/typeGenerator';
import { JSONSchema7 } from 'json-schema';

describe('TypeGenerator', () => {
    let generator: TypeGenerator;

    beforeEach(() => {
        generator = new TypeGenerator();
    });

    it('should generate types for primitive properties', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                string: { type: 'string' },
                number: { type: 'number' },
                boolean: { type: 'boolean' }
            },
            required: ['string', 'number']
        };

        const result = generator.generateTypeDefinitions(schema);
        expect(result).toContain('string: string;');
        expect(result).toContain('number: number;');
        expect(result).toContain('boolean?: boolean;');
    });

    it('should handle nested objects', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'number' }
                    },
                    required: ['name']
                }
            }
        };

        const result = generator.generateTypeDefinitions(schema);
        expect(result).toContain('user?: {');
        expect(result).toContain('name: string;');
        expect(result).toContain('age?: number;');
    });

    it('should generate array types', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                numbers: {
                    type: 'array',
                    items: { type: 'number' }
                }
            }
        };

        const result = generator.generateTypeDefinitions(schema);
        expect(result).toContain('numbers?: number[];');
    });

    it('should handle enum types', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'pending']
                }
            }
        };

        const result = generator.generateTypeDefinitions(schema);
        expect(result).toContain("status?: 'active' | 'inactive' | 'pending';");
    });
});
