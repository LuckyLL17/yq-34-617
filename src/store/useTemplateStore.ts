import { create } from 'zustand';
import type { CopybookTemplate, CopybookConfig, TemplateStore } from '@/types';
import { createPersistedStore, STORAGE_KEYS, generateId } from './utils/persist';

/**
 * 生成模板预览文本
 * 截取配置文本的前 20 个字符作为预览
 */
function generatePreviewText(config: CopybookConfig): string {
  const chars = Array.from(config.text).filter(
    (ch) => ch !== '\n' && ch !== '\r' && ch !== '\t' && ch !== ' '
  );
  return chars.slice(0, 20).join('') + (chars.length > 20 ? '...' : '');
}

/**
 * 模板管理 Store
 * 负责字帖模板的增删改查和选择管理
 * 职责：管理用户保存的字帖模板和选择状态
 */
export const useTemplateStore = create<TemplateStore>()(
  createPersistedStore<TemplateStore>(
    STORAGE_KEYS.TEMPLATES,
    (state) => ({ templates: state.templates })
  )((set, get) => ({
    templates: [],
    selectedTemplateIds: [],

    saveTemplate: (name, config) => {
      const now = Date.now();
      const template: CopybookTemplate = {
        id: generateId('tpl'),
        name,
        config: { ...config },
        createdAt: now,
        updatedAt: now,
        previewText: generatePreviewText(config),
      };
      set((state) => ({
        templates: [template, ...state.templates],
      }));
      return template;
    },

    updateTemplate: (id, updates) => {
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
        ),
      }));
    },

    deleteTemplate: (id) => {
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        selectedTemplateIds: state.selectedTemplateIds.filter((sid) => sid !== id),
      }));
    },

    deleteTemplates: (ids) => {
      const idSet = new Set(ids);
      set((state) => ({
        templates: state.templates.filter((t) => !idSet.has(t.id)),
        selectedTemplateIds: state.selectedTemplateIds.filter((sid) => !idSet.has(sid)),
      }));
    },

    toggleSelectTemplate: (id) => {
      set((state) => {
        const exists = state.selectedTemplateIds.includes(id);
        return {
          selectedTemplateIds: exists
            ? state.selectedTemplateIds.filter((sid) => sid !== id)
            : [...state.selectedTemplateIds, id],
        };
      });
    },

    selectAllTemplates: () => {
      set((state) => ({
        selectedTemplateIds: state.templates.map((t) => t.id),
      }));
    },

    clearSelection: () => {
      set({ selectedTemplateIds: [] });
    },

    loadTemplateToConfig: (id, applyConfig) => {
      const template = get().templates.find((t) => t.id === id);
      if (template) {
        applyConfig(template.config);
      }
    },
  }))
);
