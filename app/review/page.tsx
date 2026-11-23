'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { dueCards, updateCard, deleteCard, recordStudyActivity } from '@/lib/storage';
import { reviewCard, calculateNextReview } from '@/lib/srs';
import { speak } from '@/lib/speak';
import type { Flashcard } from '@/lib/types';
import { Volume2, RotateCcw, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

export default function ReviewPage() {
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ pinyin: '', meaningVi: '' });

  useEffect(() => {
    setQueue(dueCards());
  }, []);

  const current = queue[idx];

  useEffect(() => {
    if (current) {
      setEditForm({ pinyin: current.pinyin || '', meaningVi: current.meaningVi || '' });
    }
  }, [current]);

  const handleRate = useCallback((quality: number) => {
    if (!current || !flipped) return;
    
    if (isEditing) {
      const updated = { ...current, pinyin: editForm.pinyin, meaningVi: editForm.meaningVi };
      updateCard(updated);
      setIsEditing(false);
    }

    updateCard(reviewCard(current, quality));
    recordStudyActivity(); // <-- CỘNG ĐIỂM MỤC TIÊU NGÀY Ở ĐÂY
    
    setFlipped(false);
    setDone((d) => d + 1);
    setIdx((i) => i + 1);
  }, [current, flipped, isEditing, editForm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!current || isEditing) return;
      if (e.code === 'Space') { e.preventDefault(); setFlipped((f) => !f); }
      if (flipped) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(3);
        if (e.key === '3') handleRate(4);
        if (e.key === '4') handleRate(5);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, flipped, isEditing, handleRate]);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Tuyệt vời! Bạn đã hoàn thành.</h1>
        <p className="text-slate-500">Không có thẻ nào đến hạn ôn tập lúc này.</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <RotateCcw size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Đã xong phiên ôn tập!</h1>
        <p className="text-slate-500">Bạn đã ôn xong {done} thẻ. Hẹn gặp lại ngày mai.</p>
      </div>
    );
  }

  const previewAgain = calculateNextReview(current, 1).intervalDays;
  const previewHard = calculateNextReview(current, 3).intervalDays;
  const previewGood = calculateNextReview(current, 4).intervalDays;
  const previewEasy = calculateNextReview(current, 5).intervalDays;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
        <span>Tiến độ: {idx} / {queue.length}</span>
        <span className="hidden sm:inline">Phím tắt: [Space] Lật, [1-4] Đánh giá</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(idx / queue.length) * 100}%` }}></div>
      </div>

      <div className="relative w-full h-[350px] [perspective:1000px] mt-4">
        <motion.div
          className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => !isEditing && setFlipped(!flipped)}
        >
          <div className="absolute inset-0 [backface-visibility:hidden] bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Mặt trước</div>
            <div className="hanzi-target text-7xl font-bold text-slate-800 text-center">{current.simplified}</div>
            <button onClick={(e) => { e.stopPropagation(); speak(current.simplified); }} className="mt-8 p-4 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
              <Volume2 size={28} />
            </button>
            <div className="mt-8 text-sm text-slate-400">Bấm vào thẻ hoặc ấn [Space] để lật</div>
          </div>

          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border border-blue-100 rounded-3xl shadow-xl flex flex-col p-8">
            <div className="flex justify-between items-start mb-4 border-b pb-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mặt sau</div>
                <div className="text-3xl text-blue-600 font-semibold">{current.pinyin || '(Chưa có Pinyin)'}</div>
                <div className="text-xl text-slate-700 mt-1">{current.meaningVi || '(Chưa có nghĩa)'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit3 size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Xóa thẻ này?')) { deleteCard(current.id); setIdx(i => i+1); } }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>

            {isEditing ? (
              <div className="flex-1 flex flex-col gap-3 justify-center" onClick={(e) => e.stopPropagation()}>
                <input value={editForm.pinyin} onChange={(e) => setEditForm({...editForm, pinyin: e.target.value})} placeholder="Pinyin..." className="border rounded-xl p-3 w-full" />
                <input value={editForm.meaningVi} onChange={(e) => setEditForm({...editForm, meaningVi: e.target.value})} placeholder="Nghĩa tiếng Việt..." className="border rounded-xl p-3 w-full" />
                <button onClick={() => setIsEditing(false)} className="bg-blue-600 text-white rounded-xl p-3 font-medium">Lưu lại</button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center">
                {current.exampleZh ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="hanzi-target text-lg text-slate-800">{current.exampleZh}</div>
                    <div className="text-sm text-blue-600">{current.examplePinyin}</div>
                    <div className="text-sm text-slate-500 mt-1">{current.exampleVi}</div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 italic">Không có câu ví dụ</div>
                )}
                {current.grammarNote && (
                  <div className="mt-4 text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100">💡 {current.grammarNote}</div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className={`grid grid-cols-4 gap-3 transition-opacity duration-300 ${flipped && !isEditing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={() => handleRate(1)} className="flex flex-col items-center py-3 rounded-2xl bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 transition-colors"><span className="font-bold">Lại</span><span className="text-xs opacity-70">&lt; {previewAgain} ngày</span></button>
        <button onClick={() => handleRate(3)} className="flex flex-col items-center py-3 rounded-2xl bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 transition-colors"><span className="font-bold">Khó</span><span className="text-xs opacity-70">{previewHard} ngày</span></button>
        <button onClick={() => handleRate(4)} className="flex flex-col items-center py-3 rounded-2xl bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 transition-colors"><span className="font-bold">Được</span><span className="text-xs opacity-70">{previewGood} ngày</span></button>
        <button onClick={() => handleRate(5)} className="flex flex-col items-center py-3 rounded-2xl bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 transition-colors"><span className="font-bold">Dễ</span><span className="text-xs opacity-70">{previewEasy} ngày</span></button>
      </div>
    </div>
  );
}
