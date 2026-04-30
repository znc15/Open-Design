"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import { MessageBubble } from "./message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MessageList() {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConv?.messages ?? [];

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <svg className="size-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            OpenDesign
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            描述你想要的 UI，我来生成代码
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {["登录页面", "导航栏", "卡片列表", "表单"].map((hint) => (
              <span
                key={hint}
                className="rounded-full border border-border/60 bg-card px-2.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full flex-1">
      <div className="flex flex-col py-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={
              isStreaming &&
              message.role === "assistant" &&
              index === messages.length - 1
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
