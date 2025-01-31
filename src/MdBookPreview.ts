import * as vscode from 'vscode';

export class MdBookPreview {
    private static currentPanel: MdBookPreview | undefined;
    private panel: vscode.WebviewPanel;

    private constructor(panel: vscode.WebviewPanel) {
        this.panel = panel;
        this.update();

        this.panel.onDidDispose(() => {
            MdBookPreview.currentPanel = undefined;
        });

        MdBookPreview.currentPanel = this;
    }

    public static createOrShow(context: vscode.ExtensionContext) {
        if (MdBookPreview.currentPanel) {
            MdBookPreview.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'mdBookPreview',
            'MdBook Preview',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        new MdBookPreview(panel);
    }

    public static restorePanel(panel: vscode.WebviewPanel) {
        if (MdBookPreview.currentPanel) {
            // If a panel already exists, dispose of the extra one
            panel.dispose();
            return;
        }

        new MdBookPreview(panel);
    }

    private update() {
        this.panel.webview.html = this.getHtml();
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
