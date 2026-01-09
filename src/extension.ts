import * as vscode from 'vscode';
import { PreviewPanel } from './preview/PreviewPanel';
import { searchInterface } from './commands/search';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('openapiView.preview', () => {
			PreviewPanel.createOrShow(context.extensionUri);
		})
	);

    context.subscriptions.push(
        vscode.commands.registerCommand('openapiView.search', () => {
            searchInterface(context.extensionUri);
        })
    );
}

export function deactivate() {}
