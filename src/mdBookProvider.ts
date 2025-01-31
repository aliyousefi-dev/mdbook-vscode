import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class MdBookProvider implements vscode.TreeDataProvider<ChapterItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ChapterItem | undefined | void> = 
        new vscode.EventEmitter<ChapterItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ChapterItem | undefined | void> = 
        this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string | undefined) {}

    getTreeItem(element: ChapterItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChapterItem): Thenable<ChapterItem[]> {
        if (!this.workspaceRoot) {
            console.log('❌ No workspace root found!');
            return Promise.resolve([]);
        }
        
        const summaryPath = path.join(this.workspaceRoot, "src", "SUMMARY.md");
        if (!fs.existsSync(summaryPath)) {
            console.log('⚠️ SUMMARY.md not found!');
            return Promise.resolve([]);
        }

        if (!element) {
            return Promise.resolve(this.parseSummary(summaryPath));
        } else {
            return Promise.resolve(element.children);
        }
    }

    private parseSummary(summaryPath: string): ChapterItem[] {
        const content = fs.readFileSync(summaryPath, "utf-8");
        const lines = content.split("\n");

        let rootItems: ChapterItem[] = [];
        let parentStack: { item: ChapterItem, indent: number }[] = [];

        lines.forEach(line => {
            const match = line.match(/^\s*-\s*\[(.*?)\]\((.*?)\)/);
            if (match) {
                const title = match[1];
                const filePath = match[2];
                const indentLevel = (line.match(/^(\s*)-/)?.[1].length ?? 0);

                // ✅ If it has children, collapse it; otherwise, keep it expanded
                const collapsibleState = (indentLevel === 0) 
                    ? vscode.TreeItemCollapsibleState.Collapsed  // Top-level items collapsed
                    : vscode.TreeItemCollapsibleState.None;      // Files stay open

                const newItem = new ChapterItem(title, filePath, vscode.TreeItemCollapsibleState.None, this.workspaceRoot);

                // Correct parent tracking
                while (parentStack.length > 0 && parentStack[parentStack.length - 1].indent >= indentLevel) {
                    parentStack.pop();
                }

                if (parentStack.length > 0) {
                    parentStack[parentStack.length - 1].item.children.push(newItem);
                    parentStack[parentStack.length - 1].item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed; // Parent collapses
                    parentStack[parentStack.length - 1].item.iconPath = new vscode.ThemeIcon("file-text"); // Parent collapses
                } else {
                    rootItems.push(newItem);
                }

                parentStack.push({ item: newItem, indent: indentLevel });

                console.log(`📂 Added: ${title} (Indent: ${indentLevel})`);
            }
        });

        return rootItems;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class ChapterItem extends vscode.TreeItem {
    public children: ChapterItem[] = [];

    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly workspaceRoot: string | undefined,
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label} (${this.filePath})`;
        this.resourceUri = workspaceRoot ? vscode.Uri.file(path.join(workspaceRoot, filePath)) : undefined;

    }

    iconPath = new vscode.ThemeIcon("file-text");

}
