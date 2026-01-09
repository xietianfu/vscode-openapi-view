import * as vscode from "vscode";

export function getHtmlForWebview(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  openApiContent: string,
  configRawContent: string
): string {
  const nonce = getNonce();

  // Normalize config content
  let injectedConfig = configRawContent;
  if (injectedConfig.includes("module.exports")) {
    injectedConfig = injectedConfig.replace(
      "module.exports",
      "window.openapiConfig"
    );
  } else if (injectedConfig.includes("export default")) {
    injectedConfig = injectedConfig.replace(
      "export default",
      "window.openapiConfig ="
    );
  }
  if (!injectedConfig.trim()) {
    injectedConfig = "window.openapiConfig = {};";
  }

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenAPI Preview</title>
        <style>
            :root {
                --bg-color: var(--vscode-editor-background);
                --text-color: var(--vscode-editor-foreground);
                --sidebar-bg: var(--vscode-sideBar-background);
                --border-color: var(--vscode-sideBarSectionHeader-border);
                --hover-bg: var(--vscode-list-hoverBackground);
                --active-bg: var(--vscode-list-activeSelectionBackground);
                --active-text: var(--vscode-list-activeSelectionForeground);
                --code-bg: var(--vscode-textCodeBlock-background);
            }
            body {
                padding: 0;
                margin: 0;
                display: flex;
                height: 100vh;
                font-family: var(--vscode-font-family);
                background-color: var(--bg-color);
                color: var(--text-color);
                overflow: hidden;
            }
            #sidebar {
                width: 300px;
                background-color: var(--sidebar-bg);
                border-right: 1px solid var(--border-color);
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
            }
            #sidebar-header {
                padding: 10px;
                border-bottom: 1px solid var(--border-color);
            }
            #search-input {
                width: 100%;
                padding: 6px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                box-sizing: border-box;
                outline: none;
            }
            #search-input:focus {
                border-color: var(--vscode-focusBorder);
            }
            #nav-list {
                flex: 1;
                overflow-y: auto;
                padding: 0;
                margin: 0;
                list-style: none;
            }
            .nav-group-title {
                padding: 8px 10px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 0.85em;
                opacity: 0.8;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
            }
            .nav-item {
                padding: 6px 10px 6px 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9em;
                border-left: 3px solid transparent;
            }
            .nav-item:hover {
                background-color: var(--hover-bg);
            }
            .nav-item.active {
                background-color: var(--active-bg);
                color: var(--active-text);
                border-left-color: var(--vscode-progressBar-background);
            }
            .method-badge {
                font-size: 0.7em;
                font-weight: bold;
                padding: 2px 4px;
                border-radius: 3px;
                text-transform: uppercase;
                min-width: 35px;
                text-align: center;
            }
            .method-get { background-color: #61affe; color: #fff; }
            .method-post { background-color: #49cc90; color: #fff; }
            .method-put { background-color: #fca130; color: #fff; }
            .method-delete { background-color: #f93e3e; color: #fff; }
            .method-patch { background-color: #50e3c2; color: #fff; }
            
            #main-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                box-sizing: border-box;
            }
            .api-title {
                font-size: 1.5em;
                margin-bottom: 10px;
                font-weight: bold;
            }
            .api-meta {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid var(--border-color);
            }
            .api-path {
                font-family: monospace;
                background: var(--code-bg);
                padding: 2px 5px;
                border-radius: 3px;
                margin-left: 10px;
            }
            .section-title {
                font-size: 1.1em;
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 10px;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 5px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
            }
            th, td {
                text-align: left;
                padding: 8px;
                border-bottom: 1px solid var(--border-color);
            }
            th {
                font-weight: bold;
                opacity: 0.8;
            }
            .hidden { display: none; }
            .arrow { transition: transform 0.2s; font-size: 0.8em; }
            .collapsed .arrow { transform: rotate(-90deg); }
            .schema-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9em;
            }
            .schema-table th, .schema-table td {
                padding: 6px 10px;
                border-bottom: 1px solid var(--border-color);
                text-align: left;
                vertical-align: top;
            }
            .schema-table th {
                background: var(--sidebar-bg);
                font-weight: 600;
            }
            .schema-row-name {
                font-family: monospace;
                color: var(--active-text);
            }
            .schema-row-type {
                color: #4ec9b0;
                font-family: monospace;
            }
            .schema-row-required {
                color: #f48771;
                font-size: 0.8em;
                font-weight: bold;
            }
            .schema-toggle {
                cursor: pointer;
                user-select: none;
                margin-right: 5px;
                display: inline-block;
                width: 12px;
                text-align: center;
                transition: transform 0.1s;
            }
            .schema-toggle.collapsed {
                transform: rotate(-90deg);
            }
            .schema-toggle.hidden {
                visibility: hidden;
            }
            .indent-guide {
                display: inline-block;
                width: 20px;
                height: 100%;
                border-left: 1px dashed var(--border-color);
                margin-right: 2px;
                vertical-align: middle;
            }
        </style>
    </head>
    <body>
        <div id="sidebar">
            <div id="sidebar-header">
                <input type="text" id="search-input" placeholder="Filter operations..." />
            </div>
            <ul id="nav-list"></ul>
        </div>
        <div id="main-content">
            <div style="text-align: center; margin-top: 50px; opacity: 0.6;">
                <h2>OpenAPI Preview</h2>
                <p>Select an endpoint from the sidebar to view details.</p>
            </div>
        </div>

        <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();
            let spec = {};
            try {
                spec = ${openApiContent};
            } catch (e) {
                console.error("Failed to parse spec in webview", e);
            }
            
            const navList = document.getElementById('nav-list');
            const mainContent = document.getElementById('main-content');
            const searchInput = document.getElementById('search-input');
            
            function init() {
                if (!spec || !spec.paths) {
                    mainContent.innerHTML = '<div style="padding: 20px; color: var(--vscode-errorForeground);">No paths found in OpenAPI spec or failed to parse.</div>';
                    return;
                }
                renderNavigation(spec);
                
                searchInput.addEventListener('input', (e) => {
                    filterNavigation(e.target.value);
                });
            }
            
            function renderNavigation(spec) {
                navList.innerHTML = '';
                
                const groups = {};
                const ungrouped = [];
                
                for (const path in spec.paths) {
                    const methods = spec.paths[path];
                    for (const method in methods) {
                        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].indexOf(method.toLowerCase()) === -1) continue;
                        
                        const op = methods[method];
                        const item = {
                            path,
                            method: method.toLowerCase(),
                            summary: op.summary || path,
                            tags: op.tags || [],
                            operationId: op.operationId || '',
                            description: op.description
                        };
                        
                        if (item.tags.length > 0) {
                            item.tags.forEach(tag => {
                                if (!groups[tag]) groups[tag] = [];
                                groups[tag].push(item);
                            });
                        } else {
                            ungrouped.push(item);
                        }
                    }
                }
                
                Object.keys(groups).sort().forEach(tag => {
                    renderGroup(tag, groups[tag]);
                });
                
                if (ungrouped.length > 0) {
                    renderGroup('Default', ungrouped);
                }
            }
            
            function renderGroup(title, items) {
                const groupLi = document.createElement('li');
                const titleDiv = document.createElement('div');
                titleDiv.className = 'nav-group-title';
                titleDiv.innerHTML = \`<span>\${title}</span> <span class="arrow">▼</span>\`;
                titleDiv.onclick = () => {
                    groupLi.classList.toggle('collapsed');
                    const list = groupLi.querySelector('ul');
                    if (list) list.classList.toggle('hidden');
                };
                
                const ul = document.createElement('ul');
                ul.style.listStyle = 'none';
                ul.style.padding = '0';
                
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'nav-item';
                    li.dataset.filterContent = \`\${item.method} \${item.path} \${item.summary}\`.toLowerCase();
                    li.innerHTML = \`<span class="method-badge method-\${item.method}">\${item.method.substring(0,3)}</span> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${item.summary}</span>\`;
                    li.title = item.summary; // Tooltip
                    li.onclick = () => {
                        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                        li.classList.add('active');
                        renderDetails(item);
                    };
                    ul.appendChild(li);
                });
                
                groupLi.appendChild(titleDiv);
                groupLi.appendChild(ul);
                navList.appendChild(groupLi);
            }
            
            function filterNavigation(query) {
                const q = query.toLowerCase();
                const items = document.querySelectorAll('.nav-item');
                items.forEach(item => {
                    if (item.dataset.filterContent.includes(q)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                document.querySelectorAll('#nav-list > li').forEach(group => {
                    const list = group.querySelector('ul');
                    let hasVisible = false;
                    list.childNodes.forEach(node => {
                        if (node.style.display !== 'none') hasVisible = true;
                    });
                    group.style.display = hasVisible ? 'block' : 'none';
                });
            }
            
            function renderDetails(item) {
                const op = spec.paths[item.path][item.method];
                
                let html = \`
                    <div class="api-meta">
                        <div class="api-title">\${item.summary}</div>
                        <div style="display: flex; align-items: center;">
                            <span class="method-badge method-\${item.method}" style="font-size: 1em; padding: 5px 10px;">\${item.method.toUpperCase()}</span>
                            <span class="api-path">\${item.path}</span>
                        </div>
                        \${item.description ? \`<p style="margin-top: 15px; opacity: 0.9;">\${item.description}</p>\` : ''}
                    </div>
                \`;
                
                // Parameters
                if (op.parameters && op.parameters.length > 0) {
                    html += \`<div class="section-title">Parameters</div>\`;
                    html += \`<table><thead><tr><th style="width: 20%">Name</th><th style="width: 15%">In</th><th style="width: 10%">Required</th><th>Description</th></tr></thead><tbody>\`;
                    op.parameters.forEach(p => {
                        html += \`<tr>
                            <td><strong>\${p.name}</strong></td>
                            <td>\${p.in}</td>
                            <td>\${p.required ? 'Yes' : 'No'}</td>
                            <td>\${p.description || '-'}</td>
                        </tr>\`;
                    });
                    html += \`</tbody></table>\`;
                }
                
                // Request Body
                if (op.requestBody) {
                    html += \`<div class="section-title">Request Body</div>\`;
                    html += \`<p>\${op.requestBody.description || ''}</p>\`;
                    const content = op.requestBody.content;
                    if (content) {
                        for (const type in content) {
                            html += \`<div style="margin-bottom: 5px; font-weight: bold; margin-top: 10px;">Media Type: \${type}</div>\`;
                            const schema = content[type].schema;
                            if (schema) {
                                html += \`<pre style="background: var(--code-bg); padding: 10px; overflow: auto; border-radius: 4px;">\${formatSchema(schema)}</pre>\`;
                            }
                        }
                    }
                }
                
                // Responses
                if (op.responses) {
                    html += \`<div class="section-title">Responses</div>\`;
                    html += \`<table><thead><tr><th style="width: 15%">Code</th><th>Description</th></tr></thead><tbody>\`;
                    for (const code in op.responses) {
                        html += \`<tr>
                            <td><strong>\${code}</strong></td>
                            <td>
                                <div>\${op.responses[code].description || ''}</div>
                                \${renderResponseSchema(op.responses[code])}
                            </td>
                        </tr>\`;
                    }
                    html += \`</tbody></table>\`;
                }
                
                mainContent.innerHTML = html;
                mainContent.scrollTop = 0;
            }

            function renderResponseSchema(response) {
                if (!response.content) return '';
                let html = '';
                for (const type in response.content) {
                    const schema = response.content[type].schema;
                    if (schema) {
                         html += \`<div style="margin-top: 5px; font-size: 0.9em; opacity: 0.8;">Schema (\${type}):</div>
                         <pre style="background: var(--code-bg); padding: 5px; margin-top: 5px; overflow: auto; border-radius: 3px;">\${formatSchema(schema)}</pre>\`;
                    }
                }
                return html;
            }
            
            function formatSchema(schema) {
                try {
                    const resolved = resolveDeep(schema);
                    return JSON.stringify(resolved, null, 2);
                } catch(e) {
                    console.error('Format schema error', e);
                    return 'Invalid Schema';
                }
            }

            function resolveDeep(schema, visited = new Set()) {
                if (!schema || typeof schema !== 'object') return schema;
                
                // Check for $ref
                if (schema.$ref && typeof schema.$ref === 'string') {
                    if (visited.has(schema.$ref)) {
                        return { $ref: schema.$ref, _circular: true };
                    }
                    
                    const refPath = schema.$ref;
                    if (refPath.startsWith('#/')) {
                        const parts = refPath.substring(2).split('/');
                        let current = spec;
                        for (const part of parts) {
                            current = current && current[part];
                        }
                        
                        if (current) {
                            const newVisited = new Set(visited);
                            newVisited.add(refPath);
                            const resolved = resolveDeep(current, newVisited);
                            // Inject source ref info if it's an object to help user identify the schema
                            if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
                                return Object.assign({ _ref: refPath }, resolved);
                            }
                            return resolved;
                        }
                    }
                }
                
                // Recursively resolve properties if it's an object/array
                if (Array.isArray(schema)) {
                    return schema.map(item => resolveDeep(item, visited));
                }
                
                const result = {};
                for (const key in schema) {
                    result[key] = resolveDeep(schema[key], visited);
                }
                return result;
            }

            // Handle messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'openOperation') {
                    // Find and select the item
                    // For now, we just search by method and path
                    const items = document.querySelectorAll('.nav-item');
                    for (let item of items) {
                         // We stored filter content as "method path summary"
                         // This is a bit weak. We should store data attributes.
                         // But we also check dataset.filterContent
                         const data = item.dataset.filterContent;
                         if (data.includes(message.method.toLowerCase()) && data.includes(message.path.toLowerCase())) {
                             item.click();
                             item.scrollIntoView();
                             break;
                         }
                    }
                }
            });

            init();
        </script>
    </body>
    </html>`;
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
