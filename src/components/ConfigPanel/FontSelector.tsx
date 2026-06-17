import { useState, useRef, useEffect, useMemo } from 'react';
import { Star } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import { useFavoriteFontStore } from '@/store/useFavoriteFontStore';
import { getFontById, getSortedFontsByType } from '@/utils/fonts';

interface FontSelectorProps {
  onOpenCompare?: () => void;
}

export default function FontSelector({ onOpenCompare }: FontSelectorProps) {
  const { textType, fontId, setFontId } = useCopybookStore(
    useShallow((s) => ({
      textType: s.textType,
      fontId: s.fontId,
      setFontId: s.setFontId,
    }))
  );

  const { favoriteFontIds, toggleFavoriteFont } = useFavoriteFontStore(
    useShallow((s) => ({
      favoriteFontIds: s.favoriteFontIds,
      toggleFavoriteFont: s.toggleFavoriteFont,
    }))
  );

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentFont = getFontById(fontId);
  const { favorites, others } = useMemo(
    () => getSortedFontsByType(textType, favoriteFontIds),
    [textType, favoriteFontIds]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [open]);

  const handleSelect = (id: string) => {
    setFontId(id);
    setOpen(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavoriteFont(id);
  };

  const renderFontItem = (font: { id: string; name: string; family: string }, isFav: boolean) => {
    const isSelected = font.id === fontId;
    return (
      <div
        key={font.id}
        data-selected={isSelected || undefined}
        onClick={() => handleSelect(font.id)}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#8B2E20]/10 text-[#8B2E20]'
            : 'text-stone-700 hover:bg-stone-50'
        }`}
      >
        <button
          onClick={(e) => handleToggleFavorite(e, font.id)}
          className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${
            isFav
              ? 'text-amber-400 hover:text-amber-500'
              : 'text-stone-300 hover:text-amber-400'
          }`}
        >
          <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <span className="flex-1 truncate text-sm" style={{ fontFamily: font.family }}>
          {font.name}
        </span>
        {isSelected && (
          <span className="shrink-0 text-xs text-[#8B2E20]/70">✓</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">书法字体</label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2.5 pr-10 text-sm bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all cursor-pointer text-left"
        >
          <span className="flex-1 truncate" style={{ fontFamily: currentFont.family }}>
            {currentFont.name}
          </span>
          <svg
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            ref={listRef}
            className="absolute z-50 mt-1 w-full bg-white border-2 border-stone-200 rounded-lg shadow-xl max-h-72 overflow-y-auto custom-scrollbar animate-in"
          >
            {favorites.length > 0 && (
              <>
                <div className="px-3 pt-2 pb-1 text-xs font-medium text-amber-600 flex items-center gap-1">
                  <Star size={10} fill="currentColor" />
                  常用字体
                </div>
                {favorites.map((f) => renderFontItem(f, true))}
                {others.length > 0 && (
                  <div className="my-1 border-t border-stone-100" />
                )}
              </>
            )}
            {others.length > 0 && (
              <>
                {favorites.length > 0 && (
                  <div className="px-3 pt-1 pb-1 text-xs font-medium text-stone-400">
                    全部字体
                  </div>
                )}
                {others.map((f) => renderFontItem(f, false))}
              </>
            )}
          </div>
        )}
      </div>
      <div
        className="mt-2 px-3 py-2.5 bg-stone-50 rounded-lg text-center text-lg text-stone-600 border border-stone-100"
        style={{ fontFamily: currentFont.family }}
      >
        {textType === 'chinese' && '永字八法'}
        {textType === 'number' && '1234567890'}
        {textType === 'english' && 'Hello World'}
      </div>

      {onOpenCompare && (
        <button
          onClick={onOpenCompare}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#8B2E20]/5 hover:bg-[#8B2E20]/10 border border-[#8B2E20]/20 hover:border-[#8B2E20]/40 rounded-lg transition-all group"
        >
          <span className="text-sm font-medium text-[#8B2E20]">字体对比选择</span>
          <span className="text-xs text-[#8B2E20]/60 group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      )}
    </div>
  );
}
