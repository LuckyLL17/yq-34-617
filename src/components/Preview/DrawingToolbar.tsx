import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Undo2, Redo2, Eraser, Pencil, Trash2, ChevronUp, ChevronDown, Target, CheckCircle2 } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';

const penColorPresets = [
  { name: '墨黑', value: '#1a1a1a' },
  { name: '深蓝', value: '#1e3a5f' },
  { name: '墨红', value: '#8B2E20' },
  { name: '墨绿', value: '#1b4332' },
  { name: '深紫', value: '#4a1942' },
  { name: '棕色', value: '#5d4037' },
];

const penWidthPresets = [
  { label: '细', value: 2 },
  { label: '中', value: 4 },
  { label: '粗', value: 6 },
  { label: '特粗', value: 10 },
];

export default function DrawingToolbar() {
  const [expanded, setExpanded] = useState(true);
  const {
    drawingEnabled,
    penColor,
    penWidth,
    pagePaths,
    pageRedoStack,
    setDrawingEnabled,
    setPenColor,
    setPenWidth,
    undoPath,
    redoPath,
    clearAllPaths,
    getCompletionPercentage,
    getCompletedCellsCount,
    getTotalValidCells,
  } = useCopybookStore(
    useShallow((s) => ({
      drawingEnabled: s.drawingEnabled,
      penColor: s.penColor,
      penWidth: s.penWidth,
      pagePaths: s.pagePaths,
      pageRedoStack: s.pageRedoStack,
      setDrawingEnabled: s.setDrawingEnabled,
      setPenColor: s.setPenColor,
      setPenWidth: s.setPenWidth,
      undoPath: s.undoPath,
      redoPath: s.redoPath,
      clearAllPaths: s.clearAllPaths,
      getCompletionPercentage: s.getCompletionPercentage,
      getCompletedCellsCount: s.getCompletedCellsCount,
      getTotalValidCells: s.getTotalValidCells,
    }))
  );

  const { hasUndo, hasRedo, hasPaths } = useMemo(() => {
    let undo = false;
    let redo = false;
    let paths = false;
    for (const key in pagePaths) {
      if (pagePaths[key] && pagePaths[key].length > 0) {
        undo = true;
        paths = true;
      }
    }
    for (const key in pageRedoStack) {
      if (pageRedoStack[key] && pageRedoStack[key].length > 0) {
        redo = true;
      }
    }
    return { hasUndo: undo, hasRedo: redo, hasPaths: paths };
  }, [pagePaths, pageRedoStack]);

  const completionPercentage = useMemo(() => getCompletionPercentage(), [getCompletionPercentage, pagePaths]);
  const completedCount = useMemo(() => getCompletedCellsCount(), [getCompletedCellsCount, pagePaths]);
  const totalCells = useMemo(() => getTotalValidCells(), [getTotalValidCells]);
  const isAllComplete = completionPercentage >= 100;

  const handleUndo = () => {
    for (const key in pagePaths) {
      if (pagePaths[key] && pagePaths[key].length > 0) {
        undoPath(Number(key));
        return;
      }
    }
  };

  const handleRedo = () => {
    const redoKeys = Object.keys(pageRedoStack).filter(
      (k) => pageRedoStack[Number(k)] && pageRedoStack[Number(k)].length > 0
    );
    if (redoKeys.length > 0) {
      redoPath(Number(redoKeys[redoKeys.length - 1]));
    }
  };

  const getProgressColor = () => {
    if (completionPercentage >= 100) return 'from-green-400 to-green-600';
    if (completionPercentage >= 60) return 'from-green-400 to-emerald-500';
    if (completionPercentage >= 30) return 'from-amber-400 to-yellow-500';
    return 'from-stone-300 to-stone-400';
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-50 to-white">
        <div className="flex items-center gap-2">
          <Pencil size={18} className="text-[#8B2E20]" />
          <h3 className="font-semibold text-sm text-stone-700">临摹练字</h3>
          {drawingEnabled && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#8B2E20]/10 text-[#8B2E20] rounded">
              已开启
            </span>
          )}
          {hasPaths && !drawingEnabled && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
              已临摹
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {drawingEnabled && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-50 border border-stone-200">
                <Target size={14} className="text-stone-500" />
                <span className="text-[11px] font-medium text-stone-600">
                  进度
                </span>
                <div className="w-20 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold min-w-[32px] ${
                    isAllComplete ? 'text-green-600' : 'text-stone-700'
                  }`}
                >
                  {completionPercentage}%
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setDrawingEnabled(!drawingEnabled)}
            className="relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B2E20]/30"
            style={{ backgroundColor: drawingEnabled ? '#8B2E20' : '#e7e5e4' }}
            aria-pressed={drawingEnabled}
            aria-label={drawingEnabled ? '关闭临摹模式' : '开启临摹模式'}
          >
            <div
              className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              style={{ transform: drawingEnabled ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-stone-100 rounded transition-colors"
            title={expanded ? '收起' : '展开'}
          >
            {expanded ? <ChevronUp size={18} className="text-stone-500" /> : <ChevronDown size={18} className="text-stone-500" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className={`px-4 pb-4 pt-2 space-y-4 transition-opacity duration-200 ${drawingEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          {drawingEnabled && (
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Target size={14} className="text-stone-500" />
                  <span className="text-[11px] font-medium text-stone-600">完成度</span>
                </div>
                <span
                  className={`text-[12px] font-bold ${
                    isAllComplete ? 'text-green-600' : 'text-stone-700'
                  }`}
                >
                  {completedCount} / {totalCells} 格 ({completionPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              {isAllComplete && (
                <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 bg-green-50 rounded-lg border border-green-200/50">
                  <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                  <span className="text-[11px] text-green-700 font-medium">
                    太棒了！所有格子都已完成描红 🎉
                  </span>
                </div>
              )}
            </div>
          )}

          {drawingEnabled && (
            <div className="hidden sm:flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50">
              <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-semibold text-green-800">
                    描红完成度
                  </span>
                  <span className="text-[12px] font-bold text-green-700">
                    {completedCount} / {totalCells}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden border border-green-200/50">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              {isAllComplete && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full shrink-0 animate-pulse">
                  已完成
                </span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-stone-600">笔色</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-6 h-6 rounded border border-stone-200 cursor-pointer bg-transparent"
              />
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {penColorPresets.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setPenColor(c.value)}
                  title={c.name}
                  className={`aspect-square rounded-md border-2 transition-all hover:scale-105 ${
                    penColor === c.value
                      ? 'border-stone-900 ring-2 ring-stone-900/20'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-stone-600">笔触粗细</label>
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {penWidth}px
              </span>
            </div>
            <div className="flex gap-2">
              {penWidthPresets.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setPenWidth(w.value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${
                    penWidth === w.value
                      ? 'border-[#8B2E20] bg-[#8B2E20] text-white'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={penWidth}
              onChange={(e) => setPenWidth(Number(e.target.value))}
              className="w-full accent-[#8B2E20] cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleUndo}
              disabled={!hasUndo}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            >
              <Undo2 size={14} />
              <span>撤销</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={!hasRedo}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            >
              <Redo2 size={14} />
              <span>重做</span>
            </button>
            <button
              onClick={clearAllPaths}
              disabled={!hasPaths}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={14} />
              <span>清除</span>
            </button>
          </div>

          {drawingEnabled && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200/50">
              <Eraser size={14} className="text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                已开启临摹模式，可直接在字帖上描红练习。完成超过 60% 即视为完成，会自动标绿。关闭后可正常滚动预览。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
