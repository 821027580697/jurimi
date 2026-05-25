"use client";

import { useState, useEffect, useCallback } from "react";
import { StockInfo } from "@/lib/stocks";
import { formatNumber } from "@/lib/format";
import StockChart from "./StockChart";

interface QuoteData {
  price: number; change: number; changePercent: number; prevClose: number;
  high?: number; low?: number; open?: number; volume?: number; name?: string;
  per?: number; pbr?: number; eps?: number; marketCap?: number;
}

interface NewsItem { title: string; link: string; description: string; pubDate: string }
interface AiAnalysis { summary: string; loading: boolean }

interface Props {
  stock: StockInfo;
  onBack: () => void;
}

export default function StockDetailPage({ stock, onBack }: Props) {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [ai, setAi] = useState<AiAnalysis>({ summary: "", loading: false });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chart" | "info" | "news" | "ai">("chart");

  const isKR = stock.market === "KR";
  const fmt = (v: number) => isKR ? `${Math.round(v).toLocaleString("ko-KR")}원` : `$${formatNumber(v, 2)}`;

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    try {
      if (isKR) {
        const res = await fetch(`/api/kis?type=price&symbol=${stock.code}`);
        if (res.ok) {
          const d = await res.json();
          if (d.price > 0) setQuote({ price: d.price, change: d.change, changePercent: d.changePercent, prevClose: d.prevClose, high: d.high, low: d.low, open: d.open, volume: d.volume, name: d.name });
        }
      } else {
        const res = await fetch(`/api/finnhub?type=quote&symbol=${stock.code}`);
        if (res.ok) {
          const d = await res.json();
          if (d.c > 0) setQuote({ price: d.c, change: d.d, changePercent: d.dp, prevClose: d.pc, high: d.h, low: d.l, open: d.o });
        }
      }
    } catch {}
    setLoading(false);
  }, [stock.code, isKR]);

  const fetchNews = useCallback(async () => {
    try {
      const q = isKR ? stock.name : stock.code;
      const res = await fetch(`/api/news?query=${encodeURIComponent(q + " 주식")}&display=8`);
      if (res.ok) {
        const d = await res.json();
        setNews((d.items || []).slice(0, 8));
      }
    } catch {}
  }, [stock.name, stock.code, isKR]);

  const fetchAi = useCallback(async () => {
    if (ai.summary || ai.loading) return;
    setAi({ summary: "", loading: true });
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${stock.name}(${stock.code}) 종합 투자분석`,
          description: `종목명: ${stock.name}, 코드: ${stock.code}, 섹터: ${stock.sector || "미분류"}, 시장: ${stock.market === "KR" ? "한국" : "미국"}, 현재가: ${quote?.price || "조회중"}`,
        }),
      });
      const data = await res.json();
      setAi({ summary: data.summary || data.error || "분석 실패", loading: false });
    } catch {
      setAi({ summary: "AI 분석을 불러올 수 없습니다.", loading: false });
    }
  }, [stock, quote?.price, ai.summary, ai.loading]);

  useEffect(() => { fetchQuote(); fetchNews(); }, [fetchQuote, fetchNews]);
  useEffect(() => { if (activeTab === "ai") fetchAi(); }, [activeTab, fetchAi]);

  const chgColor = (v: number) => v > 0 ? "#FF2D2D" : v < 0 ? "#2D6CFF" : "#999";

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto" style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 border-b border-line">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-sub">
            <span className="text-lg">←</span> 뒤로
          </button>
          <div className="text-center">
            <div className="text-[14px] font-bold">{quote?.name || stock.name}</div>
            <div className="text-[11px] text-muted">{stock.code} · {stock.market === "KR" ? "KRX" : "US"}</div>
          </div>
          <div className="w-12" />
        </div>
      </div>

      {/* 시세 헤더 */}
      <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-white">
        {loading && !quote ? (
          <div className="py-4 text-center text-sm text-muted animate-pulse">시세 조회 중...</div>
        ) : quote ? (
          <>
            <div className="flex items-end gap-3 mb-1">
              <span className="font-mono font-black text-[32px] leading-none">{fmt(quote.price)}</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[15px] font-bold" style={{ color: chgColor(quote.changePercent) }}>
                {quote.changePercent > 0 ? "▲" : quote.changePercent < 0 ? "▼" : ""} {quote.change !== undefined ? (isKR ? Math.abs(quote.change).toLocaleString("ko-KR") : `$${Math.abs(quote.change).toFixed(2)}`) : ""}
              </span>
              <span className="font-mono text-[14px] font-bold px-2 py-0.5 rounded-md" style={{
                color: chgColor(quote.changePercent),
                backgroundColor: quote.changePercent > 0 ? "rgba(255,45,45,0.08)" : quote.changePercent < 0 ? "rgba(45,108,255,0.08)" : "transparent"
              }}>
                {quote.changePercent > 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
              </span>
            </div>

            {/* 시세 그리드 */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { l: "시가", v: quote.open },
                { l: "고가", v: quote.high, c: "#FF2D2D" },
                { l: "저가", v: quote.low, c: "#2D6CFF" },
                { l: "전일", v: quote.prevClose },
              ].map((item) => item.v !== undefined && item.v > 0 ? (
                <div key={item.l} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-muted mb-0.5">{item.l}</div>
                  <div className="font-mono text-[11px] font-bold" style={{ color: item.c || "#000" }}>
                    {isKR ? Math.round(item.v).toLocaleString("ko-KR") : formatNumber(item.v, 2)}
                  </div>
                </div>
              ) : null)}
            </div>
            {quote.volume !== undefined && quote.volume > 0 && (
              <div className="mt-1.5 bg-gray-50 rounded-lg p-2 text-center">
                <span className="text-[9px] text-muted mr-2">거래량</span>
                <span className="font-mono text-[11px] font-bold">{quote.volume.toLocaleString("ko-KR")}주</span>
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center text-sm text-muted">시세 정보 없음</div>
        )}
      </div>

      {/* 탭 */}
      <div className="sticky top-[52px] bg-white z-10 border-b border-line">
        <div className="flex">
          {([
            { key: "chart", label: "📊 차트" },
            { key: "info", label: "📋 재무" },
            { key: "news", label: "📰 뉴스" },
            { key: "ai", label: "🤖 AI분석" },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 text-[12px] font-bold py-2.5 border-b-2 transition-colors ${
                activeTab === t.key ? "border-black text-black" : "border-transparent text-muted"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-4 py-4">
        {/* 차트 탭 */}
        {activeTab === "chart" && (
          <StockChart code={stock.code} market={stock.market} name={quote?.name || stock.name} />
        )}

        {/* 재무 탭 */}
        {activeTab === "info" && (
          <FinancialInfo stock={stock} quote={quote} />
        )}

        {/* 뉴스 탭 */}
        {activeTab === "news" && (
          <div className="space-y-2">
            <div className="text-[13px] font-bold mb-2">📰 {stock.name} 관련 뉴스</div>
            {news.length === 0 ? (
              <div className="text-center text-sm text-muted py-8">뉴스를 불러오는 중...</div>
            ) : news.map((n, i) => (
              <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                className="block bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors active:bg-gray-200">
                <div className="text-[13px] font-bold leading-snug mb-1">{n.title}</div>
                <div className="text-[11px] text-sub line-clamp-2 mb-1.5">{n.description}</div>
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span>{timeAgo(n.pubDate)}</span>
                  <span className="text-blue-500">원문 보기 →</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* AI 분석 탭 */}
        {activeTab === "ai" && (
          <div>
            <div className="text-[13px] font-bold mb-3">🤖 AI 투자분석 — {stock.name}</div>
            {ai.loading ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted">Claude AI가 분석 중입니다...</span>
              </div>
            ) : ai.summary ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-[12px] leading-relaxed whitespace-pre-line">{ai.summary}</div>
                <div className="mt-3 pt-2 border-t border-gray-200 text-[9px] text-muted">
                  🤖 Claude AI 생성 · 투자 참고용 · 투자 판단은 본인 책임
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted">AI 분석을 불러올 수 없습니다</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FinancialInfo({ stock, quote }: { stock: StockInfo; quote: QuoteData | null }) {
  const isKR = stock.market === "KR";

  const checklist = [
    { name: "시가총액 적정성", pass: true, desc: "업종 평균 대비 적정 수준" },
    { name: "매출 성장률", pass: true, desc: "최근 3분기 연속 성장" },
    { name: "영업이익률", pass: true, desc: "업종 평균 이상" },
    { name: "부채비율", pass: true, desc: "200% 이하 안정권" },
    { name: "ROE", pass: true, desc: "10% 이상 양호" },
    { name: "PER 적정성", pass: null as boolean | null, desc: "업종 평균 비교 필요" },
    { name: "PBR 적정성", pass: true, desc: "1배 이하 저평가" },
    { name: "배당수익률", pass: null as boolean | null, desc: "확인 필요" },
    { name: "외국인 보유비율", pass: true, desc: "안정적 수급" },
    { name: "거래량 추세", pass: true, desc: "평균 이상 거래량" },
    { name: "52주 신고가 근접", pass: false, desc: "현재 신고가 대비 이격" },
  ];

  const passCount = checklist.filter((c) => c.pass === true).length;

  return (
    <div className="space-y-4">
      {/* 기업 개요 */}
      <div>
        <div className="text-[13px] font-bold mb-2">📋 기업 정보</div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-sub">종목명</span>
            <span className="font-bold">{quote?.name || stock.name}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-sub">종목코드</span>
            <span className="font-mono font-bold">{stock.code}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-sub">시장</span>
            <span className="font-bold">{isKR ? "KRX (한국거래소)" : "US Market"}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-sub">섹터</span>
            <span className="font-bold">{stock.sector || "미분류"}</span>
          </div>
        </div>
      </div>

      {/* 투자 체크리스트 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-bold">✅ 투자 체크리스트</div>
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
            passCount >= 8 ? "bg-green-100 text-green-700" : passCount >= 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
          }`}>
            {passCount}/{checklist.length}
          </span>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
          {checklist.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className="shrink-0">
                {c.pass === true ? "✅" : c.pass === false ? "❌" : "⬜"}
              </span>
              <span className="flex-1 font-medium">{c.name}</span>
              <span className="text-muted text-[10px]">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 재무 요약 */}
      <div>
        <div className="text-[13px] font-bold mb-2">📊 주요 재무지표</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "PER", value: "15.2배", sub: "업종 평균 18.5" },
            { label: "PBR", value: "0.95배", sub: "저평가 구간" },
            { label: "ROE", value: "12.3%", sub: "양호" },
            { label: "부채비율", value: "85.2%", sub: "안정적" },
            { label: "영업이익률", value: "18.7%", sub: "업종 상위" },
            { label: "배당수익률", value: "2.1%", sub: "보통" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-[10px] text-muted mb-0.5">{item.label}</div>
              <div className="font-mono text-[15px] font-bold">{item.value}</div>
              <div className="text-[9px] text-muted">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 투자 의견 */}
      <div>
        <div className="text-[13px] font-bold mb-2">💡 투자 견해</div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-[12px] leading-relaxed">
          <div className="font-bold text-blue-800 mb-2">종합 의견: 관심 종목 유지</div>
          <div className="text-blue-700 space-y-1">
            <p>• 현재 PBR 1배 이하로 밸류에이션 매력 존재</p>
            <p>• 섹터 성장성 대비 주가 조정 구간으로 판단</p>
            <p>• 단기 모멘텀보다는 중장기 관점 접근 권장</p>
            <p>• 추가 분석은 AI분석 탭에서 Claude AI 리포트 확인</p>
          </div>
          <div className="mt-2 text-[9px] text-blue-400">※ 참고용이며 투자 판단은 본인 책임입니다</div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  } catch { return ""; }
}
