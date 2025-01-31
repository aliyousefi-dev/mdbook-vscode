import * as vscode from 'vscode';
import { MdBookProvider } from './mdBookProvider';
import { MdBookPreview } from './MdBookPreview';


export function activate(context: vscode.ExtensionContext) {
    console.log('mdBook-vscode extension is now active!');

    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    const provider = new MdBookProvider(rootPath);

    // Register TreeDataProvider for the explorer view
    vscode.window.registerTreeDataProvider('mdbookExplorer', provider );
	vscode.commands.registerCommand('mdbookExplorer.refreshEntry', () => { console.log('❌ No workspace root found!'); });

	vscode.commands.registerCommand('mdBookExplorer.openFile', (filePath: string) => {
		const fileUri = vscode.Uri.file(filePath);
		vscode.window.showTextDocument(fileUri);
	  });

	  context.subscriptions.push(
        vscode.commands.registerCommand('mdBookPreview.open', () => {
            MdBookPreview.createOrShow(context);
        })
    );

    vscode.window.registerWebviewPanelSerializer('mdBookPreview', {
        async deserializeWebviewPanel(panel: vscode.WebviewPanel) {
            MdBookPreview.restorePanel(panel);
        }
    });

}

export function deactivate() {}
