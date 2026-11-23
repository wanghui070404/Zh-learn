'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { radicals, type Radical } from '@/data/radicals';
import { speak } from '@/lib/speak';
import { toggleLearnedWord, useLearnedWords, recordStudyActivity } from '@/lib/storage';
import { 
  Volume2, PenTool, ExternalLink, Copy, X, Search, ChevronDown, 
  Loader2, Check, CheckCircle2, Circle 
} from 'lucide-react';

function getStrokes(n: number): number {
  if (n <= 6) return 1;
  if (n <= 29) return 2;
  if (n <= 60) return 3;
  if (n <= 94) return 4;
  if (n <= 117) return 5;
  if (n <= 146) return 6;
  if (n <= 166) return 7;
  if (n <= 175) return 8;
  if (n <= 186) return 9;
  if (n <= 194) return 10;
  if (n <= 200) return 11;
  if (n <= 204) return 12;
  if (n <= 208) return 13;
  if (n <= 210) return 14;
  if (n === 211) return 15;
  if (n <= 213) return 16;
  return 17;
}

export default function RadicalsPage() {
  const [q, setQ] = useState('');
  const [strokeFilter, setStrokeFilter] = useState<number | null>(null);
  const [selected, setSelected] = useState<Radical | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const learnedWords = useLearnedWords();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = radicals.filter((r) => {
    const matchesSearch =
      r.char.includes(q) ||
      r.pinyin.toLowerCase().includes(q.toLowerCase()) ||
      r.meaning.toLowerCase().includes(q.toLowerCase());
      
    const matchesStroke = strokeFilter === null || getStrokes(r.n) === strokeFilter;
    
    return matchesSearch && matchesStroke;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">214 Bộ thủ</h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo chữ, pinyin..."
              className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 focus:border-blue-500 rounded-xl outline-none transition-colors bg-white/70 backdrop-blur-sm"
            />
          </div>

          <div className="relative w-full sm:w-40" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white/70 backdrop-blur-sm border-2 border-slate-200 hover:border-blue-400 rounded-xl transition-colors text-slate-700 font-medium text-sm"
            >
              <span>{strokeFilter === null ? 'Tất cả số nét' : `${strokeFilter} nét`}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto"
                >
                  <button
                    onClick={() => { setStrokeFilter(null); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${strokeFilter === null ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-600'}`}
                  >
                    Tất cả số nét
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStrokeFilter(s); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${strokeFilter === s ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-600'}`}
                    >
                      {s} nét
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((r, i) => {
          const isLearned = learnedWords.includes(r.char);
          
          return (
            <motion.div
              key={r.n}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelected(r)}
              className={`group cursor-pointer border rounded-2xl p-4 transition-all duration-300 relative flex flex-col justify-between ${
                isLearned 
                  ? 'bg-green-50/50 border-green-200 shadow-sm' 
                  : 'bg-white/70 backdrop-blur-sm border-slate-200/60 hover:border-blue-400 hover:bg-white hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const isNowLearned = toggleLearnedWord(r.char); 
                  if(isNowLearned) recordStudyActivity(); 
                }}
                className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${isLearned ? 'text-green-500' : 'text-slate-300 hover:text-green-500'}`}
                title={isLearned ? "Bỏ đánh dấu đã thuộc" : "Đánh dấu đã thuộc"}
              >
                {isLearned ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>

              <div>
                <div className="flex items-baseline gap-2 mb-2 mt-1">
                  <span className="hanzi-target text-4xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{r.char}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded">#{r.n}</span>
                </div>
                <div className="text-sm font-medium text-blue-600">{r.pinyin}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">{r.meaning}</div>
              </div>
              
              <div className="text-[10px] text-slate-400 mt-3 bg-slate-50 inline-block self-start px-1.5 py-0.5 rounded border border-slate-100">{getStrokes(r.n)} nét</div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Không tìm thấy bộ thủ nào phù hợp.
        </div>
      )}

      {selected && (
        <RadicalModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function RadicalModal({ item, onClose }: { item: Radical; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const learnedWords = useLearnedWords();
  const isLearned = learnedWords.includes(item.char);

  async function handleSpeak() {
    if (isPlaying) return;
    setIsPlaying(true);
    await speak(item.char);
    setIsPlaying(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.char);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="hanzi-target text-8xl leading-none text-slate-800">{item.char}</div>
            <div className="text-blue-600 text-3xl mt-4 font-semibold">{item.pinyin}</div>
            <div className="text-slate-500 text-lg">{item.meaning}</div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Bộ #{item.n}</div>
            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{getStrokes(item.n)} nét</div>
            <button onClick={onClose} className="mt-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            const isNowLearned = toggleLearnedWord(item.char); 
            if(isNowLearned) recordStudyActivity(); 
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
            isLearned 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-slate-100 text-slate-700 hover:bg-green-50 hover:text-green-600 border border-transparent'
          }`}
        >
          {isLearned ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          {isLearned ? 'Đã đánh dấu thuộc' : 'Đánh dấu đã thuộc'}
        </button>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={handleSpeak} 
            disabled={isPlaying} 
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-80"
          >
            {isPlaying ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />} 
            Nghe
          </button>
          
          <Link href={`/writing?char=${encodeURIComponent(item.char)}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
            <PenTool size={18} /> Viết
          </Link>

          <a 
            href={`https://youglish.com/pronounce/${encodeURIComponent(item.char)}/chinese`} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            <ExternalLink size={18} /> Ngữ cảnh
          </a>

          <button 
            onClick={handleCopy} 
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              isCopied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isCopied ? <Check size={18} /> : <Copy size={18} />} 
            {isCopied ? 'Đã chép' : 'Copy'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
