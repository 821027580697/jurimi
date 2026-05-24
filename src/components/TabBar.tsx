'use client';

import { Tab } from '@/lib/types';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { key: Tab; icon: string; label: string }[] = [
  { key: 'home', icon: '🏠', label: '홈' },
  { key: 'market', icon: '📈', label: '시장' },
  { key: 'asset', icon: '💼', label: '자산' },
  { key: 'news', icon: '📰', label: '뉴스' },
  { key: 'ai', icon: '🤖', label: 'AI' },
];

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-[480px] mx-auto">
      <div className="flex justify-around py-1.5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              activeTab === tab.key ? 'text-black' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className={`text-[10px] ${activeTab === tab.key ? 'font-bold' : ''}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
