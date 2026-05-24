import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { stockName } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `주리미 AI: 다음 종목에 대해 체크리스트 11항목 기준으로 분석해주세요: ${stockName}

체크리스트 항목:
1. PER 적정성 (업종 평균 대비)
2. ROE 양호 (10% 이상)
3. 매출 성장률 (YoY 양수)
4. 영업이익 흑자
5. 부채비율 적정 (200% 이하)
6. 기관/외국인 순매수
7. 52주 신고가 근접
8. 거래량 증가 추세
9. 업종 성장성
10. 경영진 신뢰도
11. 배당/주주환원

각 항목에 대해 ✅ 통과 또는 ❌ 미통과로 판정하고, 종합 점수와 투자 의견을 제시해주세요. 한국어로 답변해주세요.`,
          },
        ],
      }),
    });

    const data = await res.json();
    const analysis = data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
