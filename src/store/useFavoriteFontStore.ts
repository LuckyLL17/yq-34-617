import { create } from 'zustand';
import { createPersistedStore, STORAGE_KEYS } from './utils/persist';

/**
 * 收藏字体 Store
 * 负责用户收藏字体的管理
 * 职责：管理字体收藏列表和收藏状态切换
 */
interface FavoriteFontState {
  /** 收藏的字体 ID 列表 */
  favoriteFontIds: string[];
  /** 切换字体收藏状态 */
  toggleFavoriteFont: (fontId: string) => void;
  /** 判断字体是否已收藏 */
  isFavoriteFont: (fontId: string) => boolean;
}

export const useFavoriteFontStore = create<FavoriteFontState>()(
  createPersistedStore<FavoriteFontState>(STORAGE_KEYS.FAVORITE_FONTS)((set, get) => ({
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
  }))
);
