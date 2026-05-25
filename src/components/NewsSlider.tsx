"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { NewsItem } from "@/lib/types";

interface Props {
  news: NewsItem[];
  isLive: boolean;
}

export default function NewsSlider({ news, isLive }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIdx(idx);

    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % news.length;
        scrollTo(next);
        return next;
      });
    }, 5000);
  };

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">📰 실시간 뉴스</h2>
          {isLive && (
            <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">
              LIVE
            </span>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {news.map((item) => (
          <a
            key={item.id}
            href={item.link || undefined}
            target={item.link ? "_blank" : undefined}
            rel={item.link ? "noopener noreferrer" : undefined}
            className="snap-start shrink-0 w-[220px] rounded-2xl border border-line p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div
              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-2"
              style={{ backgroundColor: item.typeColor }}
            >
              {item.typeEmoji} {item.type}
            </div>
            <div className="text-[13px] font-bold leading-snug mb-1.5 line-clamp-2">{item.title}</div>
            <div className="text-[11px] text-sub line-clamp-2 mb-2">{item.summary}</div>
            <div className="flex items-center justify-between text-[10px] text-muted">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
          </a>
        ))}
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
