import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { WatermarkPosition } from '@/types';

const watermarkPositions: { id: WatermarkPosition; label: string }[] = [
  { id: 'cell-corner', label: '格子右下角' },
  { id: 'page-center', label: '页面中央' },
];

export default function WatermarkConfig() {
  const {
    watermark,
    setWatermarkEnabled,
    setWatermarkText,
    setWatermarkPosition,
    setWatermarkFontSize,
    setWatermarkOpacity,
    setWatermarkColor,
  } = useCopybookStore(
    useShallow((s) => ({
      watermark: s.watermark,
      setWatermarkEnabled: s.setWatermarkEnabled,
      setWatermarkText: s.setWatermarkText,
      setWatermarkPosition: s.setWatermarkPosition,
      setWatermarkFontSize: s.setWatermarkFontSize,
      setWatermarkOpacity: s.setWatermarkOpacity,
      setWatermarkColor: s.setWatermarkColor,
    }))
  );

  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
          启用水印
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={watermark.enabled}
            onChange={(e) => setWatermarkEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </div>
      </label>

      {watermark.enabled && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">水印文字</label>
            <input
              type="text"
              value={watermark.text}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="请输入水印文字"
              maxLength={20}
              className="w-full px-3 py-2 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">水印位置</label>
            <div className="grid grid-cols-2 gap-1.5">
              {watermarkPositions.map((p) => {
                const active = watermark.position === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setWatermarkPosition(p.id)}
                    className={`py-2 px-1.5 text-xs font-medium rounded-md border transition-all duration-200 ${
                      active
                        ? 'border-[#8B2E20] bg-[#8B2E20] text-white shadow-sm'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-stone-700">字号大小</label>
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {watermark.fontSize}px
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={48}
              value={watermark.fontSize}
              onChange={(e) => setWatermarkFontSize(Number(e.target.value))}
              className="w-full accent-[#8B2E20] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-stone-700">透明度</label>
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {Math.round(watermark.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              value={watermark.opacity * 100}
              onChange={(e) => setWatermarkOpacity(Number(e.target.value) / 100)}
              className="w-full accent-[#8B2E20] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">水印颜色</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={watermark.color}
                onChange={(e) => setWatermarkColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-stone-200 bg-white p-0.5"
              />
              <input
                type="text"
                value={watermark.color}
                onChange={(e) => setWatermarkColor(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all font-mono"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
