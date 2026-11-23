'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Library, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { vocabulary } from '@/lib/vocab';
import { addCard, toggleLearnedWord, useLearnedWords, recordStudyActivity } from '@/lib/storage';
import type { VocabItem } from '@/lib/types';

export default function VocabularyPage() {
  const [q, setQ] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unlearned' | 'learned'>('all');
  const [selected, setSelected] = useState<VocabItem | null>(null);
  
  const learnedWords = useLearnedWords();

  const filtered = useMemo(() => {
    let result = vocabulary;
    if (q) {
      const query = q.toLowerCase();
      result = result.filter(
        (v) =>
          v.simplified.includes(q) ||
          v.pinyin.toLowerCase().includes(query) ||
          v.meaningVi.toLowerCase().includes(query)
      );
    }
    
    if (filterMode === 'learned') {
      result = result.filter(v => learnedWords.includes(v.simplified));
    } else if (filterMode === 'unlearned') {
      result = result.filter(v => !learnedWords.includes(v.simplified));
    }

    return result.slice(0, 100);
  }, [q, filterMode, learnedWords]);

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left py-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center md:justify-start gap-3">
          <Library className="text-blue-600" size={32} />
          Từ vựng HSK
        </h1>
        <p className="text-slate-600">Kho từ vựng đồ sộ, tra cứu và đánh dấu từ đã thuộc.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm từ vựng..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none bg-white/70 backdrop-blur-sm"
          />
        </div>
        
        <div className="flex bg-slate-100/80 p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => setFilterMode('all')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterMode === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Tất cả</button>
          <button onClick={() => setFilterMode('unlearned')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterMode === 'unlearned' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Chưa thuộc</button>
          <button onClick={() => setFilterMode('learned')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterMode === 'learned' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Đã thuộc</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((v, i) => {
          const isLearned = learnedWords.includes(v.simplified);
          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 10) * 0.05 }}
              className={`relative text-left border rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between ${
                isLearned 
                  ? 'bg-green-50/50 border-green-200' 
                  : 'bg-white/70 border-slate-200/60 hover:border-blue-400 hover:shadow-lg'
              }`}
            >
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const isNowLearned = toggleLearnedWord(v.simplified); 
                  if(isNowLearned) recordStudyActivity(); 
                }}
                className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${isLearned ? 'text-green-500' : 'text-slate-300 hover:text-green-500'}`}
                title={isLearned ? "Bỏ đánh dấu đã thuộc" : "Đánh dấu đã thuộc"}
              >
                {isLearned ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              <div onClick={() => setSelected(v)} className="cursor-pointer">
                <span className="hanzi-target text-3xl font-bold text-slate-800">{v.simplified}</span>
                <div className="text-lg text-blue-600 font-medium mt-2">{v.pinyin}</div>
                <div className="text-slate-600 mt-1 line-clamp-2">{v.meaningVi}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">Không tìm thấy từ vựng nào phù hợp.</div>
      )}

      {selected && <VocabModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function VocabModal({ item, onClose }: { item: VocabItem; onClose: () => void }) {
  const [added, setAdded] = useState(false);
  const learnedWords = useLearnedWords();
  const isLearned = learnedWords.includes(item.simplified);

  function handleAdd() {
    addCard({
      simplified: item.simplified,
      pinyin: item.pinyin,
      meaningVi: item.meaningVi,
      exampleZh: item.example?.zh || '',
      examplePinyin: item.example?.pinyin || '',
      exampleVi: item.example?.vi || '',
      grammarNote: item.grammarNote,
      source: 'vocabulary',
    });
    setAdded(true);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="hanzi-target text-6xl text-slate-800">{item.simplified}</div>
            <div className="text-blue-600 text-2xl mt-3 font-medium">{item.pinyin}</div>
            <div className="text-slate-600 text-lg mt-1">{item.meaningVi}</div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              added ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {added ? 'Đã thêm' : 'Tạo Flashcard'}
          </button>
          
          <a
            href={`/writing?char=${encodeURIComponent(item.simplified)}`}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            Luyện viết
          </a>
          
          <button
            onClick={() => {
              const isNowLearned = toggleLearnedWord(item.simplified); 
              if(isNowLearned) recordStudyActivity(); 
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              isLearned ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-green-50 hover:text-green-600'
            }`}
          >
            {isLearned ? 'Đã thuộc' : 'Thuộc rồi'}
          </button>

          <a
            href={`https://youglish.com/pronounce/${encodeURIComponent(item.simplified)}/chinese`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            <ExternalLink size={18} /> Ngữ cảnh
          </a>
        </div>
      </motion.div>
    </div>
  );
}
