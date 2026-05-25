"use client";

import Header from "@/components/Header";
import GlobalMarket from "@/components/GlobalMarket";
import NewsSlider from "@/components/NewsSlider";
import SectorCycle from "@/components/SectorCycle";
import PortfolioDonut from "@/components/PortfolioDonut";
import { useMarketData } from "@/hooks/useMarketData";
import { useNews } from "@/hooks/useNews";

export default function Home() {
  const { data: marketData, isLive: marketLive } = useMarketData();
  const { news, isLive: newsLive } = useNews();

  return (
    <main className="scroll-smooth">
      <Header />
      <GlobalMarket data={marketData} isLive={marketLive} />
      <div className="h-px bg-line mx-4" />
      <NewsSlider news={news} isLive={newsLive} />
      <div className="h-px bg-line mx-4" />
      <SectorCycle />
      <div className="h-px bg-line mx-4" />
      <PortfolioDonut />
    </main>
  );
}
