import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckinStore, CheckinRecord } from '@/types';

const STORAGE_KEY = 'copybook-checkin-records';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function calcStreaks(records: Record<string, CheckinRecord>): { current: number; longest: number } {
  const dates = Object.keys(records).sort();
  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let current = 0;
  let prevDate: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = dates.length - 1; i >= 0; i--) {
    const cur = parseDate(dates[i]);
    cur.setHours(0, 0, 0, 0);

    if (prevDate === null) {
      const diffDays = Math.round((today.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        current = 1;
      } else {
        current = 0;
        break;
      }
    } else {
      const diffDays = Math.round((prevDate.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current++;
      } else {
        break;
      }
    }

    if (current > longest) longest = current;
    prevDate = cur;
  }

  let longestAll = 0;
  let streak = 0;
  prevDate = null;
  for (const dateStr of dates) {
    const cur = parseDate(dateStr);
    cur.setHours(0, 0, 0, 0);
    if (prevDate === null) {
      streak = 1;
    } else {
      const diffDays = Math.round((cur.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    if (streak > longestAll) longestAll = streak;
    prevDate = cur;
  }

  return { current, longest: Math.max(longest, longestAll) };
}

export const useCheckinStore = create<CheckinStore>()(
  persist(
    (set, get) => ({
      records: {},

      checkin: (record) =>
        set((state) => {
          const existing = state.records[record.date];
          const newRecord: CheckinRecord = {
            ...record,
            timestamp: Date.now(),
            charCount: existing ? existing.charCount + record.charCount : record.charCount,
            posterThumbnail: record.posterThumbnail || existing?.posterThumbnail,
          };
          return {
            records: {
              ...state.records,
              [record.date]: newRecord,
            },
          };
        }),

      getRecordByDate: (date) => get().records[date],

      getMonthRecords: (year, month) => {
        const records = get().records;
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
        const result: Record<string, CheckinRecord> = {};
        for (const [date, record] of Object.entries(records)) {
          if (date.startsWith(prefix)) {
            result[date] = record;
          }
        }
        return result;
      },

      getStats: () => {
        const records = get().records;
        const dates = Object.keys(records);
        let totalChars = 0;
        for (const rec of Object.values(records)) {
          totalChars += rec.charCount;
        }
        const { current, longest } = calcStreaks(records);
        return {
          totalDays: dates.length,
          totalChars,
          currentStreak: current,
          longestStreak: longest,
        };
      },

      getMaxCharCount: () => {
        const records = get().records;
        let max = 0;
        for (const rec of Object.values(records)) {
          if (rec.charCount > max) max = rec.charCount;
        }
        return max;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ records: state.records }),
    }
  )
);

export { formatDate, parseDate };
