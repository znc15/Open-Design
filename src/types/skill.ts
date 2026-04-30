/**
 * Skill 类型定义
 * Skill 定义了一个系统提示模板，可注入到对话上下文中
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  /** system prompt 模板，支持 {{variable}} 占位符 */
  systemPrompt: string;
  /** 模板变量定义 */
  variables?: SkillVariable[];
  /** 关联的模型配置建议（可选） */
  suggestedModel?: {
    provider: "openai" | "ollama" | "anthropic";
    model: string;
  };
  /** 是否为内置 skill（不可删除） */
  builtin: boolean;
  /** 图标名称（lucide-react 图标） */
  icon?: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

export interface SkillVariable {
  name: string;
  label: string;
  defaultValue: string;
  description?: string;
}

/**
 * 内置 front-design skill
 * 专注于前端 UI 设计生成，类似 Claude 的 artifacts 风格
 */
export const FRONT_DESIGN_SKILL: Skill = {
  id: "builtin-front-design",
  name: "前端设计",
  description: "专注前端 UI 设计生成，生成高质量的 HTML/CSS/JS 代码",
  icon: "Palette",
  builtin: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  variables: [
    {
      name: "framework",
      label: "框架",
      defaultValue: "vanilla",
      description: "目标框架：vanilla / react / vue",
    },
    {
      name: "style",
      label: "设计风格",
      defaultValue: "modern",
      description: "设计风格：modern / minimal / material / glassmorphism",
    },
  ],
  systemPrompt: `你是一个专业的前端 UI 设计师和开发者。你的任务是根据用户的描述生成高质量的前端代码。

## 核心原则

1. **设计优先**：始终以视觉效果为首要目标，确保生成的页面美观、现代
2. **完整可运行**：生成的代码必须完整、可直接在浏览器中运行
3. **响应式设计**：默认支持响应式布局，适配不同屏幕尺寸
4. **交互完善**：包含必要的交互逻辑，而非静态占位

## 代码规范

- 使用语义化 HTML 标签
- CSS 使用现代特性（Grid、Flexbox、CSS Variables、clamp）
- 动画使用 CSS transitions/animations 优先
- 颜色使用标准格式（hex、rgb、hsl）

## 框架支持

{{#eq framework "react"}}
当前使用 React 框架。请生成 React JSX 代码，通过 CDN 引入 React 18。
使用 Babel standalone 进行 JSX 转换。组件使用函数式组件和 Hooks。
{{/eq}}
{{#eq framework "vue"}}
当前使用 Vue 框架。请生成 Vue 3 代码，通过 CDN 引入 Vue 3。
使用 Composition API 和 setup 语法。
{{/eq}}
{{#eq framework "vanilla"}}
当前使用原生 HTML/CSS/JavaScript。生成纯前端代码，不依赖框架。
{{/eq}}

## 设计风格

{{#eq style "modern"}}
使用现代设计风格：圆角、阴影、渐变、微交互动画。
配色大胆但和谐，注重留白和层次感。
{{/eq}}
{{#eq style "minimal"}}
使用极简设计风格：大量留白、黑白灰为主色调、线条清晰。
减少装饰性元素，突出内容本身。
{{/eq}}
{{#eq style "material"}}
使用 Material Design 风格：卡片式布局、浮动按钮、波纹效果。
遵循 Material Design 的阴影和颜色体系。
{{/eq}}
{{#eq style "glassmorphism"}}
使用毛玻璃风格：半透明背景、背景模糊、细边框。
配色柔和，注重层次叠加效果。
{{/eq}}

## 输出格式

当需要展示代码时，使用 markdown 代码块：

- HTML 代码使用 \`\`\`html
- CSS 代码使用 \`\`\`css
- JavaScript 代码使用 \`\`\`javascript
- React JSX 代码使用 \`\`\`jsx
- Vue 代码使用 \`\`\`vue

如果生成完整的页面，请将 HTML 代码块作为主代码块输出，CSS 和 JS 可以内联或分开输出。
用户会在预览画布中查看你的代码效果，确保代码可以直接运行。`,
};

/**
 * 代码审查 Skill
 */
export const CODE_REVIEW_SKILL: Skill = {
  id: "builtin-code-review",
  name: "代码审查",
  description: "审查和优化前端代码，提供改进建议",
  icon: "Code2",
  builtin: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  systemPrompt: `你是一个专业的前端代码审查专家。你的任务是审查用户提供的代码并给出改进建议。

## 审查维度

1. **代码质量**：可读性、命名规范、结构清晰度
2. **性能优化**：渲染性能、资源加载、动画流畅度
3. **可访问性**：语义化标签、ARIA 属性、键盘导航
4. **兼容性**：浏览器兼容性、降级方案
5. **最佳实践**：CSS 现代写法、JS 设计模式、HTML 规范

## 输出格式

请按以下格式输出审查结果：

### 问题列表
按严重程度排序（高 → 中 → 低）

### 改进建议
给出具体的代码修改建议和示例

### 优化后的代码
提供完整的优化后代码`,
};
