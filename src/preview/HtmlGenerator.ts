import * as vscode from 'vscode';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

export function getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri, openApiContent: string, configRawContent: string): string {
    const nonce = getNonce();

    // Paths
    const stylePath = vscode.Uri.joinPath(extensionUri, 'resources', 'view', 'preview.css');
    const styleUri = webview.asWebviewUri(stylePath);
    
    const scriptPath = vscode.Uri.joinPath(extensionUri, 'resources', 'view', 'preview.js');
    const scriptUri = webview.asWebviewUri(scriptPath);

    const templatePath = path.join(extensionUri.fsPath, 'resources', 'templates');

    // Configure Nunjucks
    nunjucks.configure(templatePath, { autoescape: true });

    // Normalize config content
    let injectedConfig = configRawContent;
    if (injectedConfig.includes('module.exports')) {
        injectedConfig = injectedConfig.replace('module.exports', 'window.openapiConfig');
    } else if (injectedConfig.includes('export default')) {
        injectedConfig = injectedConfig.replace('export default', 'window.openapiConfig =');
    }
    if (!injectedConfig.trim()) {
        injectedConfig = "window.openapiConfig = {};";
    }

    // Render
    try {
        return nunjucks.render('webview.njk', {
            cspSource: webview.cspSource,
            nonce: nonce,
            styleUri: styleUri.toString(),
            scriptUri: scriptUri.toString(),
            openApiContent: openApiContent,
            configRawContent: injectedConfig
        });
    } catch (e) {
        console.error('Nunjucks render error:', e);
        return `<!DOCTYPE html><html><body>Error rendering template: ${e}</body></html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
