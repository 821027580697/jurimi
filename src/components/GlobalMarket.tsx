"use client";

import { MarketData } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import PriceTag from "./PriceTag";

interface Props {
  data: MarketData;
  isLive: boolean;
}

function IndexCard({ name, value, change, compact }: { name: string; value: number; change: number; compact?: boolean }) {
  const decimals = value < 100 ? 2 : value < 10000 ? 2 : 0;
  return (
    <div className={`bg-card rounded-xl border border-line p-3 ${compact ? "flex-1 min-w-0" : ""}`}>
      <div className="text-xs text-sub mb-1">{name}</div>
      <div className="font-mono font-black text-base leading-tight">{formatNumber(value, decimals)}</div>
      <PriceTag change={change} size="sm" />
    </div>
  );
}

export default function GlobalMarket({ data, isLive }: Props) {
  return (
    <section className="px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-bold">📈 글로벌 증시</h2>
        {isLive && (
          <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">
            LIVE
          </span>
        )}
      </div>

      {/* 한국 */}
      <div className="mb-3">
        <div className="text-xs font-bold text-sub mb-1.5">🇰🇷 국내</div>
        <div className="grid grid-cols-2 gap-2">
          {data.korea.map((idx) => (
            <IndexCard key={idx.name} name={idx.name} value={idx.value} change={idx.change} />
          ))}
        </div>
      </div>

      {/* 미국 */}
      <div className="mb-3">
        <div className="text-xs font-bold text-sub mb-1.5">🇺🇸 미국</div>
        <div className="grid grid-cols-4 gap-1.5">
          {data.us.map((idx) => (
            <IndexCard key={idx.name} name={idx.name} value={idx.value} change={idx.change} compact />
          ))}
        </div>
      </div>

      {/* 일본 + 중국 */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs font-bold text-sub mb-1.5">🇯🇵 일본</div>
          {data.japan.map((idx) => (
            <IndexCard key={idx.name} name={idx.name} value={idx.value} change={idx.change} />
          ))}
        </div>
        <div>
          <div className="text-xs font-bold text-sub mb-1.5">🇨🇳 중국</div>
          <div className="space-y-1.5">
            {data.china.map((idx) => (
              <IndexCard key={idx.name} name={idx.name} value={idx.value} change={idx.change} />
            ))}
          </div>
        </div>
      </div>

      {/* 유럽 */}
      <div className="mb-4">
        <div className="text-xs font-bold text-sub mb-1.5">🇪🇺 유럽</div>
        <div className="grid grid-cols-2 gap-2">
          {data.europe.map((idx) => (
            <IndexCard key={idx.name} name={idx.name} value={idx.value} change={idx.change} />
          ))}
        </div>
      </div>

      {/* 환율 */}
      <div className="mb-3">
        <div className="text-xs font-bold text-sub mb-1.5">💱 환율</div>
        <div className="grid grid-cols-2 gap-2">
          {data.currencies.map((cur) => (
            <div key={cur.pair} className="bg-card rounded-xl border border-line p-3">
              <div className="text-xs text-sub mb-1">{cur.pair}</div>
              <div className="font-mono font-bold text-sm">{formatNumber(cur.value, cur.value < 100 ? 2 : 1)}</div>
              <PriceTag change={cur.change} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* 원자재 */}
      <div className="flex flex-wrap gap-2">
        {data.commodities.map((c) => (
          <div key={c.name} className="bg-card rounded-xl border border-line px-3 py-2 flex items-center gap-2">
            <span className="text-sm">{c.icon}</span>
            <span className="text-xs font-bold">{c.name}</span>
            <span className="font-mono text-xs font-bold">
              {c.unit === "%" ? "" : c.unit}
              {formatNumber(c.value, c.value < 10 ? 2 : 1)}
              {c.unit === "%" ? "%" : ""}
            </span>
            <PriceTag change={c.change} size="sm" showArrow={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
