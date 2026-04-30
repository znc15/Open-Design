"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { Send, Square, Search, Sparkles, X, MousePointer2, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chat-store";
import { useSkillStore } from "@/stores/skill-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { useAppStore } from "@/stores/app-store";
import { useTodoStore } from "@/stores/todo-store";
import { SkillSelector } from "./skill-selector";
import { ModelSelector } from "./model-selector";
import { DesignSystemSelector } from "./design-system-selector";
import { QuestionFormDialog } from "./question-form";
import { cn } from "@/lib/utils";
import { generateDiscoveryPrompt } from "@/lib/prompts/discovery";
import type { DiscoveryFormData } from "@/types/discovery";

export function ChatInput() {
  const [input, setInput] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [activeDesignSystemId, setActiveDesignSystemId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const abortStream = useChatStore((state) => state.abortStream);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const activeModel = useChatStore((state) => state.activeModel);
  const getResolvedSystemPrompt = useSkillStore((state) => state.getResolvedSystemPrompt);
  const activeSkillId = useSkillStore((state) => state.activeSkillId);
  const getActiveSkill = useSkillStore((state) => state.getActiveSkill);
  const setActiveSkill = useSkillStore((state) => state.setActiveSkill);
  const activeSkill = getActiveSkill();
  const selectedElementInfo = useCanvasStore((s) => s.selectedElementInfo);
  const setSelectedElementInfo = useCanvasStore((s) => s.setSelectedElementInfo);
  const autoSendElement = useAppStore((s) => s.autoSendElement);
  const { discoveryForm, setDiscoveryForm, setAwaitingForm } = useTodoStore();

  /** 处理初始化表单提交 */
  const handleFormSubmit = useCallback((data: DiscoveryFormData) => {
    setDiscoveryForm(data);
    // 如果有输入内容，自动发送
    if (input.trim() && activeModel) {
      const discoveryPrompt = generateDiscoveryPrompt(data);
      // 将 discovery prompt 作为上下文注入消息
      const enrichedMessage = `${discoveryPrompt}\n\n用户需求: ${input.trim()}`;
      sendMessage(enrichedMessage);
      setInput("");
    }
  }, [input, activeModel, sendMessage, setDiscoveryForm]);

  /** 检测是否需要先填表单（新对话的第一条消息） */
  const conversations = useChatStore((s) => s.conversations);
  const activeConvId = useChatStore((s) => s.activeConversationId);
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const isNewConversation = !activeConv || activeConv.messages.length === 0;
  const needsDiscoveryForm = isNewConversation && !discoveryForm;

  const handleSubmit = useCallback(() => {
    let text = input.trim();
    if (!text || isStreaming || !activeModel) return;

    // 新对话且没有表单数据时，先弹出问题表单
    if (needsDiscoveryForm) {
      setShowQuestionForm(true);
      return;
    }

    // 如果有选中元素且开关开启，在消息中附加元素信息
    if (selectedElementInfo && autoSendElement) {
      const elementContext = `[选中元素: <${selectedElementInfo.tagName}${selectedElementInfo.id ? ` id="${selectedElementInfo.id}"` : ""}${selectedElementInfo.className ? ` class="${selectedElementInfo.className}"` : ""}>]`;
      text = `${elementContext}\n${text}`;
      setSelectedElementInfo(null);
    } else if (selectedElementInfo && !autoSendElement) {
      setSelectedElementInfo(null);
    }

    // 如果有 discovery form 数据，注入到消息上下文
    if (discoveryForm) {
      const discoveryPrompt = generateDiscoveryPrompt(discoveryForm);
      text = `${discoveryPrompt}\n\n用户需求: ${text}`;
    }

    sendMessage(text);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isStreaming, activeModel, sendMessage, getResolvedSystemPrompt, selectedElementInfo, setSelectedElementInfo, autoSendElement, needsDiscoveryForm, discoveryForm]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  return (
    <div className="border-t border-border/60 bg-gradient-to-t from-card to-card/90 p-3 backdrop-blur-sm">
      {/* 选中元素提示 */}
      {selectedElementInfo && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs">
          <MousePointer2 className="size-3 text-primary" />
          <span className="text-primary font-medium">
            &lt;{selectedElementInfo.tagName}&gt;
          </span>
          {selectedElementInfo.id && (
            <span className="text-primary/70">#{selectedElementInfo.id}</span>
          )}
          {selectedElementInfo.className && (
            <span className="text-primary/60 truncate max-w-[150px]">
              .{selectedElementInfo.className.split(/\s+/)[0]}
            </span>
          )}
          <span className="text-muted-foreground flex-1 truncate">
            {selectedElementInfo.textContent.slice(0, 50)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelectedElementInfo(null)}
            className="shrink-0"
          >
            <X className="size-3" />
          </Button>
        </div>
      )}

      {/* 当前激活的 Skill 标签 */}
      {activeSkill && (
        <div className="flex items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
            <Sparkles className="size-3" />
            <span>{activeSkill.name}</span>
            <button
              className="ml-1 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
              onClick={() => setActiveSkill(null)}
              title="取消选择 Skill"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* 工具栏：Skill 选择器 + Design System 选择器 + 模型选择器 + 问题表单 + 联网搜索开关 */}
      <div className="flex items-center gap-2 mb-2">
        <SkillSelector />
        <DesignSystemSelector
          activeSystemId={activeDesignSystemId}
          onSelect={setActiveDesignSystemId}
        />
        <ModelSelector />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-7"
          onClick={() => setShowQuestionForm(true)}
          title="初始化问题表单"
        >
          <FileQuestion className="size-3.5" />
          <span className="text-xs">表单</span>
        </Button>
        <Button
          variant={searchEnabled ? "default" : "outline"}
          size="sm"
          className="gap-1.5 h-7 ml-auto"
          onClick={() => setSearchEnabled(!searchEnabled)}
        >
          <Search className="size-3.5" />
          <span className="text-xs">{searchEnabled ? "搜索已开启" : "联网搜索"}</span>
        </Button>
      </div>

      {/* Discovery form 状态提示 */}
      {discoveryForm && (
        <div className="flex items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs text-green-600">
            <FileQuestion className="size-3" />
            <span>{discoveryForm.surface} · {discoveryForm.tone} · {discoveryForm.scale}</span>
            <button
              className="ml-1 rounded-full hover:bg-green-500/20 p-0.5 transition-colors"
              onClick={() => useTodoStore.getState().clearDiscoveryForm()}
              title="清除表单数据"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div className="flex items-end gap-2 rounded-xl border border-border/80 bg-background px-3 py-1.5 shadow-sm transition-all focus-within:border-primary/40 focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/20">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            selectedElementInfo
              ? `描述对 <${selectedElementInfo.tagName}> 的修改...`
              : activeModel
                ? "描述你想要的 UI 设计..."
                : "请先在顶栏选择一个模型..."
          }
          rows={1}
          className="max-h-[200px] min-h-[32px] flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />

        {isStreaming ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={abortStream}
            className="text-muted-foreground hover:text-foreground"
            aria-label="停止生成"
          >
            <Square className="size-3.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSubmit}
            disabled={!input.trim() || !activeModel}
            className="text-muted-foreground hover:text-primary disabled:opacity-30"
            aria-label="发送消息"
          >
            <Send className="size-3.5" />
          </Button>
        )}
      </div>

      <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
        Shift+Enter 换行 · Enter 发送
      </p>

      {/* 初始化问题表单弹窗 */}
      <QuestionFormDialog
        open={showQuestionForm}
        onOpenChange={setShowQuestionForm}
        onSubmit={handleFormSubmit}
        initialData={discoveryForm || undefined}
      />
    </div>
  );
}
