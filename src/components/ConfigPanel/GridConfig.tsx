import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { GridType, TraceDisplayMode, WritingDirection } from '@/types';
import { ArrowRight, ArrowLeft, ArrowDown, ArrowUpRight } from 'lucide-react';

const gridTypes: { id: GridType; label: string }[] = [
  { id: 'tian', label: '田字格' },
  { id: 'mi', label: '米字格' },
  { id: 'hui', label: '回宫格' },
  { id: 'none', label: '无格线' },
];

const writingDirections: { id: WritingDirection; label: string; icon: React.ReactNode }[] = [
  { id: 'horizontal-ltr', label: '横排从左到右', icon: <ArrowRight size={14} /> },
  { id: 'horizontal-rtl', label: '横排从右到左', icon: <ArrowLeft size={14} /> },
  { id: 'vertical-rtl', label: '竖排从右到左', icon: <ArrowDown size={14} /> },
  { id: 'vertical-ltr', label: '竖排从左到右', icon: <ArrowUpRight size={14} /> },
];

const traceDisplayModes: { id: TraceDisplayMode; label: string; hint: string }[] = [
  { id: 'all', label: '全部显示', hint: '每个格子都显示范字' },
  { id: 'every2', label: '每2字1个', hint: '隔1格显示1个范字' },
  { id: 'every4', label: '每4字1个', hint: '隔3格显示1个范字' },
  { id: 'firstRow', label: '仅首行', hint: '只显示第一行范字' },
];

export default function GridConfig() {
  const {
    gridType,
    cellSize,
    colsPerRow,
    rows,
    writingDirection,
    showDashed,
    showTrace,
    traceOpacity,
    traceDisplayMode,
    setGridType,
    setCellSize,
    setColsPerRow,
    setRows,
    setWritingDirection,
    setShowDashed,
    setShowTrace,
    setTraceOpacity,
    setTraceDisplayMode,
  } = useCopybookStore(
    useShallow((s) => ({
      gridType: s.gridType,
      cellSize: s.cellSize,
      colsPerRow: s.colsPerRow,
      rows: s.rows,
      writingDirection: s.writingDirection,
      showDashed: s.showDashed,
      showTrace: s.showTrace,
      traceOpacity: s.traceOpacity,
      traceDisplayMode: s.traceDisplayMode,
      setGridType: s.setGridType,
      setCellSize: s.setCellSize,
      setColsPerRow: s.setColsPerRow,
      setRows: s.setRows,
      setWritingDirection: s.setWritingDirection,
      setShowDashed: s.setShowDashed,
      setShowTrace: s.setShowTrace,
      setTraceOpacity: s.setTraceOpacity,
      setTraceDisplayMode: s.setTraceDisplayMode,
    }))
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-stone-700">格子类型</label>
        <div className="grid grid-cols-4 gap-1.5">
          {gridTypes.map((g) => {
            const active = gridType === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGridType(g.id)}
                className={`py-2 px-1.5 text-xs font-medium rounded-md border transition-all duration-200 ${
                  active
                    ? 'border-[#8B2E20] bg-[#8B2E20] text-white shadow-sm'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-stone-700">书写方向</label>
        <div className="grid grid-cols-2 gap-1.5">
          {writingDirections.map((d) => {
            const active = writingDirection === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setWritingDirection(d.id)}
                className={`py-2 px-2 text-xs font-medium rounded-md border transition-all duration-200 flex items-center gap-2 justify-center ${
                  active
                    ? 'border-[#8B2E20] bg-[#8B2E20] text-white shadow-sm'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {d.icon}
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-stone-700">格子大小</label>
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            {cellSize}px
          </span>
        </div>
        <input
          type="range"
          min={32}
          max={120}
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          className="w-full accent-[#8B2E20] cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-stone-700">每行字数</label>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {colsPerRow}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={16}
            value={colsPerRow}
            onChange={(e) => setColsPerRow(Number(e.target.value))}
            className="w-full accent-[#8B2E20] cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-stone-700">行数</label>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {rows}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={20}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="w-full accent-[#8B2E20] cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
            显示参考虚线
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showDashed}
              onChange={(e) => setShowDashed(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
            描红临摹模式
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showTrace}
              onChange={(e) => setShowTrace(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
        </label>

        {showTrace && (
          <div className="space-y-4 pl-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-stone-500">描红透明度</label>
                <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                  {Math.round(traceOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                value={traceOpacity * 100}
                onChange={(e) => setTraceOpacity(Number(e.target.value) / 100)}
                className="w-full accent-[#8B2E20] cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-stone-600">范字显示方式</label>
              <div className="grid grid-cols-2 gap-1.5">
                {traceDisplayModes.map((m) => {
                  const active = traceDisplayMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setTraceDisplayMode(m.id)}
                      title={m.hint}
                      className={`py-2 px-2 text-xs font-medium rounded-md border transition-all duration-200 text-left ${
                        active
                          ? 'border-[#8B2E20] bg-[#8B2E20] text-white shadow-sm'
                          : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-semibold">{m.label}</div>
                      <div className={`mt-0.5 text-[10px] leading-tight ${active ? 'text-white/80' : 'text-stone-400'}`}>
                        {m.hint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
