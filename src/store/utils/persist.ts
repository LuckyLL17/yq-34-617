import { persist } from 'zustand/middleware';
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * 持久化存储键名前缀
 * 统一管理所有 store 的存储键名，避免命名冲突
 */
export const STORAGE_KEYS = {
  CHECKIN: 'copybook-checkin-records',
  FAVORITE_FONTS: 'copybook-favorite-fonts',
  TEMPLATES: 'copybook-templates',
} as const;

/**
 * 创建带持久化的 store 创建器
 * 封装 persist 中间件的通用配置，减少重复代码
 *
 * @template T - store 状态类型
 * @param name - 存储键名
 * @param partialize - 选择需要持久化的状态字段
 * @returns 带有 persist 中间件的 store 创建器
 */
export function createPersistedStore<T extends object>(
  name: string,
  partialize?: (state: T) => Partial<T>
): (
  config: StateCreator<T, [], [StoreMutatorIdentifier, unknown][]>
) => StateCreator<T, [], [['zustand/persist', Partial<T>]]> {
  return (config) =>
    persist(config, {
      name,
      ...(partialize ? { partialize } : {}),
    });
}

/**
 * 生成唯一 ID
 * 用于模板、记录等需要唯一标识的场景
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
