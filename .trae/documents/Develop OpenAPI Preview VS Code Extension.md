# VS Code Extension: OpenAPI Preview & Test Tool

This plan outlines the development of a VS Code extension to preview, search, and test OpenAPI 3.0 interfaces, including support for custom environments and pre/post-request hooks.

## 1. Project Initialization
- Initialize a VS Code extension project structure in `d:\code\learn\vscodeTool\openapiView`.
- Configure `package.json` with necessary commands and activation events.
- Install dependencies: `swagger-ui-dist` (for rendering), `js-yaml` (for parsing).

## 2. Core Feature: OpenAPI Preview
- **Command**: `openapiView.preview` to open the preview for the currently active `openapi.json` file.
- **Implementation**:
  - Create a `PreviewPanel` class to manage the VS Code Webview.
  - Generate HTML that loads `swagger-ui-dist` assets.
  - Pass the content of the opened `openapi.json` to the Swagger UI instance for rendering.

## 3. Feature: Interface Search & Query
- **Built-in**: Swagger UI provides basic filtering.
- **VS Code Integration**:
  - **Command**: `openapiView.search`.
  - Parse the OpenAPI JSON to extract all API endpoints (Method, Path, Summary).
  - Show a **QuickPick** list in VS Code.
  - On selection, send a message to the Webview to scroll to and expand the specific operation.

## 4. Feature: Request Testing & Configuration
- **Config File**: Support `openapi-config.js` in the project root.
- **Capabilities**:
  - **Environments**: Define base URLs (Servers).
  - **Hooks**: `requestInterceptor` and `responseInterceptor` functions.
- **Implementation**:
  - Read `openapi-config.js` content.
  - Inject the configuration and hook functions into the Webview's Swagger UI initialization script.
  - This allows users to modify requests (e.g., add auth headers) and process responses dynamically.

## 5. Development Roadmap
1.  **Scaffold**: Setup `package.json`, `tsconfig.json`, and directory structure.
2.  **Webview**: Implement basic Swagger UI rendering for `openapi.json`.
3.  **Config Loader**: Implement logic to read `openapi-config.js` and inject it into the Webview.
4.  **Search**: Implement the QuickPick search functionality.
5.  **Verify**: Test with the provided `openapi.json` and a sample config file.
