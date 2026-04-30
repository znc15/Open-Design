import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 项目类型定义
 * 项目包含独立的对话历史、代码文件、设置
 */
export interface ProjectFile {
  id: string;
  name: string;
  language: "html" | "css" | "javascript" | "jsx" | "tsx" | "vue";
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectSettings {
  /** 项目使用的框架 */
  framework: "vanilla" | "react" | "vue";
  /** 项目描述 */
  description: string;
}

export interface Project {
  id: string;
  name: string;
  /** 项目下的对话 ID 列表 */
  conversationIds: string[];
  /** 项目下的文件 */
  files: ProjectFile[];
  /** 项目设置 */
  settings: ProjectSettings;
  createdAt: number;
  updatedAt: number;
}

interface ProjectState {
  /** 所有项目 */
  projects: Project[];
  /** 当前激活的项目 ID */
  activeProjectId: string | null;

  /** 创建项目 */
  createProject: (name: string, framework?: "vanilla" | "react" | "vue") => string;
  /** 切换项目 */
  switchProject: (id: string) => void;
  /** 删除项目 */
  deleteProject: (id: string) => void;
  /** 重命名项目 */
  renameProject: (id: string, name: string) => void;
  /** 获取当前项目 */
  getActiveProject: () => Project | undefined;

  /** 添加文件到项目 */
  addFile: (projectId: string, file: Omit<ProjectFile, "id" | "createdAt" | "updatedAt">) => string;
  /** 更新文件内容 */
  updateFile: (projectId: string, fileId: string, content: string) => void;
  /** 删除文件 */
  deleteFile: (projectId: string, fileId: string) => void;
  /** 重命名文件 */
  renameFile: (projectId: string, fileId: string, name: string) => void;

  /** 关联对话到项目 */
  linkConversation: (projectId: string, conversationId: string) => void;
  /** 取消关联对话 */
  unlinkConversation: (projectId: string, conversationId: string) => void;

  /** 更新项目设置 */
  updateSettings: (projectId: string, settings: Partial<ProjectSettings>) => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 默认项目文件模板 */
function createDefaultFiles(framework: "vanilla" | "react" | "vue"): ProjectFile[] {
  const now = Date.now();
  const baseId = generateId();

  if (framework === "react") {
    return [
      {
        id: `${baseId}-index`,
        name: "index.html",
        language: "html" as const,
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" src="App.jsx"></script>
</body>
</html>`,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `${baseId}-app`,
        name: "App.jsx",
        language: "jsx" as const,
        content: `function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="app">
      <h1>Hello React!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `${baseId}-style`,
        name: "style.css",
        language: "css" as const,
        content: `.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #333;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}`,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  if (framework === "vue") {
    return [
      {
        id: `${baseId}-index`,
        name: "index.html",
        language: "html" as const,
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue App</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <h1>{{ message }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Click me</button>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `${baseId}-app`,
        name: "app.js",
        language: "javascript" as const,
        content: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const message = ref('Hello Vue!');
    const count = ref(0);

    function increment() {
      count.value++;
    }

    return {
      message,
      count,
      increment
    };
  }
}).mount('#app');`,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `${baseId}-style`,
        name: "style.css",
        language: "css" as const,
        content: `#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #42b883;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #369870;
}`,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  // Vanilla HTML/CSS/JS
  return [
    {
      id: `${baseId}-index`,
      name: "index.html",
      language: "html" as const,
      content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Design</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>Start editing to see your changes.</p>
    <button id="clickBtn">Click me</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `${baseId}-style`,
      name: "style.css",
      language: "css" as const,
      content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

p {
  color: #666;
  margin-bottom: 1rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `${baseId}-script`,
      name: "script.js",
      language: "javascript" as const,
      content: `document.getElementById('clickBtn').addEventListener('click', function() {
  alert('Button clicked!');
});`,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      createProject: (name, framework = "vanilla") => {
        const id = `proj-${generateId()}`;
        const now = Date.now();
        const newProject: Project = {
          id,
          name,
          conversationIds: [],
          files: createDefaultFiles(framework),
          settings: {
            framework,
            description: "",
          },
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [newProject, ...state.projects],
          activeProjectId: id,
        }));
        return id;
      },

      switchProject: (id) => set({ activeProjectId: id }),

      deleteProject: (id) =>
        set((state) => {
          const remaining = state.projects.filter((p) => p.id !== id);
          const newActiveId =
            state.activeProjectId === id
              ? remaining.length > 0
                ? remaining[0].id
                : null
              : state.activeProjectId;
          return {
            projects: remaining,
            activeProjectId: newActiveId,
          };
        }),

      renameProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p
          ),
        })),

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId);
      },

      addFile: (projectId, file) => {
        const fileId = `file-${generateId()}`;
        const now = Date.now();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  files: [
                    ...p.files,
                    { ...file, id: fileId, createdAt: now, updatedAt: now },
                  ],
                  updatedAt: now,
                }
              : p
          ),
        }));
        return fileId;
      },

      updateFile: (projectId, fileId, content) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  files: p.files.map((f) =>
                    f.id === fileId
                      ? { ...f, content, updatedAt: Date.now() }
                      : f
                  ),
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      deleteFile: (projectId, fileId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  files: p.files.filter((f) => f.id !== fileId),
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      renameFile: (projectId, fileId, name) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  files: p.files.map((f) =>
                    f.id === fileId
                      ? { ...f, name, updatedAt: Date.now() }
                      : f
                  ),
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      linkConversation: (projectId, conversationId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId &&
            !p.conversationIds.includes(conversationId)
              ? {
                  ...p,
                  conversationIds: [...p.conversationIds, conversationId],
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      unlinkConversation: (projectId, conversationId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  conversationIds: p.conversationIds.filter(
                    (id) => id !== conversationId
                  ),
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      updateSettings: (projectId, settings) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  settings: { ...p.settings, ...settings },
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),
    }),
    {
      name: "open-design-projects",
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
