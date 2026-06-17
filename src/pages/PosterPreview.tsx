import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Flame, Sparkles, ArrowLeft } from 'lucide-react';
import { useCheckinStore, formatDate, parseDate } from '@/store/useCheckinStore';

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

export default function PosterPreview() {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const records = useCheckinStore((s) => s.records);
  const stats = useMemo(() => useCheckinStore.getState().getStats(), [records]);

  const targetDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : formatDate(new Date());
  const record = records[targetDate];

  const slogan = useMemo(() => {
    const idx = new Date(targetDate).getDate() % SLOGANS.length;
    return SLOGANS[idx];
  }, [targetDate]);

  const hasData = !!record;

  const displayTotalDays = hasData ? stats.totalDays : 0;
  const displayTotalChars = hasData ? stats.totalChars : 0;
  const displayCurrentStreak = hasData ? stats.currentStreak : 0;
  const charCount = record?.charCount || 0;
  const thumbnail = record?.posterThumbnail || '';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `
          linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 50%, #F0E6D3 100%)
        `,
      }}
    >
      <div className="w-full max-w-[380px]">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-800 text-sm transition"
        >
          <ArrowLeft size={16} />
          返回
        </button>

        {/* 海报主体 */}
        <div
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
                  <span className="text-[10px] font-bold">第 {displayTotalDays} 天打卡</span>
                </div>
              </div>
            </div>

            {/* 字帖缩略图 */}
            <div className="relative rounded-xl overflow-hidden border-2 border-amber-700/20 bg-white shadow-inner mb-4">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="字帖预览"
                  className="w-full block bg-white"
                  style={{ maxHeight: 220, objectFit: 'contain' }}
                />
              ) : (
                <div
                  className="w-full flex flex-col items-center justify-center text-stone-400 bg-[repeating-linear-gradient(0deg,#fff,#fff_24px,#faf6f0_24px,#faf6f0_25px)]"
                  style={{ height: 160 }}
                >
                  <Sparkles size={28} className="text-stone-300 mb-2" />
                  <span className="text-xs">暂无字帖预览</span>
                  <span className="text-[10px] text-stone-300 mt-1">导出字帖后可生成海报</span>
                </div>
              )}
              {/* 渐变遮罩 */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/70 to-transparent" />
            </div>

            {/* 标语 */}
            <div className="text-center mb-4">
              <p
                className="text-[17px] font-bold tracking-widest text-amber-900"
                style={{ fontFamily: '"Noto Serif SC", "STSong", "SimSun", serif' }}
              >
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
                  {displayCurrentStreak}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">天</span>
                </div>
              </div>
              <div className="text-center bg-white/70 rounded-lg py-2.5 border border-amber-700/10">
                <div className="flex items-center justify-center gap-1 text-amber-700 mb-0.5">
                  <Calendar size={13} />
                  <span className="text-[10px] font-medium">累计天数</span>
                </div>
                <div className="text-lg font-extrabold text-stone-800 leading-none">
                  {displayTotalDays}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">天</span>
                </div>
              </div>
              <div className="text-center bg-white/70 rounded-lg py-2.5 border border-amber-700/10">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                  <Sparkles size={13} />
                  <span className="text-[10px] font-medium">当日练习</span>
                </div>
                <div className="text-lg font-extrabold text-stone-800 leading-none">
                  {charCount}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">字</span>
                </div>
              </div>
            </div>

            {/* 日期 */}
            <div className="text-center pt-2 border-t border-dashed border-amber-700/20">
              <div className="text-[11px] text-stone-500 mb-0.5">练习日期</div>
              <div className="text-[13px] font-semibold text-stone-800">
                {formatDisplayDate(targetDate)}
              </div>
              {hasData && (
                <div className="text-[10px] text-stone-400 mt-1.5">
                  已累计练习 {displayTotalChars.toLocaleString()} 字
                </div>
              )}
            </div>
          </div>

          {/* 底部装饰条 */}
          <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-400 to-red-500" />
        </div>

        {/* 底部说明 */}
        <p className="text-center text-xs text-stone-400 mt-4">
          — 墨韵字帖生成器 · 让练字成为一种生活方式 —
        </p>
      </div>
    </div>
  );
}
