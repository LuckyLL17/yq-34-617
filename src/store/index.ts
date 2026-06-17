/**
 * Store 统一导出模块
 *
 * 集中导出所有 store，方便组件引用。
 *
 * Store 架构设计：
 * - useConfigStore: 字帖配置管理（外观、布局、样式）
 * - useDrawingStore: 绘图状态管理（画笔、路径、完成度）
 * - useTextStore: 文本处理管理（笔画筛选、排序、难度、动画）
 * - useCheckinStore: 打卡记录管理（持久化）
 * - useFavoriteFontStore: 字体收藏管理（持久化）
 * - useTemplateStore: 模板管理（持久化）
 *
 * 设计原则：
 * - 单一职责：每个 store 只负责一个领域的状态
 * - 可组合：组件可以根据需要选择使用多个 store
 * - 无循环依赖：store 之间不直接互相依赖
 */

export { useConfigStore, DEFAULT_CONFIG } from './useConfigStore';
export { useDrawingStore, COMPLETION_THRESHOLD } from './useDrawingStore';
export { useTextStore, DIFFICULTY_PRESETS } from './useTextStore';
export { useCheckinStore, formatDate, parseDate } from './useCheckinStore';
export { useFavoriteFontStore } from './useFavoriteFontStore';
export { useTemplateStore } from './useTemplateStore';
export { STORAGE_KEYS, createPersistedStore, generateId } from './utils/persist';
