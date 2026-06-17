import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  RotateCcw,
  Loader2,
  FileDown,
  ChevronDown,
  Pencil,
  FileText,
  Check,
  Settings,
  X,
  Image,
  FileImage,
} from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { useCheckinStore, formatDate } from '@/store/useCheckinStore';
import { exportCopybook, type ExportOptions, type PaperSize, type PageOrientation, type ExportFormat, type ImageQuality } from '@/utils/pdfExport';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  previewRef: React.RefObject<HTMLElement>;
  onCheckinSuccess?: (data: { thumbnail: string; charCount: number }) => void;
}

type ExportMode = 'original' | 'drawing';

export default function ExportButton({ previewRef, onCheckinSuccess }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [exportFilename, setExportFilename] = useState('字帖');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [imageQuality, setImageQuality] = useState<ImageQuality>('high');
  const [pageRange, setPageRange] = useState<'all' | 'current'>('all');
  const { resetConfig, pagePaths, textType, fontId, text } = useCopybookStore(
    useShallow((s) => ({
      resetConfig: s.resetConfig,
      pagePaths: s.pagePaths,
      textType: s.textType,
      fontId: s.fontId,
      text: s.text,
    }))
  );
  const { checkin } = useCheckinStore();

  const hasDrawing = useMemo(() => {
    return Object.values(pagePaths).some((p) => p && p.length > 0);
  }, [pagePaths]);

  const charCount = useMemo(() => {
    let count = 0;
    for (const ch of text) {
      if (ch !== '\n' && ch !== '\r' && ch !== '\t' && ch !== ' ') {
        count++;
      }
    }
    return count;
  }, [text]);

  const captureThumbnail = async (): Promise<string> => {
    if (!previewRef.current) return '';
    const firstPage = previewRef.current.querySelector<HTMLElement>('[data-page-index="0"]');
    if (!firstPage) return '';
    const gridContainer = firstPage.querySelector<HTMLElement>('.flex.flex-col.items-center.justify-center.relative');
    const target = gridContainer || firstPage;
    try {
      await new Promise((r) => setTimeout(r, 200));
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch {
      return '';
    }
  };

  const handleCheckin = async () => {
    const today = formatDate(new Date());
    const thumbnail = await captureThumbnail();
    checkin({
      date: today,
      charCount,
      textType,
      fontId,
      posterThumbnail: thumbnail,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    if (thumbnail && onCheckinSuccess) {
      onCheckinSuccess({ thumbnail, charCount });
    }
  };

  const handleQuickExport = async (mode: ExportMode) => {
    if (!previewRef.current || exporting) {
      if (!previewRef.current) {
        setError('未找到字帖内容，请刷新页面重试');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

    setShowDropdown(false);
    setExporting(true);
    setError(null);

    try {
      const includeDrawing = mode === 'drawing';
      const options: ExportOptions = {
        filename: exportFilename || '字帖',
        includeDrawing,
        paperSize,
        orientation,
        format: exportFormat,
        imageQuality,
        pageRange,
        currentPageIndex: 0,
      };
      await exportCopybook(previewRef.current, options);
      await handleCheckin();
    } catch (err) {
      console.error('导出失败:', err);
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(`导出失败：${msg}`);
      setTimeout(() => setError(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有配置吗？')) {
      resetConfig();
    }
  };

  const paperSizeOptions: { value: PaperSize; label: string }[] = [
    { value: 'a4', label: 'A4' },
    { value: 'a5', label: 'A5' },
    { value: 'letter', label: 'Letter' },
    { value: 'legal', label: 'Legal' },
  ];

  const formatOptions: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'pdf', label: 'PDF', icon: <FileText size={16} /> },
    { value: 'png', label: 'PNG', icon: <Image size={16} /> },
    { value: 'jpg', label: 'JPG', icon: <FileImage size={16} /> },
  ];

  const qualityOptions: { value: ImageQuality; label: string }[] = [
    { value: 'low', label: '标准' },
    { value: 'medium', label: '清晰' },
    { value: 'high', label: '高清' },
    { value: 'ultra', label: '超清' },
  ];

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border-2 border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
      >
        <RotateCcw size={16} />
        重置配置
      </button>

      <div className="relative">
        {showSuccess && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check size={16} />
            打卡成功！今日已练习 {charCount} 字
          </div>
        )}

        {exporting ? (
          <button
            disabled
            className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold text-white bg-[#8B2E20] rounded-lg shadow-md opacity-70 cursor-not-allowed"
          >
            <Loader2 size={18} className="animate-spin" />
            正在导出...
          </button>
        ) : (
          <>
            <div className="flex">
              <button
                onClick={() => handleQuickExport(hasDrawing ? 'drawing' : 'original')}
                className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#8B2E20] rounded-l-lg shadow-md hover:bg-[#7a281c] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-md"
              >
                <FileDown size={18} strokeWidth={2} />
                {hasDrawing ? '导出临摹版' : '导出'}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center px-3 py-2.5 text-white bg-[#8B2E20] border-l border-[#7a281c] hover:bg-[#7a281c] transition-all duration-200"
                aria-label="导出设置"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center px-3 py-2.5 text-white bg-[#8B2E20] border-l border-[#7a281c] rounded-r-lg hover:bg-[#7a281c] transition-all duration-200"
                aria-label="导出选项"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => handleQuickExport('original')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                      <FileText size={16} className="text-stone-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">原版字帖</div>
                      <div className="text-xs text-stone-500">不含临摹笔迹</div>
                    </div>
                  </button>
                  <div className="border-t border-stone-100" />
                  <button
                    onClick={() => handleQuickExport('drawing')}
                    disabled={!hasDrawing}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#8B2E20]/10 flex items-center justify-center">
                      <Pencil size={16} className="text-[#8B2E20]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">临摹版字帖</div>
                      <div className="text-xs text-stone-500">
                        {hasDrawing ? '包含临摹笔迹' : '暂无临摹内容'}
                      </div>
                    </div>
                  </button>
                  <div className="border-t border-stone-100" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowSettings(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Settings size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">导出设置</div>
                      <div className="text-xs text-stone-500">自定义导出选项</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {error && (
          <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </div>
        )}
      </div>

      {showSettings && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Settings size={20} className="text-[#8B2E20]" />
                导出设置
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-stone-700">文件名称</label>
                <input
                  type="text"
                  value={exportFilename}
                  onChange={(e) => setExportFilename(e.target.value)}
                  placeholder="请输入文件名"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2E20]/30 focus:border-[#8B2E20] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-stone-700">导出格式</label>
                <div className="grid grid-cols-3 gap-2">
                  {formatOptions.map((f) => {
                    const active = exportFormat === f.value;
                    return (
                      <button
                        key={f.value}
                        onClick={() => setExportFormat(f.value)}
                        className={`py-2.5 px-2 text-xs font-medium rounded-lg border transition-all duration-200 flex flex-col items-center gap-1 ${
                          active
                            ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20]'
                            : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {f.icon}
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-stone-700">纸张大小</label>
                <div className="grid grid-cols-4 gap-2">
                  {paperSizeOptions.map((p) => {
                    const active = paperSize === p.value;
                    return (
                      <button
                        key={p.value}
                        onClick={() => setPaperSize(p.value)}
                        className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
                          active
                            ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20]'
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
                <label className="block text-sm font-semibold text-stone-700">页面方向</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                      orientation === 'portrait'
                        ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20]'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-4 h-5 border-2 rounded-sm" />
                    纵向
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                      orientation === 'landscape'
                        ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20]'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-5 h-4 border-2 rounded-sm" />
                    横向
                  </button>
                </div>
              </div>

              {exportFormat !== 'pdf' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">图片质量</label>
                  <div className="grid grid-cols-4 gap-2">
                    {qualityOptions.map((q) => {
                      const active = imageQuality === q.value;
                      return (
                        <button
                          key={q.value}
                          onClick={() => setImageQuality(q.value)}
                          className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all duration-200 ${
                            active
                              ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20]'
                              : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          {q.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-stone-700">导出范围</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPageRange('all')}
                    className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-all duration-200 ${
                      pageRange === 'all'
                        ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20]'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    全部页面
                  </button>
                  <button
                    onClick={() => setPageRange('current')}
                    className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-all duration-200 ${
                      pageRange === 'current'
                        ? 'border-[#8B2E20] bg-[#8B2E20]/5 text-[#8B2E20]'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    当前页面
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
                    包含临摹笔迹
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={hasDrawing}
                      onChange={() => {}}
                      disabled={!hasDrawing}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
                {!hasDrawing && (
                  <p className="text-xs text-stone-400">暂无临摹内容，可先开启临摹练字</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  handleQuickExport('original');
                }}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#8B2E20] rounded-lg hover:bg-[#7a281c] transition-colors flex items-center justify-center gap-2"
              >
                <FileDown size={16} />
                导出字帖
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
