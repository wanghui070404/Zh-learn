'use client';
import { useMemo } from 'react';

export default function Heatmap({ history }: { history: Record<string, number> }) {
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    // Lấy 90 ngày gần nhất (khoảng 3 tháng)
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      arr.push({ date: dateStr, count: history[dateStr] || 0 });
    }
    return arr;
  }, [history]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count < 5) return 'bg-green-200';
    if (count < 15) return 'bg-green-400';
    if (count < 30) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm">
      <h3 className="font-semibold text-slate-700 mb-4 text-sm">Lịch sử học tập (90 ngày)</h3>
      <div className="flex flex-wrap gap-1">
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} hoạt động`}
            className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors hover:ring-1 hover:ring-slate-400`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 justify-end">
        <span>Ít</span>
        <div className="w-3 h-3 rounded-sm bg-slate-100" />
        <div className="w-3 h-3 rounded-sm bg-green-200" />
        <div className="w-3 h-3 rounded-sm bg-green-400" />
        <div className="w-3 h-3 rounded-sm bg-green-600" />
        <div className="w-3 h-3 rounded-sm bg-green-800" />
        <span>Nhiều</span>
      </div>
    </div>
  );
}
