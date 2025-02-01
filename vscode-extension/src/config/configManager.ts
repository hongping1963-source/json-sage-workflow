import * as vscode from 'vscode';

export class ConfigManager {
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('jsonSageAI');
    }

    reload() {
        this.config = vscode.workspace.getConfiguration('jsonSageAI');
    }

    getApiKey(): string {
        return this.config.get('apiKey', '');
    }

    getModel(): string {
        return this.config.get('model', 'deepseek-chat');
    }

    getAutoValidate(): boolean {
        return this.config.get('autoValidate', true);
    }

    async updateApiKey(apiKey: string) {
        await this.config.update('apiKey', apiKey, true);
    }

    async updateModel(model: string) {
        await this.config.update('model', model, true);
    }

    async updateAutoValidate(autoValidate: boolean) {
        await this.config.update('autoValidate', autoValidate, true);
    }
}
