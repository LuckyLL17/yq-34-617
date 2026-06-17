import { useState, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { getPresetsByType } from '@/utils/presetTexts';

export default function TextInput() {
  const { textType, text, setText } = useCopybookStore(
    useShallow((s) => ({
      textType: s.textType,
      text: s.text,
      setText: s.setText,
    }))
  );
  const [showPresets, setShowPresets] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const presets = getPresetsByType(textType);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPresets(false);
      }
    }
    if (showPresets) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPresets]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-stone-700">文字内容</label>
        <div className="relative" ref={containerRef}>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#8B2E20] bg-[#8B2E20]/5 rounded-md hover:bg-[#8B2E20]/10 transition-colors"
          >
            <Sparkles size={12} />
            预设内容
            <ChevronDown
              size={12}
              className={`transition-transform ${showPresets ? 'rotate-180' : ''}`}
            />
          </button>
          {showPresets && (
            <div className="absolute right-0 top-full mt-1.5 z-30 w-72 max-h-80 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              {presets.length === 0 ? (
                <p className="px-4 py-3 text-xs text-stone-400">暂无预设</p>
              ) : (
                presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setText(p.value);
                      setShowPresets(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-[#8B2E20]/5 hover:text-[#8B2E20] transition-colors border-b border-stone-50 last:border-b-0"
                  >
                    <div className="font-medium mb-0.5">{p.label}</div>
                    <div className="text-xs text-stone-400 truncate">
                      {p.value.slice(0, 30)}
                      {p.value.length > 30 ? '...' : ''}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="请输入要练习的文字...&#10;&#10;使用 | 手动换行，使用 --- 手动换页"
        rows={5}
        className="w-full px-3 py-2.5 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg resize-none focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
        style={{ fontFamily: 'inherit' }}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-400">
          <span className="inline-block px-1.5 py-0.5 bg-stone-100 rounded font-mono text-[10px] mr-1">|</span>
          换行
          <span className="mx-1.5 text-stone-300">·</span>
          <span className="inline-block px-1.5 py-0.5 bg-stone-100 rounded font-mono text-[10px] mr-1">---</span>
          换页
        </p>
        <p className="text-xs text-stone-400 text-right">
          共 {text.replace(/\s/g, '').replace(/\|/g, '').replace(/---/g, '').length} 字
        </p>
      </div>
    </div>
  );
}
