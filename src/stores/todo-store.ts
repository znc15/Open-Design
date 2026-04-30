import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TodoItem, TodoStatus, DiscoveryFormData } from "@/types/discovery";

interface TodoState {
  /** 当前任务的 Todo 列表 */
  todos: TodoItem[];
  /** 是否显示 Todo 面板 */
  panelVisible: boolean;
  /** 初始化表单数据 */
  discoveryForm: DiscoveryFormData | null;
  /** 是否正在等待表单填写 */
  awaitingForm: boolean;
  /** 是否正在等待方向选择 */
  awaitingDirection: boolean;

  /** 添加 Todo */
  addTodo: (content: string, priority?: "P0" | "P1" | "P2") => void;
  /** 更新 Todo 状态 */
  updateTodoStatus: (id: string, status: TodoStatus) => void;
  /** 删除 Todo */
  removeTodo: (id: string) => void;
  /** 清空所有 Todo */
  clearTodos: () => void;
  /** 设置面板可见性 */
  setPanelVisible: (visible: boolean) => void;
  /** 设置初始化表单数据 */
  setDiscoveryForm: (form: DiscoveryFormData) => void;
  /** 清除初始化表单 */
  clearDiscoveryForm: () => void;
  /** 设置等待表单状态 */
  setAwaitingForm: (awaiting: boolean) => void;
  /** 设置等待方向选择状态 */
  setAwaitingDirection: (awaiting: boolean) => void;
  /** 从 AI 消息中解析 Todo */
  parseTodosFromMessage: (message: string) => void;
}

function generateId(): string {
  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** 从消息中解析 TodoWrite 格式的任务 */
function parseTodoWrite(message: string): Array<{ content: string; status: TodoStatus }> {
  const todos: Array<{ content: string; status: TodoStatus }> = [];

  // 匹配 TodoWrite 格式：- [ ] 或 - [x] 或 - [~]
  const lines = message.split("\n");
  for (const line of lines) {
    const pendingMatch = line.match(/^-\s*\[\s*\]\s*(.+)/);
    const completedMatch = line.match(/^-\s*\[x\]\s*(.+)/);
    const inProgressMatch = line.match(/^-\s*\[~\]\s*(.+)/);

    if (pendingMatch) {
      todos.push({ content: pendingMatch[1].trim(), status: "pending" });
    } else if (completedMatch) {
      todos.push({ content: completedMatch[1].trim(), status: "completed" });
    } else if (inProgressMatch) {
      todos.push({ content: inProgressMatch[1].trim(), status: "in_progress" });
    }
  }

  return todos;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      panelVisible: false,
      discoveryForm: null,
      awaitingForm: false,
      awaitingDirection: false,

      addTodo: (content, priority = "P1") =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: generateId(),
              content,
              status: "pending",
              priority,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
          panelVisible: true,
        })),

      updateTodoStatus: (id, status) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, status, updatedAt: Date.now() } : todo
          ),
        })),

      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      clearTodos: () => set({ todos: [], panelVisible: false }),

      setPanelVisible: (visible) => set({ panelVisible: visible }),

      setDiscoveryForm: (form) => set({ discoveryForm: form, awaitingForm: false }),

      clearDiscoveryForm: () => set({ discoveryForm: null }),

      setAwaitingForm: (awaiting) => set({ awaitingForm: awaiting }),

      setAwaitingDirection: (awaiting) => set({ awaitingDirection: awaiting }),

      parseTodosFromMessage: (message) => {
        const parsedTodos = parseTodoWrite(message);
        if (parsedTodos.length === 0) return;

        const currentTodos = get().todos;
        const newTodos: TodoItem[] = parsedTodos.map((parsed, index) => ({
          id: generateId(),
          content: parsed.content,
          status: parsed.status,
          priority: (index === 0 ? "P0" : "P1") as TodoItem["priority"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));

        // 如果已有 Todo，更新状态；否则添加新的
        if (currentTodos.length > 0) {
          // 尝试匹配并更新状态
          set({
            todos: currentTodos.map((todo) => {
              const matched = parsedTodos.find((p) => p.content === todo.content);
              if (matched) {
                return { ...todo, status: matched.status, updatedAt: Date.now() };
              }
              return todo;
            }),
          });
        } else {
          set({ todos: newTodos, panelVisible: true });
        }
      },
    }),
    {
      name: "open-design-todo",
      partialize: (state) => ({
        todos: state.todos,
        discoveryForm: state.discoveryForm,
      }),
    }
  )
);