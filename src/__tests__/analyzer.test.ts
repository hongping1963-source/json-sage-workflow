import { JsonAnalyzer } from '../core/analyzer';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';

describe('JsonAnalyzer', () => {
    let analyzer: JsonAnalyzer;
    let tempDir: string;

    beforeEach(() => {
        analyzer = new JsonAnalyzer();
        tempDir = join(os.tmpdir(), 'jsonsage-tests');
    });

    it('should analyze primitive types correctly', async () => {
        const testData = {
            string: 'test',
            number: 123,
            boolean: true,
            null: null
        };

        const testFile = join(tempDir, 'test.json');
        await writeFile(testFile, JSON.stringify(testData));

        const schema = await analyzer.analyzeJsonStructure(testFile);

        expect(schema.type).toBe('object');
        expect(schema.properties).toBeDefined();
        expect(schema.properties?.string.type).toBe('string');
        expect(schema.properties?.number.type).toBe('integer');
        expect(schema.properties?.boolean.type).toBe('boolean');
        expect(schema.properties?.null.type).toBe('null');
    });

    it('should detect date-time strings', async () => {
        const testData = {
            date: '2025-01-12T15:00:00Z'
        };

        const testFile = join(tempDir, 'date-test.json');
        await writeFile(testFile, JSON.stringify(testData));

        const schema = await analyzer.analyzeJsonStructure(testFile);

        expect(schema.properties?.date.type).toBe('string');
        expect(schema.properties?.date.format).toBe('date-time');
    });

    it('should handle nested objects', async () => {
        const testData = {
            user: {
                name: 'John',
                age: 30,
                address: {
                    street: '123 Main St',
                    city: 'Example City'
                }
            }
        };

        const testFile = join(tempDir, 'nested-test.json');
        await writeFile(testFile, JSON.stringify(testData));

        const schema = await analyzer.analyzeJsonStructure(testFile);

        expect(schema.properties?.user.type).toBe('object');
        expect(schema.properties?.user.properties?.address.type).toBe('object');
    });

    it('should analyze arrays correctly', async () => {
        const testData = {
            numbers: [1, 2, 3],
            mixed: [1, 'string', true]
        };

        const testFile = join(tempDir, 'array-test.json');
        await writeFile(testFile, JSON.stringify(testData));

        const schema = await analyzer.analyzeJsonStructure(testFile);

        expect(schema.properties?.numbers.type).toBe('array');
        expect(schema.properties?.numbers.items.type).toBe('integer');
        expect(schema.properties?.mixed.type).toBe('array');
        expect(schema.properties?.mixed.items.anyOf).toBeDefined();
    });
});
