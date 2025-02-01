import * as vscode from 'vscode';
import * as path from 'path';

export async function activateExtension() {
    const ext = vscode.extensions.getExtension('json-sage-ai.json-sage-ai-vscode');
    if (!ext) {
        throw new Error('Extension not found');
    }
    await ext.activate();
    return ext;
}

export async function createTempFile(content: string, extension: string = '.json'): Promise<vscode.Uri> {
    const tmpFile = path.join(__dirname, `test-${Date.now()}${extension}`);
    const uri = vscode.Uri.file(tmpFile);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
    return uri;
}

export async function deleteTempFile(uri: vscode.Uri): Promise<void> {
    try {
        await vscode.workspace.fs.delete(uri);
    } catch (error) {
        console.error(`Failed to delete temp file: ${error}`);
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function openTextDocument(content: string, language: string = 'json'): Promise<vscode.TextDocument> {
    const document = await vscode.workspace.openTextDocument({
        content,
        language
    });
    await vscode.window.showTextDocument(document);
    return document;
}

export async function executeCommandWithProgress(
    command: string,
    ...args: any[]
): Promise<void> {
    const result = await vscode.commands.executeCommand(command, ...args);
    await sleep(1000); // 等待命令执行完成
    return result;
}

export async function getDocumentDiagnostics(
    document: vscode.TextDocument
): Promise<vscode.Diagnostic[]> {
    await sleep(1000); // 等待诊断完成
    return vscode.languages.getDiagnostics(document.uri);
}

export class TestMemento implements vscode.Memento {
    private storage = new Map<string, any>();

    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    get(key: string, defaultValue?: any) {
        return this.storage.has(key)
            ? this.storage.get(key)
            : defaultValue;
    }

    update(key: string, value: any): Thenable<void> {
        this.storage.set(key, value);
        return Promise.resolve();
    }
}

export class TestExtensionContext implements vscode.ExtensionContext {
    subscriptions: { dispose(): any }[] = [];
    workspaceState = new TestMemento();
    globalState = new TestMemento();
    extensionPath = __dirname;
    storagePath = path.join(__dirname, '.storage');
    globalStoragePath = path.join(__dirname, '.global-storage');
    logPath = path.join(__dirname, '.logs');
    extensionUri = vscode.Uri.file(__dirname);
    environmentVariableCollection = new Map();

    asAbsolutePath(relativePath: string): string {
        return path.join(this.extensionPath, relativePath);
    }
}
