"use client";

import { useState, useEffect, useCallback } from "react";
import { MarketData } from "@/lib/types";
import { MARKET_DATA } from "@/lib/data";

export function useMarketData() {
  const [data, setData] = useState<MarketData>(MARKET_DATA);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchUSMarket = useCallback(async () => {
    try {
      const res = await fetch("/api/finnhub?type=multi&symbols=SPY,QQQ,DIA");
      if (!res.ok) return;
      const quotes = await res.json();

      setData((prev) => {
        const us = [...prev.us];
        if (quotes.SPY?.dp !== undefined) {
          us[1] = { ...us[1], change: quotes.SPY.dp, value: quotes.SPY.c * 10 };
        }
        if (quotes.QQQ?.dp !== undefined) {
          us[2] = { ...us[2], change: quotes.QQQ.dp, value: quotes.QQQ.c * 45 };
        }
        if (quotes.DIA?.dp !== undefined) {
          us[0] = { ...us[0], change: quotes.DIA.dp, value: quotes.DIA.c * 100 };
        }
        return { ...prev, us };
      });
      setIsLive(true);
      setLastUpdate(new Date());
    } catch {}
  }, []);

  const fetchKRMarket = useCallback(async () => {
    try {
      const [kospiRes, kosdaqRes] = await Promise.all([
        fetch("/api/kis?type=index&symbol=0001"),
        fetch("/api/kis?type=index&symbol=1001"),
      ]);

      const [kospi, kosdaq] = await Promise.all([
        kospiRes.ok ? kospiRes.json() : null,
        kosdaqRes.ok ? kosdaqRes.json() : null,
      ]);

      setData((prev) => {
        const korea = [...prev.korea];
        if (kospi?.value > 0) korea[0] = { ...korea[0], value: kospi.value, change: kospi.change };
        if (kosdaq?.value > 0) korea[1] = { ...korea[1], value: kosdaq.value, change: kosdaq.change };
        return { ...prev, korea };
      });
      setIsLive(true);
      setLastUpdate(new Date());
    } catch {}
  }, []);

  const fetchPortfolioPrices = useCallback(async () => {
    try {
      const [kisRes, finnhubRes] = await Promise.all([
        fetch("/api/kis?type=multi-price&symbols=396520,189300,454910,487240"),
        fetch("/api/finnhub?type=multi&symbols=QCOM,RKLB"),
      ]);
      const kisData = kisRes.ok ? await kisRes.json() : {};
      const finnhubData = finnhubRes.ok ? await finnhubRes.json() : {};
      return { kis: kisData, finnhub: finnhubData };
    } catch {
      return { kis: {}, finnhub: {} };
    }
  }, []);

  useEffect(() => {
    fetchUSMarket();
    fetchKRMarket();

    const interval = setInterval(() => {
      fetchUSMarket();
      fetchKRMarket();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchUSMarket, fetchKRMarket]);

  return { data, isLive, lastUpdate, fetchPortfolioPrices };
}
