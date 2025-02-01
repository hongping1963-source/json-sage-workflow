import * as vscode from 'vscode';
import { getNonce } from '../utils/nonce';

export class SchemaEditorPanel {
    public static currentPanel: SchemaEditorPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri
    ) {
        this._panel = panel;
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        
        // 处理来自 webview 的消息
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'updateSchema':
                        try {
                            await vscode.workspace.fs.writeFile(
                                vscode.Uri.parse(message.filePath),
                                Buffer.from(message.content)
                            );
                            vscode.window.showInformationMessage('Schema updated successfully!');
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to update schema: ${error.message}`);
                        }
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SchemaEditorPanel.currentPanel) {
            SchemaEditorPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'schemaEditor',
            'JSON Schema Editor',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media')
                ]
            }
        );

        SchemaEditorPanel.currentPanel = new SchemaEditorPanel(panel, extensionUri);
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'media', 'main.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'media', 'style.css')
        );
        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css')
        );
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <link href="${codiconsUri}" rel="stylesheet">
                <title>JSON Schema Editor</title>
            </head>
            <body>
                <div class="container">
                    <div class="toolbar">
                        <button class="button" id="addProperty">
                            <i class="codicon codicon-add"></i>
                            Add Property
                        </button>
                        <button class="button" id="validate">
                            <i class="codicon codicon-check"></i>
                            Validate
                        </button>
                        <button class="button" id="save">
                            <i class="codicon codicon-save"></i>
                            Save
                        </button>
                    </div>
                    <div class="editor-container">
                        <div id="schema-tree"></div>
                        <div id="property-editor"></div>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    public dispose() {
        SchemaEditorPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
