"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlForWebview = void 0;
const vscode = require("vscode");
const nunjucks = require("nunjucks");
const path = require("path");
const fs = require("fs");
function getHtmlForWebview(webview, extensionUri, openApiContent, configRawContent) {
    const nonce = getNonce();
    // Paths
    const stylePath = vscode.Uri.joinPath(extensionUri, 'resources', 'view', 'preview.css');
    const scriptPath = vscode.Uri.joinPath(extensionUri, 'resources', 'view', 'preview.js');
    const templatePath = path.join(extensionUri.fsPath, 'resources', 'templates');
    // Read resources content
    let styleContent = '';
    let scriptContent = '';
    try {
        styleContent = fs.readFileSync(stylePath.fsPath, 'utf-8');
        scriptContent = fs.readFileSync(scriptPath.fsPath, 'utf-8');
    }
    catch (e) {
        console.error('Failed to read preview resources', e);
    }
    // Configure Nunjucks
    nunjucks.configure(templatePath, { autoescape: true, noCache: true });
    // Normalize config content
    let injectedConfig = configRawContent;
    if (injectedConfig.includes('module.exports')) {
        injectedConfig = injectedConfig.replace('module.exports', 'window.openapiConfig');
    }
    else if (injectedConfig.includes('export default')) {
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
            styleContent: styleContent,
            scriptContent: scriptContent,
            openApiContent: openApiContent,
            configRawContent: injectedConfig
        });
    }
    catch (e) {
        console.error('Nunjucks render error:', e);
        return `<!DOCTYPE html><html><body>Error rendering template: ${e}</body></html>`;
    }
}
exports.getHtmlForWebview = getHtmlForWebview;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=HtmlGenerator.js.map