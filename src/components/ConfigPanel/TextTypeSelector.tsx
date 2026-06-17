import { Hash, Type, Languages } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { TextType } from '@/types';

const types: { id: TextType; label: string; icon: typeof Hash }[] = [
  { id: 'chinese', label: '汉字', icon: Type },
  { id: 'number', label: '数字', icon: Hash },
  { id: 'english', label: '英文', icon: Languages },
];

export default function TextTypeSelector() {
  const { textType, setTextType } = useCopybookStore(
    useShallow((s) => ({
      textType: s.textType,
      setTextType: s.setTextType,
    }))
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">字帖类型</label>
      <div className="grid grid-cols-3 gap-2">
        {types.map((t) => {
          const Icon = t.icon;
          const active = textType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTextType(t.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border-2 transition-all duration-200 ${
                active
                  ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20] shadow-sm'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
