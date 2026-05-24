import { Stock, Holding, MarketIndex, NewsItem, EventItem } from './types';

export const EXCHANGE_RATE = 1448;

export const stocks: Stock[] = [
  {
    name: 'TIGER 미국우주테크', code: '396520', sector: '🚀',
    price: 14655, chg: 9.38, per: 'ETF', roe: 'ETF', rev: '+24%',
    cap: '2조', check: '10/11', analyst: '키움증권', tp: '170,000', op: '적극매수',
    desc: 'SpaceX IPO 시 25% 편입 예정. RKLB 25%, 위성통신/발사체 중심 ETF.',
    news: ['SpaceX IPO D-21, 기업가치 $1.75조 전망', 'RKLB 뉴트론 발사체 성공적 테스트 완료', '우주 산업 ETF 자금 유입 가속화'],
    aiScore: 92,
  },
  {
    name: '인텔리안테크', code: '189300', sector: '🚀',
    price: 152800, chg: 3.21, per: '50배', roe: '8%', rev: '+24%',
    cap: '1.8조', check: '10/11', analyst: 'NH투자증권', tp: '170,000', op: '매수',
    desc: '위성통신 안테나 글로벌 1위. 스타링크/원웹 탑재.',
    news: ['인텔리안테크, 스타링크 안테나 공급 계약 체결', '위성통신 시장 2028년까지 연 25% 성장 전망', 'LEO 위성 안테나 수요 급증'],
    aiScore: 90,
  },
  {
    name: '두산로보틱스', code: '454910', sector: '🤖',
    price: 107000, chg: -7.83, per: '적자', roe: '음수', rev: '-23%',
    cap: '9,200억', check: '7/11', analyst: '한국투자', tp: '130,000', op: '보유',
    desc: '협동로봇 전문. 두산그룹 로봇 사업 핵심.',
    news: ['두산로보틱스, 유럽 시장 진출 본격화', '협동로봇 시장 연 30% 성장 전망', '적자 지속에 투자자 우려 확산'],
    aiScore: 65,
  },
  {
    name: '퀄컴', code: 'QCOM', sector: '👓',
    price: 238.16, chg: 2.45, per: '18배', roe: '42%', rev: '+18%',
    cap: '$195B', check: '8/11', analyst: 'Morgan Stanley', tp: '$280', op: '매수',
    desc: 'AR/XR 칩 플랫폼 스냅드래곤. 메타 오리온 글래스 칩 공급.',
    news: ['퀄컴, 메타 오리온 AR 글래스 칩 독점 공급', 'XR2 Gen 3 칩셋 공개', 'AI PC 시장 진출 가속화'],
    usd: true,
    aiScore: 85,
  },
  {
    name: '로켓랩', code: 'RKLB', sector: '🚀',
    price: 135.76, chg: 5.12, per: '적자', roe: '음수', rev: '+55%',
    cap: '$32B', check: '7/11', analyst: 'Goldman Sachs', tp: '$150', op: '매수',
    desc: '소형 발사체 일렉트론 + 중형 뉴트론 개발 중.',
    news: ['로켓랩 뉴트론 발사체 2025 하반기 첫 발사', '일렉트론 50회 발사 달성', 'NASA 계약 수주 증가'],
    usd: true,
    aiScore: 72,
  },
  {
    name: 'SK하이닉스', code: '000660', sector: '💾',
    price: 238000, chg: 4.52, per: '6배', roe: '35%', rev: '+89%',
    cap: '173조', check: '11/11', analyst: '삼성증권', tp: '280,000', op: '적극매수',
    desc: 'HBM4 독점 공급. AI 반도체 메모리 글로벌 1위.',
    news: ['SK하이닉스 HBM4 양산 시작', 'NVIDIA GB300 HBM 독점 공급', 'DRAM 가격 상승세 지속'],
    aiScore: 98,
  },
  {
    name: '미래에셋증권', code: '006800', sector: '🏦',
    price: 12450, chg: 1.82, per: '8배', roe: '12%', rev: '+32%',
    cap: '5.8조', check: '11/11', analyst: 'KB증권', tp: '15,000', op: '매수',
    desc: 'SpaceX $2.78억 지분 보유. 글로벌 자산운용.',
    news: ['미래에셋, SpaceX 지분가치 급등', '해외 ETF 순자산 50조 돌파', '로보어드바이저 서비스 확대'],
    aiScore: 96,
  },
  {
    name: '코리아써키트', code: '007810', sector: '💾',
    price: 28500, chg: 6.34, per: '13배', roe: '15%', rev: '+42%',
    cap: '1.2조', check: '10/11', analyst: '대신증권', tp: '35,000', op: '매수',
    desc: 'SoCAMM 기판 흑자전환. AI 서버 기판 핵심 수혜.',
    news: ['코리아써키트, SoCAMM 기판 양산 본격화', 'AI 서버 기판 수주 급증', '흑자전환 성공에 목표가 상향'],
    aiScore: 94,
  },
  {
    name: '한화에어로스페이스', code: '012450', sector: '🚀',
    price: 856000, chg: 2.15, per: '35배', roe: '18%', rev: '+45%',
    cap: '48조', check: '9/11', analyst: '미래에셋', tp: '950,000', op: '매수',
    desc: '우주항공 + 방산. 누리호 엔진, K-방산 수출.',
    news: ['한화에어로, 누리호 3차 발사 성공', '폴란드 K9 추가 수주', '우주 사업부 분사 검토'],
    aiScore: 88,
  },
  {
    name: '셀트리온', code: '068270', sector: '💊',
    price: 185500, chg: -1.24, per: '22배', roe: '16%', rev: '+28%',
    cap: '26조', check: '9/11', analyst: '하나증권', tp: '220,000', op: '매수',
    desc: '바이오시밀러 글로벌 1위. 짐펜트라 미국 판매 호조.',
    news: ['셀트리온, 짐펜트라 미국 시장점유율 30% 돌파', '신규 바이오시밀러 3종 FDA 승인 추진', '자사주 매입 발표'],
    aiScore: 86,
  },
  {
    name: 'NVIDIA', code: 'NVDA', sector: '💾',
    price: 135.40, chg: 3.28, per: '55배', roe: '85%', rev: '+122%',
    cap: '$3.3T', check: '9/11', analyst: 'JP Morgan', tp: '$170', op: '적극매수',
    desc: 'AI GPU 절대 강자. 데이터센터, 자율주행, 로봇.',
    news: ['NVIDIA GB300 출하 시작', 'AI 데이터센터 투자 가속화', 'Blackwell 수요 공급 초과'],
    usd: true,
    aiScore: 91,
  },
  {
    name: 'Tesla', code: 'TSLA', sector: '🚗',
    price: 342.50, chg: -2.18, per: '95배', roe: '20%', rev: '+12%',
    cap: '$1.1T', check: '7/11', analyst: 'Wedbush', tp: '$400', op: '매수',
    desc: '전기차 + FSD + 옵티머스 로봇 + 에너지.',
    news: ['테슬라, 옵티머스 Gen 3 공개', 'FSD v13 완전자율주행 승인 임박', '사이버트럭 생산량 증가'],
    usd: true,
    aiScore: 74,
  },
  {
    name: '삼성전자', code: '005930', sector: '💾',
    price: 83200, chg: 1.05, per: '12배', roe: '8%', rev: '+15%',
    cap: '497조', check: '8/11', analyst: '삼성증권', tp: '100,000', op: '매수',
    desc: '반도체 + 스마트폰 + 파운드리. HBM 경쟁력 강화 중.',
    news: ['삼성전자, HBM3E 엔비디아 퀄 테스트 통과', '갤럭시 S25 울트라 판매 호조', '파운드리 2nm GAA 양산 준비'],
    aiScore: 80,
  },
  {
    name: 'KODEX AI전력핵심설비', code: '472170', sector: '⚡',
    price: 55090, chg: -2.57, per: 'ETF', roe: 'ETF', rev: '+35%',
    cap: '8,500억', check: '8/11', analyst: '삼성자산운용', tp: '-', op: '-',
    desc: 'AI 데이터센터 전력 인프라 ETF. 변압기, 전선 등.',
    news: ['AI 데이터센터 전력 수요 폭증', '변압기 업체 수주 잔고 역대 최고', '전력 인프라 투자 확대'],
    aiScore: 78,
  },
  {
    name: 'Apple', code: 'AAPL', sector: '📱',
    price: 198.50, chg: 0.85, per: '32배', roe: '147%', rev: '+5%',
    cap: '$3.0T', check: '9/11', analyst: 'Bernstein', tp: '$220', op: '매수',
    desc: 'iPhone + Apple Vision Pro + 서비스 생태계.',
    news: ['애플, iOS 19 AI 기능 대폭 강화', 'Vision Pro 2세대 개발 중', '서비스 매출 사상 최고'],
    usd: true,
    aiScore: 87,
  },
];

export const portfolio = {
  domestic: [
    { name: 'TIGER 미국우주테크', code: '396520', qty: 706, avg: 13398, cur: 14655, sector: '🚀', check: '10/11' },
    { name: '인텔리안테크', code: '189300', qty: 15, avg: 139520, cur: 152800, sector: '🚀', check: '10/11' },
    { name: '두산로보틱스', code: '454910', qty: 4, avg: 116100, cur: 107000, sector: '🤖', check: '7/11' },
  ] as Holding[],
  overseas: [
    { name: '퀄컴', code: 'QCOM', qty: 10, avg: 202.68, cur: 238.16, sector: '👓', check: '8/11', usd: true },
    { name: '로켓랩', code: 'RKLB', qty: 7, avg: 133.21, cur: 135.76, sector: '🚀', check: '7/11', usd: true },
  ] as Holding[],
  pension: [
    { name: 'TIGER 미국우주테크', code: '396520', qty: 281, avg: 14216, cur: 14655, type: '위험' },
    { name: 'KODEX AI전력핵심설비', code: '472170', qty: 37, avg: 56505, cur: 55090, type: '위험' },
    { name: 'TIME 나스닥채권혼합50', code: '000000', qty: 95, avg: 14240, cur: 14295, type: '안전' },
    { name: 'KODEX TDF2060', code: '000001', qty: 103, avg: 12315, cur: 12375, type: '안전' },
  ] as Holding[],
};

export const marketIndices: MarketIndex[] = [
  { name: '코스피', flag: '🇰🇷', value: 7847.71, chg: 0.41 },
  { name: '코스닥', flag: '🇰🇷', value: 1161.13, chg: 4.99 },
  { name: '나스닥100', flag: '🇺🇸', value: 26343.97, chg: 0.19 },
  { name: 'S&P500', flag: '🇺🇸', value: 7473.48, chg: 0.37 },
  { name: '다우존스', flag: '🇺🇸', value: 50579.71, chg: 0.58 },
  { name: 'VIX', flag: '🇺🇸', value: 18.42, chg: -2.15 },
];

export const bondsCommodities: MarketIndex[] = [
  { name: '미국채 2년', flag: '🇺🇸', value: 4.12, chg: 1.08 },
  { name: '미국채 10년', flag: '🇺🇸', value: 4.56, chg: -0.35 },
  { name: 'WTI', flag: '🛢️', value: 96.60, chg: 0.26 },
  { name: '골드', flag: '🥇', value: 4523, chg: -0.42 },
  { name: 'USD/KRW', flag: '💱', value: 1448, chg: -0.12 },
  { name: 'USD/JPY', flag: '💴', value: 149.82, chg: 0.08 },
];

export const newsItems: NewsItem[] = [
  { type: 'surge', title: '코스피 +8.07% 역사적 급등! 3,000 돌파', time: '10:30', tags: ['📊 전체', '💰 기관 2.3조'] },
  { type: 'good', title: 'SpaceX IPO 공식 발표, 기업가치 $1.75조', time: '09:15', tags: ['🚀 우주', '📈 IPO'] },
  { type: 'flow', title: '외국인 반도체 → 로봇 섹터 대규모 이동', time: '14:20', tags: ['💰 외국인', '🤖 로봇'] },
  { type: 'ipo', title: '로켓랩 뉴트론 발사체 첫 비행 성공', time: '08:00', tags: ['🚀 우주', '🇺🇸 미국'] },
  { type: 'macro', title: 'Fed 금리 동결, 9월 인하 시사', time: '03:00', tags: ['🌍 매크로', '💵 금리'] },
  { type: 'surge', title: 'SK하이닉스 HBM4 양산 개시, 신고가 경신', time: '11:45', tags: ['💾 반도체', '📈 신고가'] },
  { type: 'good', title: '한화에어로 폴란드 K9 추가 수주 $2.4B', time: '16:30', tags: ['🚀 방산', '🇵🇱 폴란드'] },
  { type: 'flow', title: '기관 매수 상위: 삼성전자, SK하이닉스, 셀트리온', time: '15:30', tags: ['💰 기관', '📊 매수'] },
];

export const events: EventItem[] = [
  { emoji: '🚀', name: 'SpaceX IPO', dday: 21 },
  { emoji: '💰', name: 'Fed FOMC 회의', dday: 14 },
  { emoji: '📊', name: 'SK하이닉스 실적발표', dday: 5 },
  { emoji: '🤖', name: '테슬라 옵티머스 발표', dday: 35 },
  { emoji: '📱', name: 'Apple WWDC', dday: 10 },
];
