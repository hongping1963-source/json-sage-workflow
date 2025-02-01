import * as vscode from 'vscode';
import { JsonSageAI } from '@json-sage-ai/core';
import { SchemaGenerator } from './features/schemaGenerator';
import { SchemaValidator } from './features/schemaValidator';
import { JsonConverter } from './features/jsonConverter';
import { StatusBarManager } from './ui/statusBar';
import { ConfigManager } from './config/configManager';

export function activate(context: vscode.ExtensionContext) {
    // 初始化配置管理器
    const configManager = new ConfigManager();
    
    // 初始化 JsonSageAI 实例
    const agent = new JsonSageAI({
        deepseekApiKey: configManager.getApiKey(),
        model: configManager.getModel(),
        maxTokens: 2048
    });

    // 初始化功能模块
    const schemaGenerator = new SchemaGenerator(agent);
    const schemaValidator = new SchemaValidator(agent);
    const jsonConverter = new JsonConverter(agent);
    const statusBar = new StatusBarManager();

    // 注册命令
    let generateSchema = vscode.commands.registerCommand('json-sage-ai.generateSchema', async () => {
        try {
            statusBar.startProgress('Generating Schema...');
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const description = await vscode.window.showInputBox({
                prompt: 'Describe your JSON Schema',
                placeHolder: 'E.g., Create a product object with name, price, and description'
            });

            if (!description) {
                return;
            }

            const schema = await schemaGenerator.generate(description);
            
            // 创建新文档并插入生成的 Schema
            const document = await vscode.workspace.openTextDocument({
                content: JSON.stringify(schema, null, 2),
                language: 'json'
            });
            
            await vscode.window.showTextDocument(document);
            statusBar.stopProgress();
            vscode.window.showInformationMessage('Schema generated successfully!');
        } catch (error) {
            statusBar.stopProgress();
            vscode.window.showErrorMessage(`Error generating schema: ${error.message}`);
        }
    });

    let validateSchema = vscode.commands.registerCommand('json-sage-ai.validateSchema', async () => {
        try {
            statusBar.startProgress('Validating Schema...');
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const document = editor.document;
            const schema = document.getText();
            
            const result = await schemaValidator.validate(schema);
            
            if (result.valid) {
                vscode.window.showInformationMessage('Schema is valid! ✨');
            } else {
                const diagnostics = new vscode.DiagnosticCollection('json-sage-ai');
                result.errors.forEach(error => {
                    const range = new vscode.Range(0, 0, document.lineCount, 0);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        error,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostics.set(document.uri, [diagnostic]);
                });
            }
            
            statusBar.stopProgress();
        } catch (error) {
            statusBar.stopProgress();
            vscode.window.showErrorMessage(`Error validating schema: ${error.message}`);
        }
    });

    let convertToSchema = vscode.commands.registerCommand('json-sage-ai.convertToSchema', async () => {
        try {
            statusBar.startProgress('Converting JSON to Schema...');
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const document = editor.document;
            const json = document.getText();
            
            const schema = await jsonConverter.convert(json);
            
            // 创建新文档并插入生成的 Schema
            const schemaDocument = await vscode.workspace.openTextDocument({
                content: JSON.stringify(schema, null, 2),
                language: 'json'
            });
            
            await vscode.window.showTextDocument(schemaDocument);
            statusBar.stopProgress();
            vscode.window.showInformationMessage('JSON converted to Schema successfully!');
        } catch (error) {
            statusBar.stopProgress();
            vscode.window.showErrorMessage(`Error converting JSON: ${error.message}`);
        }
    });

    // 注册自动验证
    let autoValidator = vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (configManager.getAutoValidate() && 
            event.document.languageId === 'json') {
            await vscode.commands.executeCommand('json-sage-ai.validateSchema');
        }
    });

    // 注册配置变更监听
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('jsonSageAI')) {
            configManager.reload();
            // 更新 JsonSageAI 实例配置
            agent.updateConfig({
                deepseekApiKey: configManager.getApiKey(),
                model: configManager.getModel()
            });
        }
    }));

    context.subscriptions.push(
        generateSchema,
        validateSchema,
        convertToSchema,
        autoValidator,
        statusBar
    );
}

export function deactivate() {}
