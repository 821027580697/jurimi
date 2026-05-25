"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { NewsItem } from "@/lib/types";

interface Props {
  news: NewsItem[];
  isLive: boolean;
}

interface AiSummary {
  summary: string;
  loading: boolean;
  error: string | null;
}

export default function NewsSlider({ news, isLive }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [summaries, setSummaries] = useState<Record<number, AiSummary>>({});

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / news.length;
    el.scrollTo({ left: cardWidth * idx, behavior: "smooth" });
  }, [news.length]);

  useEffect(() => {
    autoRef.current = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % news.length;
        scrollTo(next);
        return next;
      });
    }, 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [news.length, scrollTo]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / news.length;
    setActiveIdx(Math.round(el.scrollLeft / cardWidth));

    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % news.length;
        scrollTo(next);
        return next;
      });
    }, 5000);
  };

  const toggleExpand = async (id: number, item: NewsItem) => {
    const isOpen = !expanded[id];
    setExpanded((prev) => ({ ...prev, [id]: isOpen }));

    if (isOpen && !summaries[id]) {
      setSummaries((prev) => ({
        ...prev,
        [id]: { summary: "", loading: true, error: null },
      }));

      try {
        const res = await fetch("/api/ai-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            description: item.summary,
            source: item.source,
            link: item.link,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || `AI 요약 실패 (${res.status})`);
        }

        setSummaries((prev) => ({
          ...prev,
          [id]: { summary: data.summary, loading: false, error: null },
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "오류";
        const userMsg = msg.includes("미설정")
          ? "⚠️ Vercel 환경변수에 ANTHROPIC_API_KEY를 추가해주세요"
          : msg;
        setSummaries((prev) => ({
          ...prev,
          [id]: { summary: "", loading: false, error: userMsg },
        }));
      }
    }
  };

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">📰 실시간 뉴스</h2>
          {isLive && (
            <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
          )}
        </div>
        <span className="text-[10px] text-muted">AI 요약 탭하기 ↓</span>
      </div>

      {/* 슬라이더 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {news.map((item) => {
          const isOpen = expanded[item.id];
          const ai = summaries[item.id];

          return (
            <div
              key={item.id}
              className={`snap-start shrink-0 rounded-2xl border border-line bg-white transition-all ${
                isOpen ? "w-[320px]" : "w-[220px]"
              }`}
            >
              {/* 카드 헤더 */}
              <a
                href={item.link || undefined}
                target={item.link ? "_blank" : undefined}
                rel={item.link ? "noopener noreferrer" : undefined}
                className="block p-4 pb-2"
              >
                <div
                  className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-2"
                  style={{ backgroundColor: item.typeColor }}
                >
                  {item.typeEmoji} {item.type}
                </div>
                <div className="text-[13px] font-bold leading-snug mb-1.5 line-clamp-2">{item.title}</div>
                <div className="text-[11px] text-sub line-clamp-2 mb-1">{item.summary}</div>
              </a>

              {/* 출처 + AI 요약 토글 */}
              <div className="px-4 pb-2">
                <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="text-blue-500 hover:underline">원문 →</a>
                  )}
                </div>

                {/* AI 요약 아코디언 버튼 */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleExpand(item.id, item); }}
                  className={`w-full flex items-center justify-between text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors mt-1 ${
                    isOpen
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>🤖 AI 요약</span>
                  <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                </button>
              </div>

              {/* AI 요약 콘텐츠 (아코디언) */}
              {isOpen && (
                <div className="px-4 pb-4 animate-in">
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 border border-gray-100">
                    {ai?.loading ? (
                      <div className="flex items-center gap-2 py-2">
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] text-muted">AI가 분석 중...</span>
                      </div>
                    ) : ai?.error ? (
                      <div className="text-[11px] text-red-500 py-1">{ai.error}</div>
                    ) : ai?.summary ? (
                      <div className="text-[11px] leading-relaxed whitespace-pre-line text-gray-700">
                        {ai.summary}
                      </div>
                    ) : null}

                    {/* 출처/링크 */}
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-[9px] text-muted">
                      <span>출처: {item.source}</span>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="text-blue-500 hover:underline font-bold">
                          기사 원문 보기 →
                        </a>
                      )}
                    </div>
                    <div className="mt-1 text-[9px] text-muted">
                      🤖 Claude AI 요약 · 투자 참고용
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-1 mt-3">
        {news.slice(0, 8).map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIdx(i); scrollTo(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === activeIdx ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
