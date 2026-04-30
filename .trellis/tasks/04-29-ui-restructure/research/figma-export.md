# 研究：Figma 设计稿导出方案

- **查询**: 研究 HTML/CSS 转 Figma 设计稿的可行方案，用于 AI 设计应用导出功能
- **范围**: 外部（第三方库、API、插件生态）
- **日期**: 2026-04-29

---

## 核心发现：Figma REST API 是只读的

**这是最关键的约束。** Figma REST API 对文件内容（files、nodes、styles 等设计内容）仅提供读取能力，不支持通过 API 创建或写入设计节点。

当前 REST API 支持写入的范围仅限于：
- 评论和评论反应（comments）
- 变量（variables）的创建/更新/删除
- 开发资源（dev resources）

这意味着**无法通过 REST API 直接创建 Figma 文件或设计节点**。所有"将 HTML 转为 Figma 设计"的方案，都必须借助插件运行时、剪贴板或手动导入。

---

## 方案一：code.to.design API（Clipboard 模式）

### 概述

code.to.design 是由 divriots 公司开发的商业 API 服务，是其 html.to.design Figma 插件（35万+用户）的底层技术。提供两种模式，其中 **Clipboard 模式**最适合我们的场景。

### 工作原理（Clipboard 模式）

1. 后端将 HTML+CSS 字符串发送到 `POST https://api.to.design/html`，设置 `clip: true`
2. API 返回 Figma 剪贴板格式的数据（model + images）
3. 前端将数据加载到系统剪贴板
4. 用户在 Figma 中 `Ctrl+V` 粘贴，即可得到可编辑的 Figma 设计层

### API 调用示例

```typescript
// 后端调用（API Key 必须在服务端，不能暴露给客户端）
const response = await fetch("https://api.to.design/html", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_KEY_HERE"
  },
  body: JSON.stringify({
    html: `<style>${CSS}</style>${HTML}`,
    clip: true,           // Clipboard 模式
    width: 1280,          // 视口宽度（可选）
    height: 720,          // 视口高度（可选）
    theme: "light",       // 或 "dark"
    fullsizeImages: false  // 是否保留原始图片分辨率
  }),
});

const { model, images } = await response.json();
```

### 前端剪贴板加载

```typescript
// 注意：document.execCommand('copy') 必须在用户交互后 5 秒内触发
// 所以必须先获取 API 数据，再显示"复制到剪贴板"按钮
```

### 定价

- 按 credit 计费：1 credit / 次调用
- Credit 包需购买，有效期 12 个月
- 具体价格需查看 code.to.design 官网 Pricing 页面

### 优势

- **不需要 Figma 插件**：Clipboard 模式完全不依赖 Figma 插件
- **可编辑层**：转换结果是可编辑的 Figma 图层，非截图
- **生产级质量**：已支撑 35万+ 用户的 Figma 插件
- **集成简单**：后端一个 HTTP 调用 + 前端剪贴板操作
- **支持 CSS 属性广泛**：box-sizing、stacking context、shadow DOM、渐变、SVG、图片资源等

### 限制

- 商业服务，需付费（按调用次数）
- 用户需要手动在 Figma 中粘贴（不是全自动）
- 依赖第三方服务的可用性
- 剪贴板操作必须在用户交互 5 秒内触发
- 转换精度约为 90%，仍需少量手动调整

### 相关链接

- [code.to.design API 文档](https://docs-code.to.design/api)
- [Clipboard 模式文档](https://docs-code.to.design/clipboard-mode)
- [code.to.design 官网](https://code.to.design/)

---

## 方案二：@builder.io/html-to-figma npm 包

### 概述

由 Builder.io 开发的开源 npm 包，可在浏览器端将 DOM 元素转换为 Figma 兼容的 JSON 结构。

### 工作原理

1. 在浏览器中调用 `htmlToFigma(domElement)` 解析 DOM 树
2. 生成 Figma 兼容的 JSON 层级结构
3. 该 JSON 需要通过 Figma 插件上传到 Figma 画布，或通过 Builder.io API 端点处理

### 安装与使用

```bash
npm install @builder.io/html-to-figma
```

```typescript
import { htmlToFigma } from '@builder.io/html-to-figma';

// 在浏览器环境中
const layers = htmlToFigma(document.body);
// layers 是 Figma 兼容的 JSON 结构
// 可以发送到 REST API，或生成 .figma.json 通过 Figma 插件上传
```

### 优势

- 开源免费
- 可在代码中直接调用（浏览器端）
- 不依赖外部 API 服务

### 限制

- **严重维护问题**：最新版本 0.0.3，最后发布于 4+ 年前（约 2022 年），项目已迁移到 Chrome 扩展方向
- **需要 Figma 插件才能渲染**：生成的 JSON 不能直接导入 Figma，必须通过配套的 Figma 插件
- **转换精度有限**：已知问题包括——
  - 所有字体必须上传到 Figma，否则使用回退字体
  - 不支持所有媒体类型（video、animated gif 等）
  - 不支持所有 CSS 属性
  - 不支持 iframe、伪元素等
- **与我们的场景冲突**：我们的 HTML 渲染在 iframe sandbox 中，htmlToFigma 需要访问实际 DOM

### 相关链接

- [npm: @builder.io/html-to-figma](https://www.npmjs.com/package/@builder.io/html-to-figma)
- [GitHub: BuilderIO/figma-html](https://github.com/BuilderIO/figma-html)（已归档/迁移）

---

## 方案三：其他 html-to-figma npm 包

### 3a. html-figma（sergcen/olliethedev）

```
npm i html-figma
```

- 分为浏览器端（`html-figma/browser`）和 Figma 插件端（`html-figma/figma`）
- 浏览器端：`htmlTofigma(element)` 将 DOM 元素转为 Figma 节点数据
- 插件端：`addLayersToFrame(layersMeta, rootNode)` 将数据写入 Figma 画布
- olliethedev 的 fork 增加了 auto-layout 支持，最新版本 0.4.7（2024-02）
- **仍需 Figma 插件**才能将结果渲染到画布

### 3b. @figr-design/html-to-figma（最新，2026-01）

```
npm install @figr-design/html-to-figma
```

- 2026 年 1 月发布，最新最活跃
- 将 HTML 元素转为 Figma 兼容节点结构，支持样式、渐变、SVG、图片
- 仍需配合 Figma 插件使用，返回的是数据结构而非直接可粘贴的内容
- 周下载量极低（约 4 次），生态不成熟
- MIT 许可证，0 依赖

### 评估

这两个包的共同问题是：**都需要运行在 Figma 插件环境中**才能将数据写入画布。它们本身只做 DOM → Figma 数据结构的转换，不能独立完成"导出到 Figma"的完整流程。

---

## 方案四：截图/PNG 导入（降级方案）

### 工作原理

1. 在 iframe sandbox 中渲染 HTML/CSS
2. 使用 `html2canvas` 或浏览器截图 API 捕获渲染结果
3. 用户将 PNG/SVG 下载后手动导入 Figma
   - 或通过 Figma REST API 的图片上传功能

### 可用的截图工具

- `html2canvas` — 前端截图库，对 CSS 支持有限
- `dom-to-image` / `html-to-image` — 基于 SVG foreignObject 的截图
- Puppeteer / Playwright — 服务端无头浏览器截图，精度最高
- 浏览器原生 `Element.getClientRects()` + Canvas API

### 优势

- 实现最简单，技术风险最低
- 不依赖任何第三方服务或 API
- 对 HTML/CSS 复杂度没有限制
- 任何能渲染的内容都能截图

### 限制

- **不可编辑**：导入 Figma 后是光栅图片，无法修改文字、颜色、布局
- **失去设计语义**：没有图层结构，没有组件，没有样式信息
- **分辨率受限**：需要处理 DPR（设备像素比）以获得清晰图片
- **不符合"设计稿"的预期**：用户通常期望得到可编辑的设计文件

### 适用场景

- 作为快速预览/分享的临时方案
- 当其他方案不可用时的 fallback
- 仅需视觉效果参考，不需要编辑

---

## 方案五：Figma Plugin 方案（用户自行安装插件）

### 概述

引导用户在 Figma 中安装 html.to.design 或 HTMLtoFigma 等插件，然后手动操作导入。

### html.to.design 插件（divriots）

- Figma 社区插件，支持 URL 和 HTML 代码两种输入
- 转换精度高，支持 auto layout、本地样式、变量、hover 状态
- 背后就是 code.to.design 技术
- 2025 年 3 月新增了 HTML 代码标签页，可直接粘贴 HTML/CSS

### HTMLtoFigma 插件（htmltofigma.com）

- 免费插件 + Chrome 扩展
- 支持 URL 和 HTML 代码导入
- 目前处于免费 early access 阶段

### 优势

- 用户得到最高质量的转换结果
- 不需要我们处理任何 Figma 集成
- 插件生态成熟，用户可能有使用经验

### 限制

- 用户必须安装 Figma 插件（体验不连贯）
- 无法在我们的应用内一键导出
- 每次导出都需要手动复制 HTML → 打开 Figma → 运行插件 → 粘贴代码
- 依赖用户自行学习和操作

---

## 方案对比矩阵

| 维度 | code.to.design API (Clipboard) | @builder.io/html-to-figma | html-figma / @figr-design | 截图/PNG | Figma 插件引导 |
|---|---|---|---|---|---|
| **可编辑图层** | 是 | 是（需插件） | 是（需插件） | 否 | 是 |
| **自动化程度** | 半自动（一键复制+手动粘贴） | 需插件配合 | 需插件配合 | 手动下载+导入 | 完全手动 |
| **集成复杂度** | 低（HTTP API） | 中 | 中 | 低 | 无需集成 |
| **第三方依赖** | code.to.design 服务 | 无（开源） | 无（开源） | 无 | Figma 插件 |
| **成本** | 按 credit 付费 | 免费 | 免费 | 免费 | 免费 |
| **转换精度** | 高（~90%） | 中（~70%） | 中 | 100% 视觉 | 高（~90%） |
| **维护状态** | 活跃 | 停止维护 | 低活跃 | N/A | 活跃 |
| **iframe 兼容** | 需提取 HTML 字符串 | 需访问 DOM | 需访问 DOM | 需渲染 | 需复制 HTML |

---

## 推荐方案

### 第一推荐：code.to.design API（Clipboard 模式）

**理由：**
- 最符合"一键导出到 Figma"的产品体验
- 不需要 Figma 插件，不依赖 DOM 访问（直接传 HTML 字符串）
- 转换质量高，结果为可编辑图层
- 集成简单：后端一个 HTTP 调用 + 前端剪贴板 API

**实施路径：**
1. 用户点击"导出到 Figma"按钮
2. 前端提取 iframe 中的 HTML/CSS 代码（已有 AI 生成的源码）
3. 后端调用 `POST https://api.to.design/html`（clip: true）
4. 返回数据加载到剪贴板
5. 提示用户在 Figma 中 Ctrl+V 粘贴
6. 自动打开 Figma（figma.new）方便用户操作

**风险：** 商业服务成本、第三方可用性依赖

### 第二推荐：截图/PNG + 结构化元数据（混合方案）

**理由：**
- 作为 code.to.design 不可用时的降级方案
- 截图保证 100% 视觉保真
- 可同时导出 HTML 源码，方便用户手动在 Figma 插件中导入

**实施路径：**
1. 用户点击"导出到 Figma"
2. 服务端使用 Playwright 无头浏览器渲染 HTML 并截图
3. 同时将 HTML/CSS 源码打包
4. 提供 PNG 下载 + 复制 HTML 代码的选项
5. 引导用户使用 html.to.design 插件手动导入

### 第三推荐：自研轻量转换 + Figma Plugin 沙盒

**理由：**
- 如果需要完全无第三方依赖
- 参考 @figr-design/html-to-figma 的思路，自研 DOM → Figma 节点映射
- 但**可行性较低**，因为 Figma 不允许通过 API 写入设计内容，必须运行在 Figma 插件环境中

**不推荐的原因：**
- 维护成本极高
- Figma 插件运行环境限制严格
- 社区已有成熟方案，没必要重复造轮子

---

## 补充信息：Figma REST API 写入能力详情

截至 2026 年 4 月，Figma REST API 支持的写入操作仅限于：

| 可写入 | 不可写入 |
|---|---|
| 评论（POST/DELETE comments） | 创建文件 |
| 评论反应（POST/DELETE reactions） | 创建/修改设计节点 |
| 变量（POST variables） | 创建样式 |
| 开发资源（POST dev_resources） | 创建组件 |
| Webhooks | 创建画布/页面 |

认证方式：
- **Personal Access Token (PAT)**：适合个人脚本，在 `X-Figma-Token` header 中传递
- **OAuth 2.0**：适合多用户应用，需在 figma.com/developers 注册应用并申请 scope
- **Plan Access Token**：组织级 token，2025 年新增

速率限制（2025 年 11 月 17 日起生效）：
- Tier 1（读取文件）：Dev/Full seat 最高 20/min
- Tier 2（评论、变量等）：Dev/Full seat 最高 100/min
- Tier 3（组件、样式等）：Dev/Full seat 最高 150/min

---

## 注意事项

1. **Figma REST API 无法创建设计内容**是所有方案的根本约束。不要在 REST API 方向上投入时间。
2. **code.to.design Clipboard 模式**是目前唯一可行的"应用内一键导出"方案。
3. 所有开源 npm 包（@builder.io/html-to-figma、html-figma、@figr-design/html-to-figma）都需要 Figma 插件运行环境才能写入画布，不适合我们的场景。
4. 我们的 HTML 渲染在 iframe sandbox 中，这意味着不能直接用需要 DOM 访问的库。但我们已经有 AI 生成的 HTML/CSS 源码，可以直接作为字符串传递给 API。
