import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { PaperTexture } from '@/types';

interface PaperTextureOption {
  value: PaperTexture;
  label: string;
  description: string;
  previewStyle: React.CSSProperties;
}

const paperTextures: PaperTextureOption[] = [
  {
    value: 'white',
    label: '纯白',
    description: '标准白纸，干净清爽',
    previewStyle: {
      backgroundColor: '#ffffff',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(212, 165, 116, 0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 46, 32, 0.03) 0%, transparent 50%)
      `,
    },
  },
  {
    value: 'cream',
    label: '米黄',
    description: '护眼米黄色，温润舒适',
    previewStyle: {
      backgroundColor: '#FBF6E9',
      backgroundImage: `
        radial-gradient(circle at 30% 20%, rgba(218, 165, 32, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(210, 180, 140, 0.08) 0%, transparent 50%)
      `,
    },
  },
  {
    value: 'rice',
    label: '宣纸',
    description: '仿宣纸质感，古典雅致',
    previewStyle: {
      backgroundColor: '#F5F0E6',
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"),
        radial-gradient(circle at 15% 25%, rgba(222, 184, 135, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 85% 75%, rgba(210, 175, 130, 0.12) 0%, transparent 50%)
      `,
    },
  },
  {
    value: 'kraft',
    label: '牛皮纸',
    description: '复古牛皮纸，质感厚重',
    previewStyle: {
      backgroundColor: '#D4B896',
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E"),
        radial-gradient(circle at 25% 30%, rgba(160, 120, 80, 0.2) 0%, transparent 55%),
        radial-gradient(circle at 75% 70%, rgba(140, 100, 60, 0.18) 0%, transparent 55%)
      `,
    },
  },
  {
    value: 'parchment',
    label: '羊皮卷',
    description: '复古羊皮卷，岁月感',
    previewStyle: {
      backgroundColor: '#F4E4C1',
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E"),
        radial-gradient(circle at 50% 50%, rgba(222, 184, 135, 0.05) 0%, transparent 70%),
        radial-gradient(circle at 10% 90%, rgba(210, 150, 80, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 90% 10%, rgba(200, 140, 70, 0.15) 0%, transparent 40%)
      `,
    },
  },
  {
    value: 'newspaper',
    label: '旧报纸',
    description: '怀旧旧报纸，文艺复古',
    previewStyle: {
      backgroundColor: '#E8E0D0',
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
        linear-gradient(180deg, rgba(232, 224, 208, 0) 0%, rgba(200, 185, 160, 0.1) 100%),
        radial-gradient(circle at 50% 0%, rgba(180, 160, 130, 0.12) 0%, transparent 60%)
      `,
    },
  },
];

export default function PaperTextureSelector() {
  const { paperTexture, setPaperTexture } = useCopybookStore(
    useShallow((s) => ({
      paperTexture: s.paperTexture,
      setPaperTexture: s.setPaperTexture,
    }))
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        {paperTextures.map((option) => {
          const isSelected = paperTexture === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setPaperTexture(option.value)}
              className={`group relative aspect-square rounded-lg border-2 transition-all duration-200 overflow-hidden hover:scale-[1.02] ${
                isSelected
                  ? 'border-[#8B2E20] ring-2 ring-[#8B2E20]/20 shadow-md'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
              title={`${option.label}：${option.description}`}
            >
              <div
                className="absolute inset-0"
                style={option.previewStyle}
              />
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                <span
                  className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded backdrop-blur-sm ${
                    isSelected
                      ? 'bg-[#8B2E20] text-white'
                      : 'bg-white/70 text-stone-600 group-hover:bg-white/90'
                  }`}
                >
                  {option.label}
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
      <p className="text-xs text-stone-500 leading-relaxed">
        {paperTextures.find((p) => p.value === paperTexture)?.description}
      </p>
    </div>
  );
}

export { paperTextures };
export type { PaperTextureOption };
