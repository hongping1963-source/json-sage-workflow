import { MappingProcessor } from '../../src/vision/mapping';
import { MappingContext, MappingRule, SchemaDefinition } from '../../src/vision/types';

describe('MappingProcessor', () => {
  let processor: MappingProcessor;

  beforeEach(() => {
    processor = new MappingProcessor();
  });

  describe('Basic Mapping', () => {
    it('should map simple object structure', () => {
      const context: MappingContext = {
        sourceData: {
          name: 'test',
          value: 123
        },
        rules: [
          { source: 'name', target: 'data.name' },
          { source: 'value', target: 'data.value' }
        ]
      };

      const result = processor.process(context);
      expect(result).toEqual({
        data: {
          name: 'test',
          value: 123
        }
      });
    });

    it('should handle missing source fields', () => {
      const context: MappingContext = {
        sourceData: { name: 'test' },
        rules: [
          { source: 'name', target: 'data.name' },
          { source: 'missing', target: 'data.value', default: 'default' }
        ],
        options: {
          preserveNull: true
        }
      };

      const result = processor.process(context);
      expect(result).toEqual({
        data: {
          name: 'test',
          value: 'default'
        }
      });
    });
  });

  describe('Transform Rules', () => {
    it('should apply format transform', () => {
      const date = new Date('2025-02-01T10:00:00Z');
      const context: MappingContext = {
        sourceData: {
          date
        },
        rules: [
          {
            source: 'date',
            target: 'formattedDate',
            transform: [{ type: 'format', params: { dateFormat: true } }]
          }
        ]
      };

      const result = processor.process(context);
      expect(result.formattedDate).toBeDefined();
      expect(typeof result.formattedDate).toBe('string');
      expect(result.formattedDate).toContain('2025');
    });

    it('should apply array transforms', () => {
      const context: MappingContext = {
        sourceData: {
          tags: ['tag1', '', 'tag2', 'tag3']
        },
        rules: [
          {
            source: 'tags',
            target: 'processedTags',
            transform: [
              {
                type: 'filter',
                params: {
                  predicate: (item: string) => item.length > 0
                }
              },
              {
                type: 'combine',
                params: { separator: ', ' }
              }
            ]
          }
        ]
      };

      const result = processor.process(context);
      expect(result.processedTags).toBe('tag1, tag2, tag3');
    });

    it('should support custom transform functions', () => {
      const context: MappingContext = {
        sourceData: {
          text: 'hello world'
        },
        rules: [
          {
            source: 'text',
            target: 'upperText',
            transform: [
              {
                type: 'custom',
                customFunction: (value: string) => value.toUpperCase()
              }
            ]
          }
        ]
      };

      const result = processor.process(context);
      expect(result.upperText).toBe('HELLO WORLD');
    });
  });

  describe('Conditional Mapping', () => {
    it('should apply conditions correctly', () => {
      const context: MappingContext = {
        sourceData: {
          status: 'active',
          value: 42
        },
        rules: [
          {
            source: 'value',
            target: 'processedValue',
            condition: {
              type: 'equals',
              value: 42
            },
            transform: [
              {
                type: 'custom',
                customFunction: (value: number) => value * 2
              }
            ]
          }
        ]
      };

      const result = processor.process(context);
      expect(result.processedValue).toBe(84);
    });

    it('should handle regex conditions', () => {
      const context: MappingContext = {
        sourceData: {
          email: 'test@example.com'
        },
        rules: [
          {
            source: 'email',
            target: 'validEmail',
            condition: {
              type: 'regex',
              value: /^[^@]+@[^@]+\.[^@]+$/
            }
          }
        ]
      };

      const result = processor.process(context);
      expect(result.validEmail).toBe('test@example.com');
    });
  });

  describe('Schema Validation', () => {
    it('should validate against schema', () => {
      const schema: SchemaDefinition = {
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

      const context: MappingContext = {
        sourceData: {
          userName: 'John',
          userAge: 30
        },
        targetSchema: schema,
        rules: [
          { source: 'userName', target: 'user.name' },
          { source: 'userAge', target: 'user.age' }
        ],
        options: {
          validateSchema: true
        }
      };

      const result = processor.process(context);
      expect(result).toEqual({
        user: {
          name: 'John',
          age: 30
        }
      });
    });

    it('should throw error for invalid schema', () => {
      const schema: SchemaDefinition = {
        type: 'object',
        properties: {
          value: { type: 'number' }
        }
      };

      const context: MappingContext = {
        sourceData: {
          value: 'not a number'
        },
        targetSchema: schema,
        rules: [
          { source: 'value', target: 'value' }
        ],
        options: {
          validateSchema: true
        }
      };

      expect(() => processor.process(context)).toThrow();
    });
  });
});
