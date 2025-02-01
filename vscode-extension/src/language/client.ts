import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activateLanguageServer(context: ExtensionContext) {
    // 服务器模块的路径
    const serverModule = context.asAbsolutePath(
        path.join('dist', 'language', 'server.js')
    );

    // 服务器选项
    const serverOptions: ServerOptions = {
        run: {
            module: serverModule,
            transport: TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=6009'] }
        }
    };

    // 客户端选项
    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'json' },
            { scheme: 'file', language: 'jsonc' }
        ],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/.json')
        }
    };

    // 创建客户端
    client = new LanguageClient(
        'jsonSageAI',
        'JsonSageAI Language Server',
        serverOptions,
        clientOptions
    );

    // 启动客户端
    client.start();
}

export function deactivateLanguageServer(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
