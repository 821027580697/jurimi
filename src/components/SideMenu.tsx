'use client';

import { Tab } from '@/lib/types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: Tab) => void;
  bookmarkCount: number;
}

const menuItems: { icon: string; label: string; tab: Tab }[] = [
  { icon: '🏠', label: '홈', tab: 'home' },
  { icon: '📈', label: '시장 지수', tab: 'market' },
  { icon: '📌', label: '북마크', tab: 'bookmark' },
  { icon: '💼', label: '내 자산', tab: 'asset' },
  { icon: '📰', label: '뉴스·돈흐름', tab: 'news' },
  { icon: '🤖', label: 'AI 추천', tab: 'ai' },
];

export default function SideMenu({ isOpen, onClose, onNavigate, bookmarkCount }: SideMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-sm font-bold px-2 py-0.5 rounded">주</span>
            <span className="font-bold">주리미</span>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-500">✕</button>
        </div>
        <div className="py-2">
          {menuItems.map(item => (
            <button
              key={item.tab}
              onClick={() => {
                onNavigate(item.tab);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 text-left"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.tab === 'bookmark' && bookmarkCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                  {bookmarkCount}
                </span>
              )}
            </button>
          ))}
          <div className="border-t my-2" />
          <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 text-left">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium">차트 분석</span>
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 text-left">
            <span className="text-lg">✅</span>
            <span className="text-sm font-medium">체크리스트</span>
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 text-left">
            <span className="text-lg">📅</span>
            <span className="text-sm font-medium">이벤트 캘린더</span>
          </button>
          <div className="border-t my-2" />
          <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 text-left">
            <span className="text-lg">⚙️</span>
            <span className="text-sm font-medium">설정</span>
          </button>
        </div>
      </div>
    </>
  );
}
