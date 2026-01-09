"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchInterface = void 0;
const vscode = require("vscode");
const yaml = require("js-yaml");
const PreviewPanel_1 = require("../preview/PreviewPanel");
function searchInterface(extensionUri) {
    return __awaiter(this, void 0, void 0, function* () {
        let text = '';
        const editor = vscode.window.activeTextEditor;
        if (editor && (editor.document.languageId === 'json' || editor.document.languageId === 'yaml')) {
            text = editor.document.getText();
        }
        else {
            const files = yield vscode.workspace.findFiles('openapi.json', null, 1);
            if (files.length > 0) {
                const doc = yield vscode.workspace.openTextDocument(files[0]);
                text = doc.getText();
            }
        }
        if (!text) {
            vscode.window.showErrorMessage('No OpenAPI file found or active.');
            return;
        }
        let spec;
        try {
            spec = yaml.load(text); // js-yaml handles JSON too
        }
        catch (e) {
            vscode.window.showErrorMessage('Failed to parse OpenAPI spec.');
            return;
        }
        if (!spec.paths) {
            vscode.window.showErrorMessage('Invalid OpenAPI spec: no paths found.');
            return;
        }
        const items = [];
        for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
            if (typeof pathItem !== 'object' || !pathItem)
                continue;
            const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];
            for (const method of methods) {
                const op = pathItem[method];
                if (op) {
                    items.push({
                        label: `${method.toUpperCase()} ${pathKey}`,
                        description: op.summary || op.operationId || '',
                        detail: op.description,
                        method,
                        path: pathKey,
                        operationId: op.operationId
                    });
                }
            }
        }
        const selected = yield vscode.window.showQuickPick(items, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Search for API operation...'
        });
        if (selected) {
            if (!PreviewPanel_1.PreviewPanel.currentPanel) {
                PreviewPanel_1.PreviewPanel.createOrShow(extensionUri);
            }
            // Give the webview a moment to initialize if it wasn't open
            setTimeout(() => {
                var _a;
                (_a = PreviewPanel_1.PreviewPanel.currentPanel) === null || _a === void 0 ? void 0 : _a.revealOperation(selected.method, selected.path, selected.description || '');
            }, 1000);
        }
    });
}
exports.searchInterface = searchInterface;
//# sourceMappingURL=search.js.map