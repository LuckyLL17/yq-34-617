import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { HeaderPosition } from '@/types';

const headerPositions: { id: HeaderPosition; label: string }[] = [
  { id: 'left', label: '左对齐' },
  { id: 'center', label: '居中' },
  { id: 'right', label: '右对齐' },
];

export default function HeaderConfig() {
  const {
    title,
    subtitle,
    nameField,
    dateField,
    classField,
    headerPosition,
    showLineNumbers,
    setTitle,
    setSubtitle,
    setNameField,
    setDateField,
    setClassField,
    setHeaderPosition,
    setShowLineNumbers,
  } = useCopybookStore(
    useShallow((s) => ({
      title: s.title,
      subtitle: s.subtitle,
      nameField: s.nameField,
      dateField: s.dateField,
      classField: s.classField,
      headerPosition: s.headerPosition,
      showLineNumbers: s.showLineNumbers,
      setTitle: s.setTitle,
      setSubtitle: s.setSubtitle,
      setNameField: s.setNameField,
      setDateField: s.setDateField,
      setClassField: s.setClassField,
      setHeaderPosition: s.setHeaderPosition,
      setShowLineNumbers: s.setShowLineNumbers,
    }))
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-stone-700">标题文字</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="留空则使用默认标题"
          className="w-full px-3 py-2 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-stone-700">副标题</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="留空则不显示副标题"
          className="w-full px-3 py-2 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-stone-700">信息栏</label>

        {([
          { field: nameField, setField: setNameField, key: 'name' as const },
          { field: dateField, setField: setDateField, key: 'date' as const },
          { field: classField, setField: setClassField, key: 'class' as const },
        ] as const).map(({ field, setField, key }) => (
          <div key={key} className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer group shrink-0">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={field.visible}
                  onChange={(e) =>
                    setField({ ...field, visible: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) =>
                setField({ ...field, label: e.target.value })
              }
              disabled={!field.visible}
              className="flex-1 px-3 py-1.5 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all disabled:opacity-40 disabled:bg-stone-50"
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-stone-700">页眉对齐</label>
        <div className="grid grid-cols-3 gap-1.5">
          {headerPositions.map((p) => {
            const active = headerPosition === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setHeaderPosition(p.id)}
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

      <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
          显示行号
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </div>
      </label>
    </div>
  );
}
