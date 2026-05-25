export interface StockInfo {
  name: string;
  code: string;
  market: "KR" | "US";
  sector?: string;
}

export const STOCK_DB: StockInfo[] = [
  // === 한국 주요 종목 (KOSPI) ===
  { name: "삼성전자", code: "005930", market: "KR", sector: "반도체" },
  { name: "삼성전자우", code: "005935", market: "KR", sector: "반도체" },
  { name: "SK하이닉스", code: "000660", market: "KR", sector: "반도체" },
  { name: "LG에너지솔루션", code: "373220", market: "KR", sector: "배터리" },
  { name: "삼성바이오로직스", code: "207940", market: "KR", sector: "바이오" },
  { name: "현대차", code: "005380", market: "KR", sector: "자동차" },
  { name: "기아", code: "000270", market: "KR", sector: "자동차" },
  { name: "셀트리온", code: "068270", market: "KR", sector: "바이오" },
  { name: "KB금융", code: "105560", market: "KR", sector: "금융" },
  { name: "신한지주", code: "055550", market: "KR", sector: "금융" },
  { name: "NAVER", code: "035420", market: "KR", sector: "IT" },
  { name: "카카오", code: "035720", market: "KR", sector: "IT" },
  { name: "POSCO홀딩스", code: "005490", market: "KR", sector: "철강" },
  { name: "삼성SDI", code: "006400", market: "KR", sector: "배터리" },
  { name: "LG화학", code: "051910", market: "KR", sector: "화학" },
  { name: "현대모비스", code: "012330", market: "KR", sector: "자동차" },
  { name: "하나금융지주", code: "086790", market: "KR", sector: "금융" },
  { name: "삼성물산", code: "028260", market: "KR", sector: "건설" },
  { name: "카카오뱅크", code: "323410", market: "KR", sector: "금융" },
  { name: "삼성생명", code: "032830", market: "KR", sector: "보험" },
  { name: "LG전자", code: "066570", market: "KR", sector: "전자" },
  { name: "SK이노베이션", code: "096770", market: "KR", sector: "에너지" },
  { name: "SK텔레콤", code: "017670", market: "KR", sector: "통신" },
  { name: "KT", code: "030200", market: "KR", sector: "통신" },
  { name: "LG", code: "003550", market: "KR", sector: "지주" },
  { name: "한국전력", code: "015760", market: "KR", sector: "전력" },
  { name: "HD현대중공업", code: "329180", market: "KR", sector: "조선" },
  { name: "HD한국조선해양", code: "009540", market: "KR", sector: "조선" },
  { name: "한화에어로스페이스", code: "012450", market: "KR", sector: "방산" },
  { name: "한화오션", code: "042660", market: "KR", sector: "조선" },
  { name: "두산에너빌리티", code: "034020", market: "KR", sector: "에너지" },
  { name: "크래프톤", code: "259960", market: "KR", sector: "게임" },
  { name: "엔씨소프트", code: "036570", market: "KR", sector: "게임" },
  { name: "넷마블", code: "251270", market: "KR", sector: "게임" },
  { name: "카카오게임즈", code: "293490", market: "KR", sector: "게임" },
  { name: "하이브", code: "352820", market: "KR", sector: "엔터" },
  { name: "JYP Ent.", code: "035900", market: "KR", sector: "엔터" },
  { name: "SM", code: "041510", market: "KR", sector: "엔터" },
  { name: "CJ ENM", code: "035760", market: "KR", sector: "엔터" },
  { name: "SK스퀘어", code: "402340", market: "KR", sector: "IT" },
  { name: "SK", code: "034730", market: "KR", sector: "지주" },
  { name: "한미반도체", code: "042700", market: "KR", sector: "반도체" },
  { name: "리노공업", code: "058470", market: "KR", sector: "반도체" },
  { name: "에코프로비엠", code: "247540", market: "KR", sector: "배터리" },
  { name: "에코프로", code: "086520", market: "KR", sector: "배터리" },
  { name: "포스코퓨처엠", code: "003670", market: "KR", sector: "배터리" },
  { name: "두산로보틱스", code: "454910", market: "KR", sector: "로봇" },
  { name: "레인보우로보틱스", code: "277810", market: "KR", sector: "로봇" },
  { name: "인텔리안테크", code: "189300", market: "KR", sector: "우주" },
  { name: "쎄트렉아이", code: "099320", market: "KR", sector: "우주" },
  { name: "한화시스템", code: "272210", market: "KR", sector: "방산" },
  { name: "LIG넥스원", code: "079550", market: "KR", sector: "방산" },
  { name: "현대로템", code: "064350", market: "KR", sector: "방산" },
  { name: "HD현대일렉트릭", code: "267260", market: "KR", sector: "전력" },
  { name: "LS ELECTRIC", code: "010120", market: "KR", sector: "전력" },
  { name: "일진전기", code: "103590", market: "KR", sector: "전력" },
  { name: "대한전선", code: "001440", market: "KR", sector: "전력" },
  { name: "금양", code: "001570", market: "KR", sector: "소재" },
  { name: "삼성전기", code: "009150", market: "KR", sector: "전자" },
  { name: "SK바이오팜", code: "326030", market: "KR", sector: "바이오" },
  { name: "알테오젠", code: "196170", market: "KR", sector: "바이오" },
  { name: "HLB", code: "028300", market: "KR", sector: "바이오" },
  { name: "유한양행", code: "000100", market: "KR", sector: "바이오" },
  { name: "삼성중공업", code: "010140", market: "KR", sector: "조선" },
  // ETF
  { name: "TIGER 미국우주테크", code: "396520", market: "KR", sector: "ETF" },
  { name: "KODEX 200", code: "069500", market: "KR", sector: "ETF" },
  { name: "KODEX AI전력핵심설비", code: "487240", market: "KR", sector: "ETF" },
  { name: "TIGER 나스닥100", code: "133690", market: "KR", sector: "ETF" },
  { name: "KODEX 반도체", code: "091160", market: "KR", sector: "ETF" },
  { name: "TIGER S&P500", code: "360750", market: "KR", sector: "ETF" },

  // === 미국 주요 종목 ===
  { name: "애플", code: "AAPL", market: "US", sector: "IT" },
  { name: "마이크로소프트", code: "MSFT", market: "US", sector: "IT" },
  { name: "엔비디아", code: "NVDA", market: "US", sector: "반도체" },
  { name: "아마존", code: "AMZN", market: "US", sector: "커머스" },
  { name: "알파벳(구글)", code: "GOOGL", market: "US", sector: "IT" },
  { name: "메타(페이스북)", code: "META", market: "US", sector: "IT" },
  { name: "테슬라", code: "TSLA", market: "US", sector: "자동차" },
  { name: "브로드컴", code: "AVGO", market: "US", sector: "반도체" },
  { name: "TSMC", code: "TSM", market: "US", sector: "반도체" },
  { name: "일라이릴리", code: "LLY", market: "US", sector: "바이오" },
  { name: "버크셔해서웨이", code: "BRK.B", market: "US", sector: "금융" },
  { name: "JP모건", code: "JPM", market: "US", sector: "금융" },
  { name: "비자", code: "V", market: "US", sector: "금융" },
  { name: "유나이티드헬스", code: "UNH", market: "US", sector: "헬스케어" },
  { name: "존슨앤존슨", code: "JNJ", market: "US", sector: "헬스케어" },
  { name: "코스트코", code: "COST", market: "US", sector: "유통" },
  { name: "월마트", code: "WMT", market: "US", sector: "유통" },
  { name: "프록터앤갬블", code: "PG", market: "US", sector: "소비재" },
  { name: "AMD", code: "AMD", market: "US", sector: "반도체" },
  { name: "인텔", code: "INTC", market: "US", sector: "반도체" },
  { name: "퀄컴", code: "QCOM", market: "US", sector: "반도체" },
  { name: "넷플릭스", code: "NFLX", market: "US", sector: "미디어" },
  { name: "디즈니", code: "DIS", market: "US", sector: "미디어" },
  { name: "나이키", code: "NKE", market: "US", sector: "소비재" },
  { name: "보잉", code: "BA", market: "US", sector: "항공" },
  { name: "록히드마틴", code: "LMT", market: "US", sector: "방산" },
  { name: "로켓랩", code: "RKLB", market: "US", sector: "우주" },
  { name: "팔란티어", code: "PLTR", market: "US", sector: "AI" },
  { name: "스노우플레이크", code: "SNOW", market: "US", sector: "클라우드" },
  { name: "크라우드스트라이크", code: "CRWD", market: "US", sector: "보안" },
  { name: "ARM홀딩스", code: "ARM", market: "US", sector: "반도체" },
  { name: "코인베이스", code: "COIN", market: "US", sector: "크립토" },
  { name: "리비안", code: "RIVN", market: "US", sector: "자동차" },
  { name: "소파이", code: "SOFI", market: "US", sector: "핀테크" },
  { name: "슈퍼마이크로", code: "SMCI", market: "US", sector: "서버" },
  { name: "마이크론", code: "MU", market: "US", sector: "반도체" },
];

export function searchStocks(query: string): StockInfo[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();

  return STOCK_DB.filter((s) => {
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.sector && s.sector.toLowerCase().includes(q))
    );
  }).slice(0, 10);
}
