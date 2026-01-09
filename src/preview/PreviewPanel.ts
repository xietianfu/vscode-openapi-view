import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { getHtmlForWebview } from "./HtmlGenerator";
import { ConfigLoader } from "../config/ConfigLoader";

export class PreviewPanel {
  public static currentPanel: PreviewPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._update();
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel._panel.reveal(column);
      PreviewPanel.currentPanel._update();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "openapiView",
      "OpenAPI Preview",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "node_modules")],
      }
    );

    PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
  }

  public dispose() {
    PreviewPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  public async revealOperation(method: string, path: string, summary: string) {
    this._panel.webview.postMessage({
      command: "openOperation",
      method,
      path,
      summary,
    });
  }

  private async _update() {
    const webview = this._panel.webview;

    let text = "";
    const editor = vscode.window.activeTextEditor;
    if (
      editor &&
      (editor.document.languageId === "json" ||
        editor.document.languageId === "yaml")
    ) {
      text = editor.document.getText();
    } else {
      const files = await vscode.workspace.findFiles("openapi.json", null, 1);
      if (files.length > 0) {
        const doc = await vscode.workspace.openTextDocument(files[0]);
        text = doc.getText();
      } else {
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
    } catch (e) {
      console.error("Failed to parse OpenAPI spec:", e);
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    let configRaw = "";
    if (workspaceFolder) {
      configRaw = await ConfigLoader.loadRaw(workspaceFolder.uri.fsPath);
    }

    this._panel.webview.html = getHtmlForWebview(
      webview,
      this._extensionUri,
      openApiJson,
      configRaw
    );
  }
}
