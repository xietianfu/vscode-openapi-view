# OpenAPI View

在 VS Code 中预览 OpenAPI 3.x 文档，并快速搜索接口。

## 功能

- 预览当前打开的 OpenAPI JSON/YAML 文件
- 左侧按 Tag 分组的接口列表，支持过滤搜索
- 侧边栏支持拖拽调整宽度、折叠/展开（自动记忆）
- 详情页展示参数、请求体、响应（含更易读的 Schema 表格与树形展开）

## 使用

### 预览

1. 打开一个 OpenAPI 规范文件（`*.json` 或 `*.yaml`）
2. 通过命令面板运行：
   - `OpenAPI: Preview`
3. 或在编辑器标题栏点击 `OpenAPI: Preview`

### 搜索接口

打开 OpenAPI 文件后，通过命令面板运行：

- `OpenAPI: Search Interfaces`

将弹出列表，可按 summary/path/方法等关键词搜索，选择后会在预览页定位并打开对应接口。

## 个人打赏

如果这个项目对你有帮助，欢迎请我喝杯咖啡：

<!-- ![Alipay](./alipay.jpg)
![WeChat](./wepay.jpg) -->

<div style="display: flex; justify-content: center; gap: 20px;">
  <img src="./alipay.jpg" width="400" style="display:inline-block"/>
  <img src="./wexinpay.jpg" width="400" style="display:inline-block"/>
</div>

## License

MIT License，详见 [LICENSE](LICENSE)。

---

# OpenAPI View

Preview OpenAPI 3.x specs in VS Code and quickly search operations.

## Features

- Preview the currently opened OpenAPI JSON/YAML file
- Tag-grouped sidebar with filter
- Resizable & collapsible sidebar (state persisted)
- Rich operation details: parameters, request body, responses, and readable schema tables

## Usage

- Open an OpenAPI spec file (`*.json` / `*.yaml`)
- Run:
  - `OpenAPI: Preview`
  - `OpenAPI: Search Interfaces`

## Donation

If you find this helpful, consider supporting the project:

- GitHub Sponsors: replace with your link
- Alipay/WeChat: add your QR code links in this README

## License

MIT, see [LICENSE](LICENSE).
