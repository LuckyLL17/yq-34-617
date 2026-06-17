import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { ColorTheme } from '@/types';

const colorThemes: ColorTheme[] = [
  {
    id: 'classic-ink',
    name: '古典墨韵',
    description: '传统书法配色，宣纸配墨字，雅致古朴',
    fontColor: '#3D2C1F',
    gridColor: '#D4A574',
    paperTexture: 'rice',
    watermarkColor: '#8B2E20',
    previewColors: ['#F5F0E6', '#3D2C1F', '#D4A574', '#8B2E20'],
  },
  {
    id: 'fresh-blue',
    name: '清新蓝调',
    description: '清爽蓝色系，护眼舒适，现代简约',
    fontColor: '#1e3a5f',
    gridColor: '#64b5f6',
    paperTexture: 'white',
    watermarkColor: '#2196F3',
    previewColors: ['#ffffff', '#1e3a5f', '#64b5f6', '#2196F3'],
  },
  {
    id: 'elegant-cream',
    name: '雅致米黄',
    description: '温润米黄色调，护眼舒适，久看不累',
    fontColor: '#5d4037',
    gridColor: '#D4A574',
    paperTexture: 'cream',
    watermarkColor: '#8D6E63',
    previewColors: ['#FBF6E9', '#5d4037', '#D4A574', '#8D6E63'],
  },
  {
    id: 'green-fresh',
    name: '绿意盎然',
    description: '清新自然绿色系，生机勃勃',
    fontColor: '#2E5339',
    gridColor: '#81c784',
    paperTexture: 'white',
    watermarkColor: '#4CAF50',
    previewColors: ['#ffffff', '#2E5339', '#81c784', '#4CAF50'],
  },
  {
    id: 'purple-elegant',
    name: '典雅紫霞',
    description: '高贵典雅紫色调，文艺浪漫',
    fontColor: '#4A235A',
    gridColor: '#ba68c8',
    paperTexture: 'parchment',
    watermarkColor: '#9C27B0',
    previewColors: ['#F4E4C1', '#4A235A', '#ba68c8', '#9C27B0'],
  },
  {
    id: 'warm-autumn',
    name: '暖色秋意',
    description: '温暖橙棕色调，复古文艺',
    fontColor: '#5d4037',
    gridColor: '#FFB74D',
    paperTexture: 'kraft',
    watermarkColor: '#E65100',
    previewColors: ['#D4B896', '#5d4037', '#FFB74D', '#E65100'],
  },
  {
    id: 'minimal-bw',
    name: '简约黑白',
    description: '经典黑白灰配色，简洁大方',
    fontColor: '#1a1a1a',
    gridColor: '#9ca3af',
    paperTexture: 'white',
    watermarkColor: '#6b7280',
    previewColors: ['#ffffff', '#1a1a1a', '#9ca3af', '#6b7280'],
  },
  {
    id: 'vermilion-ancient',
    name: '朱红古风',
    description: '中国风朱红配色，复古大气',
    fontColor: '#8B2E20',
    gridColor: '#e57373',
    paperTexture: 'newspaper',
    watermarkColor: '#C62828',
    previewColors: ['#E8E0D0', '#8B2E20', '#e57373', '#C62828'],
  },
];

const fontColorPresets = [
  { name: '墨黑', value: '#3D2C1F' },
  { name: '纯黑', value: '#1a1a1a' },
  { name: '深蓝', value: '#1e3a5f' },
  { name: '墨蓝', value: '#2c3e50' },
  { name: '墨红', value: '#8B2E20' },
  { name: '深棕', value: '#5d4037' },
  { name: '墨绿', value: '#2E5339' },
  { name: '深紫', value: '#4A235A' },
];

const gridColorPresets = [
  { name: '浅棕', value: '#D4A574' },
  { name: '浅灰', value: '#9ca3af' },
  { name: '浅红', value: '#e57373' },
  { name: '浅蓝', value: '#64b5f6' },
  { name: '浅绿', value: '#81c784' },
  { name: '浅紫', value: '#ba68c8' },
  { name: '浅橙', value: '#FFB74D' },
  { name: '浅粉', value: '#F48FB1' },
];

export default function ColorConfig() {
  const {
    fontColor,
    gridColor,
    paperTexture,
    watermark,
    setFontColor,
    setGridColor,
    applyColorTheme,
  } = useCopybookStore(
    useShallow((s) => ({
      fontColor: s.fontColor,
      gridColor: s.gridColor,
      paperTexture: s.paperTexture,
      watermark: s.watermark,
      setFontColor: s.setFontColor,
      setGridColor: s.setGridColor,
      applyColorTheme: s.applyColorTheme,
    }))
  );

  const currentThemeId = colorThemes.find(
    (t) =>
      t.fontColor === fontColor &&
      t.gridColor === gridColor &&
      t.paperTexture === paperTexture &&
      t.watermarkColor === watermark.color
  )?.id;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-stone-700">整页主题</label>
          <span className="text-xs text-stone-500">一键切换整套配色</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {colorThemes.map((theme) => {
            const isSelected = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => applyColorTheme(theme)}
                title={`${theme.name}：${theme.description}`}
                className={`group relative aspect-square rounded-lg border-2 transition-all duration-200 overflow-hidden hover:scale-[1.03] ${
                  isSelected
                    ? 'border-[#8B2E20] ring-2 ring-[#8B2E20]/20 shadow-md'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  {theme.previewColors.map((color, idx) => (
                    <div key={idx} style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-1 py-1 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="block text-[10px] font-medium text-white text-center leading-tight truncate">
                    {theme.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8B2E20] flex items-center justify-center text-white text-[9px] shadow-sm">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {currentThemeId && (
          <p className="text-xs text-stone-500 leading-relaxed px-1">
            {colorThemes.find((t) => t.id === currentThemeId)?.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-stone-100 space-y-5">
        <p className="text-xs text-stone-400 font-medium">自定义调整</p>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-stone-700">字体颜色</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">{fontColor}</span>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-6 h-6 rounded border border-stone-200 cursor-pointer bg-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {fontColorPresets.map((c) => (
              <button
                key={c.value}
                onClick={() => setFontColor(c.value)}
                title={c.name}
                className={`aspect-square rounded-md border-2 transition-all hover:scale-105 ${
                  fontColor === c.value
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
            <label className="text-sm font-semibold text-stone-700">格线颜色</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">{gridColor}</span>
              <input
                type="color"
                value={gridColor}
                onChange={(e) => setGridColor(e.target.value)}
                className="w-6 h-6 rounded border border-stone-200 cursor-pointer bg-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {gridColorPresets.map((c) => (
              <button
                key={c.value}
                onClick={() => setGridColor(c.value)}
                title={c.name}
                className={`aspect-square rounded-md border-2 transition-all hover:scale-105 ${
                  gridColor === c.value
                    ? 'border-stone-900 ring-2 ring-stone-900/20'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


