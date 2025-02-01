import * as vscode from 'vscode';
import { MdBookPreview } from './MdBookPreview';
import { SummeryExplorer } from './SummeryExplorer';

export function activate(context: vscode.ExtensionContext) {
    console.log('mdBook-vscode extension is now active!');

    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;


    vscode.commands.registerCommand('mdBookExplorer.openFile', (filePath: string) => {
        const fileUri = vscode.Uri.file(filePath);
        vscode.window.showTextDocument(fileUri);
    });

    // Register command for opening the MdBook preview
    context.subscriptions.push(
        vscode.commands.registerCommand('mdBookPreview.open', () => {
            MdBookPreview.createOrShow(context);
        })
    );

    // Register WebviewPanel serializer for preview panel restoration
    vscode.window.registerWebviewPanelSerializer('mdBookPreview', {
        async deserializeWebviewPanel(panel: vscode.WebviewPanel) {
            MdBookPreview.restorePanel(panel);
        }
    });

    new SummeryExplorer(context);
}

export function deactivate() {}
