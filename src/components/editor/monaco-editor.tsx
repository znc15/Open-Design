"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  X,
  FileCode,
  FileJson,
  FileCode2,
  FileType,
  Braces,
  ChevronDown,
} from "lucide-react";
import { useProjectStore, type ProjectFile } from "@/stores/project-store";
import { useCanvasStore } from "@/stores/canvas-store";
import type { editor } from "monaco-editor";

/** 语言图标映射 */
const LANGUAGE_ICONS: Record<string, React.ReactNode> = {
  html: <FileCode className="size-3.5" />,
  css: <Braces className="size-3.5" />,
  javascript: <FileJson className="size-3.5" />,
  jsx: <FileCode2 className="size-3.5" />,
  tsx: <FileType className="size-3.5" />,
  vue: <FileCode className="size-3.5" />,
};

/** Monaco 语言 ID 映射 */
const LANGUAGE_MAP: Record<string, string> = {
  html: "html",
  css: "css",
  javascript: "javascript",
  jsx: "javascript",
  tsx: "typescript",
  vue: "vue",
};

/** 单个文件 Tab */
function FileTab({
  file,
  isActive,
  onSelect,
  onClose,
  onRename,
}: {
  file: ProjectFile;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onRename: (name: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditName(file.name);
  };

  const handleSave = () => {
    if (editName.trim() && editName !== file.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 px-2 py-1 cursor-pointer border-b-2 transition-colors",
        isActive
          ? "border-primary bg-background text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      {LANGUAGE_ICONS[file.language] || <FileCode className="size-3.5" />}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          onBlur={handleSave}
          className="h-4 w-20 text-xs bg-transparent border-none outline-none"
        />
      ) : (
        <span className="text-xs truncate max-w-[100px]">{file.name}</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-4 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="size-2.5" />
      </Button>
    </div>
  );
}

/** 新建文件对话框 */
function NewFileDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, language: ProjectFile["language"]) => void;
}) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<ProjectFile["language"]>("html");

  const handleCreate = () => {
    if (name.trim()) {
      // 自动添加扩展名
      let finalName = name.trim();
      const ext = {
        html: ".html",
        css: ".css",
        javascript: ".js",
        jsx: ".jsx",
        tsx: ".tsx",
        vue: ".vue",
      }[language];

      if (!finalName.endsWith(ext)) {
        finalName += ext;
      }

      onCreate(finalName, language);
      setName("");
      setLanguage("html");
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border rounded-lg p-4 w-80 shadow-lg">
        <h3 className="text-sm font-medium mb-3">新建文件</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">文件名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入文件名"
              className="w-full h-8 px-2 text-sm border rounded"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">语言</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as ProjectFile["language"])}
              className="w-full h-8 px-2 text-sm border rounded"
            >
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
              <option value="jsx">JSX (React)</option>
              <option value="tsx">TSX (React + TypeScript)</option>
              <option value="vue">Vue SFC</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
            创建
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MonacoCodeEditor() {
  const { getActiveProject, addFile, updateFile, deleteFile, renameFile } = useProjectStore();
  const { setEditorCode } = useCanvasStore();

  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const activeProject = getActiveProject();
  const files = activeProject?.files || [];
  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || null;

  // 同步文件内容到 canvas store（用于预览）
  useEffect(() => {
    if (activeFile?.language === "html") {
      setEditorCode(activeFile.content);
    }
  }, [activeFile, setEditorCode]);

  // 编辑器挂载
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // 内容变化
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeFile && activeProject && value !== undefined) {
        updateFile(activeProject.id, activeFile.id, value);
      }
    },
    [activeFile, activeProject, updateFile]
  );

  // 新建文件
  const handleCreateFile = (name: string, language: ProjectFile["language"]) => {
    if (activeProject) {
      const fileId = addFile(activeProject.id, {
        name,
        language,
        content: getDefaultContent(language),
      });
      setActiveFileId(fileId);
    }
  };

  // 没有项目时显示提示
  if (!activeProject) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileCode className="size-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">请先创建或选择一个项目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 文件 Tab 栏 */}
      <div className="flex items-center border-b border-border/60 bg-muted/30">
        <ScrollArea className="flex-1">
          <div className="flex items-center">
            {files.map((file) => (
              <FileTab
                key={file.id}
                file={file}
                isActive={file.id === activeFileId || (!activeFileId && file === files[0])}
                onSelect={() => setActiveFileId(file.id)}
                onClose={() => {
                  if (activeProject) {
                    deleteFile(activeProject.id, file.id);
                    if (activeFileId === file.id) {
                      setActiveFileId(files[0]?.id || null);
                    }
                  }
                }}
                onRename={(name) => {
                  if (activeProject) {
                    renameFile(activeProject.id, file.id, name);
                  }
                }}
              />
            ))}
          </div>
        </ScrollArea>
        <Button
          variant="ghost"
          size="icon-sm"
          className="mx-1"
          onClick={() => setShowNewFileDialog(true)}
          title="新建文件"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Monaco 编辑器 */}
      <div className="flex-1">
        {activeFile ? (
          <Editor
            height="100%"
            language={LANGUAGE_MAP[activeFile.language] || "html"}
            value={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              formatOnPaste: true,
              bracketPairColorization: { enabled: true },
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">选择一个文件开始编辑</p>
          </div>
        )}
      </div>

      {/* 新建文件对话框 */}
      <NewFileDialog
        open={showNewFileDialog}
        onOpenChange={setShowNewFileDialog}
        onCreate={handleCreateFile}
      />
    </div>
  );
}

/** 获取默认文件内容 */
function getDefaultContent(language: ProjectFile["language"]): string {
  switch (language) {
    case "html":
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新页面</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World</h1>
  <script src="script.js"></script>
</body>
</html>`;
    case "css":
      return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`;
    case "javascript":
      return `// JavaScript
console.log('Hello World');`;
    case "jsx":
      return `// React JSX
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="app">
      <h1>Hello React!</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}`;
    case "tsx":
      return `// React TSX
import React from 'react';

interface AppProps {
  title?: string;
}

const App: React.FC<AppProps> = ({ title = 'Hello' }) => {
  const [count, setCount] = React.useState<number>(0);

  return (
    <div className="app">
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
};

export default App;`;
    case "vue":
      return `<template>
  <div class="app">
    <h1>{{ message }}</h1>
    <button @click="increment">Count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('Hello Vue!');
const count = ref(0);

function increment() {
  count.value++;
}
</script>

<style scoped>
.app {
  text-align: center;
  padding: 2rem;
}
</style>`;
    default:
      return "";
  }
}
