import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { DifficultyLevel } from '@/types';
import { Sparkles, Target, Flame, Grid3x3, Eye, Layers } from 'lucide-react';

interface DifficultyOption {
  level: DifficultyLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const OPTIONS: DifficultyOption[] = [
  {
    level: 'beginner',
    label: '入门',
    description: '大格子·米字格·全参考线·高透明度范字',
    icon: <Sparkles size={18} />,
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    level: 'intermediate',
    label: '进阶',
    description: '中等格子·田字格·虚线参考·描红范字',
    icon: <Target size={18} />,
    color: 'text-[#8B2E20]',
    gradient: 'from-[#8B2E20] to-[#5d1e15]',
  },
  {
    level: 'advanced',
    label: '挑战',
    description: '小格子·回宫格·无参考线·无范字',
    icon: <Flame size={18} />,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-600',
  },
];

const LEVEL_DETAILS: Record<DifficultyLevel, { cellSize: string; layout: string; guide: string; trace: string }> = {
  beginner: {
    cellSize: '80px 大格',
    layout: '8 × 10 排版',
    guide: '米字格 + 全虚线',
    trace: '40% 透明度范字',
  },
  intermediate: {
    cellSize: '64px 中格',
    layout: '10 × 14 排版',
    guide: '田字格 + 虚线',
    trace: '25% 透明度描红',
  },
  advanced: {
    cellSize: '48px 小格',
    layout: '14 × 18 排版',
    guide: '回宫格 + 无虚线',
    trace: '不显示范字',
  },
};

export default function DifficultySelector() {
  const { difficultyLevel, setDifficultyLevel } = useCopybookStore(
    useShallow((s) => ({
      difficultyLevel: s.difficultyLevel,
      setDifficultyLevel: s.setDifficultyLevel,
    }))
  );

  const details = LEVEL_DETAILS[difficultyLevel];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const isActive = difficultyLevel === opt.level;
          return (
            <button
              key={opt.level}
              onClick={() => setDifficultyLevel(opt.level)}
              className={`relative group p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-transparent shadow-lg'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
              }`}
            >
              {isActive && (
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${opt.gradient} opacity-10`} />
              )}
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? `bg-gradient-to-br ${opt.gradient} text-white shadow-md`
                      : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                  }`}
                >
                  {opt.icon}
                </div>
                <div
                  className={`text-sm font-bold ${
                    isActive ? opt.color : 'text-stone-700'
                  }`}
                >
                  {opt.label}
                </div>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-gradient-to-r from-stone-50 to-amber-50/30 rounded-xl border border-stone-200/50">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${OPTIONS.find(o => o.level === difficultyLevel)?.gradient} flex items-center justify-center text-white shadow-sm`}>
            {OPTIONS.find(o => o.level === difficultyLevel)?.icon}
          </div>
          <span className={`text-sm font-bold ${OPTIONS.find(o => o.level === difficultyLevel)?.color}`}>
            {OPTIONS.find(o => o.level === difficultyLevel)?.label}模式
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Grid3x3 size={12} className="text-stone-400 shrink-0" />
            <span>{details.cellSize}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <Layers size={12} className="text-stone-400 shrink-0" />
            <span>{details.layout}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <Target size={12} className="text-stone-400 shrink-0" />
            <span>{details.guide}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <Eye size={12} className="text-stone-400 shrink-0" />
            <span>{details.trace}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
