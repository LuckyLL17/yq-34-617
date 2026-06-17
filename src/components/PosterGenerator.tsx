import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { Calendar, Flame, Download, Sparkles } from 'lucide-react';
import { useCheckinStore, formatDate, parseDate } from '@/store/useCheckinStore';
import type { CheckinRecord } from '@/types';

interface PosterGeneratorProps {
  open: boolean;
  onClose: () => void;
  initialThumbnail?: string;
  initialCharCount?: number;
  initialRecord?: CheckinRecord;
}

const SLOGANS = [
  '一笔一画，皆是修行',
  '字如其人，立品为先',
  '心静如水，字秀如花',
  '日日临池，笔耕不辍',
  '翰墨飘香，丹青溢彩',
  '落笔生花，挥毫写意',
  '习字修心，练字养性',
  '铁画银钩，入木三分',
];

function formatDisplayDate(date: string) {
  const d = parseDate(date);
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`;
}

export default function PosterGenerator({
  open,
  onClose,
  initialThumbnail,
  initialCharCount,
  initialRecord,
}: PosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const records = useCheckinStore((s) => s.records);
  const stats = useMemo(() => useCheckinStore.getState().getStats(), [records]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const today = formatDate(new Date());

  const record: CheckinRecord = useMemo(() => {
    if (initialRecord) return initialRecord;
    const thumb = initialThumbnail ?? '';
    const cc = initialCharCount ?? 0;
    const existing = useCheckinStore.getState().getRecordByDate(today);
    if (existing) {
      return { ...existing, posterThumbnail: thumb || existing.posterThumbnail };
    }
    return {
      date: today,
      charCount: cc,
      textType: 'chinese',
      fontId: '',
      timestamp: Date.now(),
      posterThumbnail: thumb,
    };
  }, [initialRecord, initialThumbnail, initialCharCount, today]);

  const slogan = useMemo(() => {
    const idx = new Date(record.date).getDate() % SLOGANS.length;
    return SLOGANS[idx];
  }, [record.date]);

  const hasAnyData = !!(record.posterThumbnail || record.charCount > 0 || initialRecord);

  // 真实打卡数据 - 因为 checkin 已经先写入 store，所以直接用 stats，不要额外 +
  const displayTotalDays = stats.totalDays;
  const displayTotalChars = stats.totalChars;
  const displayCurrentStreak = stats.currentStreak;

  // 生成真实二维码 - 内容为海报预览页面链接
  useEffect(() => {
    let canceled = false;
    const generate = async () => {
      try {
        const baseUrl = window.location.origin;
        const posterUrl = `${baseUrl}/poster/${record.date}`;
        const url = await QRCode.toDataURL(posterUrl, {
          width: 160,
          margin: 1,
          color: {
            dark: '#44403C',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        if (!canceled) setQrDataUrl(url);
      } catch {
        if (!canceled) setQrDataUrl('');
      }
    };
    if (open) generate();
    return () => {
      canceled = true;
    };
  }, [open, record.date]);

  const handleDownload = useCallback(async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 120));
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF7F2',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `练字海报-${record.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('导出海报失败', err);
    } finally {
      setDownloading(false);
    }
  }, [record.date]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm">
      <div className="relative max-w-[380px] w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition"
          aria-label="关闭"
        >
          ✕
        </button>

        {/* 海报主体 */}
        <div
          ref={posterRef}
          className="relative w-full bg-[#FAF7F2] rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 0%, rgba(217,119,6,0.08) 0%, transparent 55%),
              radial-gradient(ellipse at 100% 100%, rgba(120,53,15,0.10) 0%, transparent 55%)
            `,
          }}
        >
          {/* 顶部装饰条 */}
          <div className="h-1.5 bg-gradient-to-r from-amber-200 via-orange-400 to-red-500" />

          {/* 角饰 */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-700/40 rounded-tl-md pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-700/40 rounded-tr-md pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-700/40 rounded-bl-md pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-700/40 rounded-br-md pointer-events-none" />

          <div className="px-7 pt-7 pb-5">
            {/* 顶部品牌区 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md">
                  <Sparkles size={18} className="text-white" strokeWidth={2.2} />
                </div>
                <div className="leading-tight">
                  <div className="text-[15px] font-bold text-stone-800 tracking-wide">墨韵字帖</div>
                  <div className="text-[10px] text-stone-500">每日一练 · 静心习字</div>
                </div>
              </div>
              <div className="text-right leading-tight">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  <span className="text-[10px] font-bold">第 {displayTotalDays || 0} 天打卡</span>
                </div>
              </div>
            </div>

            {/* 字帖缩略图 */}
            <div className="relative rounded-xl overflow-hidden border-2 border-amber-700/20 bg-white shadow-inner mb-4">
              {record.posterThumbnail ? (
                <img
                  src={record.posterThumbnail}
                  alt="字帖预览"
                  className="w-full block bg-white"
                  style={{ maxHeight: 220, objectFit: 'contain' }}
                />
              ) : (
                <div
                  className="w-full flex items-center justify-center text-stone-300 bg-[repeating-linear-gradient(0deg,#fff,#fff_24px,#faf6f0_24px,#faf6f0_25px)]"
                  style={{ height: 140 }}
                >
                  <span className="text-xs">暂无字帖预览</span>
                </div>
              )}
              {/* 渐变遮罩 */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/70 to-transparent" />
            </div>

            {/* 标语 */}
            <div className="text-center mb-4">
              <p className="text-[17px] font-bold tracking-widest text-amber-900"
                 style={{ fontFamily: '"Noto Serif SC", "STSong", "SimSun", serif' }}>
                「{slogan}」
              </p>
            </div>

            {/* 数据栏 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center bg-white/70 rounded-lg py-2.5 border border-amber-700/10">
                <div className="flex items-center justify-center gap-1 text-orange-600 mb-0.5">
                  <Flame size={13} />
                  <span className="text-[10px] font-medium">连续打卡</span>
                </div>
                <div className="text-lg font-extrabold text-stone-800 leading-none">
                  {displayCurrentStreak || 0}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">天</span>
                </div>
              </div>
              <div className="text-center bg-white/70 rounded-lg py-2.5 border border-amber-700/10">
                <div className="flex items-center justify-center gap-1 text-amber-700 mb-0.5">
                  <Calendar size={13} />
                  <span className="text-[10px] font-medium">累计天数</span>
                </div>
                <div className="text-lg font-extrabold text-stone-800 leading-none">
                  {displayTotalDays || 0}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">天</span>
                </div>
              </div>
              <div className="text-center bg-white/70 rounded-lg py-2.5 border border-amber-700/10">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                  <Sparkles size={13} />
                  <span className="text-[10px] font-medium">今日练习</span>
                </div>
                <div className="text-lg font-extrabold text-stone-800 leading-none">
                  {record.charCount || 0}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">字</span>
                </div>
              </div>
            </div>

            {/* 日期 + 二维码 */}
            <div className="flex items-end justify-between gap-3 pt-2 border-t border-dashed border-amber-700/20">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-stone-500 mb-0.5">练习日期</div>
                <div className="text-[13px] font-semibold text-stone-800 truncate">
                  {formatDisplayDate(record.date)}
                </div>
                {hasAnyData ? (
                  <div className="text-[10px] text-stone-400 mt-1.5">
                    已累计练习 {displayTotalChars || 0} 字
                  </div>
                ) : null}
              </div>
              <div className="shrink-0">
                <div className="w-[72px] h-[72px] rounded-lg bg-white p-1.5 shadow-sm border border-amber-700/10">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="二维码" className="w-full h-full block" />
                  ) : (
                    <div className="w-full h-full rounded bg-stone-50 flex flex-col items-center justify-center">
                      <div className="w-4 h-4 border border-stone-200 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="text-center text-[9px] text-stone-400 mt-1">扫码查看</div>
              </div>
            </div>
          </div>

          {/* 底部装饰条 */}
          <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-400 to-red-500" />
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 transition text-sm font-medium backdrop-blur"
          >
            关闭
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition text-white text-sm font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
          >
            <Download size={16} />
            {downloading ? '生成中…' : '下载海报'}
          </button>
        </div>
      </div>
    </div>
  );
}
