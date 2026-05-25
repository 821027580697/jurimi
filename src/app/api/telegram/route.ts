import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN || !CHAT_ID) {
    return NextResponse.json({ error: "텔레그램 설정 미완료" }, { status: 500 });
  }

  try {
    const { message, parseMode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "메시지가 필요합니다" }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: parseMode || "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description || "전송 실패" }, { status: 400 });
    }

    return NextResponse.json({ success: true, messageId: data.result?.message_id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
