'use client';

import { events } from '@/lib/data';
import { getDdayText } from '@/lib/utils';

export default function EventCalendar({ max = 3 }: { max?: number }) {
  const sorted = [...events].sort((a, b) => a.dday - b.dday).slice(0, max);

  return (
    <div className="space-y-2">
      {sorted.map((event, i) => (
        <div
          key={i}
          className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
            event.dday <= 7 ? 'bg-red-50' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-mono font-black ${
                event.dday <= 7 ? 'text-red-500' : 'text-gray-700'
              }`}
            >
              {getDdayText(event.dday)}
            </span>
            <span className="text-sm">{event.emoji}</span>
            <span className="text-sm">{event.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
