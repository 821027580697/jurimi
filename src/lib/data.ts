import { Stock, Holding, MarketIndex, NewsItem, EventItem } from './types';

export const EXCHANGE_RATE = 1448;

export const stocks: Stock[] = [
  // 🚀 우주/방산
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
    name: '한화에어로스페이스', code: '012450', sector: '🚀',
    price: 856000, chg: 2.15, per: '35배', roe: '18%', rev: '+45%',
    cap: '48조', check: '9/11', analyst: '미래에셋', tp: '950,000', op: '매수',
    desc: '우주항공 + 방산. 누리호 엔진, K-방산 수출.',
    news: ['한화에어로, 누리호 3차 발사 성공', '폴란드 K9 추가 수주', '우주 사업부 분사 검토'],
    aiScore: 88,
  },
  {
    name: '한화시스템', code: '272210', sector: '🚀',
    price: 32500, chg: 1.56, per: '45배', roe: '5%', rev: '+18%',
    cap: '6.5조', check: '8/11', analyst: '신한투자', tp: '38,000', op: '매수',
    desc: '위성통신 원앤텐나. 방산 전자전 시스템.',
    news: ['한화시스템, 저궤도 위성 통신 사업 본격화', '방산 전자전 수출 확대', 'UAM 버티포트 개발 참여'],
    aiScore: 75,
  },
  {
    name: 'LIG넥스원', code: '079550', sector: '🚀',
    price: 238000, chg: 4.12, per: '25배', roe: '14%', rev: '+32%',
    cap: '5.7조', check: '9/11', analyst: 'KB증권', tp: '270,000', op: '매수',
    desc: '유도무기 전문 방산업체. 천궁-II, 비궁.',
    news: ['LIG넥스원, 사우디 천궁-II 수출 계약', '유도무기 수주잔고 역대 최고', 'K-방산 수출 호황'],
    aiScore: 84,
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

  // 💾 반도체
  {
    name: 'SK하이닉스', code: '000660', sector: '💾',
    price: 238000, chg: 4.52, per: '6배', roe: '35%', rev: '+89%',
    cap: '173조', check: '11/11', analyst: '삼성증권', tp: '280,000', op: '적극매수',
    desc: 'HBM4 독점 공급. AI 반도체 메모리 글로벌 1위.',
    news: ['SK하이닉스 HBM4 양산 시작', 'NVIDIA GB300 HBM 독점 공급', 'DRAM 가격 상승세 지속'],
    aiScore: 98,
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
    name: '코리아써키트', code: '007810', sector: '💾',
    price: 28500, chg: 6.34, per: '13배', roe: '15%', rev: '+42%',
    cap: '1.2조', check: '10/11', analyst: '대신증권', tp: '35,000', op: '매수',
    desc: 'SoCAMM 기판 흑자전환. AI 서버 기판 핵심 수혜.',
    news: ['코리아써키트, SoCAMM 기판 양산 본격화', 'AI 서버 기판 수주 급증', '흑자전환 성공에 목표가 상향'],
    aiScore: 94,
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
    name: 'AMD', code: 'AMD', sector: '💾',
    price: 168.30, chg: 1.92, per: '42배', roe: '4%', rev: '+18%',
    cap: '$272B', check: '7/11', analyst: 'Bank of America', tp: '$200', op: '매수',
    desc: 'MI300X AI 가속기. 데이터센터 GPU 2위.',
    news: ['AMD MI325X 출시 임박', '데이터센터 매출 비중 50% 돌파', '인스팅트 시리즈 수주 급증'],
    usd: true,
    aiScore: 76,
  },
  {
    name: 'TSMC', code: 'TSM', sector: '💾',
    price: 185.20, chg: 0.95, per: '28배', roe: '30%', rev: '+35%',
    cap: '$960B', check: '10/11', analyst: 'Morgan Stanley', tp: '$210', op: '적극매수',
    desc: '파운드리 절대 강자. 3nm/2nm 독점 양산.',
    news: ['TSMC 미국 애리조나 팹 가동 개시', '2nm 공정 양산 준비 완료', 'AI 칩 수요로 가동률 100%'],
    usd: true,
    aiScore: 93,
  },
  {
    name: 'ASML', code: 'ASML', sector: '💾',
    price: 920.50, chg: -0.78, per: '38배', roe: '52%', rev: '+12%',
    cap: '$370B', check: '9/11', analyst: 'UBS', tp: '$1,050', op: '매수',
    desc: 'EUV 노광장비 독점. 반도체 장비 최강자.',
    news: ['ASML High-NA EUV 주문 급증', 'Intel·삼성 2nm용 장비 납품', '중국 수출 제한 영향 제한적'],
    usd: true,
    aiScore: 89,
  },
  {
    name: '리노공업', code: '058470', sector: '💾',
    price: 268000, chg: 2.83, per: '28배', roe: '22%', rev: '+25%',
    cap: '4.1조', check: '9/11', analyst: '한국투자', tp: '300,000', op: '매수',
    desc: '반도체 테스트 소켓 글로벌 1위. AI 칩 테스트 수혜.',
    news: ['리노공업, AI 칩 테스트 소켓 수주 급증', '고성능 HBM 테스트 소켓 양산', '영업이익률 40% 유지'],
    aiScore: 85,
  },

  // 🤖 로봇
  {
    name: '두산로보틱스', code: '454910', sector: '🤖',
    price: 107000, chg: -7.83, per: '적자', roe: '음수', rev: '-23%',
    cap: '9,200억', check: '7/11', analyst: '한국투자', tp: '130,000', op: '보유',
    desc: '협동로봇 전문. 두산그룹 로봇 사업 핵심.',
    news: ['두산로보틱스, 유럽 시장 진출 본격화', '협동로봇 시장 연 30% 성장 전망', '적자 지속에 투자자 우려 확산'],
    aiScore: 65,
  },
  {
    name: '레인보우로보틱스', code: '277810', sector: '🤖',
    price: 198500, chg: 3.45, per: '적자', roe: '음수', rev: '+120%',
    cap: '3.2조', check: '7/11', analyst: '키움증권', tp: '250,000', op: '매수',
    desc: '삼성전자 지분 투자. 이족보행 휴머노이드 로봇.',
    news: ['레인보우로보틱스, 삼성전자 추가 투자 유치', '휴머노이드 로봇 공장 양산 테스트', '보스턴다이내믹스와 기술 협력'],
    aiScore: 68,
  },
  {
    name: '로보티즈', code: '108490', sector: '🤖',
    price: 52800, chg: 1.25, per: '적자', roe: '음수', rev: '+45%',
    cap: '5,800억', check: '6/11', analyst: 'NH투자', tp: '65,000', op: '보유',
    desc: '서비스 로봇 + 자율주행 배달 로봇. 다이나믹셀 액추에이터.',
    news: ['로보티즈, 실내 배달 로봇 GS25 전국 확대', '다이나믹셀 미국 수출 급증', '물류 자동화 로봇 수주'],
    aiScore: 58,
  },

  // 👓 AR/XR
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
    name: 'Meta', code: 'META', sector: '👓',
    price: 542.30, chg: 1.18, per: '25배', roe: '35%', rev: '+22%',
    cap: '$1.4T', check: '9/11', analyst: 'Goldman Sachs', tp: '$620', op: '매수',
    desc: 'Reality Labs AR/VR. 오리온 AR 글래스. 메타버스.',
    news: ['메타, 오리온 AR 글래스 2025 출시 확정', 'Reality Labs 분기 매출 첫 $1B 돌파', 'Llama 4 오픈소스 AI 공개'],
    usd: true,
    aiScore: 88,
  },
  {
    name: '코세스', code: '089890', sector: '👓',
    price: 18750, chg: 5.62, per: '32배', roe: '10%', rev: '+38%',
    cap: '3,200억', check: '8/11', analyst: '유안타', tp: '24,000', op: '매수',
    desc: 'AR 글래스 광학부품. 메타 오리온 부품 공급.',
    news: ['코세스, 메타 AR 글래스 렌즈 양산 시작', 'AR 광학 부품 수율 90% 달성', '미국 AR 기업 신규 공급 계약'],
    aiScore: 77,
  },

  // 💊 바이오
  {
    name: '셀트리온', code: '068270', sector: '💊',
    price: 185500, chg: -1.24, per: '22배', roe: '16%', rev: '+28%',
    cap: '26조', check: '9/11', analyst: '하나증권', tp: '220,000', op: '매수',
    desc: '바이오시밀러 글로벌 1위. 짐펜트라 미국 판매 호조.',
    news: ['셀트리온, 짐펜트라 미국 시장점유율 30% 돌파', '신규 바이오시밀러 3종 FDA 승인 추진', '자사주 매입 발표'],
    aiScore: 86,
  },
  {
    name: '삼성바이오로직스', code: '207940', sector: '💊',
    price: 1025000, chg: 0.78, per: '60배', roe: '12%', rev: '+22%',
    cap: '68조', check: '8/11', analyst: 'NH투자', tp: '1,100,000', op: '매수',
    desc: 'CMO/CDMO 글로벌 1위. 바이오 의약품 위탁생산.',
    news: ['삼성바이오, 5공장 착공 발표', 'ADC 위탁생산 수주 급증', 'mRNA 생산 시설 투자'],
    aiScore: 79,
  },
  {
    name: '유한양행', code: '000100', sector: '💊',
    price: 98500, chg: 2.34, per: '35배', roe: '8%', rev: '+15%',
    cap: '6.5조', check: '8/11', analyst: 'KB증권', tp: '120,000', op: '매수',
    desc: '레이저티닙 폐암 신약. 글로벌 라이선스 아웃.',
    news: ['유한양행, 레이저티닙 미국 FDA 승인', 'J&J 마일스톤 $1.2B 수령', '신약 파이프라인 강화'],
    aiScore: 81,
  },

  // 🚗 자동차
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
    name: '현대차', code: '005380', sector: '🚗',
    price: 268000, chg: 0.75, per: '5배', roe: '15%', rev: '+8%',
    cap: '57조', check: '9/11', analyst: '미래에셋', tp: '320,000', op: '매수',
    desc: '글로벌 3위 자동차. 전기차 아이오닉 + 수소차.',
    news: ['현대차, 미국 전기차 공장 가동 시작', '아이오닉 7 글로벌 출시', '인도 IPO 성공적 마무리'],
    aiScore: 82,
  },
  {
    name: '기아', code: '000270', sector: '🚗',
    price: 128500, chg: 1.23, per: '4배', roe: '22%', rev: '+10%',
    cap: '52조', check: '10/11', analyst: '한국투자', tp: '150,000', op: '적극매수',
    desc: 'PBV + 전기차. EV6, EV9 글로벌 판매 호조.',
    news: ['기아, EV3 유럽 판매 1위', 'PBV 택시/물류 수주 급증', '역대 최대 실적 경신'],
    aiScore: 90,
  },
  {
    name: 'HL만도', code: '204320', sector: '🚗',
    price: 48500, chg: -1.82, per: '15배', roe: '9%', rev: '+12%',
    cap: '2.3조', check: '7/11', analyst: '대신증권', tp: '58,000', op: '매수',
    desc: '자율주행 센서 + 전동화 부품. ADAS 핵심.',
    news: ['HL만도, 자율주행 레벨3 부품 수주', 'BMW 전동화 부품 공급 계약', 'ADAS 매출 비중 40% 돌파'],
    aiScore: 70,
  },

  // ⚡ 전력/에너지
  {
    name: 'KODEX AI전력핵심설비', code: '472170', sector: '⚡',
    price: 55090, chg: -2.57, per: 'ETF', roe: 'ETF', rev: '+35%',
    cap: '8,500억', check: '8/11', analyst: '삼성자산운용', tp: '-', op: '-',
    desc: 'AI 데이터센터 전력 인프라 ETF. 변압기, 전선 등.',
    news: ['AI 데이터센터 전력 수요 폭증', '변압기 업체 수주 잔고 역대 최고', '전력 인프라 투자 확대'],
    aiScore: 78,
  },
  {
    name: 'HD현대일렉트릭', code: '267260', sector: '⚡',
    price: 425000, chg: 3.18, per: '40배', roe: '25%', rev: '+52%',
    cap: '10조', check: '10/11', analyst: '삼성증권', tp: '480,000', op: '적극매수',
    desc: '초고압 변압기 글로벌 수혜. AI 데이터센터 전력 장비.',
    news: ['HD현대일렉트릭, 미국 변압기 수주 $500M', '수주잔고 3년치 확보', '초고압 변압기 공급 부족'],
    aiScore: 92,
  },
  {
    name: 'LS일렉트릭', code: '010120', sector: '⚡',
    price: 215000, chg: 1.45, per: '30배', roe: '18%', rev: '+35%',
    cap: '6.5조', check: '9/11', analyst: 'NH투자', tp: '250,000', op: '매수',
    desc: '전력기기 + ESS + 데이터센터 전력. 배전반, 차단기.',
    news: ['LS일렉트릭, 미국 데이터센터 전력기기 수주', 'ESS 수주 잔고 급증', '북미 매출 비중 40% 돌파'],
    aiScore: 84,
  },
  {
    name: '일진전기', code: '103590', sector: '⚡',
    price: 28500, chg: 4.78, per: '22배', roe: '20%', rev: '+45%',
    cap: '1.7조', check: '9/11', analyst: '키움증권', tp: '35,000', op: '매수',
    desc: '초고압 변압기 + 전력 케이블. 글로벌 전력 인프라 수혜.',
    news: ['일진전기, 중동 변압기 수주 확대', '미국 전력망 교체 수요 급증', '분기 최대 실적 경신'],
    aiScore: 82,
  },

  // 🏦 금융
  {
    name: '미래에셋증권', code: '006800', sector: '🏦',
    price: 12450, chg: 1.82, per: '8배', roe: '12%', rev: '+32%',
    cap: '5.8조', check: '11/11', analyst: 'KB증권', tp: '15,000', op: '매수',
    desc: 'SpaceX $2.78억 지분 보유. 글로벌 자산운용.',
    news: ['미래에셋, SpaceX 지분가치 급등', '해외 ETF 순자산 50조 돌파', '로보어드바이저 서비스 확대'],
    aiScore: 96,
  },
  {
    name: 'KB금융', code: '105560', sector: '🏦',
    price: 95200, chg: 0.42, per: '6배', roe: '10%', rev: '+8%',
    cap: '38조', check: '9/11', analyst: '하나증권', tp: '110,000', op: '매수',
    desc: '국내 1위 금융지주. 은행+증권+보험+카드.',
    news: ['KB금융, 역대 최대 순이익 경신', '밸류업 프로그램 주주환원 확대', '자사주 1조 소각 발표'],
    aiScore: 83,
  },
  {
    name: '신한지주', code: '055550', sector: '🏦',
    price: 58900, chg: 0.85, per: '5배', roe: '9%', rev: '+6%',
    cap: '30조', check: '8/11', analyst: '미래에셋', tp: '68,000', op: '매수',
    desc: '종합금융그룹. 디지털 혁신, SOL 플랫폼.',
    news: ['신한지주, 밸류업 배당성향 40% 목표', '디지털 고객 3,000만 돌파', '동남아 진출 가속화'],
    aiScore: 78,
  },

  // 📱 IT/플랫폼
  {
    name: 'Apple', code: 'AAPL', sector: '📱',
    price: 198.50, chg: 0.85, per: '32배', roe: '147%', rev: '+5%',
    cap: '$3.0T', check: '9/11', analyst: 'Bernstein', tp: '$220', op: '매수',
    desc: 'iPhone + Apple Vision Pro + 서비스 생태계.',
    news: ['애플, iOS 19 AI 기능 대폭 강화', 'Vision Pro 2세대 개발 중', '서비스 매출 사상 최고'],
    usd: true,
    aiScore: 87,
  },
  {
    name: 'Microsoft', code: 'MSFT', sector: '📱',
    price: 442.80, chg: 0.62, per: '36배', roe: '38%', rev: '+16%',
    cap: '$3.3T', check: '10/11', analyst: 'JP Morgan', tp: '$500', op: '적극매수',
    desc: 'Azure 클라우드 + Copilot AI + Office 365.',
    news: ['MS, Azure AI 매출 분기 $10B 돌파', 'Copilot 기업 도입 200% 증가', 'GitHub Copilot 개발자 3억명'],
    usd: true,
    aiScore: 94,
  },
  {
    name: 'Google', code: 'GOOGL', sector: '📱',
    price: 178.50, chg: 1.35, per: '22배', roe: '32%', rev: '+14%',
    cap: '$2.2T', check: '9/11', analyst: 'Goldman Sachs', tp: '$205', op: '매수',
    desc: '검색 + YouTube + Google Cloud + Gemini AI.',
    news: ['구글, Gemini 2.0 출시 예정', 'YouTube 광고 매출 역대 최고', 'Google Cloud 영업이익 흑자 전환'],
    usd: true,
    aiScore: 86,
  },
  {
    name: '네이버', code: '035420', sector: '📱',
    price: 228000, chg: -0.87, per: '28배', roe: '10%', rev: '+12%',
    cap: '37조', check: '8/11', analyst: 'NH투자', tp: '270,000', op: '매수',
    desc: '검색 + 커머스 + 클라우드 + AI(하이퍼클로바X).',
    news: ['네이버, 하이퍼클로바X 기업 서비스 확대', '커머스 거래액 50조 돌파', '일본 라인야후 시너지 가시화'],
    aiScore: 76,
  },
  {
    name: '카카오', code: '035720', sector: '📱',
    price: 42800, chg: 0.47, per: '40배', roe: '5%', rev: '+8%',
    cap: '19조', check: '7/11', analyst: '키움증권', tp: '55,000', op: '보유',
    desc: '카카오톡 + 카카오페이 + 카카오엔터.',
    news: ['카카오, AI 카나나 서비스 출시', '카카오페이 흑자 전환', '엔터 부문 구조조정 마무리'],
    aiScore: 64,
  },
  {
    name: 'Amazon', code: 'AMZN', sector: '📱',
    price: 195.60, chg: 0.92, per: '60배', roe: '22%', rev: '+12%',
    cap: '$2.0T', check: '8/11', analyst: 'Morgan Stanley', tp: '$230', op: '매수',
    desc: 'AWS 클라우드 + 이커머스 + 물류 + AI.',
    news: ['아마존, AWS 분기 매출 $30B 돌파', 'Alexa+ AI 비서 출시', '물류 로봇 10만대 도입'],
    usd: true,
    aiScore: 83,
  },

  // 🔋 2차전지
  {
    name: 'LG에너지솔루션', code: '373220', sector: '🔋',
    price: 365000, chg: -1.35, per: '80배', roe: '5%', rev: '-8%',
    cap: '85조', check: '7/11', analyst: '삼성증권', tp: '420,000', op: '매수',
    desc: '글로벌 2위 배터리. 원통형 46시리즈 + ESS.',
    news: ['LG에솔, 테슬라 4680 배터리 양산 시작', 'ESS 수주 급증으로 실적 개선', '전고체 배터리 2027 양산 목표'],
    aiScore: 69,
  },
  {
    name: '삼성SDI', code: '006400', sector: '🔋',
    price: 285000, chg: -2.45, per: '25배', roe: '8%', rev: '-12%',
    cap: '19.5조', check: '7/11', analyst: 'KB증권', tp: '350,000', op: '보유',
    desc: '각형 배터리 + 전고체 배터리 개발.',
    news: ['삼성SDI, GM 전기차 배터리 공급 확대', '전고체 배터리 시제품 공개', '유럽 공장 가동률 회복'],
    aiScore: 67,
  },
  {
    name: '에코프로비엠', code: '247540', sector: '🔋',
    price: 128000, chg: -3.12, per: '적자', roe: '음수', rev: '-25%',
    cap: '12.4조', check: '5/11', analyst: '하나증권', tp: '160,000', op: '보유',
    desc: '양극재 전문. 삼성SDI 주요 공급.',
    news: ['에코프로비엠, 양극재 가격 하락에 실적 부진', '차세대 하이니켈 양극재 개발', '미국 공장 투자 결정'],
    aiScore: 52,
  },

  // 🏗️ 건설/소재
  {
    name: '포스코홀딩스', code: '005490', sector: '🏗️',
    price: 312000, chg: 0.65, per: '9배', roe: '6%', rev: '-5%',
    cap: '26조', check: '8/11', analyst: 'KB증권', tp: '380,000', op: '매수',
    desc: '철강 + 리튬 + 2차전지 소재. 포스코퓨처엠.',
    news: ['포스코, 아르헨티나 리튬 양산 시작', '철강 가격 회복세', 'HBI 미국 공장 가동 개시'],
    aiScore: 73,
  },
  {
    name: '현대건설', code: '000720', sector: '🏗️',
    price: 35800, chg: -0.56, per: '7배', roe: '8%', rev: '+5%',
    cap: '4조', check: '7/11', analyst: '대신증권', tp: '42,000', op: '보유',
    desc: '국내 1위 건설사. 원전+플랜트 수출.',
    news: ['현대건설, 체코 원전 수주 참여', '중동 플랜트 수주 확대', '국내 주택 분양 시장 회복'],
    aiScore: 66,
  },

  // 🎮 엔터/게임
  {
    name: '크래프톤', code: '259960', sector: '🎮',
    price: 328000, chg: 2.15, per: '18배', roe: '20%', rev: '+28%',
    cap: '15조', check: '9/11', analyst: '미래에셋', tp: '380,000', op: '매수',
    desc: 'PUBG + 인조이 + AI 게임. 글로벌 게임사.',
    news: ['크래프톤, 인조이 글로벌 출시 호응', 'PUBG 모바일 누적 매출 $10B 돌파', 'AI NPC 기술 게임 적용'],
    aiScore: 84,
  },
  {
    name: 'HYBE', code: '352820', sector: '🎮',
    price: 285000, chg: -1.05, per: '35배', roe: '12%', rev: '+18%',
    cap: '11조', check: '7/11', analyst: 'NH투자', tp: '320,000', op: '매수',
    desc: 'BTS + 위버스 플랫폼. K-POP 글로벌 엔터.',
    news: ['HYBE, BTS 완전체 활동 재개', '위버스 가입자 1억명 돌파', '일본 걸그룹 데뷔 성공'],
    aiScore: 71,
  },

  // 🛒 유통/소비재
  {
    name: '쿠팡', code: 'CPNG', sector: '🛒',
    price: 24.80, chg: 1.64, per: '55배', roe: '15%', rev: '+25%',
    cap: '$47B', check: '8/11', analyst: 'Goldman Sachs', tp: '$30', op: '매수',
    desc: '한국 1위 이커머스. 로켓배송 + 쿠팡이츠 + 쿠팡플레이.',
    news: ['쿠팡, 대만 진출 본격화', '로켓배송 당일배송 비율 95%', '쿠팡이츠 배달 시장 1위 탈환'],
    usd: true,
    aiScore: 79,
  },
  {
    name: '이마트', code: '139480', sector: '🛒',
    price: 68500, chg: -0.43, per: '적자', roe: '음수', rev: '-3%',
    cap: '1.9조', check: '5/11', analyst: '하나증권', tp: '80,000', op: '보유',
    desc: '대형마트 + SSG닷컴 + 스타벅스코리아.',
    news: ['이마트, 구조조정 통한 체질 개선', '스타벅스코리아 실적 호조', 'SSG닷컴 적자 축소'],
    aiScore: 48,
  },
  {
    name: '아모레퍼시픽', code: '090430', sector: '🛒',
    price: 128000, chg: 3.22, per: '38배', roe: '8%', rev: '+15%',
    cap: '7.4조', check: '8/11', analyst: 'KB증권', tp: '150,000', op: '매수',
    desc: '설화수 + 라네즈 + 이니스프리. K-뷰티 대표.',
    news: ['아모레, 미국 시장 매출 50% 성장', '라네즈 글로벌 히트', '인디 브랜드 인수 추진'],
    aiScore: 74,
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
