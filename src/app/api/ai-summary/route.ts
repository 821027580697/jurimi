import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API 키 미설정" }, { status: 500 });
  }

  try {
    const { title, description, source, link } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "제목이 필요합니다" }, { status: 400 });
    }

    const prompt = `당신은 한국 주식 투자 전문 AI 애널리스트입니다.
아래 뉴스를 분석하여 투자자에게 유용한 요약을 제공해주세요.

[뉴스 제목] ${title}
[뉴스 요약] ${description || "없음"}
[출처] ${source || "불명"}

다음 형식으로 정확히 답변해주세요:

📋 핵심요약: (1~2문장으로 뉴스 핵심 정리)

📊 투자 포인트:
• (관련 종목이나 섹터에 미치는 영향 1)
• (관련 종목이나 섹터에 미치는 영향 2)

🏷️ 관련: (관련 종목명이나 섹터, 쉼표로 구분)

⚡ 영향도: (상/중/하 중 택1) | (긍정/부정/중립 중 택1)`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Claude API ${res.status}`, detail: err }, { status: res.status });
    }

    const data = await res.json();
    const summary = data.content?.[0]?.text || "요약을 생성할 수 없습니다.";

    return NextResponse.json({
      summary,
      title,
      source,
      link,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
