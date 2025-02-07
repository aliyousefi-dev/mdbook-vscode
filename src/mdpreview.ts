import * as vscode from 'vscode';

export class MdPreview {
    private static currentPanel: MdPreview | undefined;
    private panel: vscode.WebviewPanel;

    constructor(context: vscode.ExtensionContext, panel?: vscode.WebviewPanel) {
        context.subscriptions.push(
            vscode.commands.registerCommand('mdcommands.mdpreview.open', () => {
                MdPreview.createOrShow(context);
            })
        );

        // Create and show a new webview panel
        const webviewPanel = panel || vscode.window.createWebviewPanel(
            'mdPreview',
            'Markdown Preview',
            vscode.ViewColumn.One,
            {}
        );

        // Register WebviewPanel serializer for preview panel restoration
        vscode.window.registerWebviewPanelSerializer('mdPreview', {
            async deserializeWebviewPanel(panel: vscode.WebviewPanel) {
                MdPreview.restorePanel(context, panel);
            }
        });

        this.panel = webviewPanel!;
        this.update();

        this.panel.onDidDispose(() => {
            MdPreview.currentPanel = undefined;
        });

        MdPreview.currentPanel = this;
    }

    public static createOrShow(context: vscode.ExtensionContext) {
        if (MdPreview.currentPanel) {
            MdPreview.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'mdPreview',
            'Markdown Preview',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        new MdPreview(context);
    }

    public static restorePanel(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
        if (MdPreview.currentPanel) {
            // If a panel already exists, dispose of the extra one
            panel.dispose();
            return;
        }

        new MdPreview(context, panel);
    }

    private update() {
        if (this.panel && this.panel.webview) {
            this.panel.webview.html = this.getHtml();
        } else {
            console.error("Panel or webview is not initialized.");
        }
    }

    private getHtml(): string {
        return `
        <html>
            <head>
                <style>
                    html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }
                    iframe { width: 100%; height: 100vh; border: none; }
                </style>
            </head>
            <body>
                <iframe src="http://localhost:3000"></iframe>
            </body>
        </html>
        `;
    }
}
