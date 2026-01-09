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
exports.PreviewPanel = void 0;
const vscode = require("vscode");
const yaml = require("js-yaml");
const HtmlGenerator_1 = require("./HtmlGenerator");
const ConfigLoader_1 = require("../config/ConfigLoader");
class PreviewPanel {
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._update();
    }
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            PreviewPanel.currentPanel._update();
            return;
        }
        const panel = vscode.window.createWebviewPanel("openapiView", "OpenAPI Preview", column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, "node_modules")],
        });
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }
    static revive(panel, extensionUri) {
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }
    dispose() {
        PreviewPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    revealOperation(method, path, summary) {
        return __awaiter(this, void 0, void 0, function* () {
            this._panel.webview.postMessage({
                command: "openOperation",
                method,
                path,
                summary,
            });
        });
    }
    _update() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const webview = this._panel.webview;
            let text = "";
            const editor = vscode.window.activeTextEditor;
            if (editor &&
                (editor.document.languageId === "json" ||
                    editor.document.languageId === "yaml")) {
                text = editor.document.getText();
            }
            else {
                const files = yield vscode.workspace.findFiles("openapi.json", null, 1);
                if (files.length > 0) {
                    const doc = yield vscode.workspace.openTextDocument(files[0]);
                    text = doc.getText();
                }
                else {
                    text = "{}";
                }
            }
            let openApiJson = "{}";
            try {
                const parsed = yaml.load(text);
                if (parsed && typeof parsed === "object") {
                    // Serialize and escape for safe HTML injection
                    openApiJson = JSON.stringify(parsed)
                        .replace(/</g, "\\u003c")
                        .replace(/\u2028/g, "\\u2028")
                        .replace(/\u2029/g, "\\u2029");
                }
            }
            catch (e) {
                console.error("Failed to parse OpenAPI spec:", e);
            }
            const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
            let configRaw = "";
            if (workspaceFolder) {
                configRaw = yield ConfigLoader_1.ConfigLoader.loadRaw(workspaceFolder.uri.fsPath);
            }
            this._panel.webview.html = (0, HtmlGenerator_1.getHtmlForWebview)(webview, this._extensionUri, openApiJson, configRaw);
        });
    }
}
exports.PreviewPanel = PreviewPanel;
//# sourceMappingURL=PreviewPanel.js.map