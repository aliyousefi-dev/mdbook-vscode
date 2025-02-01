import * as vscode from 'vscode';

export class SummeryExplorer implements vscode.TreeDataProvider<Node>, vscode.TreeDragAndDropController<Node> {
    dropMimeTypes = ['application/vnd.code.tree.summeryExplorer'];
    dragMimeTypes = ['text/uri-list'];

    private tree: Record<string, Record<string, {}>> = { 'A': { 'A1': {}, 'A2': {} }, 'B': { 'B1': {}, 'B2': {} } };
    
    private _onDidChangeTreeData = new vscode.EventEmitter<Node | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;

    constructor(context: vscode.ExtensionContext) {
        console.log("Initializing TestViewDragAndDrop...");
        const view = vscode.window.createTreeView('summeryExplorer', { treeDataProvider: this, dragAndDropController: this });
        context.subscriptions.push(view);

        context.subscriptions.push(vscode.commands.registerCommand('summeryExplorer.rename', async (node: Node) => {
            const newName = await vscode.window.showInputBox({ prompt: "Enter new name", value: node.key });
            if (newName) {
                this.renameNode(node.key, newName);
            }
        }));
    }

    getChildren(element?: Node): Node[] {
        console.log("getChildren called with:", element);
        if (!element) {
            return Object.keys(this.tree).map(key => ({ key }));
        }

        const children = this.tree[element.key];
        return children ? Object.keys(children).map(key => ({ key })) : [];
    }

    getTreeItem(element: Node): vscode.TreeItem {
        console.log("getTreeItem called with:", element);
        const hasChildren = this.tree[element.key] !== undefined;

        return { 
            label: element.key, 
            collapsibleState: hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            contextValue: "renameable"
        };
    }

    renameNode(oldKey: string, newKey: string) {
        if (this.tree[oldKey]) {
            this.tree[newKey] = this.tree[oldKey];
            delete this.tree[oldKey];
        } else {
            for (const parentKey in this.tree) {
                if (this.tree[parentKey][oldKey]) {
                    this.tree[parentKey][newKey] = this.tree[parentKey][oldKey];
                    delete this.tree[parentKey][oldKey];
                    break;
                }
            }
        }

        vscode.window.showInformationMessage(`Renamed ${oldKey} to ${newKey}`);
        this._onDidChangeTreeData.fire(undefined); // Refresh the explorer
    }

    async handleDrop(target: Node | undefined, sources: vscode.DataTransfer) {
        console.log("handleDrop called with target:", target, "sources:", sources);
    }

    async handleDrag(source: Node[], treeDataTransfer: vscode.DataTransfer) {
        console.log("handleDrag called with source:", source);
        treeDataTransfer.set('application/vnd.code.tree.summeryExplorer', new vscode.DataTransferItem(source));
    }
}

interface Node { key: string; }
