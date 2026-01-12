import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { PreviewPanel } from "../preview/PreviewPanel";

interface OpenApiOperationItem extends vscode.QuickPickItem {
  method: string;
  path: string;
  operationId?: string;
}

export async function searchInterface(extensionUri: vscode.Uri) {
  let text = "";
  const editor = vscode.window.activeTextEditor;
  if (
    editor &&
    (editor.document.languageId === "json" ||
      editor.document.languageId === "yaml")
  ) {
    text = editor.document.getText();
  } else {
    vscode.window.showErrorMessage(
      vscode.l10n.t("No active OpenAPI file. Open a JSON/YAML spec first.")
    );
    return;
  }

  if (!text) {
    vscode.window.showErrorMessage(
      vscode.l10n.t("No OpenAPI file found or active.")
    );
    return;
  }

  let spec: any;
  try {
    spec = yaml.load(text); // js-yaml handles JSON too
  } catch (e) {
    vscode.window.showErrorMessage(
      vscode.l10n.t("Failed to parse OpenAPI spec.")
    );
    return;
  }

  if (!spec.paths) {
    vscode.window.showErrorMessage(
      vscode.l10n.t("Invalid OpenAPI spec: no paths found.")
    );
    return;
  }

  const items: OpenApiOperationItem[] = [];
  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    if (typeof pathItem !== "object" || !pathItem) continue;

    const methods = [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
      "trace",
    ];
    for (const method of methods) {
      const op = (pathItem as any)[method];
      if (op) {
        items.push({
          label: `${method.toUpperCase()} ${pathKey}`,
          description: op.summary || op.operationId || "",
          detail: op.description,
          method,
          path: pathKey,
          operationId: op.operationId,
        });
      }
    }
  }

  const selected = await vscode.window.showQuickPick(items, {
    matchOnDescription: true,
    matchOnDetail: true,
    placeHolder: vscode.l10n.t("Search for API operation..."),
  });

  if (selected) {
    if (!PreviewPanel.currentPanel) {
      PreviewPanel.createOrShow(extensionUri);
    }

    // Give the webview a moment to initialize if it wasn't open
    setTimeout(() => {
      PreviewPanel.currentPanel?.revealOperation(
        selected.method,
        selected.path,
        selected.description || ""
      );
    }, 1000);
  }
}
