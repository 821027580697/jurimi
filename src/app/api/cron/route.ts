import { NextRequest, NextResponse } from "next/server";

const NAVER_CID = process.env.NAVER_CLIENT_ID || "";
const NAVER_SEC = process.env.NAVER_CLIENT_SECRET || "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const QUERIES = ["주식 증시 코스피", "반도체 AI 주식", "IPO 상장", "금리 환율 경제"];

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

function cleanHtml(str: string): string {
  return (str || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'");
}

async function fetchNaverNews(): Promise<NewsItem[]> {
  if (!NAVER_CID || !NAVER_SEC) return [];

  const allItems: NewsItem[] = [];
  for (const q of QUERIES) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=5&sort=date`,
        { headers: { "X-Naver-Client-Id": NAVER_CID, "X-Naver-Client-Secret": NAVER_SEC } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data.items || []) {
        allItems.push({
          title: cleanHtml(item.title),
          description: cleanHtml(item.description),
          link: item.originallink || item.link,
          pubDate: item.pubDate,
        });
      }
    } catch {}
  }

  const seen = new Set<string>();
  return allItems.filter((n) => {
    if (seen.has(n.title)) return false;
    seen.add(n.title);
    return true;
  });
}

async function getAiSummary(news: NewsItem[]): Promise<string> {
  if (!ANTHROPIC_KEY || news.length === 0) return "";

  const headlines = news
    .slice(0, 10)
    .map((n, i) => `${i + 1}. ${n.title}`)
    .join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{
          role: "user",
          content: `당신은 한국 주식 투자 전문 AI입니다. 오늘의 주요 뉴스를 분석하여 투자자에게 텔레그램 알림용 브리핑을 작성해주세요.

오늘의 뉴스:
${headlines}

다음 형식으로 작성해주세요:
🔔 주리미 AI 뉴스 브리핑

📈 시장 요약: (2~3문장)

🔥 주요 이슈:
1. (핵심 이슈 1)
2. (핵심 이슈 2)
3. (핵심 이슈 3)

💡 투자 포인트: (1~2문장 핵심 조언)

⏰ ${new Date().toLocaleDateString("ko-KR")} 기준`,
        }],
      }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    return data.content?.[0]?.text || "";
  } catch {
    return "";
  }
}

async function sendTelegram(message: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID || !message) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

// Vercel Cron 또는 수동 트리거
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const news = await fetchNaverNews();
    if (news.length === 0) {
      return NextResponse.json({ status: "no_news", count: 0 });
    }

    const summary = await getAiSummary(news);
    if (!summary) {
      return NextResponse.json({ status: "no_summary", count: news.length });
    }

    const sent = await sendTelegram(summary);

    return NextResponse.json({
      status: "ok",
      newsCount: news.length,
      summaryLength: summary.length,
      telegramSent: sent,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
