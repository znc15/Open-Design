import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Skill, SkillVariable } from "@/types/skill";
import { FRONT_DESIGN_SKILL, CODE_REVIEW_SKILL } from "@/types/skill";

interface SkillState {
  /** 所有 skill（包括内置和用户自定义） */
  skills: Skill[];
  /** 当前激活的 skill ID */
  activeSkillId: string | null;
  /** skill 变量值（用户填写的变量值） */
  variableValues: Record<string, Record<string, string>>;

  /** 获取当前激活的 skill */
  getActiveSkill: () => Skill | undefined;
  /** 设置激活的 skill */
  setActiveSkill: (id: string | null) => void;
  /** 添加自定义 skill */
  addSkill: (skill: Omit<Skill, "id" | "builtin" | "createdAt" | "updatedAt">) => string;
  /** 更新 skill */
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  /** 删除 skill（仅限自定义） */
  deleteSkill: (id: string) => void;
  /** 设置变量值 */
  setVariableValue: (skillId: string, variableName: string, value: string) => void;
  /** 获取填充变量后的 system prompt */
  getResolvedSystemPrompt: (skillId: string) => string;
}

function generateId(): string {
  return `skill-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 内置 skills */
const BUILTIN_SKILLS: Skill[] = [FRONT_DESIGN_SKILL, CODE_REVIEW_SKILL];

/**
 * 简单的模板引擎
 * 支持 {{variable}} 和 {{#eq variable "value"}}...{{/eq}} 语法
 */
function resolveTemplate(template: string, variables: Record<string, string>): string {
  let result = template;

  // 处理条件块 {{#eq variable "value"}}...{{/eq}}
  const conditionRegex = /\{\{#eq\s+(\w+)\s+"([^"]+)"\}\}([\s\S]*?)\{\{\/eq\}\}/g;
  result = result.replace(conditionRegex, (_, varName, expectedValue, content) => {
    const actualValue = variables[varName] || "";
    return actualValue === expectedValue ? content : "";
  });

  // 处理简单变量 {{variable}}
  const variableRegex = /\{\{(\w+)\}\}/g;
  result = result.replace(variableRegex, (_, varName) => {
    return variables[varName] || "";
  });

  return result;
}

export const useSkillStore = create<SkillState>()(
  persist(
    (set, get) => ({
      skills: BUILTIN_SKILLS,
      activeSkillId: FRONT_DESIGN_SKILL.id, // 默认激活 front-design
      variableValues: {
        [FRONT_DESIGN_SKILL.id]: {
          framework: "vanilla",
          style: "modern",
        },
      },

      getActiveSkill: () => {
        const { skills, activeSkillId } = get();
        return skills.find((s) => s.id === activeSkillId);
      },

      setActiveSkill: (id) => set({ activeSkillId: id }),

      addSkill: (skill) => {
        const id = generateId();
        const now = Date.now();
        set((state) => ({
          skills: [
            ...state.skills,
            { ...skill, id, builtin: false, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      updateSkill: (id, updates) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id && !s.builtin
              ? { ...s, ...updates, updatedAt: Date.now() }
              : s
          ),
        })),

      deleteSkill: (id) =>
        set((state) => {
          const skill = state.skills.find((s) => s.id === id);
          if (skill?.builtin) return state; // 不能删除内置 skill

          const newActiveId =
            state.activeSkillId === id ? FRONT_DESIGN_SKILL.id : state.activeSkillId;

          return {
            skills: state.skills.filter((s) => s.id !== id),
            activeSkillId: newActiveId,
          };
        }),

      setVariableValue: (skillId, variableName, value) =>
        set((state) => ({
          variableValues: {
            ...state.variableValues,
            [skillId]: {
              ...state.variableValues[skillId],
              [variableName]: value,
            },
          },
        })),

      getResolvedSystemPrompt: (skillId) => {
        const { skills, variableValues } = get();
        const skill = skills.find((s) => s.id === skillId);
        if (!skill) return "";

        const values = variableValues[skillId] || {};

        // 使用默认值填充未设置的变量
        const resolvedValues: Record<string, string> = {};
        if (skill.variables) {
          for (const v of skill.variables) {
            resolvedValues[v.name] = values[v.name] ?? v.defaultValue;
          }
        }

        return resolveTemplate(skill.systemPrompt, resolvedValues);
      },
    }),
    {
      name: "open-design-skills",
      partialize: (state) => ({
        skills: state.skills.filter((s) => !s.builtin), // 只持久化自定义 skill
        activeSkillId: state.activeSkillId,
        variableValues: state.variableValues,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<SkillState>;
        return {
          ...current,
          // 合并内置 skills 和持久化的自定义 skills
          skills: [
            ...BUILTIN_SKILLS,
            ...(persistedState.skills || []),
          ],
          activeSkillId: persistedState.activeSkillId ?? current.activeSkillId,
          variableValues: persistedState.variableValues ?? current.variableValues,
        };
      },
    }
  )
);
