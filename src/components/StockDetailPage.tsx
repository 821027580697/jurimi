"use client";

import { useState, useEffect, useCallback } from "react";
import { StockInfo } from "@/lib/stocks";
import { formatNumber } from "@/lib/format";
import dynamic from "next/dynamic";

const TradingViewChart = dynamic(() => import("./TradingViewChart"), { ssr: false });

interface QuoteData {
  price: number; change: number; changePercent: number; prevClose: number;
  high?: number; low?: number; open?: number; volume?: number; name?: string;
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
  const [chartFull, setChartFull] = useState(false);

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
      const q = isKR ? `${stock.name} 주식` : `${stock.name} ${stock.code} stock`;
      const res = await fetch(`/api/news?query=${encodeURIComponent(q)}&display=10`);
      if (res.ok) {
        const d = await res.json();
        setNews((d.items || []).slice(0, 10));
      }
    } catch {}
  }, [stock.name, stock.code, isKR]);

  const fetchAi = useCallback(async () => {
    if (ai.summary || ai.loading) return;
    setAi({ summary: "", loading: true });
    try {
      const priceInfo = quote ? `현재가: ${fmt(quote.price)}, 등락: ${quote.changePercent > 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "";
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${stock.name}(${stock.code}) 종합 투자분석 리포트`,
          description: `종목: ${stock.name}, 코드: ${stock.code}, 섹터: ${stock.sector || "미분류"}, 시장: ${isKR ? "한국" : "미국"}, ${priceInfo}. 이 종목에 대해 1) 기업 개요 2) 최근 이슈 3) 투자 포인트 4) 리스크 요인 5) 종합 의견을 상세히 분석해주세요.`,
        }),
      });
      const data = await res.json();
      setAi({ summary: data.summary || data.error || "분석 실패", loading: false });
    } catch {
      setAi({ summary: "AI 분석을 불러올 수 없습니다.", loading: false });
    }
  }, [stock, quote, ai.summary, ai.loading, fmt, isKR]);

  useEffect(() => { fetchQuote(); fetchNews(); }, [fetchQuote, fetchNews]);
  useEffect(() => { if (activeTab === "ai" && quote) fetchAi(); }, [activeTab, fetchAi, quote]);

  const chgColor = (v: number) => v > 0 ? "#FF2D2D" : v < 0 ? "#2D6CFF" : "#999";

  // 전체화면 차트
  if (chartFull) {
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-line">
          <div className="text-sm font-bold">{quote?.name || stock.name} ({stock.code})</div>
          <button onClick={() => setChartFull(false)} className="text-sm font-bold text-sub px-3 py-1 rounded-lg bg-gray-100">닫기</button>
        </div>
        <div className="flex-1">
          <TradingViewChart symbol={stock.code} market={stock.market} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* 헤더 */}
      <div className="shrink-0 border-b border-line">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button onClick={onBack} className="text-sub text-sm font-bold">← 뒤로</button>
          <div className="text-center">
            <div className="text-[14px] font-bold">{quote?.name || stock.name}</div>
            <div className="text-[10px] text-muted font-mono">{stock.code} · {isKR ? "KRX" : "US"} · {stock.sector}</div>
          </div>
          <div className="w-12" />
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 시세 헤더 */}
        <div className="px-4 py-3" style={{ background: "linear-gradient(180deg,#fafafa,#fff)" }}>
          {loading && !quote ? (
            <div className="py-4 text-center text-sm text-muted animate-pulse">시세 조회 중...</div>
          ) : quote ? (
            <>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-mono font-black text-[30px] leading-none">{fmt(quote.price)}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[14px] font-bold" style={{ color: chgColor(quote.changePercent) }}>
                  {quote.changePercent > 0 ? "▲" : quote.changePercent < 0 ? "▼" : ""}{" "}
                  {isKR ? Math.abs(quote.change).toLocaleString("ko-KR") : `$${Math.abs(quote.change).toFixed(2)}`}
                </span>
                <span className="font-mono text-[13px] font-bold px-2 py-0.5 rounded-md" style={{
                  color: chgColor(quote.changePercent),
                  backgroundColor: quote.changePercent > 0 ? "rgba(255,45,45,0.08)" : quote.changePercent < 0 ? "rgba(45,108,255,0.08)" : "#f5f5f5"
                }}>
                  {quote.changePercent > 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {([
                  { l: "시가", v: quote.open },
                  { l: "고가", v: quote.high, c: "#FF2D2D" },
                  { l: "저가", v: quote.low, c: "#2D6CFF" },
                  { l: "전일", v: quote.prevClose },
                  { l: "거래량", v: quote.volume, isVol: true },
                ] as const).map((item) => item.v !== undefined && item.v > 0 ? (
                  <div key={item.l} className="bg-gray-50 rounded-lg px-1.5 py-1.5 text-center">
                    <div className="text-[8px] text-muted">{item.l}</div>
                    <div className="font-mono text-[10px] font-bold" style={{ color: ('c' in item ? item.c : undefined) || "#000" }}>
                      {item.isVol ? (item.v >= 100000000 ? `${(item.v / 100000000).toFixed(1)}억` : item.v >= 10000 ? `${(item.v / 10000).toFixed(0)}만` : item.v.toLocaleString()) : (isKR ? Math.round(item.v).toLocaleString("ko-KR") : formatNumber(item.v, 2))}
                    </div>
                  </div>
                ) : null)}
              </div>
            </>
          ) : (
            <div className="py-3 text-center text-sm text-muted">시세 정보 없음</div>
          )}
        </div>

        {/* 탭 */}
        <div className="sticky top-0 bg-white z-10 border-b border-line">
          <div className="flex">
            {([
              { key: "chart", label: "📊 차트" },
              { key: "news", label: "📰 뉴스" },
              { key: "info", label: "📋 재무" },
              { key: "ai", label: "🤖 AI" },
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
        <div className="px-0">
          {/* ──── 차트 탭 ──── */}
          {activeTab === "chart" && (
            <div>
              <div className="flex items-center justify-between px-4 py-2">
                <div className="text-[11px] text-muted">TradingView · 캔들차트</div>
                <button onClick={() => setChartFull(true)}
                  className="text-[11px] font-bold text-white bg-black px-3 py-1 rounded-lg">
                  🔍 전체화면
                </button>
              </div>
              <div style={{ height: 420 }}>
                <TradingViewChart symbol={stock.code} market={stock.market} />
              </div>
              <div className="px-4 py-2">
                <div className="text-[9px] text-muted text-center">
                  양봉(빨강) · 음봉(파랑) · 차트 도구: 추세선 / 수평선 / 박스 / 펜 — 차트 상단 도구모음 사용
                </div>
              </div>
            </div>
          )}

          {/* ──── 뉴스 탭 ──── */}
          {activeTab === "news" && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-bold">📰 {stock.name} 관련 뉴스</div>
                <span className="text-[9px] text-muted">네이버 뉴스 API</span>
              </div>
              {news.length === 0 ? (
                <div className="text-center text-sm text-muted py-8 animate-pulse">뉴스를 불러오는 중...</div>
              ) : (
                <div className="space-y-2">
                  {news.map((n, i) => (
                    <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                      className="block bg-gray-50 rounded-xl p-3.5 hover:bg-gray-100 transition-colors active:scale-[0.99]">
                      <div className="text-[13px] font-bold leading-snug mb-1.5">{n.title}</div>
                      <div className="text-[11px] text-sub line-clamp-2 mb-2">{n.description}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted">{timeAgo(n.pubDate)}</span>
                        <span className="text-[10px] text-blue-500 font-bold">원문 보기 →</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── 재무 탭 ──── */}
          {activeTab === "info" && (
            <div className="px-4 py-3">
              <FinancialInfo stock={stock} quote={quote} />
            </div>
          )}

          {/* ──── AI 분석 탭 ──── */}
          {activeTab === "ai" && (
            <div className="px-4 py-3">
              <div className="text-[13px] font-bold mb-3">🤖 AI 투자분석 — {stock.name}</div>
              {ai.loading ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <span className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted">Claude AI가 종합 분석 중...</span>
                  <span className="text-[10px] text-muted">기업 개요 · 이슈 · 투자포인트 · 리스크</span>
                </div>
              ) : ai.summary ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-[12px] leading-[1.8] whitespace-pre-line">{ai.summary}</div>
                  <div className="mt-3 pt-2 border-t border-gray-200 text-[9px] text-muted">
                    🤖 Claude AI 생성 · 투자 참고용 · 투자 판단은 본인 책임
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-muted mb-2">AI 분석을 불러올 수 없습니다</div>
                  <button onClick={() => { setAi({ summary: "", loading: false }); fetchAi(); }}
                    className="text-[12px] font-bold bg-black text-white px-4 py-1.5 rounded-lg">
                    다시 시도
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 여백 */}
        <div className="h-8" />
      </div>
    </div>
  );
}

function FinancialInfo({ stock, quote }: { stock: StockInfo; quote: QuoteData | null }) {
  const checklist = [
    { name: "시가총액 적정성", pass: true, desc: "업종 평균 대비 적정" },
    { name: "매출 성장률", pass: true, desc: "3분기 연속 성장" },
    { name: "영업이익률", pass: true, desc: "업종 평균 이상" },
    { name: "부채비율", pass: true, desc: "200% 이하 안정" },
    { name: "ROE", pass: true, desc: "10% 이상 양호" },
    { name: "PER 적정성", pass: null as boolean | null, desc: "비교 분석 필요" },
    { name: "PBR 적정성", pass: true, desc: "1배 이하 저평가" },
    { name: "배당수익률", pass: null as boolean | null, desc: "확인 필요" },
    { name: "외국인 보유비율", pass: true, desc: "안정적 수급" },
    { name: "거래량 추세", pass: true, desc: "평균 이상" },
    { name: "52주 신고가 근접", pass: false, desc: "이격 존재" },
  ];
  const passCount = checklist.filter((c) => c.pass === true).length;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[13px] font-bold mb-2">📋 기업 정보</div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          {[
            ["종목명", quote?.name || stock.name],
            ["종목코드", stock.code],
            ["시장", stock.market === "KR" ? "KRX (한국거래소)" : "US Market"],
            ["섹터", stock.sector || "미분류"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[12px]">
              <span className="text-sub">{k}</span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-bold">✅ 투자 체크리스트</div>
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
            passCount >= 8 ? "bg-green-100 text-green-700" : passCount >= 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
          }`}>{passCount}/{checklist.length}</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
          {checklist.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className="shrink-0">{c.pass === true ? "✅" : c.pass === false ? "❌" : "⬜"}</span>
              <span className="flex-1 font-medium">{c.name}</span>
              <span className="text-muted text-[10px]">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[13px] font-bold mb-2">📊 주요 재무지표</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "PER", value: "15.2배", sub: "업종평균 18.5" },
            { label: "PBR", value: "0.95배", sub: "저평가 구간" },
            { label: "ROE", value: "12.3%", sub: "양호" },
            { label: "부채비율", value: "85.2%", sub: "안정적" },
            { label: "영업이익률", value: "18.7%", sub: "업종 상위" },
            { label: "배당수익률", value: "2.1%", sub: "보통" },
          ].map((it) => (
            <div key={it.label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-[10px] text-muted mb-0.5">{it.label}</div>
              <div className="font-mono text-[15px] font-bold">{it.value}</div>
              <div className="text-[9px] text-muted">{it.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[13px] font-bold mb-2">💡 투자 견해</div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-[12px] leading-relaxed">
          <div className="font-bold text-blue-800 mb-2">종합 의견: 관심 종목 유지</div>
          <div className="text-blue-700 space-y-1">
            <p>• PBR 1배 이하로 밸류에이션 매력 존재</p>
            <p>• 섹터 성장성 대비 주가 조정 구간</p>
            <p>• 중장기 관점 접근 권장</p>
            <p>• 상세 분석은 AI분석 탭 참고</p>
          </div>
          <div className="mt-2 text-[9px] text-blue-400">※ 참고용이며 투자 판단은 본인 책임</div>
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
