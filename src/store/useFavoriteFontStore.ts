import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'copybook-favorite-fonts';

interface FavoriteFontState {
  favoriteFontIds: string[];
  toggleFavoriteFont: (fontId: string) => void;
  isFavoriteFont: (fontId: string) => boolean;
}

export const useFavoriteFontStore = create<FavoriteFontState>()(
  persist(
    (set, get) => ({
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
    }
  )
);
