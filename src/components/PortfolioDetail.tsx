"use client";

import { SectorSummary } from "@/lib/types";
import { formatNativePrice, formatManWon, toKRW, EXCHANGE_RATE } from "@/lib/format";
import PriceTag from "./PriceTag";

interface Props {
  sector: SectorSummary;
  onClose: () => void;
}

export default function PortfolioDetail({ sector, onClose }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden animate-in">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-base">{sector.emoji}</span>
          <span className="text-sm font-bold">{sector.name} 섹터</span>
          <span className="text-xs text-sub">— {sector.percentage.toFixed(0)}% ({formatManWon(sector.totalValue)})</span>
        </div>
        <button onClick={onClose} className="text-sm text-sub hover:text-black">✕</button>
      </div>

      <div className="divide-y divide-line">
        {sector.items.map((item, i) => {
          const evalValue = item.qty * item.currentPrice;
          const costValue = item.qty * item.avgPrice;
          const returnPct = costValue > 0 ? ((evalValue - costValue) / costValue) * 100 : 0;
          const evalKRW = toKRW(evalValue, item.isUsd);
          const checkScore = item.checklist !== "-" ? parseInt(item.checklist) : -1;
          const checkTotal = item.checklist !== "-" ? parseInt(item.checklist.split("/")[1]) : -1;
          const isPass = checkScore >= 0 && checkTotal > 0 && checkScore >= checkTotal * 0.7;

          return (
            <div key={i} className="px-4 py-3">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-[13px] font-bold">{item.name}</span>
                  <span className="text-[11px] text-muted ml-1.5">{item.qty}주</span>
                  <span className="text-[10px] text-muted ml-1">({item.account})</span>
                </div>
                <PriceTag change={returnPct} size="sm" />
              </div>
              <div className="text-[11px] text-sub">
                매입 {formatNativePrice(item.avgPrice, item.isUsd)} → 현재{" "}
                <span className="font-mono font-bold">{formatNativePrice(item.currentPrice, item.isUsd)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-sub">
                  평가 {formatManWon(evalKRW)}
                  {item.isUsd && (
                    <span className="text-muted ml-1">
                      (${(evalValue).toLocaleString("en-US", { maximumFractionDigits: 0 })} × ₩{EXCHANGE_RATE.toLocaleString()})
                    </span>
                  )}
                </span>
                {item.checklist !== "-" && (
                  <span className={`text-[10px] font-bold ${isPass ? "text-green-600" : "text-red-500"}`}>
                    [{item.checklist} {isPass ? "✅" : "❌"}]
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
