"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Plus,
  Trash2,
  Search,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  GripVertical,
  Pencil,
  Check,
  X,
  Folder,
  Settings,
} from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useSidebarStore, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/stores/sidebar-store";
import { useProjectStore } from "@/stores/project-store";
import { useAppStore } from "@/stores/app-store";
import { useCanvasStore } from "@/stores/canvas-store";
import type { Conversation } from "@/types/chat";

/** 单个对话项 */
function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditTitle(conversation.title);
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      <MessageSquare className="size-4 shrink-0" />
      {isEditing ? (
        <div className="flex flex-1 items-center gap-1">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm px-1"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
          >
            <Check className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate text-sm">{conversation.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </>
      )}
    </div>
  );
}

/** 项目项 */
function ProjectItem({
  project,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  project: { id: string; name: string };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditName(project.name);
  };

  const handleSave = () => {
    if (editName.trim() && editName !== project.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      <Folder className="size-4 shrink-0" />
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="h-6 text-sm px-1"
          autoFocus
          onBlur={handleSave}
        />
      ) : (
        <>
          <span className="flex-1 truncate text-sm">{project.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </>
      )}
    </div>
  );
}

/** 新建项目对话框 */
function NewProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, framework: "vanilla" | "react" | "vue") => void;
}) {
  const [name, setName] = useState("");
  const [framework, setFramework] = useState<"vanilla" | "react" | "vue">("vanilla");

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), framework);
      setName("");
      setFramework("vanilla");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">项目名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">框架</label>
            <div className="flex gap-2">
              {(["vanilla", "react", "vue"] as const).map((fw) => (
                <Button
                  key={fw}
                  variant={framework === fw ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFramework(fw)}
                >
                  {fw === "vanilla" ? "原生" : fw === "react" ? "React" : "Vue"}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AppSidebar() {
  const { isOpen, width, activeTab, searchQuery, toggle, setWidth, setTab, setSearchQuery } =
    useSidebarStore();
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const {
    conversations,
    activeConversationId,
    createConversation,
    switchConversation,
    deleteConversation,
    renameConversation,
    clearAllConversations,
  } = useChatStore();

  const {
    projects,
    activeProjectId,
    createProject,
    switchProject,
    deleteProject,
    renameProject,
  } = useProjectStore();

  const [isDragging, setIsDragging] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 拖拽调整宽度
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, setWidth]);

  // 过滤对话
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 过滤项目
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 折叠状态
  if (!isOpen) {
    return (
      <div
        className="flex flex-col items-center border-r border-border/60 bg-card py-3 transition-all duration-300 ease-in-out"
        style={{ width: SIDEBAR_COLLAPSED_WIDTH }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg hover:scale-110 transition-transform"
          onClick={toggle}
          title="展开侧边栏"
        >
          <PanelLeftOpen className="size-5" />
        </Button>
        <div className="my-2 h-px w-6 bg-border/60" />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 rounded-lg hover:scale-110 transition-transform",
            activeTab === "conversations" && "bg-primary/10 text-primary"
          )}
          onClick={() => {
            toggle();
            setTab("conversations");
          }}
          title="对话历史"
        >
          <MessageSquare className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 rounded-lg hover:scale-110 transition-transform",
            activeTab === "projects" && "bg-primary/10 text-primary"
          )}
          onClick={() => {
            toggle();
            setTab("projects");
          }}
          title="项目列表"
        >
          <FolderOpen className="size-5" />
        </Button>
        <div className="flex-1" />
        <div className="my-2 h-px w-6 bg-border/60" />
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg hover:scale-110 transition-transform"
          onClick={() => setSettingsOpen(true)}
          title="设置"
        >
          <Settings className="size-5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        ref={sidebarRef}
        className="flex flex-col border-r border-border/60 bg-card"
        style={{ width: `${width}px`, minWidth: SIDEBAR_MIN_WIDTH, maxWidth: SIDEBAR_MAX_WIDTH }}
      >
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <Tabs value={activeTab} onValueChange={(v) => setTab(v as "conversations" | "projects")}>
            <TabsList className="h-7">
              <TabsTrigger value="conversations" className="text-xs px-2">
                <MessageSquare className="size-3 mr-1" />
                对话
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs px-2">
                <FolderOpen className="size-3 mr-1" />
                项目
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon-sm" onClick={toggle} title="折叠侧边栏">
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "conversations" ? "搜索对话..." : "搜索项目..."}
              className="h-7 pl-7 text-sm"
            />
          </div>
        </div>

        {/* 内容区域 */}
        <ScrollArea className="flex-1 px-2">
          {activeTab === "conversations" ? (
            <div className="space-y-1 py-1">
              {filteredConversations.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {searchQuery ? "未找到匹配的对话" : "暂无对话"}
                </p>
              ) : (
                filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={() => switchConversation(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onRename={(title) => renameConversation(conv.id, title)}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {filteredProjects.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {searchQuery ? "未找到匹配的项目" : "暂无项目"}
                </p>
              ) : (
                filteredProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isActive={project.id === activeProjectId}
                    onSelect={() => {
                      switchProject(project.id);
                      // 切换项目时创建新对话
                      useChatStore.getState().createConversation();
                      // 加载项目的 HTML 文件到画布
                      const proj = useProjectStore.getState().getActiveProject();
                      if (proj) {
                        const htmlFile = proj.files.find(
                          (f) => f.language === "html" || f.name === "index.html"
                        );
                        if (htmlFile) {
                          useCanvasStore.getState().setEditorCode(htmlFile.content);
                        } else {
                          useCanvasStore.getState().setEditorCode("");
                        }
                      }
                    }}
                    onDelete={() => deleteProject(project.id)}
                    onRename={(name) => renameProject(project.id, name)}
                  />
                ))
              )}
            </div>
          )}
        </ScrollArea>

        {/* 底部操作栏 */}
        <div className="border-t border-border/60 px-2 py-2">
          {activeTab === "conversations" ? (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => createConversation()}
              >
                <Plus className="size-3 mr-1" />
                新对话
              </Button>
              {conversations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  title="清空所有对话"
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowNewProjectDialog(true)}
            >
              <Plus className="size-3 mr-1" />
              新建项目
            </Button>
          )}
        </div>

        {/* 可拖拽分隔条 */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors",
            isDragging ? "bg-primary/50" : "hover:bg-primary/30"
          )}
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* 新建项目对话框 */}
      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
        onCreate={(name, framework) => {
          createProject(name, framework);
          // 新建项目后自动创建新对话
          useChatStore.getState().createConversation();
          // 清空画布代码
          useCanvasStore.getState().setEditorCode("");
        }}
      />

      {/* 清空确认对话框 */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认清空</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要清空所有对话历史吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAllConversations();
                setShowClearConfirm(false);
              }}
            >
              清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
