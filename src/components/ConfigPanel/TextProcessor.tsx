import { useShallow } from 'zustand/react/shallow';
import { Shuffle, ArrowDownUp, RotateCcw, ListOrdered, Filter } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { SortMode } from '@/types';

const sortOptions: { id: SortMode; label: string; icon: typeof Shuffle }[] = [
  { id: 'original', label: '原序', icon: ListOrdered },
  { id: 'reverse', label: '倒序', icon: ArrowDownUp },
  { id: 'shuffle', label: '随机', icon: Shuffle },
  { id: 'interleave', label: '间隔', icon: Filter },
];

export default function TextProcessor() {
  const {
    textType,
    minStroke,
    maxStroke,
    sortMode,
    interleaveInterval,
    setMinStroke,
    setMaxStroke,
    setSortMode,
    setInterleaveInterval,
    applyStrokeFilter,
    applyTextSort,
    resetTextProcessing,
  } = useCopybookStore(
    useShallow((s) => ({
      textType: s.textType,
      minStroke: s.minStroke,
      maxStroke: s.maxStroke,
      sortMode: s.sortMode,
      interleaveInterval: s.interleaveInterval,
      setMinStroke: s.setMinStroke,
      setMaxStroke: s.setMaxStroke,
      setSortMode: s.setSortMode,
      setInterleaveInterval: s.setInterleaveInterval,
      applyStrokeFilter: s.applyStrokeFilter,
      applyTextSort: s.applyTextSort,
      resetTextProcessing: s.resetTextProcessing,
    }))
  );

  const isChinese = textType === 'chinese';

  return (
    <div className="space-y-5">
      {isChinese && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
              <Filter size={14} strokeWidth={2} />
              笔画数过滤
            </label>
            <button
              onClick={applyStrokeFilter}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#8B2E20] rounded-md hover:bg-[#7a281c] active:scale-[0.98] transition-all"
            >
              应用过滤
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">最少笔画</label>
              <input
                type="number"
                min={1}
                max={30}
                value={minStroke}
                onChange={(e) => setMinStroke(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
              />
            </div>
            <div className="text-stone-400 text-lg font-light pt-4">—</div>
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">最多笔画</label>
              <input
                type="number"
                min={1}
                max={30}
                value={maxStroke}
                onChange={(e) => setMaxStroke(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-stone-400">
            仅保留笔画数在 {minStroke} - {maxStroke} 画之间的汉字
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
            <Shuffle size={14} strokeWidth={2} />
            文字排序
          </label>
          <button
            onClick={applyTextSort}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#8B2E20] rounded-md hover:bg-[#7a281c] active:scale-[0.98] transition-all"
          >
            应用排序
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sortOptions.map((opt) => {
            const Icon = opt.icon;
            const active = sortMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSortMode(opt.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-lg border-2 transition-all duration-200 ${
                  active
                    ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20] shadow-sm'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {sortMode === 'interleave' && (
          <div className="flex items-center gap-3 pt-1">
            <label className="text-xs text-stone-500 whitespace-nowrap">间隔数</label>
            <input
              type="number"
              min={2}
              max={10}
              value={interleaveInterval}
              onChange={(e) => setInterleaveInterval(Number(e.target.value))}
              className="w-20 px-3 py-1.5 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
            />
            <p className="text-xs text-stone-400">
              每 {interleaveInterval} 个字为一组重组顺序
            </p>
          </div>
        )}
        {sortMode === 'shuffle' && (
          <p className="text-xs text-stone-400">
            每次点击「应用排序」都会重新随机打乱文字顺序
          </p>
        )}
        {sortMode === 'reverse' && (
          <p className="text-xs text-stone-400">将当前文字内容完全倒序排列</p>
        )}
      </div>

      <button
        onClick={resetTextProcessing}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-stone-500 bg-stone-100 rounded-lg hover:bg-stone-200 hover:text-stone-700 transition-colors"
      >
        <RotateCcw size={14} />
        重置所有处理（恢复原文）
      </button>
    </div>
  );
}
