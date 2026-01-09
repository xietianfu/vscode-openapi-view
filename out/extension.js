"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const PreviewPanel_1 = require("./preview/PreviewPanel");
const search_1 = require("./commands/search");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('openapiView.preview', () => {
        PreviewPanel_1.PreviewPanel.createOrShow(context.extensionUri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('openapiView.search', () => {
        (0, search_1.searchInterface)(context.extensionUri);
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map