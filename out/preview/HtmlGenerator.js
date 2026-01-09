"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlForWebview = void 0;
const vscode = require("vscode");
function getHtmlForWebview(webview, extensionUri, openApiContent, configRawContent) {
    const swaggerUiDistPath = vscode.Uri.joinPath(extensionUri, 'node_modules', 'swagger-ui-dist');
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(swaggerUiDistPath, 'swagger-ui.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(swaggerUiDistPath, 'swagger-ui-bundle.js'));
    const presetUri = webview.asWebviewUri(vscode.Uri.joinPath(swaggerUiDistPath, 'swagger-ui-standalone-preset.js'));
    // Normalize config content to be browser-compatible if it uses module.exports
    // This is a simple heuristic.
    let injectedConfig = configRawContent;
    if (injectedConfig.includes('module.exports')) {
        injectedConfig = injectedConfig.replace('module.exports', 'window.openapiConfig');
    }
    else if (injectedConfig.includes('export default')) {
        injectedConfig = injectedConfig.replace('export default', 'window.openapiConfig =');
    }
    // If empty, ensure we define window.openapiConfig
    if (!injectedConfig.trim()) {
        injectedConfig = "window.openapiConfig = {};";
    }
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>OpenAPI Preview</title>
        <style>
            body { padding: 0; margin: 0; }
            #swagger-ui { height: 100vh; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="${scriptUri}"></script>
        <script src="${presetUri}"></script>
        
        <!-- Inject User Config -->
        <script>
            try {
                ${injectedConfig}
            } catch (e) {
                console.error("Failed to load user config", e);
                window.openapiConfig = {};
            }
        </script>

        <script>
            const specContent = ${JSON.stringify(openApiContent)};
            let parsedSpec;
            try {
                parsedSpec = JSON.parse(specContent);
            } catch (e) {
                console.error("Failed to parse OpenAPI spec", e);
                // Maybe it's YAML? SwaggerUI can handle string content usually, but safer to pass object if JSON.
                // If it fails, we pass the string.
                parsedSpec = specContent;
            }

            const userConfig = window.openapiConfig || {};
            
            // Initialize Swagger UI
            const uiConfig = {
                dom_id: '#swagger-ui',
                spec: parsedSpec,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout",
                requestInterceptor: userConfig.requestInterceptor,
                responseInterceptor: userConfig.responseInterceptor
            };

            // Handle environments (modify servers)
            if (userConfig.environments && Array.isArray(userConfig.environments)) {
                // If user provided environments, we might want to override servers
                // For now, let's assume environments is just a list of server objects { url, description }
                if (typeof parsedSpec === 'object') {
                    parsedSpec.servers = userConfig.environments;
                }
            }

            const ui = SwaggerUIBundle(uiConfig);

            // Message Handling
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'openOperation') {
                    // Message: { method, path }
                    // Swagger UI generates IDs like: operations-[tag]-[operationId]
                    // If operationId is missing, it uses method and path.
                    // We need to find the DOM element.
                    
                    // This is tricky because we don't know the tag or operationId easily without parsing the same way Swagger does.
                    // However, we can use Swagger UI's system to expand.
                    
                    // Simple approach: Filter? 
                    // Better: Use the search functionality if available or just let the user use the UI.
                    // The requirement says "Support interface search query".
                    
                    // Let's try to filter using the built-in filter if possible, or just print to console for now.
                    console.log("Requested operation:", message.method, message.path);
                    
                    // Attempt to locate via DOM text content (brittle but effective for simple cases)
                    // Or, if we have the operationId from the extension side, we can pass it.
                }
            });
        </script>
    </body>
    </html>`;
}
exports.getHtmlForWebview = getHtmlForWebview;
//# sourceMappingURL=HtmlGenerator.js.map