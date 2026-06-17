import { useState, useMemo } from 'react';
import { X, Check, Type, ZoomIn, ZoomOut, Star } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import { useFavoriteFontStore } from '@/store/useFavoriteFontStore';
import { getSortedFontsByType } from '@/utils/fonts';
import type { FontOption } from '@/types';

interface FontCompareModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FontCompareModal({ open, onClose }: FontCompareModalProps) {
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

  const [inputText, setInputText] = useState('永');
  const [fontSize, setFontSize] = useState(72);
  const [selectedFontId, setSelectedFontId] = useState(fontId);

  const { favorites: favFonts, others: otherFonts } = useMemo(
    () => getSortedFontsByType(textType, favoriteFontIds),
    [textType, favoriteFontIds]
  );
  const totalCount = favFonts.length + otherFonts.length;

  const displayText = inputText.slice(0, 1) || '永';

  const handleSelectFont = (font: FontOption) => {
    setSelectedFontId(font.id);
    setFontId(font.id);
    setTimeout(() => onClose(), 200);
  };

  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => Math.max(32, Math.min(128, prev + delta)));
  };

  const handleToggleFavorite = (e: React.MouseEvent, fontId: string) => {
    e.stopPropagation();
    toggleFavoriteFont(fontId);
  };

  const renderFontCard = (font: FontOption, isFav: boolean) => {
    const isSelected = font.id === selectedFontId;
    const isCurrent = font.id === fontId;

    return (
      <button
        key={font.id}
        onClick={() => handleSelectFont(font)}
        className={`group relative p-5 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
          isSelected
            ? 'border-[#8B2E20] bg-[#8B2E20]/5 shadow-lg shadow-[#8B2E20]/10'
            : 'border-stone-200 bg-white hover:border-[#8B2E20]/50 hover:bg-stone-50'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span
              onClick={(e) => handleToggleFavorite(e, font.id)}
              className={`cursor-pointer transition-colors ${
                isFav ? 'text-amber-400 hover:text-amber-500' : 'text-stone-300 hover:text-amber-400'
              }`}
            >
              <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
            </span>
            <p
              className={`text-sm font-semibold ${
                isSelected ? 'text-[#8B2E20]' : 'text-stone-700'
              }`}
            >
              {font.name}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isCurrent && !isSelected && (
              <span className="text-xs text-stone-400">当前使用</span>
            )}
            {isSelected && (
              <div className="w-6 h-6 rounded-full bg-[#8B2E20] flex items-center justify-center shadow-md">
                <Check size={14} className="text-white" />
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center justify-center py-6 px-2 rounded-lg bg-gradient-to-br from-stone-50 to-white border border-stone-100"
          style={{ minHeight: `${fontSize + 40}px` }}
        >
          <span
            className="text-stone-800 leading-none transition-transform group-hover:scale-110"
            style={{
              fontFamily: font.family,
              fontSize: `${fontSize}px`,
            }}
          >
            {displayText}
          </span>
        </div>

        {isSelected && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#8B2E20] text-white text-xs font-medium rounded-full">
              <Check size={12} />
              已选择
            </span>
          </div>
        )}

        {!isSelected && (
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-center">
            <span className="text-xs text-[#8B2E20] font-medium">
              点击选择此字体
            </span>
          </div>
        )}
      </button>
    );
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'fadeInUp 0.3s ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] flex items-center justify-center shadow-lg shadow-[#8B2E20]/20">
              <Type size={20} className="text-white" />
            </div>
            <div>
              <h3
                className="text-lg font-bold text-[#3D2C1F]"
                style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}
              >
                字体对比选择
              </h3>
              <p className="text-xs text-stone-500">
                共 {totalCount} 款字体 · {favFonts.length} 个常用 · 点击选择喜欢的字体
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] max-w-md">
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                输入要对比的字
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={1}
                  className="w-full px-4 py-2.5 text-lg bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
                  placeholder="请输入一个字"
                  style={{ fontFamily: '"Noto Serif SC", serif' }}
                />
                {inputText.length > 1 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-600">
                    仅显示第一个字
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                预览大小
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFontSizeChange(-8)}
                  disabled={fontSize <= 32}
                  className="w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="w-12 text-center text-sm font-medium text-stone-700">
                  {fontSize}px
                </span>
                <button
                  onClick={() => handleFontSizeChange(8)}
                  disabled={fontSize >= 128}
                  className="w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span
                  className="text-3xl"
                  style={{
                    fontFamily: '"Ma Shan Zheng", "KaiTi", cursive',
                    color: '#8B2E20',
                  }}
                >
                  {displayText}
                </span>
                <div>
                  <p className="text-xs font-medium text-amber-800">当前预览字</p>
                  <p className="text-xs text-amber-600">可调节大小</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {favFonts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 mb-3">
                <Star size={14} fill="currentColor" className="text-amber-400" />
                <span className="text-sm font-medium text-amber-600">常用字体</span>
                <span className="text-xs text-amber-500">({favFonts.length})</span>
              </div>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
              >
                {favFonts.map((font) => renderFontCard(font, true))}
              </div>
            </div>
          )}
          {otherFonts.length > 0 && (
            <div>
              {favFonts.length > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-sm font-medium text-stone-400">全部字体</span>
                  <span className="text-xs text-stone-400">({otherFonts.length})</span>
                </div>
              )}
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
              >
                {otherFonts.map((font) => renderFontCard(font, false))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50 text-center shrink-0">
          <p className="text-xs text-stone-500">
            💡 提示：点击任意字体卡片即可应用并关闭窗口，拖动滑块可调整预览字大小
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
