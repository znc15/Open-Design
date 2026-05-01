# 修改设置中的圆角配置

## Goal

在设置对话框中新增"外观"tab，提供圆角大小的滑块控制，让用户实时调整全局圆角风格。

## What I already know

* 圆角通过 CSS 变量 `--radius` 控制，默认 `0.5rem`（[globals.css:76](src/app/globals.css#L76)）
* 派生变量：`--radius-sm` ~ `--radius-4xl` 均基于 `--radius` 计算（[globals.css:42-48](src/app/globals.css#L42-L48)）
* 设置对话框在 [settings-dialog.tsx](src/components/settings/settings-dialog.tsx)，当前 5 个 tab
* 项目使用 shadcn/ui 组件库，有 Slider 组件可用
* 项目使用 zustand 做状态管理

## Assumptions (temporary)

* 圆角值范围 0 ~ 1.5rem，步长 0.125rem
* 设置持久化到 localStorage
* 实时预览（拖动滑块时立即生效）

## Open Questions

* 圆角值范围是否合适？（0 ~ 1.5rem）

## Requirements (evolving)

* 在设置对话框新增"外观"tab
* 提供圆角滑块，范围 0 ~ 1.5rem，步长 0.125rem
* 拖动时实时修改 `:root` 的 `--radius` CSS 变量
* 设置值持久化到 localStorage，下次打开自动恢复
* 默认值 0.5rem（与当前一致）

## Acceptance Criteria (evolving)

* [ ] 设置对话框出现"外观"tab
* [ ] 滑块可调节圆角，拖动时全局圆角实时变化
* [ ] 刷新页面后圆角设置保留
* [ ] 重置按钮可恢复默认值

## Definition of Done (team quality bar)

* Lint / typecheck 通过
* 无 console 报错
* 设置持久化正常

## Out of Scope (explicit)

* 不做其他外观设置（字体大小、主题色等）
* 不做暗色模式单独圆角

## Technical Notes

* CSS 变量修改方式：`document.documentElement.style.setProperty('--radius', value)`
* 持久化：zustand middleware `persist` 或直接 localStorage
* 参考：[settings-dialog.tsx](src/components/settings/settings-dialog.tsx) tab 结构
