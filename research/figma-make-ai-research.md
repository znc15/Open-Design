# Research: Figma Make AI 与竞品对比分析

- **Query**: Figma Make AI features capabilities, AI design tools comparison v0.dev Lovable Bolt.new Galileo AI Uizard
- **Scope**: 外部 (产品功能与市场调研)
- **Date**: 2026-04-29

---

## 一、Figma Make AI 概述

### 1.1 产品定位

Figma Make 是 Figma 于 2025 年 5 月在 Config 2025 大会上推出的 AI 驱动 prompt-to-app 工具。它允许用户通过自然语言描述，将现有设计转换为可交互原型、功能完整的 Web 应用程序。

**核心价值主张**:
- 从静态设计到可交互原型的快速转换
- 保持设计系统一致性的 AI 生成
- 与 Figma 生态深度集成（Design、Sites、Dev Mode）

### 1.2 核心功能

| 功能模块 | 描述 |
|---------|------|
| **AI Chat** | 通过自然语言对话生成/修改原型和应用 |
| **Interactive Prototyping** | 将静态设计转换为完全交互的原型，支持动画、按钮交互、实时反馈 |
| **Dynamic Data** | 上传文件、动态可视化数据，模拟真实应用场景 |
| **Responsive Adaptations** | 跨设备响应式适配，从移动端生成桌面版本 |
| **Point and Edit** | 指向特定元素并用自然语言描述修改，精确控制变更 |
| **Code Editor** | 内置代码编辑器，支持手动修改代码，可粘贴自有代码 |
| **Supabase 集成** | 连接后端服务，实现用户认证、数据存储、私有 API |
| **Design-to-Canvas** | 将 Make 预览复制为可编辑的 Figma Design 图层 |

### 1.3 Make Kits (设计系统集成)

2026 年 4 月发布，是 Figma Make 的核心差异化功能：

**功能描述**:
- 将生产级 React 设计系统组件包导入 Figma Make
- 支持 npm 公共仓库和 Figma 私有仓库
- 包含 guidelines.md 教导 AI 如何正确使用组件
- 可导入 Figma 库的样式、变量和设计 tokens

**技术要求**:
- 目前仅支持 React 代码库
- 需要将设计系统发布为 npm package
- 私有包仅限 Organization/Enterprise 计划

### 1.4 Make Attachments (项目上下文)

支持附加文件类型：
- PDF、Markdown、CSV、JSON 数据集
- 截图、品牌指南、法律文案
- 图片、媒体、SVG

### 1.5 技术架构

| 层级 | 技术 |
|------|------|
| AI 模型 | Claude 3.7 Sonnet (计划引入更多模型) |
| 前端框架 | React |
| 后端集成 | Supabase (认证、数据库、存储) |
| 发布平台 | Figma Sites、自定义域名 (2025 年免费) |

### 1.6 定价与 AI Credits

| 计划 | Full Seat 月费 | AI Credits/月 |
|------|---------------|---------------|
| Starter (免费) | - | 150/天 (上限 500/月) |
| Professional | EUR 16 | 3,000 |
| Organization | EUR 55 | 3,500 |
| Enterprise | EUR 90 | 4,250 |

**Seat 权限说明**:
- Full Seat: 完整 Make 功能，可发布分享
- Dev/Collab/View Seat: 仅限 drafts 中使用，不可分享

---

## 二、竞品分析

### 2.1 v0 by Vercel

#### 核心定位
面向 React/Next.js 开发者的 UI 代码生成工具，强调生产就绪的组件输出。

#### 主要功能
| 功能 | 描述 |
|------|------|
| Text-to-UI | 自然语言生成 React/Tailwind/shadcn UI |
| Screenshot-to-Code | 上传截图生成对应代码 |
| Figma Import | 提取 Figma 设计 tokens，保持设计一致性 |
| Design Mode | 可视化编辑面板，调整间距、颜色、布局 |
| v0 API | OpenAI 兼容 API，可集成到 CI/CD |
| Full-Stack Apps | 支持后端功能，连接数据库 |

#### 定价 (2026)
| 计划 | 月费 | Credits | 核心特性 |
|------|------|---------|----------|
| Free | $0 | $5 credits | 7 messages/天，200 projects |
| Premium | $20 | $20 credits | 无限项目，Figma 导入，API 访问 |
| Team | $30/用户 | $30/用户 + $2 daily bonus | 共享 credits，团队协作 |
| Business | $100/用户 | $30/用户 | 训练数据 opt-out |
| Enterprise | 自定义 | 自定义 | SAML SSO, RBAC, SLA |

#### 模型定价 (Token-based)
| 模型 | Input | Output | 适用场景 |
|------|-------|--------|----------|
| v0 Mini | $1/1M | $5/1M | 简单修改、快速修复 |
| v0 Pro | $3/1M | $15/1M | 大多数开发任务 |
| v0 Max | $5/1M | $25/1M | 复杂逻辑、多文件生成 |

#### 技术栈输出
- React + Next.js
- Tailwind CSS
- shadcn/ui 组件库

### 2.2 Lovable

#### 核心定位
全栈 AI 应用构建平台，强调从 prompt 到可部署应用的完整流程。

#### 主要功能
| 功能 | 描述 |
|------|------|
| AI App Builder | 自然语言生成完整应用 (前端+后端+数据库) |
| Lovable Cloud | 内置后端基础设施 (数据库、认证、文件存储) |
| Lovable AI | 无需 API Key 即可添加 AI 功能到应用 |
| Dev Mode | 直接编辑代码 |
| Visual Editor | 可视化样式编辑 |
| GitHub Sync | 代码同步到 GitHub |
| Domain Purchase | 内置域名购买和连接 |

#### Lovable AI 功能
- AI 摘要、聊天机器人
- 情感分析、文档 Q&A
- 内容生成、多语言翻译
- 图像/文档分析
- 工作流自动化

#### 定价 (2026)
| 计划 | 月费 | 核心特性 |
|------|------|----------|
| Free | $0 | 5 messages/天 |
| Pro | $25 | 无限应用，私有仓库，自定义域名 |
| Teams | $30/用户 | 共享工作区，SSO，SCIM |

#### 技术栈
- 前端: React + TypeScript + Tailwind
- 后端: Supabase
- AI 模型: Claude (核心) + Gemini (Lovable AI)

#### 企业认证
- SOC 2 Type II
- ISO 27001:2022
- GDPR 合规

### 2.3 Bolt.new

#### 核心定位
基于 WebContainer 技术的浏览器内全栈应用构建器，无需本地环境配置。

#### 主要功能
| 功能 | 描述 |
|------|------|
| Browser-Based Dev | 完全在浏览器中构建、运行、部署应用 |
| WebContainer | 浏览器内 Node.js 运行时 |
| Full-Stack Generation | 前端+后端+数据库 Schema 一体生成 |
| Multi-Model Support | 可选择不同 AI 模型 |
| One-Click Deploy | 一键部署到 Netlify/Vercel |
| Full Code Access | 完整代码可见可编辑，支持下载 ZIP |

#### 定价 (2026)
| 计划 | 月费 | Tokens | 核心特性 |
|------|------|--------|----------|
| Free | $0 | 1M/月 (300K daily cap) | 公私项目，hosting，无限数据库 |
| Pro | $25 | 10M/月 | 无日限制，自定义域名，AI 图像编辑 |
| Teams | $30/成员 | 10M/成员 | 团队管理，私有 NPM，设计系统集成 |
| Enterprise | 自定义 | 自定义 | SSO, 审计日志, 专属支持 |

#### 技术特点
- WebContainer 技术 (浏览器内运行 Node.js)
- Claude Sonnet 作为主要模型
- 支持多框架 (React, Vue, Svelte)

### 2.4 Google Stitch (原 Galileo AI)

#### 背景信息
- 2025 年 5 月 Google 收购 Galileo AI
- 产品更名为 Stitch，并入 Google Labs
- 从付费工具转为免费产品

#### 主要功能 (Stitch 2.0, 2026 年 3 月)
| 功能 | 描述 |
|------|------|
| Text-to-UI | 自然语言生成高保真 UI 设计 |
| Image-to-UI | 上传草图/截图/线框图转换为数字 UI |
| Voice Canvas | 语音命令实时设计迭代 |
| Multi-Screen Generation | 一次生成 5 个关联屏幕 |
| Prototypes | 连接屏幕创建可交互原型 |
| DESIGN.md | Markdown 格式的设计系统规范 |
| Figma Export | 一键粘贴到 Figma |
| Code Export | HTML/CSS, Tailwind, React, Claude Code |

#### 定价
- **完全免费** (Google Labs 产品)
- 350 标准生成/月 + 200 实验性生成/月
- 每日 credit 限制

#### 技术架构
- 底层模型: Gemini 2.5 Pro / Gemini 3
- MCP Server + 公开 SDK
- Agent Skills 可扩展架构

### 2.5 Uizard

#### 核心定位
面向非设计师的快速原型工具，强调从文本/草图到可编辑原型的转换。

#### 主要功能
| 功能 | 描述 |
|------|------|
| Autodesigner 2.0 | 文本生成多屏幕原型 |
| Screenshot Scanner | 截图转换为可编辑设计 |
| Wireframe Scanner | 手绘线框图数字化 |
| Theme Generator | 快速生成主题 |
| Real-time Collaboration | 实时多人协作 |
| Code Export | React/CSS 开发者交接 |

#### 定价 (2026)
| 计划 | 月费 | AI 生成 | 项目数 |
|------|------|---------|--------|
| Free | $0 | 3/月 (Autodesigner 1.5) | 2 |
| Pro | $12 (年付) | 500/月 (Autodesigner 2.0) | 100 |
| Business | $39 (年付) | 5,000/月 | 无限 |
| Enterprise | 自定义 | 无限 | 无限 |

#### 收购背景
- 2024 年 5 月被 Miro 收购
- 仍作为独立产品运营

---

## 三、竞品对比表格

### 3.1 核心功能对比

| 维度 | Figma Make | v0 | Lovable | Bolt.new | Stitch | Uizard |
|------|-----------|-----|---------|----------|--------|--------|
| **输出类型** | 原型+代码 | 代码 | 完整应用 | 完整应用 | 设计+代码 | 原型 |
| **前端框架** | React | React/Next.js | React | React/Vue/Svelte | HTML/React | - |
| **后端支持** | Supabase | 部分 | 完整 (Cloud) | 完整 | 无 | 无 |
| **设计系统集成** | Make Kits | Design tokens | 有限 | Design System KB | DESIGN.md | Brand Kit |
| **Figma 集成** | 原生 | Figma Import | Figma Import | Figma Import | Figma Export | Figma Export |
| **代码编辑器** | 有 | 有 | 有 (Dev Mode) | 有 | 无 | 无 |
| **协作功能** | 有 | Team Plan | Teams Plan | Teams Plan | 有 | 有 |
| **企业安全** | SSO, SCIM | SSO, RBAC | SSO, SCIM, SOC2 | SSO | - | SSO |

### 3.2 定价对比

| 工具 | 免费计划 | 入门付费 | 团队计划 | 企业计划 |
|------|---------|---------|---------|---------|
| Figma Make | 150 credits/天 | EUR 16/月 (Full Seat) | EUR 55/月 (Org) | EUR 90/月 (Ent) |
| v0 | $5 credits/月 | $20/月 | $30/用户/月 | $100/用户/月 |
| Lovable | 5 messages/天 | $25/月 | $30/用户/月 | 自定义 |
| Bolt.new | 1M tokens/月 | $25/月 | $30/成员/月 | 自定义 |
| Stitch | **完全免费** | - | - | - |
| Uizard | 3 生成/月 | $12/月 | $39/月 | 自定义 |

### 3.3 适用场景对比

| 场景 | 推荐工具 | 理由 |
|------|---------|------|
| 设计师探索原型 | Figma Make / Stitch | 与设计工作流深度集成 |
| React 组件开发 | v0 | 最高质量 React 代码输出 |
| 快速 MVP 构建 | Lovable / Bolt.new | 完整全栈能力 |
| 非设计师快速原型 | Uizard | 最低学习曲线 |
| 免费 UI 探索 | Stitch | 完全免费，高质量输出 |
| 企业设计团队 | Figma Make (Enterprise) | Make Kits 设计系统集成 |

### 3.4 优势与限制

| 工具 | 核心优势 | 主要限制 |
|------|---------|---------|
| Figma Make | 设计系统集成 (Make Kits)、Figma 生态无缝集成 | 仅支持 React、需 Full Seat |
| v0 | 最高质量 React 代码、API 可集成、shadcn/ui | 前端为主、Token 成本可累积 |
| Lovable | 完整全栈、企业合规、内置 AI 功能 | 代码质量参差、扩展性有限 |
| Bolt.new | 浏览器内完整开发环境、多框架支持 | Token 消耗快、成本易超预算 |
| Stitch | 完全免费、Gemini 3 驱动、语音交互 | 实验性产品、生产代码有限 |
| Uizard | 非设计师友好、草图转换、最低成本 | 设计质量一般、无代码输出 |

---

## 四、技术栈总结

| 工具 | AI 模型 | 前端技术 | 后端技术 | 部署平台 |
|------|---------|---------|---------|---------|
| Figma Make | Claude 3.7 Sonnet | React | Supabase | Figma Sites |
| v0 | 自研模型 (基于 Claude) | React, Next.js, Tailwind, shadcn | Vercel | Vercel |
| Lovable | Claude + Gemini | React, TypeScript, Tailwind | Supabase | 内置 + GitHub |
| Bolt.new | Claude Sonnet (可选) | React/Vue/Svelte | 内置 (WebContainer) | Netlify/Vercel |
| Stitch | Gemini 2.5 Pro / Gemini 3 | HTML/CSS, Tailwind, React | 无 | Figma/GitHub |
| Uizard | Autodesigner (自研) | - | 无 | 内置 |

---

## 五、用户评价与市场定位

### 5.1 各工具目标用户

| 工具 | 主要用户群体 | 技术门槛 |
|------|-------------|---------|
| Figma Make | 设计师、产品经理、设计系统团队 | 低-中 |
| v0 | React/Next.js 开发者 | 中 |
| Lovable | 创业者、独立开发者、产品经理 | 低 |
| Bolt.new | 全栈开发者、快速原型团队 | 中 |
| Stitch | 设计师、早期探索者 | 低 |
| Uizard | 非设计师、产品经理、学生 | 极低 |

### 5.2 市场趋势观察

1. **代码 vs 设计输出分化**:
   - v0、Lovable、Bolt.new 强调代码输出
   - Stitch、Uizard 强调设计输出
   - Figma Make 兼具两者

2. **设计系统集成成为差异化**:
   - Figma Make Kits 支持导入生产级 React 组件
   - v0 支持 Figma design tokens
   - Stitch 引入 DESIGN.md 格式

3. **免费 vs 付费策略**:
   - Stitch 完全免费 (Google Labs)
   - 其他工具均采用 freemium 模式

4. **企业功能竞争**:
   - Lovable 最完整企业认证 (SOC2, ISO27001, GDPR)
   - Figma/v0/Bolt 提供 SSO、RBAC

---

## 六、参考资料

### 官方文档
- [Figma Make 官方文档](https://developers.figma.com/docs/code/intro-to-figma-make/)
- [Figma Make 博客](https://figma.com/blog/introducing-figma-make)
- [v0 官方文档](https://v0.dev/docs/pricing)
- [Lovable 文档](https://docs.lovable.dev/)
- [Bolt.new 定价](https://bolt.new/pricing)
- [Google Stitch](https://stitch.withgoogle.com/)
- [Uizard 定价](https://uizard.com/pricing/)

### 第三方评测
- [Best AI Tools for UI/UX Design in 2026](https://www.idlen.io/blog/best-ai-tools-ui-ux-design-2026/)
- [Best v0 Alternatives (2026 Tested)](https://aidesigner.ai/blog/v0-alternatives)
- [Google Stitch 2.0 Review](https://computertech.co/google-stitch-review/)

---

## 七、总结与建议

### 7.1 工具选择建议

**如果需要...**
- 保持设计系统一致性 → **Figma Make** (Make Kits 是核心优势)
- 生产级 React 代码 → **v0** (代码质量最高)
- 快速构建完整 MVP → **Lovable** 或 **Bolt.new**
- 免费探索 UI 概念 → **Stitch** (完全免费)
- 非设计师快速出原型 → **Uizard** (最低门槛)

### 7.2 Figma Make 的核心差异化

1. **Make Kits**: 唯一支持导入生产级 React 组件包的 AI 设计工具
2. **设计系统集成**: Guidelines.md 教导 AI 正确使用组件
3. **生态整合**: 与 Figma Design/Sites/Dev Mode 无缝集成
4. **Point & Edit**: 直观的指向式交互修改

### 7.3 潜在风险

- Figma Make 仅支持 React，Vue/Svelte 用户需考虑其他工具
- AI Credits 消耗机制可能带来成本不可控风险
- 各工具生成代码质量参差，生产环境需人工审查
