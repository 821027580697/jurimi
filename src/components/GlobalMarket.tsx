"use client";

import { useState, useRef, useEffect } from "react";
import { MarketData, MarketIndex, CurrencyRate, Commodity } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface Props {
  data: MarketData;
  isLive: boolean;
}

type Tab = "domestic" | "overseas";

interface InvestorFlow {
  individual: number;
  foreign: number;
  institution: number;
}

const INVESTOR_FLOWS: Record<string, InvestorFlow> = {
  "코스피": { individual: 10654, foreign: -19221, institution: 7583 },
  "코스닥": { individual: -8793, foreign: 5975, institution: 3010 },
};

const MARQUEE_NEWS = [
  "포스코인터, 에너지 풀 밸류체인 확장 가속",
  "삼성전자, HBM4 양산 하반기 본격화",
  "한화에어로, 미 합작법인 설립…K방산 수출 확대",
  "SK하이닉스, AI 메모리 글로벌 1위 굳히기",
  "현대차그룹, 전고체 배터리 2027 양산 목표",
];

function isMarketOpen(): boolean {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const h = kst.getHours();
  const d = kst.getDay();
  return d >= 1 && d <= 5 && h >= 9 && h < 16;
}

function FlowValue({ value }: { value: number }) {
  const color = value > 0 ? "#FF2D2D" : value < 0 ? "#2D6CFF" : "#999";
  const sign = value > 0 ? "+" : "";
  return (
    <span className="font-mono text-[11px] font-bold" style={{ color }}>
      {sign}{Math.abs(value).toLocaleString("ko-KR")}
    </span>
  );
}

function MarketCard({ idx, showFlow }: { idx: MarketIndex; showFlow?: boolean }) {
  const change = idx.change;
  const changeAbs = idx.value - idx.prevClose;
  const isUp = change > 0;
  const isDown = change < 0;
  const color = isUp ? "#FF2D2D" : isDown ? "#2D6CFF" : "#999";
  const arrow = isUp ? "▲" : isDown ? "▼" : "";
  const decimals = idx.value < 100 ? 2 : idx.value < 10000 ? 2 : 2;
  const open = isMarketOpen();
  const flow = INVESTOR_FLOWS[idx.name];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{idx.region}</span>
          <span className="text-[13px] font-bold">{idx.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-500" : "bg-gray-400"}`} />
          <span className="text-[10px] text-muted">{open ? "장중" : "장마감"}</span>
        </div>
      </div>

      {/* 지수 */}
      <div className="font-mono font-black text-[22px] leading-tight mb-0.5">
        {formatNumber(idx.value, decimals)}
      </div>

      {/* 등락 */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="font-mono text-[13px] font-bold" style={{ color }}>
          {arrow} {Math.abs(changeAbs).toFixed(2)}
        </span>
        <span className="font-mono text-[13px] font-bold" style={{ color }}>
          ({change > 0 ? "+" : ""}{change.toFixed(2)}%)
        </span>
      </div>

      {/* 투자자별 매매동향 */}
      {showFlow && flow && (
        <div className="border-t border-gray-100 pt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-sub">개인</span>
            <FlowValue value={flow.individual} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-sub">외인</span>
            <FlowValue value={flow.foreign} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-sub">기관</span>
            <FlowValue value={flow.institution} />
          </div>
          <div className="text-right text-[9px] text-muted">(억원)</div>
        </div>
      )}
    </div>
  );
}

function OverseasCard({ idx }: { idx: MarketIndex }) {
  const change = idx.change;
  const changeAbs = idx.value - idx.prevClose;
  const isUp = change > 0;
  const isDown = change < 0;
  const color = isUp ? "#FF2D2D" : isDown ? "#2D6CFF" : "#999";
  const arrow = isUp ? "▲" : isDown ? "▼" : "";
  const decimals = idx.value < 100 ? 2 : idx.value < 10000 ? 2 : 0;

  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{idx.region}</span>
        <span className="text-[12px] font-bold">{idx.name}</span>
      </div>
      <div className="font-mono font-black text-[18px] leading-tight mb-0.5">
        {formatNumber(idx.value, decimals)}
      </div>
      <div className="flex items-center gap-1">
        <span className="font-mono text-[11px] font-bold" style={{ color }}>
          {arrow} {Math.abs(changeAbs).toFixed(2)} ({change > 0 ? "+" : ""}{change.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

function CurrencyCard({ cur }: { cur: CurrencyRate }) {
  const color = cur.change > 0 ? "#FF2D2D" : cur.change < 0 ? "#2D6CFF" : "#999";
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
      <div className="text-[11px] text-sub mb-1">{cur.pair}</div>
      <div className="font-mono font-bold text-[15px]">{formatNumber(cur.value, cur.value < 100 ? 2 : 1)}</div>
      <span className="font-mono text-[11px] font-bold" style={{ color }}>
        {cur.change > 0 ? "+" : ""}{cur.change.toFixed(2)}%
      </span>
    </div>
  );
}

function CommodityChip({ c }: { c: Commodity }) {
  const color = c.change > 0 ? "#FF2D2D" : c.change < 0 ? "#2D6CFF" : "#999";
  return (
    <div className="bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100 flex items-center gap-2">
      <span className="text-sm">{c.icon}</span>
      <span className="text-[11px] font-bold">{c.name}</span>
      <span className="font-mono text-[11px] font-bold">
        {c.unit === "%" ? "" : c.unit}{formatNumber(c.value, c.value < 10 ? 2 : 1)}{c.unit === "%" ? "%" : ""}
      </span>
      <span className="font-mono text-[10px] font-bold" style={{ color }}>
        {c.change > 0 ? "+" : ""}{c.change.toFixed(2)}%
      </span>
    </div>
  );
}

function NewsMarquee() {
  const text = MARQUEE_NEWS.join("  |  ");
  return (
    <div className="overflow-hidden bg-gray-900 rounded-xl py-2 mt-3">
      <div className="marquee-track flex whitespace-nowrap">
        <span className="text-[11px] text-gray-300 px-4 inline-block animate-marquee">
          📢 {text}  |  {text}
        </span>
      </div>
    </div>
  );
}

export default function GlobalMarket({ data, isLive }: Props) {
  const [tab, setTab] = useState<Tab>("domestic");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageIdx, setPageIdx] = useState(0);

  const overseasGroups = [
    { label: "🇺🇸 미국", items: data.us },
    { label: "🇯🇵🇨🇳 아시아", items: [...data.japan, ...data.china] },
    { label: "🇪🇺 유럽", items: data.europe },
  ];

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    setPageIdx(Math.round(el.scrollLeft / w));
  };

  useEffect(() => {
    setPageIdx(0);
    scrollRef.current?.scrollTo({ left: 0 });
  }, [tab]);

  const totalPages = tab === "domestic" ? 1 : overseasGroups.length;

  return (
    <section className="py-4">
      {/* 세계지도 배경 */}
      <div
        className="mx-4 rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f1f3f5 100%)",
        }}
      >
        {/* 탭 + LIVE */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-gray-200 rounded-full p-0.5">
            <button
              onClick={() => setTab("domestic")}
              className={`text-[13px] font-bold px-5 py-1.5 rounded-full transition-all ${
                tab === "domestic" ? "bg-black text-white shadow-sm" : "text-gray-500"
              }`}
            >
              국내
            </button>
            <button
              onClick={() => setTab("overseas")}
              className={`text-[13px] font-bold px-5 py-1.5 rounded-full transition-all ${
                tab === "overseas" ? "bg-black text-white shadow-sm" : "text-gray-500"
              }`}
            >
              해외
            </button>
          </div>
          {isLive && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-muted font-bold">LIVE</span>
            </div>
          )}
        </div>

        {/* 국내 탭 */}
        {tab === "domestic" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {data.korea.map((idx) => (
                <MarketCard key={idx.name} idx={idx} showFlow />
              ))}
            </div>

            {/* 환율 */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {data.currencies.map((cur) => (
                <CurrencyCard key={cur.pair} cur={cur} />
              ))}
            </div>

            {/* 원자재 */}
            <div className="flex flex-wrap gap-2">
              {data.commodities.map((c) => (
                <CommodityChip key={c.name} c={c} />
              ))}
            </div>
          </>
        )}

        {/* 해외 탭 */}
        {tab === "overseas" && (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-1"
              style={{ scrollbarWidth: "none" }}
            >
              {overseasGroups.map((group, gi) => (
                <div key={gi} className="snap-start shrink-0 w-full px-1">
                  <div className="text-[11px] font-bold text-sub mb-2">{group.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((idx) => (
                      <OverseasCard key={idx.name} idx={idx} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-3">
              {overseasGroups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = scrollRef.current;
                    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === pageIdx ? "bg-black" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* 뉴스 마퀴 */}
        <NewsMarquee />
      </div>
    </section>
  );
}
