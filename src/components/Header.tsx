"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black text-white px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black text-sm font-black">주</span>
        </div>
        <div>
          <div className="text-[20px] font-black tracking-tight leading-tight">주리미</div>
          <div className="text-[10px] text-gray-400 -mt-0.5">AI 투자분석</div>
        </div>
        <div className="ml-auto text-[10px] text-gray-500">v2.0</div>
      </div>
    </header>
  );
}
