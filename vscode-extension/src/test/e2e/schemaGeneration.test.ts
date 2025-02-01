import * as assert from 'assert';
import * as vscode from 'vscode';
import { activateExtension } from '../helper';

suite('Schema Generation E2E Tests', () => {
    const sampleJson = `{
        "name": "Test Product",
        "price": 99.99,
        "description": "A test product",
        "inStock": true,
        "categories": ["electronics", "gadgets"],
        "specifications": {
            "weight": 1.5,
            "dimensions": {
                "length": 10,
                "width": 5,
                "height": 2
            }
        }
    }`;

    suiteSetup(async () => {
        await activateExtension();
    });

    test('Generate Schema from Description', async () => {
        // 创建新文档
        const document = await vscode.workspace.openTextDocument({
            content: '',
            language: 'json'
        });
        await vscode.window.showTextDocument(document);

        // 执行命令
        await vscode.commands.executeCommand('json-sage-ai.generateSchema', 
            'Create a product object with name, price, and description');

        // 等待生成完成
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 验证结果
        const editor = vscode.window.activeTextEditor;
        assert.ok(editor);
        
        const text = editor.document.getText();
        const schema = JSON.parse(text);

        assert.strictEqual(schema.type, 'object');
        assert.ok(schema.properties.name);
        assert.ok(schema.properties.price);
        assert.ok(schema.properties.description);
    });

    test('Convert JSON to Schema', async () => {
        // 创建包含 JSON 的文档
        const document = await vscode.workspace.openTextDocument({
            content: sampleJson,
            language: 'json'
        });
        await vscode.window.showTextDocument(document);

        // 执行转换命令
        await vscode.commands.executeCommand('json-sage-ai.convertToSchema');

        // 等待转换完成
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 验证结果
        const editor = vscode.window.activeTextEditor;
        assert.ok(editor);
        
        const text = editor.document.getText();
        const schema = JSON.parse(text);

        assert.strictEqual(schema.type, 'object');
        assert.ok(schema.properties.name);
        assert.ok(schema.properties.price);
        assert.ok(schema.properties.categories);
        assert.ok(schema.properties.specifications);
    });

    test('Validate Schema', async () => {
        // 创建包含有效 Schema 的文档
        const validSchema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                price: { type: 'number' }
            },
            required: ['name', 'price']
        };

        const document = await vscode.workspace.openTextDocument({
            content: JSON.stringify(validSchema, null, 2),
            language: 'json'
        });
        await vscode.window.showTextDocument(document);

        // 执行验证命令
        await vscode.commands.executeCommand('json-sage-ai.validateSchema');

        // 等待验证完成
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 验证没有诊断错误
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        assert.strictEqual(diagnostics.length, 0);
    });

    test('Schema Editor UI', async () => {
        // 打开 Schema 编辑器
        await vscode.commands.executeCommand('json-sage-ai.openSchemaEditor');

        // 等待编辑器加载
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 验证编辑器是否打开
        const editor = vscode.window.activeTextEditor;
        assert.ok(editor);
        assert.strictEqual(editor.document.languageId, 'json');
    });

    test('Preview Panel', async () => {
        // 创建包含 Schema 的文档
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                price: { type: 'number' }
            }
        };

        const document = await vscode.workspace.openTextDocument({
            content: JSON.stringify(schema, null, 2),
            language: 'json'
        });
        await vscode.window.showTextDocument(document);

        // 打开预览面板
        await vscode.commands.executeCommand('json-sage-ai.openPreview');

        // 等待预览面板加载
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 验证预览面板是否打开
        const visibleEditors = vscode.window.visibleTextEditors;
        assert.ok(visibleEditors.length > 1);
    });
});
