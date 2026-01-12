let navList, mainContent, searchInput;

function init() {
  navList = document.getElementById("nav-list");
  mainContent = document.getElementById("main-content");
  searchInput = document.getElementById("search-input");

  console.log("OpenAPI Preview Init");
  console.log("Spec:", window.spec ? "Found" : "Missing");

  if (!window.spec || !window.spec.paths) {
    if (mainContent) {
      mainContent.innerHTML =
        '<div style="padding: 20px; color: var(--vscode-errorForeground);">No paths found in OpenAPI spec or failed to parse.</div>';
    } else {
      console.error("Main content element not found");
    }
  } else {
    renderNavigation(window.spec);

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        filterNavigation(e.target.value);
      });
    }
  }
}

// Run init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function renderNavigation(spec) {
  navList.innerHTML = "";

  const groups = {};
  const ungrouped = [];

  for (const path in spec.paths) {
    const methods = spec.paths[path];
    for (const method in methods) {
      if (
        ["get", "post", "put", "delete", "patch", "options", "head"].indexOf(
          method.toLowerCase()
        ) === -1
      )
        continue;

      const op = methods[method];
      const item = {
        path,
        method: method.toLowerCase(),
        summary: op.summary || path,
        tags: op.tags || [],
        operationId: op.operationId || "",
        description: op.description,
      };

      if (item.tags.length > 0) {
        item.tags.forEach((tag) => {
          if (!groups[tag]) groups[tag] = [];
          groups[tag].push(item);
        });
      } else {
        ungrouped.push(item);
      }
    }
  }

  Object.keys(groups)
    .sort()
    .forEach((tag) => {
      renderGroup(tag, groups[tag]);
    });

  if (ungrouped.length > 0) {
    renderGroup("Default", ungrouped);
  }
}

function renderGroup(title, items) {
  const groupLi = document.createElement("li");
  const titleDiv = document.createElement("div");
  titleDiv.className = "nav-group-title";
  titleDiv.innerHTML = `<span>${title}</span> <span class="arrow">▼</span>`;
  titleDiv.onclick = () => {
    groupLi.classList.toggle("collapsed");
    const list = groupLi.querySelector("ul");
    if (list) list.classList.toggle("hidden");
  };

  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = "0";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.dataset.filterContent =
      `${item.method} ${item.path} ${item.summary}`.toLowerCase();
    li.innerHTML = `<span class="method-badge method-${
      item.method
    }">${item.method.substring(
      0,
      3
    )}</span> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${
      item.summary
    }</span>`;
    li.title = item.summary; // Tooltip
    li.onclick = () => {
      document
        .querySelectorAll(".nav-item")
        .forEach((el) => el.classList.remove("active"));
      li.classList.add("active");
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
  const items = document.querySelectorAll(".nav-item");
  items.forEach((item) => {
    if (item.dataset.filterContent.includes(q)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });

  document.querySelectorAll("#nav-list > li").forEach((group) => {
    const list = group.querySelector("ul");
    let hasVisible = false;
    list.childNodes.forEach((node) => {
      if (node.style.display !== "none") hasVisible = true;
    });
    group.style.display = hasVisible ? "block" : "none";
  });
}

function renderDetails(item) {
  const op = window.spec.paths[item.path][item.method];

  let html = `
        <div class="api-meta">
            <div class="api-title">${item.summary}</div>
            <div style="display: flex; align-items: center;">
                <span class="method-badge method-${
                  item.method
                }" style="font-size: 1em; padding: 5px 10px;">${item.method.toUpperCase()}</span>
                <span class="api-path">${item.path}</span>
            </div>
            ${
              item.description
                ? `<p style="margin-top: 15px; opacity: 0.9;">${item.description}</p>`
                : ""
            }
        </div>
    `;

  // Parameters
  if (op.parameters && op.parameters.length > 0) {
    html += `<div class="section-title">Parameters</div>`;
    html += `<table><thead><tr><th style="width: 20%">Name</th><th style="width: 15%">In</th><th style="width: 10%">Required</th><th>Description</th></tr></thead><tbody>`;
    op.parameters.forEach((p) => {
      html += `<tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.in}</td>
                <td>${p.required ? "Yes" : "No"}</td>
                <td>${p.description || "-"}</td>
            </tr>`;
    });
    html += `</tbody></table>`;
  }

  // Request Body
  if (op.requestBody) {
    html += `<div class="section-title">Request Body</div>`;
    html += `<p>${op.requestBody.description || ""}</p>`;
    const content = op.requestBody.content;
    if (content) {
      for (const type in content) {
        html += `<div style="margin-bottom: 5px; font-weight: bold; margin-top: 10px;">Media Type: ${type}</div>`;
        const schema = content[type].schema;
        if (schema) {
          html += renderSchemaTable(schema, "root");
        }
      }
    }
  }

  // Responses
  if (op.responses) {
    html += `<div class="section-title">Responses</div>`;

    for (const code in op.responses) {
      html += `<div style="margin-bottom: 20px; border: 1px solid var(--border-color); border-radius: 4px;">
                <div style="padding: 8px 10px; background: var(--sidebar-bg); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: bold; font-family: monospace; font-size: 1.1em;">${code}</span>
                    <span style="opacity: 0.8;">${
                      op.responses[code].description || ""
                    }</span>
                </div>
                <div style="padding: 10px;">
                    ${renderResponseSchema(op.responses[code])}
                </div>
            </div>`;
    }
  }

  mainContent.innerHTML = html;
  mainContent.scrollTop = 0;
}

function renderResponseSchema(response) {
  if (!response.content) return "";
  let html = "";
  for (const type in response.content) {
    const schema = response.content[type].schema;
    if (schema) {
      html += `<div style="margin-top: 5px; font-size: 0.9em; opacity: 0.8;">Schema (${type}):</div>`;
      html += renderSchemaTable(schema, "root");
    }
  }
  return html;
}

function renderSchemaTable(schema, rootName = "root") {
  const resolved = resolveDeep(schema);
  if (!resolved) return '<div class="error">Invalid Schema</div>';

  // If it's a primitive type, just show it simply
  if (
    resolved.type !== "object" &&
    resolved.type !== "array" &&
    !resolved.properties
  ) {
    return `<div style="background: var(--code-bg); padding: 10px; border-radius: 4px; font-family: monospace;">
            <span style="color: #4ec9b0;">${resolved.type || "unknown"}</span> 
            ${resolved.format ? `(${resolved.format})` : ""}
            ${resolved.description ? `- ${resolved.description}` : ""}
         </div>`;
  }

  let rows = "";
  let idCounter = 0;

  function generateRows(obj, name, level, parentId = null, required = false) {
    const id = `row-${Math.random().toString(36).substr(2, 9)}`;
    const hasChildren =
      (obj.type === "object" && obj.properties) ||
      (obj.type === "array" && obj.items);
    const isCircular = obj._circular;

    let typeDisplay = obj.type || "object";
    if (obj.format) typeDisplay += ` (${obj.format})`;
    if (obj.items && obj.items.type) typeDisplay += `[${obj.items.type}]`;
    if (isCircular) typeDisplay += " (Circular)";
    if (obj._ref) {
      const refName = obj._ref.split("/").pop();
      typeDisplay += ` <span style="opacity:0.6; font-size:0.8em">&lt;${refName}&gt;</span>`;
    }

    const indent =
      level > 0 ? `<span style="padding-left: ${level * 20}px"></span>` : "";
    const toggle =
      hasChildren && !isCircular
        ? `<span class="schema-toggle" data-id="${id}">▼</span>`
        : `<span class="schema-toggle hidden">▼</span>`;

    const rowClass = parentId ? `child-of-${parentId}` : "";

    rows += `<tr class="schema-row ${rowClass}" id="${id}" data-level="${level}">
            <td>
                ${indent}${toggle}
                <span class="schema-row-name">${name}</span>
            </td>
            <td class="schema-row-type">${typeDisplay}</td>
            <td class="schema-row-required">${required ? "Required" : ""}</td>
            <td>${obj.description || "-"}</td>
        </tr>`;

    if (hasChildren && !isCircular) {
      if (obj.type === "object" && obj.properties) {
        for (const key in obj.properties) {
          const prop = obj.properties[key];
          const isReq =
            obj.required &&
            Array.isArray(obj.required) &&
            obj.required.includes(key);
          generateRows(prop, key, level + 1, id, isReq);
        }
      } else if (obj.type === "array" && obj.items) {
        generateRows(obj.items, "items", level + 1, id, false);
      }
    }
  }

  generateRows(resolved, rootName, 0);

  return `<table class="schema-table">
        <thead>
            <tr>
                <th style="width: 35%">Name</th>
                <th style="width: 20%">Type</th>
                <th style="width: 10%">Required</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;
}

// Global toggle function
function toggleRow(id) {
  const row = document.getElementById(id);
  if (!row) return;
  const toggle = row.querySelector(".schema-toggle");

  if (toggle.classList.contains("collapsed")) {
    toggle.classList.remove("collapsed");
    showChildren(id);
  } else {
    toggle.classList.add("collapsed");
    hideChildren(id);
  }
}

// Event Delegation for toggles
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("schema-toggle")) {
    const id = e.target.dataset.id;
    if (id) toggleRow(id);
  }
});

function hideChildren(parentId) {
  const children = document.querySelectorAll(`.child-of-${parentId}`);
  children.forEach((child) => {
    child.style.display = "none";
    if (child.querySelector(".schema-toggle:not(.collapsed)")) {
      hideChildren(child.id);
    }
  });
}

function showChildren(parentId) {
  const children = document.querySelectorAll(`.child-of-${parentId}`);
  children.forEach((child) => {
    child.style.display = "table-row";
    const toggle = child.querySelector(".schema-toggle");
    if (toggle && !toggle.classList.contains("collapsed")) {
      showChildren(child.id);
    }
  });
}

function formatSchema(schema) {
  try {
    const resolved = resolveDeep(schema);
    return JSON.stringify(resolved, null, 2);
  } catch (e) {
    console.error("Format schema error", e);
    return "Invalid Schema";
  }
}

function resolveDeep(schema, visited = new Set()) {
  if (!schema || typeof schema !== "object") return schema;

  // Check for $ref
  if (schema.$ref && typeof schema.$ref === "string") {
    if (visited.has(schema.$ref)) {
      return { $ref: schema.$ref, _circular: true };
    }

    const refPath = schema.$ref;
    if (refPath.startsWith("#/")) {
      const parts = refPath.substring(2).split("/");
      let current = window.spec;
      for (const part of parts) {
        current = current && current[part];
      }

      if (current) {
        const newVisited = new Set(visited);
        newVisited.add(refPath);
        const resolved = resolveDeep(current, newVisited);
        // Inject source ref info if it's an object to help user identify the schema
        if (
          resolved &&
          typeof resolved === "object" &&
          !Array.isArray(resolved)
        ) {
          return Object.assign({ _ref: refPath }, resolved);
        }
        return resolved;
      }
    }
  }

  // Recursively resolve properties if it's an object/array
  if (Array.isArray(schema)) {
    return schema.map((item) => resolveDeep(item, visited));
  }

  const result = {};
  for (const key in schema) {
    result[key] = resolveDeep(schema[key], visited);
  }
  return result;
}

// Handle messages from extension
window.addEventListener("message", (event) => {
  const message = event.data;
  if (message.command === "openOperation") {
    // Find and select the item
    const items = document.querySelectorAll(".nav-item");
    for (let item of items) {
      const data = item.dataset.filterContent;
      if (
        data.includes(message.method.toLowerCase()) &&
        data.includes(message.path.toLowerCase())
      ) {
        item.click();
        item.scrollIntoView();
        break;
      }
    }
  }
});
