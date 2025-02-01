import * as vscode from 'vscode';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private progressResolver: (() => void) | undefined;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left
        );
    }

    startProgress(message: string) {
        this.statusBarItem.text = `$(sync~spin) ${message}`;
        this.statusBarItem.show();
    }

    stopProgress() {
        this.statusBarItem.hide();
        if (this.progressResolver) {
            this.progressResolver();
            this.progressResolver = undefined;
        }
    }

    showMessage(message: string, timeout: number = 3000) {
        this.statusBarItem.text = message;
        this.statusBarItem.show();
        setTimeout(() => {
            this.statusBarItem.hide();
        }, timeout);
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}
