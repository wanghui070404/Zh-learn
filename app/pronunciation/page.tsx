'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookmarkPlus, ExternalLink, Search } from 'lucide-react';
import YouGlishWidget from '@/components/YouGlishWidget';
import { addCard } from '@/lib/storage';

function PronunciationInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '你';
  
  const [q, setQ] = useState(initialQ);
  const [saved, setSaved] = useState(false);

  // Cập nhật lại ô tìm kiếm nếu URL thay đổi (khi bấm từ trang khác sang)
  useEffect(() => {
    const paramQ = searchParams.get('q');
    if (paramQ) {
      setQ(paramQ);
      setSaved(false);
    }
  }, [searchParams]);

  function handleSave() {
    if (!q) return;
    addCard({
      simplified: q,
      pinyin: '', 
      meaningVi: '',
      source: 'youglish',
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left py-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Phát âm thực tế</h1>
        <p className="text-slate-600">Nghe cách người bản xứ nói từ vựng trong ngữ cảnh thực tế qua video.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSaved(false);
              }}
              placeholder="Nhập từ hoặc cụm từ tiếng Trung..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all hanzi-target text-lg bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!q || saved}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all ${
                saved 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
              }`}
            >
              <BookmarkPlus size={20} />
              {saved ? 'Đã lưu' : 'Lưu thẻ'}
            </button>
            <a
              href={`https://youglish.com/pronounce/${encodeURIComponent(q)}/chinese`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              <ExternalLink size={20} />
              <span className="hidden sm:inline">Mở tab mới</span>
            </a>
          </div>
        </div>
      </motion.div>

      {q && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-lg p-2"
        >
          <div className="rounded-2xl overflow-hidden bg-slate-50">
             <YouGlishWidget query={q} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function PronunciationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12 text-slate-500 animate-pulse">Đang tải dữ liệu...</div>}>
      <PronunciationInner />
    </Suspense>
  );
}
