import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame, Target, Calendar as CalendarIcon, Award } from 'lucide-react';
import { useCheckinStore, formatDate } from '@/store/useCheckinStore';
import type { CheckinRecord } from '@/types';

interface CalendarViewProps {
  onSelectDate?: (date: string, record?: CheckinRecord) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarView({ onSelectDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const records = useCheckinStore((s) => s.records);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const stats = useMemo(() => useCheckinStore.getState().getStats(), [records]);
  const monthRecords = useMemo(() => useCheckinStore.getState().getMonthRecords(year, month), [records, year, month]);
  const maxCount = useMemo(() => Math.max(useCheckinStore.getState().getMaxCharCount(), 1), [records]);

  const today = useMemo(() => formatDate(new Date()), []);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const firstDayWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; dateStr: string; inMonth: boolean; isToday: boolean; record?: CheckinRecord }[] = [];

    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      cells.push({ date: d, dateStr: formatDate(d), inMonth: false, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDate(date);
      cells.push({
        date,
        dateStr,
        inMonth: true,
        isToday: dateStr === today,
        record: monthRecords[dateStr],
      });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      cells.push({ date, dateStr: formatDate(date), inMonth: false, isToday: false });
    }

    return cells;
  }, [year, month, monthRecords, today]);

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getCellColor = (record?: CheckinRecord) => {
    if (!record) return 'bg-white hover:bg-stone-50';
    const ratio = Math.min(record.charCount / maxCount, 1);
    if (ratio < 0.25) return 'bg-[#D4A574]/20 hover:bg-[#D4A574]/30';
    if (ratio < 0.5) return 'bg-[#D4A574]/40 hover:bg-[#D4A574]/50';
    if (ratio < 0.75) return 'bg-[#8B2E20]/40 hover:bg-[#8B2E20]/50';
    return 'bg-[#8B2E20]/60 hover:bg-[#8B2E20]/70';
  };

  const getTextColor = (record?: CheckinRecord, isToday?: boolean) => {
    if (!record) return isToday ? 'text-[#8B2E20]' : 'text-stone-700';
    const ratio = Math.min(record.charCount / maxCount, 1);
    if (ratio >= 0.5) return 'text-white';
    return 'text-[#3D2C1F]';
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border-b border-stone-200/70">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-stone-100">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#E55934] flex items-center justify-center">
              <Flame size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-stone-500">连续打卡</div>
              <div className="text-xl font-bold text-stone-800">{stats.currentStreak}<span className="text-xs font-normal text-stone-500 ml-1">天</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-stone-100">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] flex items-center justify-center">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-stone-500">最长连续</div>
              <div className="text-xl font-bold text-stone-800">{stats.longestStreak}<span className="text-xs font-normal text-stone-500 ml-1">天</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-stone-100">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4A574] to-[#B8956A] flex items-center justify-center">
              <CalendarIcon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-stone-500">累计天数</div>
              <div className="text-xl font-bold text-stone-800">{stats.totalDays}<span className="text-xs font-normal text-stone-500 ml-1">天</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-stone-100">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4A7C59] to-[#3A6248] flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-stone-500">累计字数</div>
              <div className="text-xl font-bold text-stone-800">{stats.totalChars.toLocaleString()}<span className="text-xs font-normal text-stone-500 ml-1">字</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goPrevMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#3D2C1F]" style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}>
              {year}年{month + 1}月
            </h3>
            <button
              onClick={goToday}
              className="px-3 py-1 text-xs font-medium text-[#8B2E20] bg-[#8B2E20]/10 rounded-md hover:bg-[#8B2E20]/20 transition-colors"
            >
              今天
            </button>
          </div>

          <button
            onClick={goNextMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((wd, i) => (
            <div
              key={wd}
              className={`text-center text-xs font-medium py-2 ${
                i === 0 || i === 6 ? 'text-[#8B2E20]/70' : 'text-stone-500'
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => cell.record && onSelectDate?.(cell.dateStr, cell.record)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200
                ${getCellColor(cell.record)}
                ${cell.inMonth ? '' : 'opacity-30'}
                ${cell.isToday && !cell.record ? 'ring-2 ring-[#8B2E20] ring-offset-1' : ''}
                ${cell.record ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-default'}
              `}
            >
              <span className={`text-sm font-medium ${getTextColor(cell.record, cell.isToday)}`}>
                {cell.date.getDate()}
              </span>
              {cell.record && (
                <span className={`text-[10px] mt-0.5 ${getTextColor(cell.record, cell.isToday)} font-medium`}>
                  {cell.record.charCount}字
                </span>
              )}
              {cell.isToday && cell.record && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white border border-stone-200"></span>
              未练习
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#D4A574]/25"></span>
              少量
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#D4A574]/50"></span>
              中量
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#8B2E20]/60"></span>
              大量
            </span>
          </div>
          <div className="text-xs text-stone-400">
            本月共 {Object.keys(monthRecords).length} 天打卡
          </div>
        </div>
      </div>
    </div>
  );
}
