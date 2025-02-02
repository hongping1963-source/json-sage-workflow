import { JsonValidator } from '../core/validator';
import { JSONSchema7 } from 'json-schema';

describe('JsonValidator', () => {
    let validator: JsonValidator;

    beforeEach(() => {
        validator = new JsonValidator({
            strict: true,
            coerceTypes: true,
            autoRepair: true
        });
    });

    describe('Basic Validation', () => {
        it('should validate correct data', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name']
            };

            const data = {
                name: 'John',
                age: 30
            };

            const result = validator.validate(data, schema);
            expect(result.valid).toBe(true);
            expect(result.data).toEqual(data);
        });

        it('should detect invalid data', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name', 'age']
            };

            const data = {
                name: 'John'
                // missing required age field
            };

            const result = validator.validate(data, schema);
            expect(result.valid).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors?.length).toBeGreaterThan(0);
        });
    });

    describe('Type Coercion', () => {
        it('should coerce string to number', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    age: { type: 'number' }
                }
            };

            const data = {
                age: '30'
            };

            const result = validator.validate(data, schema);
            expect(result.valid).toBe(true);
            expect(result.data?.age).toBe(30);
        });

        it('should coerce number to string', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            };

            const data = {
                id: 123
            };

            const result = validator.validate(data, schema);
            expect(result.valid).toBe(true);
            expect(result.data?.id).toBe('123');
        });
    });

    describe('Auto Repair', () => {
        it('should repair invalid types', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                    active: { type: 'boolean' }
                }
            };

            const data = {
                name: 123,
                age: '30',
                active: 1
            };

            const result = validator.validate(data, schema);
            expect(result.repairedData).toEqual({
                name: '123',
                age: 30,
                active: true
            });
        });

        it('should repair missing required fields', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name', 'age']
            };

            const data = {
                name: 'John'
            };

            const result = validator.validate(data, schema);
            expect(result.repairedData).toHaveProperty('age');
            expect(typeof result.repairedData?.age).toBe('number');
        });
    });

    describe('Complex Validations', () => {
        it('should validate nested objects', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    user: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            address: {
                                type: 'object',
                                properties: {
                                    street: { type: 'string' },
                                    city: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            };

            const data = {
                user: {
                    name: 'John',
                    address: {
                        street: 123,  // should be string
                        city: true    // should be string
                    }
                }
            };

            const result = validator.validate(data, schema);
            expect(result.repairedData?.user.address.street).toBe('123');
            expect(result.repairedData?.user.address.city).toBe('true');
        });

        it('should validate arrays', () => {
            const schema: JSONSchema7 = {
                type: 'object',
                properties: {
                    tags: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            };

            const data = {
                tags: [123, true, 'test']
            };

            const result = validator.validate(data, schema);
            expect(result.repairedData?.tags).toEqual(['123', 'true', 'test']);
        });
    });
});
