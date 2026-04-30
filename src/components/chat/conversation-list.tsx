"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chat-store";
import { cn } from "@/lib/utils";

export function ConversationList() {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const createConversation = useChatStore((s) => s.createConversation);
  const switchConversation = useChatStore((s) => s.switchConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const clearAllConversations = useChatStore((s) => s.clearAllConversations);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  function handleNew() {
    createConversation();
  }

  function handleSwitch(id: string) {
    if (isStreaming) return;
    switchConversation(id);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (isStreaming) return;
    deleteConversation(id);
  }

  function handleStartRename(e: React.MouseEvent, id: string, title: string) {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  }

  function handleConfirmRename() {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
  }

  function handleCancelRename() {
    setEditingId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleConfirmRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  }

  function handleClearAll() {
    clearAllConversations();
    setShowConfirmClear(false);
  }

  return (
    <div className="flex flex-col border-b border-border/60 bg-gradient-to-r from-card/80 to-card/60">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">对话历史</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleNew}
            disabled={isStreaming}
            aria-label="新建对话"
          >
            <Plus className="size-3.5" />
          </Button>
          {conversations.length > 0 && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowConfirmClear(true)}
              disabled={isStreaming}
              aria-label="清空全部"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* 清空确认条 */}
      {showConfirmClear && (
        <div className="flex items-center gap-1.5 border-b border-border/40 px-3 py-1">
          <span className="flex-1 text-[11px] text-muted-foreground">确认清空所有对话？</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleClearAll}
            className="text-destructive hover:text-destructive"
          >
            <Check className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowConfirmClear(false)}
          >
            <X className="size-3" />
          </Button>
        </div>
      )}

      {/* 对话列表 */}
      {conversations.length > 0 && (
        <div className="max-h-40 overflow-y-auto px-1.5 py-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm cursor-pointer transition-colors",
                activeConversationId === conv.id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-muted",
                isStreaming && activeConversationId !== conv.id && "opacity-50"
              )}
              onClick={() => handleSwitch(conv.id)}
            >
              <MessageSquare className="size-3 shrink-0 opacity-50" />

              {editingId === conv.id ? (
                <input
                  ref={inputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleConfirmRename}
                  className="flex-1 bg-transparent text-sm outline-none ring-1 ring-primary/30 rounded px-1"
                />
              ) : (
                <span
                  className="flex-1 truncate text-[12px]"
                  onDoubleClick={(e) => handleStartRename(e, conv.id, conv.title)}
                  title={conv.title}
                >
                  {conv.title}
                </span>
              )}

              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0"
              >
                <X className="size-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {conversations.length === 0 && (
        <div className="px-3 pb-2 text-[11px] text-muted-foreground/60">
          暂无对话
        </div>
      )}
    </div>
  );
}
