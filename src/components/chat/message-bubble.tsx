"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { Bot, User, Loader2, Sparkles, Brain, Code2, Eye, Search, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Message, MessageStep } from "@/types/chat";
import type { Components } from "react-markdown";
import { useSkillStore } from "@/stores/skill-store";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

/** 步骤图标映射 */
const STEP_ICONS: Record<MessageStep["type"], React.ReactNode> = {
  thinking: <Brain className="size-3.5" />,
  skill: <Sparkles className="size-3.5" />,
  generating: <Code2 className="size-3.5" />,
  rendering: <Eye className="size-3.5" />,
  searching: <Search className="size-3.5" />,
};

/** 执行步骤指示器 */
function StepsIndicator({ steps, isStreaming }: { steps: MessageStep[]; isStreaming: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const runningStep = steps.find((s) => s.status === "running");
  const completedCount = steps.filter((s) => s.status === "completed").length;

  return (
    <div className="mb-3 rounded-lg border border-border/60 bg-muted/30 overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        <span className="text-xs font-medium text-muted-foreground">
          执行步骤
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {completedCount}/{steps.length}
        </span>
        {isStreaming && runningStep && (
          <Loader2 className="size-3.5 animate-spin text-primary" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-3 py-2 space-y-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 text-xs",
                step.status === "completed" && "text-muted-foreground",
                step.status === "running" && "text-primary font-medium",
                step.status === "pending" && "text-muted-foreground/50"
              )}
            >
              <div className={cn(
                "shrink-0",
                step.status === "running" && "animate-pulse"
              )}>
                {step.status === "completed" ? (
                  <div className="size-3.5 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="size-1.5 rounded-full bg-primary" />
                  </div>
                ) : step.status === "running" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <div className="size-3.5 rounded-full border border-border/60" />
                )}
              </div>
              {STEP_ICONS[step.type]}
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Skill 标签 */
function SkillBadge({ skillId }: { skillId: string }) {
  const skills = useSkillStore((s) => s.skills);
  const skill = skills.find((s) => s.id === skillId);

  if (!skill) return null;

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary mb-2">
      <Sparkles className="size-3" />
      {skill.name}
    </div>
  );
}

/** 复制按钮 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 静默失败
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="rounded p-1 hover:bg-muted/50 transition-colors"
      title={copied ? "已复制" : "复制代码"}
    >
      {copied ? (
        <Check className="size-3.5 text-primary" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

/** 从 className 中提取语言 */
function extractLanguage(className: string | undefined): string {
  if (!className) return "code";
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : "code";
}

/** Markdown 组件覆写 */
function getMarkdownComponents(isStreaming: boolean): Components {
  return {
    pre({ children, className, ...props }) {
      // 检测是否为代码块（有 className 说明是代码块）
      const isCodeBlock = !!className;
      if (!isCodeBlock) {
        return (
          <pre className="mb-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm" {...props}>
            {children}
          </pre>
        );
      }

      // 提取语言
      const language = extractLanguage(className);

      // 提取代码文本用于复制
      let codeText = "";
      if (children && typeof children === "object" && "props" in children) {
        const childProps = children.props as { children?: React.ReactNode };
        if (typeof childProps.children === "string") {
          codeText = childProps.children;
        } else if (Array.isArray(childProps.children)) {
          codeText = childProps.children.join("");
        }
      }

      // 流式输出时代码块为空，不显示占位动画
      if (isStreaming && !codeText.trim()) {
        return null;
      }

      // 代码块：正常渲染，添加复制按钮
      return (
        <div className="my-3 rounded-lg bg-muted/80 overflow-hidden ring-1 ring-border/60">
          <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/60">
            <span className="text-xs text-muted-foreground font-medium">{language}</span>
            {codeText && <CopyButton text={codeText} />}
          </div>
          <pre className="p-3 overflow-x-auto text-sm leading-relaxed" {...props}>
            {children}
          </pre>
        </div>
      );
    },
    code({ className, children, ...props }) {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
            {...props}
          >
            {children}
          </code>
        );
      }
      // 代码块内的 code 标签：添加语法高亮样式
      return (
        <code
          className={cn("font-mono text-sm", className)}
          {...props}
        >
          {children}
        </code>
      );
    },
    p({ children, ...props }) {
      return (
        <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
          {children}
        </p>
      );
    },
    ul({ children, ...props }) {
      return (
        <ul className="mb-3 list-disc space-y-1 pl-6 last:mb-0" {...props}>
          {children}
        </ul>
      );
    },
    ol({ children, ...props }) {
      return (
        <ol className="mb-3 list-decimal space-y-1 pl-6 last:mb-0" {...props}>
          {children}
        </ol>
      );
    },
    li({ children, ...props }) {
      return (
        <li className="leading-relaxed" {...props}>
          {children}
        </li>
      );
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote
          className="my-3 border-l-3 border-primary/40 pl-4 text-muted-foreground italic"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    h1({ children, ...props }) {
      return (
        <h1 className="mb-3 mt-4 text-lg font-bold first:mt-0" {...props}>
          {children}
        </h1>
      );
    },
    h2({ children, ...props }) {
      return (
        <h2 className="mb-2 mt-4 text-base font-bold first:mt-0" {...props}>
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      return (
        <h3 className="mb-2 mt-3 text-sm font-bold first:mt-0" {...props}>
          {children}
        </h3>
      );
    },
    a({ children, href, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
          {...props}
        >
          {children}
        </a>
      );
    },
    table({ children, ...props }) {
      return (
        <div className="my-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead({ children, ...props }) {
      return (
        <thead className="bg-muted/50" {...props}>
          {children}
        </thead>
      );
    },
    th({ children, ...props }) {
      return (
        <th
          className="border-b border-border px-3 py-2 text-left font-medium"
          {...props}
        >
          {children}
        </th>
      );
    },
    td({ children, ...props }) {
      return (
        <td className="border-b border-border px-3 py-2" {...props}>
          {children}
        </td>
      );
    },
  };
}

const markdownComponents = getMarkdownComponents(false);

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const contentRef = useRef<HTMLDivElement>(null);
  const textContent = useMemo(
    () =>
      message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join(""),
    [message.content]
  );

  // 动态生成 markdown 组件（依赖 isStreaming 状态）
  const components = useMemo(
    () => getMarkdownComponents(isStreaming ?? false),
    [isStreaming]
  );

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 animate-message-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px]",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
            : "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-sm"
            : "bg-card text-foreground border border-border/60 shadow-sm"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{textContent}</div>
        ) : (
          <div ref={contentRef} className="message-content prose-compact">
            {/* Skill 标签 */}
            {message.skillId && <SkillBadge skillId={message.skillId} />}

            {/* 执行步骤 */}
            {message.steps && message.steps.length > 0 && (
              <StepsIndicator steps={message.steps} isStreaming={isStreaming ?? false} />
            )}

            <Markdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {textContent}
            </Markdown>
            {/* 流式输出光标 */}
            {isStreaming && (
              <span className="streaming-cursor" aria-hidden="true" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
