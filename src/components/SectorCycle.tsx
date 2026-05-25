"use client";

import { SECTORS, EVENTS, CYCLE_PHASES, CURRENT_CYCLE } from "@/lib/data";
import { calcDDay, formatDDay } from "@/lib/format";

export default function SectorCycle() {
  const eventsWithDDay = EVENTS.map((e) => ({ ...e, dDay: calcDDay(e.date) }))
    .filter((e) => e.dDay >= -1)
    .sort((a, b) => a.dDay - b.dDay);

  return (
    <section className="px-4 py-4">
      <h2 className="text-base font-bold mb-3">🔄 섹터 사이클</h2>

      {/* 경제 사이클 */}
      <div className="mb-4">
        <div className="text-xs text-sub mb-2">
          현재 경제 사이클:{" "}
          <span className="font-bold text-black">
            {CYCLE_PHASES.find((p) => p.key === CURRENT_CYCLE)?.emoji}{" "}
            {CYCLE_PHASES.find((p) => p.key === CURRENT_CYCLE)?.name}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {CYCLE_PHASES.map((phase) => {
            const isCurrent = phase.key === CURRENT_CYCLE;
            return (
              <div
                key={phase.key}
                className={`text-center py-2.5 rounded-lg text-xs font-bold ${
                  isCurrent ? "bg-black text-white" : "bg-card border border-line text-sub"
                }`}
              >
                <div className="text-base mb-0.5">{phase.emoji}</div>
                <div className="text-[10px]">{phase.name}</div>
                {isCurrent && <div className="text-[9px] mt-0.5">★지금</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 섹터별 자금 흐름 */}
      <div className="mb-4">
        <div className="text-xs font-bold text-sub mb-2">섹터별 자금 흐름 (외국인 기준)</div>
        <div className="space-y-2">
          {SECTORS.map((s) => {
            const barWidth = Math.max(5, Math.min(100, s.ytdReturn * 1.2));
            return (
              <div key={s.name} className="flex items-center gap-2">
                <span className="text-sm w-5 text-center shrink-0">{s.emoji}</span>
                <span className="text-xs font-bold w-14 shrink-0">{s.name}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: s.barColor,
                      opacity: s.status === "future" ? 0.3 : 1,
                      backgroundImage: s.status === "future"
                        ? "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 6px)"
                        : undefined,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] font-bold w-12 text-right shrink-0">
                  {s.status === "future" ? (
                    <span className="text-muted">미래</span>
                  ) : s.status === "upcoming" ? (
                    <span className="text-muted">대기</span>
                  ) : (
                    <span style={{ color: s.ytdReturn > 0 ? "#FF2D2D" : "#2D6CFF" }}>
                      +{s.ytdReturn}%
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 다음 이벤트 */}
      <div>
        <div className="text-xs font-bold text-sub mb-2">📅 다음 이벤트</div>
        <div className="space-y-1">
          {eventsWithDDay.map((e, i) => {
            const isUrgent = e.dDay <= 7 && e.dDay >= 0;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  e.highlight
                    ? "bg-red-50 border border-red-200 font-bold"
                    : isUrgent
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-card border border-line"
                }`}
              >
                <span
                  className={`font-mono font-bold w-10 shrink-0 ${
                    e.highlight ? "text-red-600" : isUrgent ? "text-yellow-600" : "text-sub"
                  }`}
                >
                  {formatDDay(e.dDay)}
                </span>
                <span>{e.icon}</span>
                <span className="flex-1 font-medium">{e.name}</span>
                <span className="text-muted">{e.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
