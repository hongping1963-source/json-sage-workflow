import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    Diagnostic,
    DiagnosticSeverity
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { JsonSageAI } from '@json-sage-ai/core';

// 创建连接
const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let agent: JsonSageAI;

connection.onInitialize((params: InitializeParams) => {
    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['"', ':']
            },
            hoverProvider: true
        }
    };
    return result;
});

// 初始化 JsonSageAI
connection.onInitialized(() => {
    agent = new JsonSageAI({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048
    });
});

// 代码补全
connection.onCompletion(
    async (textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
        const document = documents.get(textDocumentPosition.textDocument.uri);
        if (!document) {
            return [];
        }

        const text = document.getText();
        const position = textDocumentPosition.position;
        const line = document.getText({
            start: { line: position.line, character: 0 },
            end: { line: position.line, character: position.character }
        });

        try {
            // 分析上下文，提供智能提示
            const suggestions = await agent.getSuggestions({
                content: text,
                position: position,
                context: line
            });

            return suggestions.map(suggestion => ({
                label: suggestion.text,
                kind: CompletionItemKind.Property,
                detail: suggestion.description,
                documentation: suggestion.documentation
            }));
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }
);

// 悬停提示
connection.onHover(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }

    try {
        const text = document.getText();
        const position = params.position;

        const hoverInfo = await agent.getHoverInfo({
            content: text,
            position: position
        });

        if (hoverInfo) {
            return {
                contents: {
                    kind: 'markdown',
                    value: hoverInfo.documentation
                }
            };
        }
    } catch (error) {
        console.error('Error getting hover info:', error);
    }

    return null;
});

// 实时诊断
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    try {
        const text = textDocument.getText();
        const diagnostics: Diagnostic[] = [];

        // 验证 JSON 语法
        try {
            JSON.parse(text);
        } catch (e) {
            if (e instanceof SyntaxError) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: textDocument.positionAt(0),
                        end: textDocument.positionAt(text.length)
                    },
                    message: `Invalid JSON: ${e.message}`,
                    source: 'json-sage-ai'
                });
            }
        }

        // 使用 JsonSageAI 进行深度验证
        const validationResult = await agent.validateJson(text);
        if (!validationResult.valid) {
            validationResult.errors.forEach(error => {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: textDocument.positionAt(0),
                        end: textDocument.positionAt(text.length)
                    },
                    message: error,
                    source: 'json-sage-ai'
                });
            });
        }

        // 发送诊断信息
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    } catch (error) {
        console.error('Error validating document:', error);
    }
}

// 监听文档变化
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

// 启动服务器
documents.listen(connection);
connection.listen();
