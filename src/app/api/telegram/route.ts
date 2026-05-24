import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const token = process.env.NEXT_PUBLIC_TELEGRAM_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT;

  if (!token || !chatId) {
    return NextResponse.json({ error: '텔레그램 설정이 없습니다.' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '알림 발송 실패' }, { status: 500 });
  }
}
