"use client";

import { useState, useEffect } from "react";
import { NewsItem } from "@/lib/types";
import { INITIAL_NEWS } from "@/lib/data";

interface NaverNewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

const QUERIES = ["주식 증시 코스피", "반도체 AI 주식", "IPO 상장"];

function classifyNews(title: string): { type: string; typeColor: string; typeEmoji: string } {
  const t = title.toLowerCase();
  if (t.includes("급등") || t.includes("폭등") || t.includes("상한가") || t.includes("사이드카"))
    return { type: "급등", typeColor: "#FF2D2D", typeEmoji: "🔴" };
  if (t.includes("호재") || t.includes("상향") || t.includes("실적") || t.includes("수주"))
    return { type: "호재", typeColor: "#00C176", typeEmoji: "🟢" };
  if (t.includes("ipo") || t.includes("상장") || t.includes("공모"))
    return { type: "IPO", typeColor: "#8B5CF6", typeEmoji: "🚀" };
  if (t.includes("외국인") || t.includes("기관") || t.includes("매수") || t.includes("매도"))
    return { type: "돈흐름", typeColor: "#2D6CFF", typeEmoji: "💰" };
  return { type: "매크로", typeColor: "#666666", typeEmoji: "🌍" };
}

function formatTime(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const now = Date.now();
    const diff = (now - d.getTime()) / 1000;
    if (diff < 60) return "방금";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const results = await Promise.all(
          QUERIES.map(async (q) => {
            const res = await fetch(`/api/news?query=${encodeURIComponent(q)}&display=5`);
            if (!res.ok) return [];
            const data = await res.json();
            return (data.items || []) as NaverNewsItem[];
          })
        );

        const all = results.flat();
        const seen = new Set<string>();
        const unique = all.filter((n) => {
          if (seen.has(n.title)) return false;
          seen.add(n.title);
          return true;
        });

        if (unique.length > 0) {
          const mapped: NewsItem[] = unique.slice(0, 15).map((n, i) => {
            const cls = classifyNews(n.title);
            return {
              id: i + 100,
              ...cls,
              title: n.title,
              summary: n.description,
              time: formatTime(n.pubDate),
              source: "네이버 뉴스",
              link: n.link,
            };
          });
          setNews(mapped);
          setIsLive(true);
        }
      } catch {}
      setLoading(false);
    }

    fetchNews();
    const interval = setInterval(fetchNews, 120000);
    return () => clearInterval(interval);
  }, []);

  return { news, isLive, loading };
}
