'use client';

const flows = [
  { from: '🔵반도체', to: '🤖로봇', amount: '+9,000억' },
  { from: '🔵반도체', to: '⚡전력', amount: '+2,600억' },
  { from: '🔵반도체', to: '🚗자동차', amount: '+3,200억' },
  { from: '🔵반도체', to: '🔋2차전지', amount: '+1,500억' },
];

export default function MoneyFlow() {
  return (
    <div className="bg-blue-50 rounded-xl p-4">
      <h3 className="text-sm font-bold mb-3 text-blue-800">
        💰 돈의 흐름 (외국인 섹터 이동)
      </h3>
      <div className="space-y-2">
        {flows.map((f, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>{f.from}</span>
              <span className="text-blue-400">→</span>
              <span>{f.to}</span>
            </div>
            <span className="font-mono font-bold text-blue-700">{f.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
