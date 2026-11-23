'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { dueCards, useFlashcards, useLearnedWords, useStudyHistory, calculateStreak } from '@/lib/storage';
import { BookOpen, PenTool, RefreshCw, Library, CheckCircle2, Flame, Layers, Target } from 'lucide-react';
import Heatmap from '@/components/Heatmap';

export default function Home() {
  const cards = useFlashcards();
  const learnedWords = useLearnedWords();
  const history = useStudyHistory();
  
  const due = dueCards().length;
  
  const learnedViaSrs = cards.filter((c) => c.repetitions >= 2).map(c => c.simplified);
  const allLearnedUnique = new Set([...learnedViaSrs, ...learnedWords]);
  const totalLearned = allLearnedUnique.size;

  const streak = calculateStreak(history);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = history[todayStr] || 0;
  const dailyGoal = 20; 
  const goalProgress = Math.min((todayCount / dailyGoal) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Chào mừng trở lại! 👋
          </h1>
          <p className="text-lg text-slate-600">Hôm nay bạn muốn chinh phục tiếng Trung như thế nào?</p>
        </div>
        <div className="bg-orange-100 text-orange-600 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm border border-orange-200">
          <Flame size={28} className={streak > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-slate-400"} />
          <div>
            <div className="text-2xl font-bold">{streak} ngày</div>
            <div className="text-xs font-semibold uppercase tracking-wider">Chuỗi ngày học</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Tổng flashcard" value={cards.length} color="blue" delay={0} />
        <StatCard icon={Target} label="Cần ôn hôm nay" value={due} color="orange" delay={1} />
        <StatCard icon={CheckCircle2} label="Từ đã thuộc" value={totalLearned} color="green" delay={2} />
        <StatCard icon={BookOpen} label="Từ đang học" value={cards.length - learnedViaSrs.length} color="purple" delay={3} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Target className="text-blue-500" size={18} />
            Mục tiêu hôm nay
          </h3>
          <div className="text-3xl font-bold text-slate-800 mb-2">{todayCount} <span className="text-lg text-slate-400 font-normal">/ {dailyGoal}</span></div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} 
              className="bg-blue-500 h-3 rounded-full" 
            />
          </div>
          <div className="text-xs text-slate-500 text-right">{Math.round(goalProgress)}% hoàn thành</div>
        </div>
        
        <div className="md:col-span-2">
          <Heatmap history={history} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard href="/review" title="Ôn tập hôm nay" desc={`${due} thẻ đang chờ`} icon={RefreshCw} gradient="from-orange-400 to-red-500" delay={4} />
        <ActionCard href="/writing" title="Luyện viết & Phát âm" desc="Xem nét vẽ và tự ghi âm giọng đọc" icon={PenTool} gradient="from-green-400 to-emerald-600" delay={5} />
        <ActionCard href="/vocabulary" title="Học từ vựng HSK" desc="Khám phá từ mới và đánh dấu" icon={Library} gradient="from-blue-400 to-indigo-600" delay={6} />
        <ActionCard href="/radicals" title="214 Bộ thủ" desc="Nền tảng cốt lõi để nhớ chữ" icon={BookOpen} gradient="from-yellow-400 to-orange-500" delay={7} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }: any) {
  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <motion.div custom={delay} initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }) }} className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${colorMap[color]}`}><Icon size={20} /></div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
    </motion.div>
  );
}

function ActionCard({ href, title, desc, icon: Icon, gradient, delay }: any) {
  return (
    <motion.div custom={delay} initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.1 } }) }}>
      <Link href={href} className="group block bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`} />
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} text-white shadow-lg`}><Icon size={24} /></div>
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </Link>
    </motion.div>
  );
}
