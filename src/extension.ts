import * as vscode from 'vscode';
import { MdPreview } from './mdpreview';
import { MdExplorer } from './mdexplorer';
import { MdCommands } from './mdcommands';

export function activate(context: vscode.ExtensionContext) {
    console.log('mdBook-vscode extension is now active!');

    // Register command for opening the MdBook preview
    new MdPreview(context);
    new MdExplorer(context);
    new MdCommands();
}

export function deactivate() {}
