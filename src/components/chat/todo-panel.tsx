"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { useTodoStore } from "@/stores/todo-store";
import type { TodoItem, TodoStatus } from "@/types/discovery";

/** 状态图标 */
function StatusIcon({ status }: { status: TodoStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-4 text-green-500" />;
    case "in_progress":
      return <Loader2 className="size-4 text-blue-500 animate-spin" />;
    case "blocked":
      return <XCircle className="size-4 text-red-500" />;
    default:
      return <Circle className="size-4 text-muted-foreground" />;
  }
}

/** 优先级颜色 */
function getPriorityColor(priority: "P0" | "P1" | "P2"): string {
  switch (priority) {
    case "P0":
      return "bg-red-500/20 text-red-600 border-red-500/30";
    case "P1":
      return "bg-blue-500/20 text-blue-600 border-blue-500/30";
    case "P2":
      return "bg-gray-500/20 text-gray-600 border-gray-500/30";
  }
}

/** 单个 Todo 项 */
function TodoItemView({
  todo,
  onStatusChange,
  onDelete,
}: {
  todo: TodoItem;
  onStatusChange: (status: TodoStatus) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const nextStatus: TodoStatus =
    todo.status === "pending" ? "in_progress" : todo.status === "in_progress" ? "completed" : "pending";

  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
        todo.status === "completed" && "bg-green-500/5",
        todo.status === "in_progress" && "bg-blue-500/5"
      )}
    >
      <button
        onClick={() => onStatusChange(nextStatus)}
        className="shrink-0 hover:scale-110 transition-transform"
        title={`点击切换为 ${nextStatus}`}
      >
        <StatusIcon status={todo.status} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm truncate",
              todo.status === "completed" && "text-muted-foreground line-through"
            )}
          >
            {todo.content}
          </span>
          <span
            className={cn(
              "shrink-0 text-xs px-1.5 py-0.5 rounded border",
              getPriorityColor(todo.priority)
            )}
          >
            {todo.priority}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="size-5 opacity-0 group-hover:opacity-100 shrink-0"
        onClick={onDelete}
        title="删除任务"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  );
}

export function TodoPanel() {
  const { todos, panelVisible, setPanelVisible, updateTodoStatus, removeTodo, clearTodos } =
    useTodoStore();

  const [collapsed, setCollapsed] = useState(false);

  if (!panelVisible || todos.length === 0) return null;

  const completedCount = todos.filter((t) => t.status === "completed").length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="border-b border-border/60 bg-card/95 backdrop-blur-sm">
      {/* 头部 */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">任务进度</span>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
          {/* 进度条 */}
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              clearTodos();
            }}
            title="清空任务"
          >
            <Trash2 className="size-3" />
          </Button>
          {collapsed ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="size-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* 任务列表 */}
      {!collapsed && (
        <ScrollArea className="max-h-[120px] px-2 pb-2">
          <div className="space-y-1">
            {todos.map((todo) => (
              <TodoItemView
                key={todo.id}
                todo={todo}
                onStatusChange={(status) => updateTodoStatus(todo.id, status)}
                onDelete={() => removeTodo(todo.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}