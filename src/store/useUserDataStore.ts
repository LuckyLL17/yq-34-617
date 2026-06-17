import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CopybookTemplate,
  CopybookConfig,
  CheckinRecord,
  CheckinStats,
} from '@/types';

/* ==================== 模板管理 ==================== */

/**
 * 生成模板ID
 */
function generateTemplateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 生成模板预览文本
 */
function generatePreviewText(config: CopybookConfig): string {
  const chars = Array.from(config.text).filter(
    (ch) => ch !== '\n' && ch !== '\r' && ch !== '\t' && ch !== ' '
  );
  return chars.slice(0, 20).join('') + (chars.length > 20 ? '...' : '');
}

/* ==================== 打卡记录 ==================== */

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 解析 YYYY-MM-DD 日期字符串
 */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 计算连续打卡天数
 */
function calcStreaks(records: Record<string, CheckinRecord>): { current: number; longest: number } {
  const dates = Object.keys(records).sort();
  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let current = 0;
  let prevDate: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = dates.length - 1; i >= 0; i--) {
    const cur = parseDate(dates[i]);
    cur.setHours(0, 0, 0, 0);

    if (prevDate === null) {
      const diffDays = Math.round((today.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        current = 1;
      } else {
        current = 0;
        break;
      }
    } else {
      const diffDays = Math.round((prevDate.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current++;
      } else {
        break;
      }
    }

    if (current > longest) longest = current;
    prevDate = cur;
  }

  let longestAll = 0;
  let streak = 0;
  prevDate = null;
  for (const dateStr of dates) {
    const cur = parseDate(dateStr);
    cur.setHours(0, 0, 0, 0);
    if (prevDate === null) {
      streak = 1;
    } else {
      const diffDays = Math.round((cur.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    if (streak > longestAll) longestAll = streak;
    prevDate = cur;
  }

  return { current, longest: Math.max(longest, longestAll) };
}

/* ==================== 用户数据 Store ==================== */

/**
 * 用户数据状态管理
 * 负责管理所有需要持久化的用户数据：模板、打卡记录、收藏字体
 * 采用分模块组织，保持职责清晰
 */
interface UserDataState {
  /* ---------- 模板模块 ---------- */
  templates: CopybookTemplate[];
  selectedTemplateIds: string[];

  /** 保存模板 */
  saveTemplate: (name: string, config: CopybookConfig) => CopybookTemplate;
  /** 更新模板 */
  updateTemplate: (id: string, updates: Partial<CopybookTemplate>) => void;
  /** 删除单个模板 */
  deleteTemplate: (id: string) => void;
  /** 批量删除模板 */
  deleteTemplates: (ids: string[]) => void;
  /** 切换模板选中状态 */
  toggleSelectTemplate: (id: string) => void;
  /** 全选模板 */
  selectAllTemplates: () => void;
  /** 清除模板选中 */
  clearSelection: () => void;
  /** 加载模板配置到当前字帖 */
  loadTemplateToConfig: (id: string, applyConfig: (config: CopybookConfig) => void) => void;

  /* ---------- 打卡模块 ---------- */
  checkinRecords: Record<string, CheckinRecord>;

  /** 打卡 */
  checkin: (record: Omit<CheckinRecord, 'timestamp'>) => void;
  /** 获取指定日期的打卡记录 */
  getCheckinRecordByDate: (date: string) => CheckinRecord | undefined;
  /** 获取某月的打卡记录 */
  getMonthCheckinRecords: (year: number, month: number) => Record<string, CheckinRecord>;
  /** 获取打卡统计 */
  getCheckinStats: () => CheckinStats;
  /** 获取最大字数 */
  getMaxCharCount: () => number;

  /* ---------- 字体收藏模块 ---------- */
  favoriteFontIds: string[];

  /** 切换字体收藏状态 */
  toggleFavoriteFont: (fontId: string) => void;
  /** 检查字体是否已收藏 */
  isFavoriteFont: (fontId: string) => boolean;
}

const STORAGE_KEY = 'copybook-user-data';

export const useUserDataStore = create<UserDataState>()(
  persist(
    (set, get) => ({
      /* ---------- 模板模块初始状态 ---------- */
      templates: [],
      selectedTemplateIds: [],

      saveTemplate: (name, config) => {
        const now = Date.now();
        const template: CopybookTemplate = {
          id: generateTemplateId(),
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

      /* ---------- 打卡模块初始状态 ---------- */
      checkinRecords: {},

      checkin: (record) =>
        set((state) => {
          const existing = state.checkinRecords[record.date];
          const newRecord: CheckinRecord = {
            ...record,
            timestamp: Date.now(),
            charCount: existing ? existing.charCount + record.charCount : record.charCount,
            posterThumbnail: record.posterThumbnail || existing?.posterThumbnail,
          };
          return {
            checkinRecords: {
              ...state.checkinRecords,
              [record.date]: newRecord,
            },
          };
        }),

      getCheckinRecordByDate: (date) => get().checkinRecords[date],

      getMonthCheckinRecords: (year, month) => {
        const records = get().checkinRecords;
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
        const result: Record<string, CheckinRecord> = {};
        for (const [date, record] of Object.entries(records)) {
          if (date.startsWith(prefix)) {
            result[date] = record;
          }
        }
        return result;
      },

      getCheckinStats: () => {
        const records = get().checkinRecords;
        const dates = Object.keys(records);
        let totalChars = 0;
        for (const rec of Object.values(records)) {
          totalChars += rec.charCount;
        }
        const { current, longest } = calcStreaks(records);
        return {
          totalDays: dates.length,
          totalChars,
          currentStreak: current,
          longestStreak: longest,
        };
      },

      getMaxCharCount: () => {
        const records = get().checkinRecords;
        let max = 0;
        for (const rec of Object.values(records)) {
          if (rec.charCount > max) max = rec.charCount;
        }
        return max;
      },

      /* ---------- 字体收藏模块初始状态 ---------- */
      favoriteFontIds: [],

      toggleFavoriteFont: (fontId) =>
        set((state) => {
          const exists = state.favoriteFontIds.includes(fontId);
          return {
            favoriteFontIds: exists
              ? state.favoriteFontIds.filter((id) => id !== fontId)
              : [...state.favoriteFontIds, fontId],
          };
        }),

      isFavoriteFont: (fontId) => get().favoriteFontIds.includes(fontId),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        templates: state.templates,
        checkinRecords: state.checkinRecords,
        favoriteFontIds: state.favoriteFontIds,
      }),
    }
  )
);

export { formatDate, parseDate };
