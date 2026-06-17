import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CopybookTemplate, CopybookConfig, TemplateStore } from '@/types';

function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generatePreviewText(config: CopybookConfig): string {
  const chars = Array.from(config.text).filter(
    (ch) => ch !== '\n' && ch !== '\r' && ch !== '\t' && ch !== ' '
  );
  return chars.slice(0, 20).join('') + (chars.length > 20 ? '...' : '');
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],
      selectedTemplateIds: [],

      saveTemplate: (name, config) => {
        const now = Date.now();
        const template: CopybookTemplate = {
          id: generateId(),
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
    }),
    {
      name: 'copybook-templates',
      partialize: (state) => ({ templates: state.templates }),
    }
  )
);
