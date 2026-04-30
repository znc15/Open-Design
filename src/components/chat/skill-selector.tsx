"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Palette, Code2, Sparkles, Check, Settings } from "lucide-react";
import { useSkillStore } from "@/stores/skill-store";
import type { Skill } from "@/types/skill";

/** Skill 图标映射 */
const SKILL_ICONS: Record<string, React.ReactNode> = {
  Palette: <Palette className="size-4" />,
  Code2: <Code2 className="size-4" />,
  Sparkles: <Sparkles className="size-4" />,
};

/** 单个 Skill 选项 */
function SkillOption({
  skill,
  isActive,
  onSelect,
}: {
  skill: Skill;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/50 text-foreground"
      )}
      onClick={onSelect}
    >
      <div className="shrink-0">
        {skill.icon ? SKILL_ICONS[skill.icon] || <Sparkles className="size-4" /> : <Sparkles className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{skill.name}</div>
        <div className="text-xs text-muted-foreground truncate">{skill.description}</div>
      </div>
      {isActive && (
        <Check className="size-4 text-primary shrink-0" />
      )}
    </button>
  );
}

/** Skill 变量配置 */
function SkillVariableConfig({
  skillId,
  variables,
  values,
  onChange,
}: {
  skillId: string;
  variables: NonNullable<Skill["variables"]>;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="space-y-2 pt-2 border-t border-border/60">
      {variables.map((v) => (
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
            <input
              value={values[v.name] || v.defaultValue}
              onChange={(e) => onChange(v.name, e.target.value)}
              className="w-full h-7 px-2 text-sm border rounded"
              placeholder={v.description}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SkillSelector() {
  const {
    skills,
    activeSkillId,
    variableValues,
    setActiveSkill,
    setVariableValue,
    getActiveSkill,
  } = useSkillStore();

  const [open, setOpen] = useState(false);
  const activeSkill = getActiveSkill();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
          >
            {activeSkill?.icon ? (
              SKILL_ICONS[activeSkill.icon] || <Sparkles className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            <span className="text-sm">{activeSkill?.name || "选择技能"}</span>
          </Button>
        }
      />
      <PopoverContent className="w-72 p-2" align="start">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
            内置技能
          </div>
          <ScrollArea className="max-h-48">
            {skills.filter((s) => s.builtin).map((skill) => (
              <SkillOption
                key={skill.id}
                skill={skill}
                isActive={skill.id === activeSkillId}
                onSelect={() => setActiveSkill(skill.id)}
              />
            ))}
          </ScrollArea>

          {skills.some((s) => !s.builtin) && (
            <>
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mt-2">
                自定义技能
              </div>
              <ScrollArea className="max-h-32">
                {skills.filter((s) => !s.builtin).map((skill) => (
                  <SkillOption
                    key={skill.id}
                    skill={skill}
                    isActive={skill.id === activeSkillId}
                    onSelect={() => setActiveSkill(skill.id)}
                  />
                ))}
              </ScrollArea>
            </>
          )}

          {/* 当前选中 Skill 的变量配置 */}
          {activeSkill?.variables && activeSkill.variables.length > 0 && (
            <SkillVariableConfig
              skillId={activeSkill.id}
              variables={activeSkill.variables}
              values={variableValues[activeSkill.id] || {}}
              onChange={(name, value) => setVariableValue(activeSkill.id, name, value)}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
