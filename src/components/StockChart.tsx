"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  code: string;
  market: "KR" | "US";
  name: string;
}

type Period = "1D" | "1W" | "1M" | "3M" | "1Y";

const PERIOD_CONFIG: Record<Period, { label: string; days: number; resolution: string; period: string }> = {
  "1D": { label: "1일", days: 1, resolution: "5", period: "D" },
  "1W": { label: "1주", days: 7, resolution: "D", period: "D" },
  "1M": { label: "1개월", days: 30, resolution: "D", period: "D" },
  "3M": { label: "3개월", days: 90, resolution: "D", period: "D" },
  "1Y": { label: "1년", days: 365, resolution: "D", period: "D" },
};

export default function StockChart({ code, market, name }: Props) {
  const [period, setPeriod] = useState<Period>("3M");
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cfg = PERIOD_CONFIG[period];
      let url: string;

      if (market === "KR") {
        if (period === "1D") {
          url = `/api/kis?type=minute&symbol=${code}`;
        } else {
          url = `/api/kis?type=daily&symbol=${code}&period=${cfg.period}&days=${cfg.days}`;
        }
      } else {
        if (period === "1D") {
          url = `/api/finnhub?type=candle&symbol=${code}&resolution=5&days=1`;
        } else {
          url = `/api/finnhub?type=candle&symbol=${code}&resolution=${cfg.resolution}&days=${cfg.days}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("API 오류");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const c = data.candles || [];
      if (c.length === 0) {
        setError("차트 데이터 없음");
        setCandles([]);
      } else {
        setCandles(c);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "차트 로딩 실패");
      setCandles([]);
    }

    setLoading(false);
  }, [code, market, period]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  const firstClose = candles.length > 0 ? candles[0].close : 0;
  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 0;
  const changePct = firstClose > 0 ? ((lastClose - firstClose) / firstClose) * 100 : 0;
  const isUp = changePct >= 0;
  const chartColor = isUp ? "#FF2D2D" : "#2D6CFF";
  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : 0;
  const priceMargin = (maxPrice - minPrice) * 0.05 || 1;

  const formatPrice = (v: number) => {
    if (market === "KR") return `${Math.round(v).toLocaleString("ko-KR")}`;
    return `$${v.toFixed(2)}`;
  };

  const formatXLabel = (date: string) => {
    if (period === "1D") return date;
    if (period === "1W" || period === "1M") {
      const parts = date.split("-");
      return `${parts[1]}/${parts[2]}`;
    }
    const parts = date.split("-");
    return `${parts[1]}/${parts[2]}`;
  };

  return (
    <div className="mt-4">
      {/* 기간 선택 */}
      <div className="flex gap-1 mb-3">
        {(Object.entries(PERIOD_CONFIG) as [Period, typeof PERIOD_CONFIG[Period]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors ${
              period === key
                ? "bg-black text-white"
                : "bg-gray-100 text-sub hover:bg-gray-200"
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="bg-card rounded-xl border border-line p-2">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <span className="text-sm text-muted animate-pulse">차트 로딩 중...</span>
          </div>
        ) : error ? (
          <div className="h-[200px] flex items-center justify-center">
            <span className="text-xs text-muted">{error}</span>
          </div>
        ) : candles.length > 0 ? (
          <>
            {/* 기간 수익률 */}
            <div className="flex items-center gap-2 px-2 mb-1">
              <span className="text-[10px] text-muted">{PERIOD_CONFIG[period].label} 변동</span>
              <span
                className="font-mono text-[12px] font-bold"
                style={{ color: chartColor }}
              >
                {isUp ? "+" : ""}
                {changePct.toFixed(2)}%
              </span>
            </div>

            {/* 메인 차트 (종가 라인) */}
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={candles} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXLabel}
                  tick={{ fontSize: 9, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis
                  domain={[minPrice - priceMargin, maxPrice + priceMargin]}
                  tickFormatter={formatPrice}
                  tick={{ fontSize: 9, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                  width={market === "KR" ? 60 : 55}
                  tickCount={5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as CandleData;
                    return (
                      <div className="bg-black text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-lg">
                        <div className="font-bold mb-0.5">{d.date}</div>
                        <div>시가 {formatPrice(d.open)}</div>
                        <div>고가 <span className="text-red-400">{formatPrice(d.high)}</span></div>
                        <div>저가 <span className="text-blue-400">{formatPrice(d.low)}</span></div>
                        <div>종가 <span className="font-bold">{formatPrice(d.close)}</span></div>
                        {d.volume > 0 && <div>거래량 {d.volume.toLocaleString()}</div>}
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={firstClose} stroke="#E8E8E8" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={chartColor}
                  strokeWidth={1.5}
                  fill={`url(#grad-${code})`}
                  dot={false}
                  activeDot={{ r: 3, fill: chartColor }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* 거래량 차트 */}
            <ResponsiveContainer width="100%" height={40}>
              <BarChart data={candles} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Bar
                  dataKey="volume"
                  fill="#E0E0E0"
                  radius={[1, 1, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-[9px] text-muted">
                {market === "KR" ? "한국투자증권 KIS API" : "Finnhub API"} · {name}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
