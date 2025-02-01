import * as assert from 'assert';
import * as vscode from 'vscode';
import { SchemaGenerator } from '../../features/schemaGenerator';
import { SchemaValidator } from '../../features/schemaValidator';
import { JsonConverter } from '../../features/jsonConverter';
import { JsonSageAI } from '@json-sage-ai/core';

suite('Extension Test Suite', () => {
    let agent: JsonSageAI;
    let schemaGenerator: SchemaGenerator;
    let schemaValidator: SchemaValidator;
    let jsonConverter: JsonConverter;

    setup(() => {
        agent = new JsonSageAI({
            deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
            model: 'deepseek-chat',
            maxTokens: 2048
        });
        schemaGenerator = new SchemaGenerator(agent);
        schemaValidator = new SchemaValidator(agent);
        jsonConverter = new JsonConverter(agent);
    });

    test('Schema Generator - Generate from Description', async () => {
        const description = 'Create a product object with name and price';
        const schema = await schemaGenerator.generate(description);

        assert.ok(schema);
        assert.strictEqual(schema.type, 'object');
        assert.ok(schema.properties);
        assert.ok(schema.properties.name);
        assert.ok(schema.properties.price);
    });

    test('Schema Generator - Generate from JSON', async () => {
        const json = `{
            "name": "Test Product",
            "price": 99.99
        }`;
        const schema = await schemaGenerator.generateFromJson(json);

        assert.ok(schema);
        assert.strictEqual(schema.type, 'object');
        assert.ok(schema.properties);
        assert.strictEqual(schema.properties.name.type, 'string');
        assert.strictEqual(schema.properties.price.type, 'number');
    });

    test('Schema Validator - Validate Schema', async () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                price: { type: 'number' }
            },
            required: ['name', 'price']
        };

        const result = await schemaValidator.validate(JSON.stringify(schema));
        assert.ok(result.valid);
    });

    test('Schema Validator - Invalid Schema', async () => {
        const schema = {
            type: 'invalid',
            properties: {}
        };

        const result = await schemaValidator.validate(JSON.stringify(schema));
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.length > 0);
    });

    test('JSON Converter - Convert JSON to Schema', async () => {
        const json = `{
            "id": 1,
            "name": "Test",
            "tags": ["tag1", "tag2"],
            "metadata": {
                "created": "2025-01-20T10:00:00Z"
            }
        }`;

        const schema = await jsonConverter.convert(json);
        assert.ok(schema);
        assert.strictEqual(schema.type, 'object');
        assert.ok(schema.properties.id);
        assert.ok(schema.properties.name);
        assert.ok(schema.properties.tags);
        assert.ok(schema.properties.metadata);
    });

    test('Extension Commands', async () => {
        const extension = vscode.extensions.getExtension('json-sage-ai.json-sage-ai-vscode');
        assert.ok(extension);
        await extension.activate();

        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('json-sage-ai.generateSchema'));
        assert.ok(commands.includes('json-sage-ai.validateSchema'));
        assert.ok(commands.includes('json-sage-ai.convertToSchema'));
    });
});
