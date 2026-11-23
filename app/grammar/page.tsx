'use client';
import { motion } from 'framer-motion';
import { grammarPoints } from '@/data/grammar';
import { BookOpen } from 'lucide-react';

export default function GrammarPage() {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left py-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center md:justify-start gap-3">
          <BookOpen className="text-blue-600" size={32} />
          Ngữ pháp HSK 1-2
        </h1>
        <p className="text-slate-600">Nắm vững các cấu trúc câu cơ bản và mẫu ngữ pháp quan trọng.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {grammarPoints.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full translate-x-4 -translate-y-4" />
            
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-slate-800">{g.title}</h2>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                HSK {g.level}
              </span>
            </div>
            
            <div className="bg-slate-800 text-green-400 font-mono text-sm p-3 rounded-xl mb-4 shadow-inner overflow-x-auto">
              {g.formula}
            </div>
            
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {g.explanation}
            </p>
            
            <div className="space-y-3 bg-white/50 p-4 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ví dụ</div>
              {g.examples.map((ex, idx) => (
                <div key={idx} className="border-l-2 border-blue-300 pl-3">
                  <div className="hanzi-target text-lg text-slate-800">{ex.zh}</div>
                  <div className="text-sm text-blue-600 font-medium">{ex.pinyin}</div>
                  <div className="text-sm text-slate-500 mt-1">{ex.vi}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
