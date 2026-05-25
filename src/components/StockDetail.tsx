'use client';

import { useState, useEffect, useCallback } from 'react';
import { Stock, Currency } from '@/lib/types';
import { formatNativePrice, formatChange, getCheckScore } from '@/lib/utils';
import { fetchSmartQuote, fetchCompanyNews, fetchSmartMetrics, fetchNaverStockNews, MetricsData, toFinnhubSymbol, CandleData, FinnhubNewsItem, NaverNewsItem, isKoreanStock } from '@/lib/api';
import { calcRSI, calcMACD, calcMFI, calcBollingerB, calcStochastic, calcWilliamsR, calcATR, calcADX, calcCCI } from '@/lib/indicators';
import Chart from './Chart';

interface StockDetailProps {
  stock: Stock;
  currency: Currency;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (code: string) => void;
}

interface Indicators {
  rsi: number | null;
  macd: { value: string; crossover: 'golden' | 'dead' | 'none' } | null;
  mfi: number | null;
  bb: number | null;
  stoch: { k: number; d: number } | null;
  williamsR: number | null;
  atr: number | null;
  adx: number | null;
  cci: number | null;
  live: boolean;
}

function formatLargeNumber(val: number | undefined | null): string {
  if (val === undefined || val === null) return '-';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}T`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}B`;
  return `${val.toFixed(1)}M`;
}

function metricColor(val: number | undefined | null): string {
  if (val === undefined || val === null) return '#000';
  if (val < 0) return '#2D6CFF';
  if (val > 0) return '#FF2D2D';
  return '#000';
}

export default function StockDetail({ stock, onBack, isBookmarked, onToggleBookmark }: StockDetailProps) {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChg, setLiveChg] = useState<number | null>(null);
  const [indicators, setIndicators] = useState<Indicators>({ rsi: null, macd: null, mfi: null, bb: null, stoch: null, williamsR: null, atr: null, adx: null, cci: null, live: false });
  const [companyNews, setCompanyNews] = useState<FinnhubNewsItem[]>([]);
  const [naverNews, setNaverNews] = useState<NaverNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsData['metric'] | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const price = livePrice ?? stock.price;
  const chg = liveChg ?? stock.chg;
  const change = formatChange(chg);
  const score = getCheckScore(stock.check);
  const isPass = score >= 10;
  const hasCheck = stock.check !== '-/-';

  useEffect(() => {
    fetchSmartQuote(stock.code, !!stock.usd).then(q => {
      if (q && q.c > 0) {
        setLivePrice(q.c);
        setLiveChg(q.dp);
      }
    });
  }, [stock.code, stock.usd]);

  useEffect(() => {
    setMetricsLoading(true);
    fetchSmartMetrics(stock.code, !!stock.usd).then(data => {
      if (data) setMetrics(data.metric);
      setMetricsLoading(false);
    });
  }, [stock.code, stock.usd]);

  useEffect(() => {
    setNewsLoading(true);
    if (!stock.usd && isKoreanStock(stock.code)) {
      fetchNaverStockNews(stock.name).then(news => {
        setNaverNews(news);
        setNewsLoading(false);
      });
    } else {
      const sym = toFinnhubSymbol(stock.code, !!stock.usd);
      fetchCompanyNews(sym).then(news => {
        setCompanyNews(news.slice(0, 5));
        setNewsLoading(false);
      });
    }
  }, [stock.code, stock.usd, stock.name]);

  const handleCandlesLoaded = useCallback((data: CandleData) => {
    const rsi = calcRSI(data.c);
    const macdResult = calcMACD(data.c);
    const mfi = calcMFI(data.h, data.l, data.c, data.v);
    const bb = calcBollingerB(data.c);
    const stoch = calcStochastic(data.h, data.l, data.c);
    const williamsR = calcWilliamsR(data.h, data.l, data.c);
    const atr = calcATR(data.h, data.l, data.c);
    const adx = calcADX(data.h, data.l, data.c);
    const cci = calcCCI(data.h, data.l, data.c);
    setIndicators({
      rsi,
      macd: macdResult ? { value: macdResult.histogram.toFixed(2), crossover: macdResult.crossover } : null,
      mfi,
      bb,
      stoch,
      williamsR,
      atr,
      adx,
      cci,
      live: data.s === 'ok',
    });
  }, []);

  const indicatorCardsRow1 = [
    {
      name: 'RSI',
      value: indicators.rsi?.toFixed(1) ?? '-',
      label: indicators.rsi ? (indicators.rsi > 70 ? '과매수' : indicators.rsi < 30 ? '과매도' : '정상') : '-',
    },
    {
      name: '%b',
      value: indicators.bb?.toFixed(2) ?? '-',
      label: indicators.bb ? (indicators.bb > 1 ? '상단돌파' : indicators.bb < 0 ? '하단돌파' : '중간') : '-',
    },
    {
      name: 'MFI',
      value: indicators.mfi?.toFixed(1) ?? '-',
      label: indicators.mfi ? (indicators.mfi > 80 ? '과유입' : indicators.mfi < 20 ? '과유출' : '유입') : '-',
    },
    {
      name: 'MACD',
      value: indicators.macd ? (indicators.macd.crossover === 'golden' ? '골든' : indicators.macd.crossover === 'dead' ? '데드' : indicators.macd.value) : '-',
      label: indicators.macd ? (indicators.macd.crossover === 'golden' ? '매수' : indicators.macd.crossover === 'dead' ? '매도' : '중립') : '-',
    },
  ];

  const indicatorCardsRow2 = [
    {
      name: 'Stoch',
      value: indicators.stoch ? `${indicators.stoch.k.toFixed(0)}` : '-',
      label: indicators.stoch ? (indicators.stoch.k > 80 ? '과매수' : indicators.stoch.k < 20 ? '과매도' : '정상') : '-',
    },
    {
      name: 'W%R',
      value: indicators.williamsR?.toFixed(1) ?? '-',
      label: indicators.williamsR !== null ? (indicators.williamsR > -20 ? '과매수' : indicators.williamsR < -80 ? '과매도' : '정상') : '-',
    },
    {
      name: 'ATR',
      value: indicators.atr?.toFixed(2) ?? '-',
      label: indicators.atr ? '변동성' : '-',
    },
    {
      name: 'ADX',
      value: indicators.adx?.toFixed(1) ?? '-',
      label: indicators.adx ? (indicators.adx > 25 ? '강한추세' : '약한추세') : '-',
    },
    {
      name: 'CCI',
      value: indicators.cci?.toFixed(0) ?? '-',
      label: indicators.cci !== null ? (indicators.cci > 100 ? '과매수' : indicators.cci < -100 ? '과매도' : '정상') : '-',
    },
  ];

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="text-sm text-gray-600">← 돌아가기</button>
        <button onClick={() => onToggleBookmark(stock.code)}
          className={`text-sm font-bold px-3 py-1.5 rounded-full transition-colors ${isBookmarked ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
          {isBookmarked ? '📌 북마크됨' : '📌 북마크'}
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{stock.sector}</span>
              <span className="text-[15px] font-bold">{stock.name}</span>
              {livePrice && (
                <span className="text-[9px] font-bold bg-green-500 text-white px-1 py-0.5 rounded animate-pulse">LIVE</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{stock.code}</div>
            <div className="text-xs text-gray-400 mt-1 max-w-[250px]">{stock.desc}</div>
          </div>
          <div className="text-right">
            <div className="text-[28px] font-mono font-black">
              {formatNativePrice(price, !!stock.usd)}
            </div>
            <div className="font-mono font-bold text-base" style={{ color: change.color }}>
              {change.text}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <Chart symbol={stock.code} isKorean={!stock.usd} onCandlesLoaded={handleCandlesLoaded} />
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-bold">보조지표</h3>
          {indicators.live && <span className="text-[9px] bg-green-500 text-white px-1 py-0.5 rounded">실시간</span>}
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {indicatorCardsRow1.map(ind => (
              <div key={ind.name} className="bg-gray-50 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-gray-500 font-bold">{ind.name}</div>
                <div className="text-sm font-mono font-bold mt-0.5">{ind.value}</div>
                <div className="text-[10px] text-gray-500">{ind.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {indicatorCardsRow2.map(ind => (
              <div key={ind.name} className="bg-gray-50 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-gray-500 font-bold">{ind.name}</div>
                <div className="text-sm font-mono font-bold mt-0.5">{ind.value}</div>
                <div className="text-[10px] text-gray-500">{ind.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Data Section */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-bold">재무 정보</h3>
          {metrics && <span className="text-[9px] font-bold bg-green-500 text-white px-1 py-0.5 rounded">LIVE</span>}
          {metrics && <span className="text-[9px] text-green-600 font-bold">실시간</span>}
          {metricsLoading && <span className="text-[9px] text-gray-400 animate-pulse">로딩 중...</span>}
        </div>

        {metrics ? (
          <>
            {/* Key Metrics */}
            <div className="mb-3">
              <div className="text-[11px] font-bold text-gray-600 mb-1.5">핵심 지표</div>
              <div className="grid grid-cols-4 gap-2">
                <MetricCell label="PER" value={metrics.peBasicExclExtraTTM} suffix="x" />
                <MetricCell label="PBR" value={metrics.pbAnnual} suffix="x" />
                <MetricCell label="EPS" value={metrics.epsBasicExclExtraItemsTTM} isCurrency />
                <MetricCell label="ROE" value={metrics.roeTTM} suffix="%" />
                <MetricCell label="ROA" value={metrics.roaTTM} suffix="%" />
                <MetricCell label="매출성장" value={metrics.revenueGrowthTTMYoy} suffix="%" />
                <MetricCell label="EPS성장" value={metrics.epsGrowthTTMYoy} suffix="%" />
                <MetricCell label="배당률" value={metrics.currentDividendYieldTTM} suffix="%" />
              </div>
            </div>

            {/* Profitability */}
            <div className="mb-3">
              <div className="text-[11px] font-bold text-gray-600 mb-1.5">수익성</div>
              <div className="grid grid-cols-3 gap-2">
                <MetricCell label="영업이익률" value={metrics.operatingMarginTTM} suffix="%" />
                <MetricCell label="순이익률" value={metrics.netProfitMarginTTM} suffix="%" />
                <MetricCell label="매출총이익률" value={metrics.grossMarginTTM} suffix="%" />
              </div>
            </div>

            {/* Stability */}
            <div className="mb-3">
              <div className="text-[11px] font-bold text-gray-600 mb-1.5">안정성</div>
              <div className="grid grid-cols-3 gap-2">
                <MetricCell label="유동비율" value={metrics.currentRatioQuarterly} suffix="x" />
                <MetricCell label="부채비율" value={metrics.debtEquityQuarterly} suffix="%" />
                <MetricCell label="베타" value={metrics.beta} />
              </div>
            </div>

            {/* Market Data */}
            {(metrics.marketCapitalization || metrics['52WeekHigh'] || metrics['52WeekLow'] || metrics['10DayAverageTradingVolume']) && (
              <div className="mb-3">
                <div className="text-[11px] font-bold text-gray-600 mb-1.5">시장 데이터</div>
                <div className="grid grid-cols-4 gap-2">
                  {metrics.marketCapitalization !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500">시가총액</div>
                      <div className="text-sm font-bold mt-0.5">{formatLargeNumber(metrics.marketCapitalization)}</div>
                    </div>
                  )}
                  {metrics['52WeekHigh'] !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500">52주 최고</div>
                      <div className="text-sm font-bold mt-0.5 text-[#FF2D2D]">{metrics['52WeekHigh'].toFixed(1)}</div>
                    </div>
                  )}
                  {metrics['52WeekLow'] !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500">52주 최저</div>
                      <div className="text-sm font-bold mt-0.5 text-[#2D6CFF]">{metrics['52WeekLow'].toFixed(1)}</div>
                    </div>
                  )}
                  {metrics['10DayAverageTradingVolume'] !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500">거래량</div>
                      <div className="text-sm font-bold mt-0.5">{metrics['10DayAverageTradingVolume'].toFixed(2)}M</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : !metricsLoading && hasCheck ? (
          /* Fallback to hardcoded stock data */
          <div className="grid grid-cols-3 gap-2">
            <Cell label="PER" value={stock.per} negative={stock.per === '적자'} />
            <Cell label="ROE" value={stock.roe} negative={stock.roe === '음수'} />
            <Cell label="매출성장" value={stock.rev} negative={stock.rev.startsWith('-')} />
            <Cell label="시가총액" value={stock.cap} />
            <Cell label="목표가" value={stock.tp} />
            <Cell label="투자의견" value={stock.op} positive={stock.op === '적극매수' || stock.op === '매수'} />
          </div>
        ) : null}
      </div>

      {hasCheck && stock.analyst !== '-' && (
        <div className="px-4 mb-4">
          <h3 className="text-sm font-bold mb-2">증권사 의견</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{stock.analyst}</span>
              <span className="text-xs font-bold">목표가 {stock.tp}</span>
            </div>
            <div className="mt-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  color: stock.op === '적극매수' || stock.op === '매수' ? '#FF2D2D' : '#555',
                  backgroundColor: stock.op === '적극매수' || stock.op === '매수' ? '#FFE5E5' : '#f0f0f0',
                }}>
                {stock.op}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-bold">관련 뉴스</h3>
          {(naverNews.length > 0 || companyNews.length > 0) && (
            <span className="text-[9px] bg-green-500 text-white px-1 py-0.5 rounded animate-pulse">LIVE</span>
          )}
          {naverNews.length > 0 && <span className="text-[9px] text-gray-400">네이버</span>}
          {newsLoading && <span className="text-[9px] text-gray-400 animate-pulse">로딩...</span>}
        </div>
        <div className="space-y-2">
          {naverNews.length > 0 ? (
            naverNews.slice(0, 5).map((n, i) => (
              <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium leading-relaxed">{n.title}</div>
                <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{n.description}</div>
              </a>
            ))
          ) : companyNews.length > 0 ? (
            companyNews.slice(0, 5).map((n, i) => (
              <a key={n.id || i} href={n.url || undefined} target="_blank" rel="noopener noreferrer"
                className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium leading-relaxed">{n.headline}</div>
                {n.source && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                    <span>{n.source}</span>
                    {n.datetime > 0 && <span>{new Date(n.datetime * 1000).toLocaleDateString('ko-KR')}</span>}
                  </div>
                )}
              </a>
            ))
          ) : stock.news.length > 0 ? (
            stock.news.slice(0, 3).map((n, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs">{n}</div>
              </div>
            ))
          ) : !newsLoading ? (
            <div className="text-xs text-gray-400 text-center py-4">관련 뉴스가 없습니다</div>
          ) : null}
        </div>
      </div>

      {hasCheck && (
        <div className="px-4 mb-6">
          <div className={`rounded-xl p-6 text-center ${isPass ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'}`}>
            <div className="text-[40px] font-black font-mono">{score}/11</div>
            <div className={`text-lg font-bold mt-1 ${isPass ? 'text-green-600' : 'text-red-600'}`}>
              {isPass ? '투자 적격 ✅' : '미통과 ❌'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCell({ label, value, suffix = '', isCurrency }: { label: string; value: number | undefined | null; suffix?: string; isCurrency?: boolean }) {
  const displayValue = value === undefined || value === null
    ? '-'
    : isCurrency
      ? value.toFixed(2)
      : `${value.toFixed(1)}${suffix}`;
  const color = value === undefined || value === null ? '#000' : metricColor(value);

  return (
    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="text-sm font-bold mt-0.5" style={{ color }}>
        {displayValue}
      </div>
    </div>
  );
}

function Cell({ label, value, negative, positive }: { label: string; value: string; negative?: boolean; positive?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="text-sm font-bold mt-0.5" style={{ color: negative ? '#2D6CFF' : positive ? '#FF2D2D' : '#000' }}>
        {value}
      </div>
    </div>
  );
}
