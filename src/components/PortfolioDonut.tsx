"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PORTFOLIO, SECTOR_COLORS } from "@/lib/data";
import { PortfolioItem, SectorSummary } from "@/lib/types";
import { formatManWon, toKRW, EXCHANGE_RATE } from "@/lib/format";
import PriceTag from "./PriceTag";
import PortfolioDetail from "./PortfolioDetail";

function buildSectors(items: PortfolioItem[]): SectorSummary[] {
  const map: Record<string, SectorSummary> = {};

  items.forEach((item) => {
    if (!map[item.sector]) {
      map[item.sector] = {
        name: item.sector,
        emoji: item.sectorEmoji,
        color: SECTOR_COLORS[item.sector] || "#999",
        totalValue: 0,
        totalCost: 0,
        percentage: 0,
        items: [],
      };
    }
    const evalKRW = toKRW(item.qty * item.currentPrice, item.isUsd);
    const costKRW = toKRW(item.qty * item.avgPrice, item.isUsd);
    map[item.sector].totalValue += evalKRW;
    map[item.sector].totalCost += costKRW;
    map[item.sector].items.push(item);
  });

  const total = Object.values(map).reduce((s, sec) => s + sec.totalValue, 0);
  Object.values(map).forEach((sec) => {
    sec.percentage = total > 0 ? (sec.totalValue / total) * 100 : 0;
  });

  return Object.values(map).sort((a, b) => b.totalValue - a.totalValue);
}

function buildAccountSummary(items: PortfolioItem[]) {
  const accounts: Record<string, { total: number; cost: number }> = {};
  items.forEach((item) => {
    const evalKRW = toKRW(item.qty * item.currentPrice, item.isUsd);
    const costKRW = toKRW(item.qty * item.avgPrice, item.isUsd);
    if (!accounts[item.account]) accounts[item.account] = { total: 0, cost: 0 };
    accounts[item.account].total += evalKRW;
    accounts[item.account].cost += costKRW;
  });
  return accounts;
}

const ACCOUNT_ICONS: Record<string, string> = {
  "국내": "🇰🇷",
  "해외": "🇺🇸",
  "퇴직연금": "🏦",
};

export default function PortfolioDonut() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(PORTFOLIO);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchLivePrices = useCallback(async () => {
    try {
      const krCodes = [...new Set(portfolio.filter((p) => !p.isUsd && !["TIME", "TDF"].includes(p.code)).map((p) => p.code))];
      const usCodes = [...new Set(portfolio.filter((p) => p.isUsd).map((p) => p.code))];

      const [kisRes, finnhubRes] = await Promise.all([
        krCodes.length > 0 ? fetch(`/api/kis?type=multi-price&symbols=${krCodes.join(",")}`) : null,
        usCodes.length > 0 ? fetch(`/api/finnhub?type=multi&symbols=${usCodes.join(",")}`) : null,
      ]);

      const kisData = kisRes?.ok ? await kisRes.json() : {};
      const finnhubData = finnhubRes?.ok ? await finnhubRes.json() : {};

      setPortfolio((prev) =>
        prev.map((item) => {
          if (!item.isUsd && kisData[item.code]?.price > 0) {
            return { ...item, currentPrice: kisData[item.code].price };
          }
          if (item.isUsd && finnhubData[item.code]?.c > 0) {
            return { ...item, currentPrice: finnhubData[item.code].c };
          }
          return item;
        })
      );
      setIsLive(true);
    } catch {}
  }, [portfolio]);

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sectors = buildSectors(portfolio);
  const accounts = buildAccountSummary(portfolio);
  const totalValue = sectors.reduce((s, sec) => s + sec.totalValue, 0);
  const totalCost = sectors.reduce((s, sec) => s + sec.totalCost, 0);
  const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  const pieData = sectors.map((s) => ({
    name: s.name,
    value: s.totalValue,
    color: s.color,
  }));

  const selectedSectorData = sectors.find((s) => s.name === selectedSector);

  return (
    <section className="px-4 py-4 pb-24">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-bold">💼 내 포트폴리오</h2>
        {isLive && (
          <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">
            LIVE
          </span>
        )}
      </div>

      {/* 도넛 차트 */}
      <div className="relative mx-auto" style={{ width: 260, height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={115}
              paddingAngle={2}
              animationBegin={0}
              animationDuration={800}
              onClick={(_, idx) => {
                const name = sectors[idx]?.name;
                setSelectedSector((prev) => (prev === name ? null : name));
              }}
              style={{ cursor: "pointer" }}
            >
              {pieData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  stroke={selectedSector === entry.name ? "#FF2D2D" : "#fff"}
                  strokeWidth={selectedSector === entry.name ? 3 : 1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[10px] text-sub">총 자산</div>
          <div className="font-mono font-black text-xl">{formatManWon(totalValue)}</div>
          <PriceTag change={totalReturn} size="sm" />
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 mb-4">
        {sectors.map((s) => (
          <button
            key={s.name}
            onClick={() => setSelectedSector((prev) => (prev === s.name ? null : s.name))}
            className={`flex items-center gap-1 text-[11px] transition-opacity ${
              selectedSector && selectedSector !== s.name ? "opacity-40" : ""
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span>{s.emoji} {s.name} {s.percentage.toFixed(0)}%</span>
          </button>
        ))}
      </div>

      {/* 계좌별 요약 */}
      <div className="bg-card rounded-xl border border-line p-3 mb-3">
        {Object.entries(accounts).map(([name, acc]) => {
          const ret = acc.cost > 0 ? ((acc.total - acc.cost) / acc.cost) * 100 : 0;
          return (
            <div key={name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{ACCOUNT_ICONS[name] || "📦"}</span>
                <span className="text-xs font-bold">{name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold">{formatManWon(acc.total)}</span>
                <PriceTag change={ret} size="sm" showArrow={false} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 환율 정보 */}
      <div className="text-[10px] text-center text-muted mb-3">
        적용 환율: $1 = ₩{EXCHANGE_RATE.toLocaleString()}
      </div>

      {/* 세부 내역 (섹터 클릭 시) */}
      {selectedSectorData && (
        <PortfolioDetail
          sector={selectedSectorData}
          onClose={() => setSelectedSector(null)}
        />
      )}
    </section>
  );
}
