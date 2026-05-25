"use client";

import { useState, useRef, useEffect } from "react";
import { MarketData, MarketIndex, CurrencyRate, Commodity } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface Props {
  data: MarketData;
  isLive: boolean;
}

type Tab = "domestic" | "overseas";

interface InvestorFlow { individual: number; foreign: number; institution: number }
const FLOWS: Record<string, InvestorFlow> = {
  "코스피": { individual: 10654, foreign: -19221, institution: 7583 },
  "코스닥": { individual: -8793, foreign: 5975, institution: 3010 },
};

const MARQUEE = [
  "포스코인터, 에너지 풀 밸류체인 확장 가속",
  "삼성전자, HBM4 양산 하반기 본격화",
  "한화에어로, 미 합작법인 설립…K방산 수출 확대",
  "SK하이닉스, AI 메모리 글로벌 1위 굳히기",
];

function isKrOpen(): boolean {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return kst.getDay() >= 1 && kst.getDay() <= 5 && kst.getHours() >= 9 && kst.getHours() < 16;
}

function Chg({ v, s, cls }: { v: number; s?: string; cls?: string }) {
  const c = v > 0 ? "text-up" : v < 0 ? "text-down" : "text-muted";
  const sign = v > 0 ? "+" : "";
  return <span className={`font-mono font-bold ${c} ${cls || ""}`}>{sign}{s || v.toLocaleString("ko-KR")}</span>;
}

export default function GlobalMarket({ data, isLive }: Props) {
  const [tab, setTab] = useState<Tab>("domestic");
  const open = isKrOpen();

  return (
    <section className="py-3">
      <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)" }}>
        {/* 탭 바 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex bg-white/10 rounded-full p-0.5">
            {(["domestic", "overseas"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-[13px] font-bold px-5 py-1.5 rounded-full transition-all ${
                  tab === t ? "bg-white text-black shadow" : "text-white/60"
                }`}>
                {t === "domestic" ? "국내" : "해외"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            <span className="text-[10px] text-white/50 font-mono">
              {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* 국내 */}
        {tab === "domestic" && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {data.korea.map((idx) => <DomesticCard key={idx.name} idx={idx} open={open} />)}
            </div>
            {/* 환율 + 원자재 한 줄 */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {data.currencies.slice(0, 4).map((c) => (
                <div key={c.pair} className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-white/40 mb-0.5">{c.pair.split("/")[0]}</div>
                  <div className="font-mono text-[12px] text-white font-bold">{formatNumber(c.value, c.value < 100 ? 2 : 0)}</div>
                  <Chg v={c.change} s={`${c.change > 0 ? "+" : ""}${c.change.toFixed(2)}%`} cls="text-[9px]" />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              {data.commodities.map((c) => (
                <div key={c.name} className="flex-1 bg-white/5 rounded-lg px-2 py-1.5 text-center">
                  <div className="text-[9px] text-white/40">{c.icon} {c.name}</div>
                  <div className="font-mono text-[11px] text-white font-bold">
                    {c.unit === "%" ? "" : c.unit}{formatNumber(c.value, c.value < 10 ? 2 : 1)}{c.unit === "%" ? "%" : ""}
                  </div>
                  <Chg v={c.change} s={`${c.change > 0 ? "+" : ""}${c.change.toFixed(2)}%`} cls="text-[9px]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 해외 */}
        {tab === "overseas" && (
          <div className="px-4 pb-4">
            <div className="text-[10px] text-white/40 font-bold mb-1.5">🇺🇸 미국</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {data.us.map((idx) => <OverseasCard key={idx.name} idx={idx} />)}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-[10px] text-white/40 font-bold mb-1.5">🇯🇵 일본</div>
                {data.japan.map((idx) => <OverseasCard key={idx.name} idx={idx} />)}
              </div>
              <div>
                <div className="text-[10px] text-white/40 font-bold mb-1.5">🇨🇳 중국</div>
                <div className="space-y-2">
                  {data.china.map((idx) => <OverseasCard key={idx.name} idx={idx} />)}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-white/40 font-bold mb-1.5">🇪🇺 유럽</div>
            <div className="grid grid-cols-2 gap-2">
              {data.europe.map((idx) => <OverseasCard key={idx.name} idx={idx} />)}
            </div>
          </div>
        )}

        {/* 뉴스 마퀴 */}
        <div className="bg-black/30 py-2 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee inline-block">
            <span className="text-[11px] text-white/60">
              {"📢  " + MARQUEE.join("  |  ") + "  |  " + MARQUEE.join("  |  ")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DomesticCard({ idx, open }: { idx: MarketIndex; open: boolean }) {
  const chgAbs = idx.value - idx.prevClose;
  const isUp = idx.change > 0;
  const isDown = idx.change < 0;
  const color = isUp ? "#FF2D2D" : isDown ? "#2D6CFF" : "#999";
  const arrow = isUp ? "▲" : isDown ? "▼" : "";
  const flow = FLOWS[idx.name];

  return (
    <div className="bg-white/[0.07] backdrop-blur rounded-2xl p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]">{idx.region}</span>
          <span className="text-[13px] font-bold text-white">{idx.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-400" : "bg-gray-500"}`} />
          <span className="text-[9px] text-white/40">{open ? "장중" : "장마감"}</span>
        </div>
      </div>

      <div className="font-mono font-black text-[24px] text-white leading-none mb-1">
        {formatNumber(idx.value, 2)}
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="font-mono text-[13px] font-bold" style={{ color }}>
          {arrow} {Math.abs(chgAbs).toFixed(2)}
        </span>
        <span className="font-mono text-[12px] font-bold px-1.5 py-0.5 rounded" style={{ color, backgroundColor: isUp ? "rgba(255,45,45,0.1)" : isDown ? "rgba(45,108,255,0.1)" : "transparent" }}>
          {idx.change > 0 ? "+" : ""}{idx.change.toFixed(2)}%
        </span>
      </div>

      {flow && (
        <div className="border-t border-white/10 pt-2 space-y-1">
          {([["개인", flow.individual], ["외인", flow.foreign], ["기관", flow.institution]] as const).map(([label, val]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[10px] text-white/40">{label}</span>
              <span className={`font-mono text-[11px] font-bold ${val > 0 ? "text-up" : "text-down"}`}>
                {val > 0 ? "+" : ""}{val.toLocaleString("ko-KR")}
              </span>
            </div>
          ))}
          <div className="text-right text-[8px] text-white/25">(억원)</div>
        </div>
      )}
    </div>
  );
}

function OverseasCard({ idx }: { idx: MarketIndex }) {
  const chgAbs = idx.value - idx.prevClose;
  const isUp = idx.change > 0;
  const isDown = idx.change < 0;
  const color = isUp ? "#FF2D2D" : isDown ? "#2D6CFF" : "#999";
  const arrow = isUp ? "▲" : isDown ? "▼" : "";
  const dec = idx.value < 100 ? 2 : idx.value < 10000 ? 2 : 0;

  return (
    <div className="bg-white/[0.07] backdrop-blur rounded-xl p-3">
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[12px]">{idx.region}</span>
        <span className="text-[12px] font-bold text-white">{idx.name}</span>
      </div>
      <div className="font-mono font-black text-[18px] text-white leading-none mb-0.5">
        {formatNumber(idx.value, dec)}
      </div>
      <span className="font-mono text-[11px] font-bold" style={{ color }}>
        {arrow} {Math.abs(chgAbs).toFixed(2)} ({idx.change > 0 ? "+" : ""}{idx.change.toFixed(2)}%)
      </span>
    </div>
  );
}
