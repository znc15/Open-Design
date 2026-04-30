"use client";

import { useState, useCallback, useRef } from "react";
import { Palette, Code2, Sparkles, Check, Trash2, Pencil, Upload, Search, Download, AlertCircle, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSkillStore } from "@/stores/skill-store";
import type { Skill, SkillVariable } from "@/types/skill";
import matter from "gray-matter";

/** Skill 图标映射 */
const SKILL_ICONS: Record<string, React.ReactNode> = {
  Palette: <Palette className="size-4" />,
  Code2: <Code2 className="size-4" />,
  Sparkles: <Sparkles className="size-4" />,
};

/** Skill 变量配置 */
function SkillVariableConfig({
  skill,
  values,
  onChange,
}: {
  skill: Skill;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  if (!skill.variables || skill.variables.length === 0) return null;

  return (
    <div className="space-y-2 pt-3 border-t border-border/60">
      {skill.variables.map((v) => (
        <div key={v.name} className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{v.label}</label>
          {v.name === "framework" ? (
            <div className="flex gap-1">
              {(["vanilla", "react", "vue"] as const).map((fw) => (
                <Button
                  key={fw}
                  variant={(values[v.name] || v.defaultValue) === fw ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => onChange(v.name, fw)}
                >
                  {fw === "vanilla" ? "原生" : fw === "react" ? "React" : "Vue"}
                </Button>
              ))}
            </div>
          ) : v.name === "style" ? (
            <div className="flex flex-wrap gap-1">
              {(["modern", "minimal", "material", "glassmorphism"] as const).map((style) => (
                <Button
                  key={style}
                  variant={(values[v.name] || v.defaultValue) === style ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => onChange(v.name, style)}
                >
                  {style === "modern" ? "现代" : style === "minimal" ? "极简" : style === "material" ? "Material" : "毛玻璃"}
                </Button>
              ))}
            </div>
          ) : (
            <Input
              value={values[v.name] || v.defaultValue}
              onChange={(e) => onChange(v.name, e.target.value)}
              className="h-7 text-sm"
              placeholder={v.description}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** Skill 市场弹窗 */
function SkillMarketModal({
  open,
  onOpenChange,
  onInstall,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: (skill: Omit<Skill, "id" | "builtin" | "createdAt" | "updatedAt">) => void;
}) {
  if (!open) return null;

  const SKILL_MARKET: Array<Omit<Skill, "id" | "builtin" | "createdAt" | "updatedAt">> = [
    {
      name: "UI 设计专家",
      description: "专注于现代 UI 设计，生成精美的界面代码",
      icon: "Palette",
      systemPrompt: `你是一个专业的 UI 设计师。你的任务是根据用户描述生成高质量的界面代码。

## 设计原则

1. **视觉层次**：通过大小、颜色、间距建立清晰的信息层次
2. **一致性**：保持设计语言统一，重复使用相同的样式模式
3. **留白**：合理使用空间，让界面呼吸
4. **对比度**：确保文字可读性，WCAG AA 标准

## 输出要求

- 使用现代 CSS 特性（Grid、Flexbox、CSS Variables）
- 提供完整的 HTML/CSS 代码
- 包含交互状态（hover、focus、active）`,
    },
    {
      name: "代码重构",
      description: "审查和优化代码，提供重构建议",
      icon: "Code2",
      systemPrompt: `你是一个代码重构专家。你的任务是审查用户代码并提供重构建议。

## 审查维度

1. **可读性**：命名、结构、注释
2. **可维护性**：模块化、单一职责
3. **性能**：算法复杂度、渲染优化
4. **最佳实践**：设计模式、代码规范

## 输出格式

### 问题列表
按优先级排列发现的问题

### 重构建议
具体的改进方案和示例代码

### 重构后代码
完整的重构后代码`,
    },
    {
      name: "API 设计师",
      description: "设计和文档化 RESTful API",
      icon: "Sparkles",
      systemPrompt: `你是一个 API 设计专家。你的任务是帮助用户设计和文档化 API。

## 设计原则

1. **RESTful 规范**：遵循 REST 架构风格
2. **一致性**：统一的命名、版本控制、错误处理
3. **安全性**：认证、授权、输入验证
4. **文档化**：清晰的 API 文档和示例

## 输出格式

提供 OpenAPI/Swagger 格式的 API 定义，包括：
- 端点路径和方法
- 请求/响应 schema
- 认证要求
- 错误码说明`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border rounded-xl w-[500px] max-h-[70vh] shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">Skill 市场</h3>
          <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {SKILL_MARKET.map((skill, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/60 p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {skill.icon ? SKILL_ICONS[skill.icon] || <Sparkles className="size-4" /> : <Sparkles className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{skill.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{skill.description}</div>
                  </div>
                  <Button size="sm" onClick={() => onInstall(skill)}>
                    安装
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

/**
 * 解析 Markdown 格式的 Skill 文件
 * 支持以下格式：
 *
 * ---
 * name: Skill 名称
 * description: Skill 描述
 * icon: Palette
 * variables:
 *   - name: framework
 *     label: 框架
 *     defaultValue: vanilla
 * ---
 *
 * ## 设计原则
 * ...
 */
function parseMarkdownSkill(content: string): Omit<Skill, "id" | "builtin" | "createdAt" | "updatedAt"> | null {
  try {
    const { data, content: body } = matter(content);

    // 验证必要字段
    if (!data.name || !body.trim()) {
      return null;
    }

    // 解析变量（如果有）
    let variables: SkillVariable[] | undefined;
    if (data.variables && Array.isArray(data.variables)) {
      variables = data.variables.map((v: Record<string, unknown>) => ({
        name: String(v.name || ""),
        label: String(v.label || ""),
        defaultValue: String(v.defaultValue || ""),
        description: v.description ? String(v.description) : undefined,
      })).filter((v) => v.name && v.label);
    }

    return {
      name: String(data.name),
      description: String(data.description || ""),
      systemPrompt: body.trim(),
      icon: data.icon ? String(data.icon) : undefined,
      variables,
    };
  } catch {
    return null;
  }
}

/**
 * 将 Skill 导出为 Markdown 格式
 */
function exportToMarkdown(skill: Skill): string {
  const frontmatter: Record<string, unknown> = {
    name: skill.name,
    description: skill.description,
  };

  if (skill.icon) {
    frontmatter.icon = skill.icon;
  }

  if (skill.variables && skill.variables.length > 0) {
    frontmatter.variables = skill.variables.map((v) => ({
      name: v.name,
      label: v.label,
      defaultValue: v.defaultValue,
      ...(v.description && { description: v.description }),
    }));
  }

  // 使用 gray-matter 的 stringify 方法
  return matter.stringify(skill.systemPrompt, frontmatter);
}

export function SkillManagement() {
  const {
    skills,
    activeSkillId,
    variableValues,
    setActiveSkill,
    setVariableValue,
    deleteSkill,
    addSkill,
    updateSkill,
  } = useSkillStore();

  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [showMarket, setShowMarket] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 导入 Skill */
  const handleImportSkill = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /** 处理文件选择（支持 .md 和 .json） */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        let parsed: Omit<Skill, "id" | "builtin" | "createdAt" | "updatedAt"> | null = null;

        if (file.name.endsWith(".md")) {
          // 解析 Markdown 格式
          parsed = parseMarkdownSkill(text);
          if (!parsed) {
            throw new Error("Markdown 文件格式错误，需要包含 frontmatter (name) 和正文内容");
          }
        } else if (file.name.endsWith(".json")) {
          // 解析 JSON 格式（向后兼容）
          const parsedJson = JSON.parse(text);
          if (!parsedJson.name || !parsedJson.description || !parsedJson.systemPrompt) {
            throw new Error("JSON 文件缺少必要字段（name, description, systemPrompt）");
          }
          parsed = {
            name: parsedJson.name,
            description: parsedJson.description,
            systemPrompt: parsedJson.systemPrompt,
            icon: parsedJson.icon,
            variables: parsedJson.variables,
          };
        } else {
          throw new Error("不支持的文件格式，请使用 .md 或 .json 文件");
        }

        // 添加 Skill
        addSkill(parsed);
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "导入失败");
      }

      // 清空 input
      e.target.value = "";
    },
    [addSkill]
  );

  /** 从市场安装 Skill */
  const handleInstallFromMarket = useCallback(
    (skill: Omit<Skill, "id" | "builtin" | "createdAt" | "updatedAt">) => {
      addSkill(skill);
      setShowMarket(false);
    },
    [addSkill]
  );

  /** 导出 Skill（默认导出为 .md 格式） */
  const handleExportSkill = useCallback((skill: Skill) => {
    const markdownContent = exportToMarkdown(skill);
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.name.replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">
        管理已安装的 Skill，配置变量参数。当前激活的 Skill 会注入系统提示词。支持导入/导出 Markdown 格式的 Skill 文件。
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleImportSkill}>
          <Upload className="size-3.5 mr-1" />
          导入 Skill
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowMarket(true)}>
          <Search className="size-3.5 mr-1" />
          搜索 Skill
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 导入错误提示 */}
      {importError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          {importError}
          <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={() => setImportError(null)}>
            <X className="size-3" />
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-2">
          {skills.map((skill) => {
            const isActive = skill.id === activeSkillId;
            const isExpanded = skill.id === expandedSkillId;

            return (
              <div
                key={skill.id}
                className={cn(
                  "rounded-xl border border-border/60 bg-gradient-to-r from-card to-card/80 p-3 transition-all",
                  isActive && "border-primary/60 bg-gradient-to-r from-primary/5 to-primary/10 ring-1 ring-primary/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    className="flex flex-1 items-center gap-2 text-left"
                    onClick={() => setActiveSkill(skill.id)}
                  >
                    <div className="shrink-0">
                      {skill.icon ? SKILL_ICONS[skill.icon] || <Sparkles className="size-4" /> : <Sparkles className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{skill.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{skill.description}</div>
                    </div>
                    {isActive && <Check className="size-4 text-primary shrink-0" />}
                  </button>

                  <div className="flex items-center gap-1">
                    {skill.variables && skill.variables.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                        title={isExpanded ? "收起配置" : "展开配置"}
                      >
                        <Pencil className={cn("size-3 transition-transform", isExpanded && "rotate-45")} />
                      </Button>
                    )}
                    {!skill.builtin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditingSkillId(skill.id);
                            setEditingName(skill.name);
                          }}
                          title="重命名 Skill"
                        >
                          <Pencil className="size-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleExportSkill(skill)}
                          title="导出 Skill"
                        >
                          <Download className="size-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteSkill(skill.id)}
                          title="删除 Skill"
                        >
                          <Trash2 className="size-3 text-muted-foreground" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <SkillVariableConfig
                    skill={skill}
                    values={variableValues[skill.id] || {}}
                    onChange={(name, value) => setVariableValue(skill.id, name, value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Skill 市场弹窗 */}
      <SkillMarketModal
        open={showMarket}
        onOpenChange={setShowMarket}
        onInstall={handleInstallFromMarket}
      />

      {/* 重命名弹窗 */}
      {editingSkillId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-xl w-[360px] shadow-xl p-4">
            <h3 className="font-medium text-sm mb-3">重命名 Skill</h3>
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="输入新的 Skill 名称"
              className="mb-3"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingSkillId(null);
                  setEditingName("");
                }}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (editingName.trim()) {
                    updateSkill(editingSkillId, { name: editingName.trim() });
                  }
                  setEditingSkillId(null);
                  setEditingName("");
                }}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
