import { MarketData, NewsItem, SectorCycleItem, EventItem, PortfolioItem } from "./types";

export const MARKET_DATA: MarketData = {
  korea: [
    { region: "🇰🇷", name: "코스피", symbol: "0001", value: 2687.45, change: 0.41, prevClose: 2676.47 },
    { region: "🇰🇷", name: "코스닥", symbol: "1001", value: 868.32, change: 4.99, prevClose: 827.01 },
  ],
  us: [
    { region: "🇺🇸", name: "다우존스", symbol: "DIA", value: 42350, change: 0.58, prevClose: 42106 },
    { region: "🇺🇸", name: "S&P500", symbol: "SPY", value: 5890, change: 0.37, prevClose: 5868 },
    { region: "🇺🇸", name: "나스닥", symbol: "QQQ", value: 18960, change: 0.19, prevClose: 18924 },
    { region: "🇺🇸", name: "VIX", symbol: "VIX", value: 18.42, change: -2.15, prevClose: 18.82 },
  ],
  japan: [
    { region: "🇯🇵", name: "닛케이225", symbol: "NKY", value: 38450, change: 0.67, prevClose: 38194 },
  ],
  china: [
    { region: "🇨🇳", name: "상해종합", symbol: "SSEC", value: 3180, change: -0.23, prevClose: 3187 },
    { region: "🇭🇰", name: "항셍", symbol: "HSI", value: 18920, change: 0.45, prevClose: 18835 },
  ],
  europe: [
    { region: "🇪🇺", name: "유로50", symbol: "EU50", value: 4850, change: 0.34, prevClose: 4834 },
    { region: "🇩🇪", name: "DAX", symbol: "DAX", value: 18200, change: 0.12, prevClose: 18178 },
  ],
  currencies: [
    { pair: "USD/KRW", value: 1448.50, change: -0.12 },
    { pair: "JPY/KRW", value: 9.68, change: 0.34 },
    { pair: "EUR/KRW", value: 1572.30, change: 0.08 },
    { pair: "CNY/KRW", value: 199.50, change: -0.05 },
  ],
  commodities: [
    { name: "WTI", icon: "🛢️", symbol: "CL", value: 96.60, change: 0.26, unit: "$" },
    { name: "골드", icon: "🥇", symbol: "GC", value: 3523.20, change: -0.42, unit: "$" },
    { name: "미국채10년", icon: "📊", symbol: "TNX", value: 4.56, change: -0.35, unit: "%" },
    { name: "미국채2년", icon: "📊", symbol: "T2Y", value: 4.12, change: 1.08, unit: "%" },
  ],
};

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 1,
    type: "급등",
    typeColor: "#FF2D2D",
    typeEmoji: "🔴",
    title: "코스피 +8.07% 역사적 급등! 매수 사이드카 발동",
    summary: "기관 2.3조 매수. 삼성전자 +8.42%, SK하이닉스 +11.2%",
    time: "10:30",
    source: "한국경제",
  },
  {
    id: 2,
    type: "호재",
    typeColor: "#00C176",
    typeEmoji: "🟢",
    title: "삼성전자 파업 극적 타결! JP모건 목표가 48만원 상향",
    summary: "메모리 사업부 1인당 6억 성과급. 노사 합의",
    time: "10:15",
    source: "매일경제",
  },
  {
    id: 3,
    type: "IPO",
    typeColor: "#8B5CF6",
    typeEmoji: "🚀",
    title: "SpaceX S-1 나스닥 제출! 6/12 상장 확정",
    summary: "$750억 조달, 밸류 $1.75조. 역대 최대 IPO",
    time: "09:00",
    source: "Reuters",
  },
  {
    id: 4,
    type: "매크로",
    typeColor: "#666666",
    typeEmoji: "🌍",
    title: "이란 종전 협상 진전! 다우 사상 최고치 경신",
    summary: "유가 하락 → 인플레이션 완화 기대",
    time: "08:30",
    source: "Bloomberg",
  },
  {
    id: 5,
    type: "돈흐름",
    typeColor: "#2D6CFF",
    typeEmoji: "💰",
    title: "외국인: 반도체 -11조 매도 → 로봇 +9천억 이동",
    summary: "섹터 로테이션 감지. 전력·자동차도 수혜",
    time: "08:00",
    source: "연합뉴스",
  },
];

export const SECTORS: SectorCycleItem[] = [
  { name: "우주", emoji: "🚀", status: "active", period: "~6/12", portfolioPct: 72, ytdReturn: 38.19, barColor: "#000" },
  { name: "AI실적", emoji: "💎", status: "active", period: "연중", portfolioPct: 10, ytdReturn: 25, barColor: "#333" },
  { name: "AI전력", emoji: "⚡", status: "active", period: "연중", portfolioPct: 0, ytdReturn: 79.66, barColor: "#555" },
  { name: "AI안경", emoji: "👓", status: "upcoming", period: "7~10월", portfolioPct: 15, ytdReturn: 10, barColor: "#CCC" },
  { name: "로봇", emoji: "🤖", status: "upcoming", period: "6~9월", portfolioPct: 2, ytdReturn: 37, barColor: "#CCC" },
  { name: "양자", emoji: "🔬", status: "future", period: "2027~", portfolioPct: 0, ytdReturn: 0, barColor: "#EEE" },
];

export const EVENTS: EventItem[] = [
  { date: "2026-06-03", name: "브로드컴 실적", icon: "💎", dDay: 0, highlight: false },
  { date: "2026-06-04", name: "SpaceX 로드쇼", icon: "🚀", dDay: 0, highlight: false },
  { date: "2026-06-12", name: "SpaceX IPO!", icon: "🚀", dDay: 0, highlight: true },
  { date: "2026-06-17", name: "FOMC", icon: "🏦", dDay: 0, highlight: false },
  { date: "2026-06-24", name: "퀄컴 투자자의날", icon: "👓", dDay: 0, highlight: false },
  { date: "2026-07-17", name: "LG 로보스타 인수", icon: "🤖", dDay: 0, highlight: false },
];

export const PORTFOLIO: PortfolioItem[] = [
  { name: "TIGER 미국우주테크", code: "396520", qty: 706, avgPrice: 13398, currentPrice: 14655, sector: "우주", sectorEmoji: "🚀", account: "국내", checklist: "10/11" },
  { name: "인텔리안테크", code: "189300", qty: 15, avgPrice: 139520, currentPrice: 152800, sector: "우주", sectorEmoji: "🚀", account: "국내", checklist: "10/11" },
  { name: "두산로보틱스", code: "454910", qty: 4, avgPrice: 116100, currentPrice: 107000, sector: "로봇", sectorEmoji: "🤖", account: "국내", checklist: "7/11" },
  { name: "퀄컴", code: "QCOM", qty: 10, avgPrice: 202.68, currentPrice: 238.16, sector: "AI안경", sectorEmoji: "👓", account: "해외", checklist: "8/11", isUsd: true },
  { name: "로켓랩", code: "RKLB", qty: 7, avgPrice: 133.21, currentPrice: 135.76, sector: "우주", sectorEmoji: "🚀", account: "해외", checklist: "7/11", isUsd: true },
  { name: "TIGER 미국우주테크", code: "396520", qty: 281, avgPrice: 14216, currentPrice: 14655, sector: "우주", sectorEmoji: "🚀", account: "퇴직연금", checklist: "10/11" },
  { name: "KODEX AI전력핵심설비", code: "487240", qty: 37, avgPrice: 56505, currentPrice: 55090, sector: "AI전력", sectorEmoji: "⚡", account: "퇴직연금", checklist: "10/11" },
  { name: "TIME 나스닥채권혼합50", code: "TIME", qty: 95, avgPrice: 14240, currentPrice: 14295, sector: "안전자산", sectorEmoji: "🛡️", account: "퇴직연금", checklist: "-" },
  { name: "KODEX TDF2060", code: "TDF", qty: 103, avgPrice: 12315, currentPrice: 12375, sector: "안전자산", sectorEmoji: "🛡️", account: "퇴직연금", checklist: "-" },
];

export const SECTOR_COLORS: Record<string, string> = {
  "우주": "#000000",
  "AI안경": "#333333",
  "반도체": "#555555",
  "AI전력": "#777777",
  "로봇": "#999999",
  "안전자산": "#CCCCCC",
  "현금": "#EEEEEE",
};

export const CYCLE_PHASES = [
  { emoji: "🌸", name: "골디락스", key: "goldilocks" },
  { emoji: "☀️", name: "인플레이션", key: "inflation" },
  { emoji: "🍂", name: "스태그플레이션", key: "stagflation" },
  { emoji: "❄️", name: "디플레이션", key: "deflation" },
] as const;

export const CURRENT_CYCLE = "inflation";
