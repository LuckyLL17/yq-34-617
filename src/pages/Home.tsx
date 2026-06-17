import { useRef, useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Settings, Eye, PenTool, ChevronDown, Calendar as CalendarIcon, Sparkles, Gauge, Type, ScrollText, BookMarked, Droplet, Clock, Hash, CheckCircle, Percent, Wand2 } from 'lucide-react';
import WatermarkConfig from '@/components/ConfigPanel/WatermarkConfig';
import { useCopybookStore } from '@/store/useCopybookStore';
import CopybookPreview from '@/components/Preview/CopybookPreview';
import DrawingToolbar from '@/components/Preview/DrawingToolbar';
import TextTypeSelector from '@/components/ConfigPanel/TextTypeSelector';
import TextInput from '@/components/ConfigPanel/TextInput';
import TextProcessor from '@/components/ConfigPanel/TextProcessor';
import FontSelector from '@/components/ConfigPanel/FontSelector';
import GridConfig from '@/components/ConfigPanel/GridConfig';
import ColorConfig from '@/components/ConfigPanel/ColorConfig';
import DifficultySelector from '@/components/ConfigPanel/DifficultySelector';
import HeaderConfig from '@/components/ConfigPanel/HeaderConfig';
import PaperTextureSelector from '@/components/ConfigPanel/PaperTextureSelector';
import StrokeAnimationModal from '@/components/StrokeAnimationModal';
import FontCompareModal from '@/components/FontCompareModal';
import ExportButton from '@/components/ExportButton';
import CalendarView from '@/components/CalendarView';
import PosterGenerator from '@/components/PosterGenerator';
import TemplateManager from '@/components/TemplateManager';
import type { CheckinRecord } from '@/types';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ConfigSection({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-stone-200/70 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-stone-50 to-white hover:from-stone-100/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-[#8B2E20]">
          {icon}
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-stone-100/70">{children}</div>
      )}
    </div>
  );
}

export default function Home() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [fontCompareOpen, setFontCompareOpen] = useState(false);
  const [posterData, setPosterData] = useState<{
    thumbnail?: string;
    charCount?: number;
    record?: CheckinRecord;
  }>({});

  const { text, difficultyLevel, getTotalValidCells, getCompletionPercentage, getCompletedCellsCount } = useCopybookStore(
    useShallow((s) => ({
      text: s.text,
      difficultyLevel: s.difficultyLevel,
      getTotalValidCells: s.getTotalValidCells,
      getCompletionPercentage: s.getCompletionPercentage,
      getCompletedCellsCount: s.getCompletedCellsCount,
    }))
  );

  const stats = useMemo(() => {
    const totalChars = Array.from(text).filter((ch) => ch !== '\n' && ch !== '\r' && ch !== '\t' && ch !== ' ').length;
    const validCells = getTotalValidCells();
    const completedCells = getCompletedCellsCount();
    const completionRate = getCompletionPercentage();

    const secondsPerChar = {
      beginner: 15,
      intermediate: 10,
      advanced: 6,
    };
    const estimatedSeconds = validCells * secondsPerChar[difficultyLevel];
    const hours = Math.floor(estimatedSeconds / 3600);
    const minutes = Math.floor((estimatedSeconds % 3600) / 60);
    const seconds = estimatedSeconds % 60;

    let estimatedTime = '';
    if (hours > 0) {
      estimatedTime += `${hours}小时`;
    }
    if (minutes > 0) {
      estimatedTime += `${minutes}分钟`;
    }
    if (hours === 0 && minutes === 0) {
      estimatedTime += `${seconds}秒`;
    }

    return {
      totalChars,
      validCells,
      completedCells,
      completionRate,
      estimatedTime,
      difficultyLabel: difficultyLevel === 'beginner' ? '入门' : difficultyLevel === 'intermediate' ? '进阶' : '挑战',
    };
  }, [text, difficultyLevel, getTotalValidCells, getCompletionPercentage, getCompletedCellsCount]);

  const handleCheckinSuccess = (data: { thumbnail: string; charCount: number }) => {
    setPosterData({ thumbnail: data.thumbnail, charCount: data.charCount });
    setTimeout(() => setPosterOpen(true), 400);
  };

  const handleSelectDate = (date: string, record?: CheckinRecord) => {
    if (record) {
      setPosterData({ record });
      setPosterOpen(true);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 50%, #F0E6D3 100%)
        `,
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(212, 165, 116, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 85% 10%, rgba(139, 46, 32, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 70% 90%, rgba(180, 120, 70, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <header className="relative z-10 border-b border-stone-200/50 backdrop-blur-sm bg-[#FAF7F2]/80">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] flex items-center justify-center shadow-lg shadow-[#8B2E20]/20">
                <PenTool size={24} className="text-[#FAF7F2]" strokeWidth={1.8} />
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold text-[#3D2C1F] tracking-wide"
                  style={{ fontFamily: '"Noto Serif SC", "STSong", "Ma Shan Zheng", serif' }}
                >
                  墨韵字帖生成器
                </h1>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5">
                  汉字 · 数字 · 英文书法练习字帖在线生成
                </p>
              </div>
            </div>

            <div className="hidden sm:block">
              <ExportButton
                previewRef={previewRef as React.RefObject<HTMLElement>}
                onCheckinSuccess={handleCheckinSuccess}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="w-full lg:w-[380px] lg:shrink-0 space-y-4 order-2 lg:order-1">
            <div className="sticky top-6 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 custom-scrollbar">
              <TemplateManager />

              <ConfigSection title="字帖类型" icon={<Settings size={16} strokeWidth={2} />}>
                <TextTypeSelector />
              </ConfigSection>

              <ConfigSection title="文字内容" icon={<Eye size={16} strokeWidth={2} />}>
                <TextInput />
              </ConfigSection>

              <ConfigSection title="文字处理" icon={<Wand2 size={16} strokeWidth={2} />} defaultOpen={false}>
                <TextProcessor />
              </ConfigSection>

              <ConfigSection title="书法字体" icon={<PenTool size={16} strokeWidth={2} />}>
                <FontSelector onOpenCompare={() => setFontCompareOpen(true)} />
              </ConfigSection>

              <ConfigSection title="难度模式" icon={<Gauge size={16} strokeWidth={2} />}>
                <DifficultySelector />
              </ConfigSection>

              <ConfigSection title="字帖布局" icon={<Settings size={16} strokeWidth={2} />}>
                <GridConfig />
              </ConfigSection>

              <ConfigSection title="页眉设置" icon={<Type size={16} strokeWidth={2} />}>
                <HeaderConfig />
              </ConfigSection>

              <ConfigSection title="颜色设置" icon={<Eye size={16} strokeWidth={2} />} defaultOpen={false}>
                <ColorConfig />
              </ConfigSection>

              <ConfigSection title="纸张质感" icon={<ScrollText size={16} strokeWidth={2} />} defaultOpen={false}>
                <PaperTextureSelector />
              </ConfigSection>

              <ConfigSection title="水印设置" icon={<Droplet size={16} strokeWidth={2} />} defaultOpen={false}>
                <WatermarkConfig />
              </ConfigSection>

              <div className="sm:hidden">
                <div className="sticky bottom-4">
                  <ExportButton
                    previewRef={previewRef as React.RefObject<HTMLElement>}
                    onCheckinSuccess={handleCheckinSuccess}
                  />
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="sticky top-4 z-20 mb-4">
              <DrawingToolbar />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50 p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#8B2E20]/10 flex items-center justify-center">
                    <Hash size={14} className="text-[#8B2E20]" />
                  </div>
                  <span className="text-xs text-stone-500">总字数</span>
                </div>
                <div className="text-xl font-bold text-[#3D2C1F]">
                  {stats.totalChars}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50 p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle size={14} className="text-green-600" />
                  </div>
                  <span className="text-xs text-stone-500">已完成</span>
                </div>
                <div className="text-xl font-bold text-[#3D2C1F]">
                  {stats.completedCells} <span className="text-sm font-normal text-stone-400">/ {stats.validCells}</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50 p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Percent size={14} className="text-blue-600" />
                  </div>
                  <span className="text-xs text-stone-500">完成率</span>
                </div>
                <div className="text-xl font-bold text-[#3D2C1F]">
                  {stats.completionRate}%
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50 p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock size={14} className="text-amber-600" />
                  </div>
                  <span className="text-xs text-stone-500">预估时长</span>
                </div>
                <div className="text-xl font-bold text-[#3D2C1F]">
                  {stats.estimatedTime}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {stats.difficultyLabel}模式 · 约 {stats.validCells} 格
                </div>
              </div>
            </div>

            <div className="overflow-auto custom-scrollbar pb-8">
              <CopybookPreview ref={previewRef} />
            </div>

            <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/50">
              <h3 className="text-sm font-semibold text-[#3D2C1F] mb-2">💡 使用小贴士</h3>
              <ul className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
                <li>• <strong>笔画动画</strong>：鼠标悬停字帖上的汉字，点击即可查看笔顺动画，支持单步/循环播放和调速</li>
                <li>• <strong>难度模式</strong>：一键切换入门/进阶/挑战三档，自动调整格子大小、参考线和范字显示</li>
                <li>• <strong>临摹练字</strong>：点击上方工具栏的「临摹练字」开关，即可直接在字帖上用鼠标或触屏描红练习</li>
                <li>• <strong>描红模式</strong>：开启后显示半透明的范字，适合初学者临摹练习</li>
                <li>• <strong>无格线</strong>：适合进阶练习，专注于字形结构</li>
                <li>• <strong>A4 导出</strong>：选择 A4 模式导出可直接打印使用</li>
                <li>• <strong>自定义颜色</strong>：点击颜色方块旁边的圆形取色器，支持自定义任意颜色</li>
                <li>• <strong>撤销清除</strong>：临摹时可随时撤销笔画或一键清除，方便反复练习</li>
              </ul>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] flex items-center justify-center">
                    <CalendarIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold text-[#3D2C1F]"
                      style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}
                    >
                      练字打卡日历
                    </h3>
                    <p className="text-xs text-stone-500">导出字帖自动打卡，点击日期查看海报</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPosterData({});
                    setPosterOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#8B2E20] bg-[#8B2E20]/10 rounded-lg hover:bg-[#8B2E20]/20 transition-colors"
                >
                  <Sparkles size={14} />
                  生成海报
                </button>
              </div>
              <CalendarView onSelectDate={handleSelectDate} />
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 mt-12 border-t border-stone-200/50 bg-[#FAF7F2]/60 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-stone-400">
            墨韵字帖生成器 · 支持数字、汉字、英文多体书法练习 · 在线即时生成
          </p>
        </div>
      </footer>

      <PosterGenerator
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        initialThumbnail={posterData.thumbnail}
        initialCharCount={posterData.charCount}
        initialRecord={posterData.record}
      />

      <StrokeAnimationModal />

      <FontCompareModal
        open={fontCompareOpen}
        onClose={() => setFontCompareOpen(false)}
      />
    </div>
  );
}
