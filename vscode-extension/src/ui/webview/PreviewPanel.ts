import * as vscode from 'vscode';
import { getNonce } from '../utils/nonce';

export class SchemaPreviewPanel {
    public static currentPanel: SchemaPreviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _currentSchema: string = '';

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        initialSchema: string
    ) {
        this._panel = panel;
        this._currentSchema = initialSchema;

        this._panel.webview.html = this._getWebviewContent(
            this._panel.webview,
            extensionUri,
            initialSchema
        );

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // 处理来自 webview 的消息
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'validate':
                        try {
                            const jsonData = JSON.parse(message.content);
                            const schemaData = JSON.parse(this._currentSchema);
                            
                            // 验证 JSON 数据
                            const isValid = await this._validateAgainstSchema(jsonData, schemaData);
                            
                            // 发送验证结果回 webview
                            this._panel.webview.postMessage({
                                command: 'validationResult',
                                isValid: isValid.valid,
                                errors: isValid.errors
                            });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Validation error: ${error.message}`);
                        }
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(
        extensionUri: vscode.Uri,
        schema: string
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SchemaPreviewPanel.currentPanel) {
            SchemaPreviewPanel.currentPanel._panel.reveal(column);
            SchemaPreviewPanel.currentPanel.update(schema);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'schemaPreview',
            'JSON Schema Preview',
            column || vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media')
                ]
            }
        );

        SchemaPreviewPanel.currentPanel = new SchemaPreviewPanel(
            panel,
            extensionUri,
            schema
        );
    }

    private _getWebviewContent(
        webview: vscode.Webview,
        extensionUri: vscode.Uri,
        schema: string
    ) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'media', 'preview.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'media', 'preview.css')
        );
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Schema Preview</title>
            </head>
            <body>
                <div class="container">
                    <div class="preview-header">
                        <h2>Schema Preview</h2>
                        <div class="preview-controls">
                            <button id="validateBtn">Validate JSON</button>
                            <button id="generateBtn">Generate Sample</button>
                        </div>
                    </div>
                    <div class="preview-content">
                        <div class="schema-view">
                            <h3>Schema</h3>
                            <pre id="schemaContent">${this._escapeHtml(schema)}</pre>
                        </div>
                        <div class="json-editor">
                            <h3>JSON Editor</h3>
                            <textarea id="jsonEditor" placeholder="Enter JSON here..."></textarea>
                        </div>
                    </div>
                    <div id="validationResult" class="validation-result"></div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    const schema = ${schema};
                </script>
            </body>
            </html>`;
    }

    private _escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    private async _validateAgainstSchema(json: any, schema: any): Promise<{valid: boolean, errors: string[]}> {
        // 这里可以使用 JsonSageAI 的验证功能
        return {
            valid: true,
            errors: []
        };
    }

    public update(schema: string) {
        this._currentSchema = schema;
        this._panel.webview.postMessage({
            command: 'updateSchema',
            schema: schema
        });
    }

    public dispose() {
        SchemaPreviewPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
