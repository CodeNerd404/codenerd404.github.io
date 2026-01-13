# CodeNerd404.github.io

这是为 GitHub Pages 创建的站点，包含媒体相关工具的演示页，主要演示“图片加水印”功能。

功能说明：
- 页面会尝试从你的仓库 `CodeNerd404/watermark-tool` 通过 jsDelivr 加载前端脚本（常见路径为 `dist/watermark.js`）。如果该脚本存在并导出了 `window.watermarkTool.apply`，页面会优先使用该方法进行水印处理。
- 如果外部脚本不可用，页面将使用内置的 Canvas 回退实现（browser-side），支持批量图片加水印并自动下载已处理文件。

集成建议：
- 在 `CodeNerd404/watermark-tool` 仓库中把前端打包产物放到 `dist/watermark.js`，并保证它暴露 `window.watermarkTool.apply` 方法，接收 (File|HTMLImageElement, options) 并返回 Blob 或 dataURL。
- 或者把你想要使用的前端脚本直接复制到本仓库的 `assets/js/` 目录并在 `index.html` 中引入。

部署：
- 建议将仓库 main 分支作为 Pages 源（根目录）。启用后几分钟内生效，网址为 https://CodeNerd404.github.io
``` ````

文件：LICENSE
```text name=LICENSE
MIT License

Copyright (c) 2026 CodeNerd404

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

部署方案（任选其一）
A — 推荐：用 GitHub CLI（gh）一键创建并推送（简单，交互少）
1. 在本地新目录保存上面文件（保持目录结构： assets/js/batch-watermark.js）。
2. 在终端登录 gh： gh auth login
3. 创建 repo（公有）并初始化：
   gh repo create CodeNerd404/CodeNerd404.github.io --public --confirm
4. 提交并推送：
   git init
   git checkout -b main
   git add .
   git commit -m "Initial GitHub Pages site with watermark tool integration"
   git branch -M main
   git remote add origin git@github.com:CodeNerd404/CodeNerd404.github.io.git
   git push -u origin main
5. 启用 Pages（gh 命令）：
   gh api -X PUT repos/CodeNerd404/CodeNerd404.github.io/pages -f source='{"branch":"main","path":"/"}'
6. 等待约 1~2 分钟后访问：https://CodeNerd404.github.io

B — 如果你不能/不想用 gh：用 Git + GitHub API（需要 GITHUB_TOKEN，有 repo 权限）
1. 本地把文件放好，执行：
   git init
   git checkout -b main
   git add .
   git commit -m "Initial GitHub Pages site with watermark tool integration"
   git remote add origin https://github.com/CodeNerd404/CodeNerd404.github.io.git
   git push -u origin main
2. 使用环境变量 GITHUB_TOKEN（需 repo scope），执行：
   curl -X PUT \
     -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/CodeNerd404/CodeNerd404.github.io/pages \
     -d '{"source":{"branch":"main","path":"/"}}'
   或者：
   gh api -X PUT repos/CodeNerd404/CodeNerd404.github.io/pages -f source='{"branch":"main","path":"/"}'

C — Web UI（如果你愿意通过网页操作）
1. 在 GitHub 新建仓库（Repository name: CodeNerd404.github.io，Public）。
2. 上传文件（Upload files）或通过 GitHub 网页编辑器新建目录/文件（建议一次上传整个打包好的目录）。
3. 在 Settings → Pages 中选择 Branch = main、Folder = /（root），保存。
4. 等待站点生效并访问：https://CodeNerd404.github.io

关于 watermark-tool 的集成（关键细节）
- 我在 index.html 中已经写了尝试通过 jsDelivr 加载外部脚本的逻辑，URL 是：
  https://cdn.jsdelivr.net/gh/CodeNerd404/watermark-tool@main/dist/watermark.js
- 为了让 jsDelivr 可用，请确保：
  - watermark-tool 仓库是 public（你已确认）。
  - 在 main 分支下存在 dist/watermark.js（或你可以改为其他路径并相应修改 index.html）。
  - 前端脚本需在全局暴露 window.watermarkTool.apply，约定：
    async function apply(input, options) -> 返回 Blob 或 dataURL（字符串）。其中 input 可以是 File、Blob、或 HTMLImageElement，options 包括 text, opacity, position 等。页面检测到该方法存在会优先调用它。
- 如果你已经在 watermark-tool 中准备好该文件并推送，就可以直接使用 jsDelivr；如果你希望我把 watermark-tool 的 dist 文件也复制到 Pages 仓库中，请把 dist/watermark.js 的内容贴在回复里，或把我加为该仓库的协作者并允许我访问（否则我无法直接从这里读取该仓库的内容）。

我现在能做的（你选择后我会继续执行）
- 如果你已经创建并推送仓库（或让我操作已存在 repo），回复“仓库已存在，继续在仓库写入文件”，我会在确认后尝试用写入工具将文件推到 main（注意：我之前尝试写入时受限于权限，若仓库已存在并允许我写入我可以继续尝试）。
- 如果你希望自己运行脚本，请选择方案 A/B/C 并把执行结果（成功/失败与错误信息）贴过来，我会立即帮你检查并完成剩余工作（比如确认 Pages 设置、检查 jsDelivr 是否能拉取 watermark.js、或把 dist 文件内嵌到 Pages 仓库）。

下一步建议（最小阻力）
1. 在本地用 gh 执行方案 A（最快）；或
2. 把 watermark-tool 仓库中 dist/watermark.js 的内容直接贴到回复，我可以把它合并到 Pages 打包并给你一个完整仓库上传包（如果你更想我把文件打包给你直接上传）。

你想先我做哪件事？（回复数字或短语）
1) 我现在尝试把文件推到已有仓库 CodeNerd404/CodeNerd404.github.io（请确认该仓库已存在并允许我写入）；
2) 给你一个一键部署脚本（包含 gh / curl）让我你自己运行（我已经给出命令，是否需要我把它做成可执行脚本文件？）；
3) 我把上面文件打包为 ZIP 并提供下载内容（你手动上传到 GitHub）；
4) 其它（例如我先帮你检查 watermark-tool 的 dist 路径是否就绪 — 若同意请先把该仓库设置为 public，然后我来检查并验证 jsDelivr 可用性）。

把你要的选项发给我，我立刻继续。
