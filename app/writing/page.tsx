'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Search, Sparkles, PenTool, Loader2, Mic, Square, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';
import { pinyin } from 'pinyin-pro';
import HanziWriterCanvas from '@/components/HanziWriterCanvas';
import { searchVocab } from '@/lib/vocab';
import { speak } from '@/lib/speak';
import { recordStudyActivity } from '@/lib/storage';
import type { VocabItem } from '@/lib/types';

const isHanzi = (text: string) => /^[\u4e00-\u9fa5\s]+$/.test(text);

// Component Waveform giả lập (chỉ để trang trí cho đẹp)
function FakeWaveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = [30, 50, 80, 40, 90, 60, 30, 70, 50, 100, 40, 60, 80, 30, 50, 90, 40, 70];
  return (
    <div className="flex items-center gap-[2px] h-6 opacity-40">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          animate={{ height: isPlaying ? [`${height * 0.5}%`, `${height}%`, `${height * 0.5}%`] : '30%' }}
          transition={{ repeat: Infinity, duration: 0.8 + (i % 3) * 0.2, ease: "easeInOut" }}
          className="w-1 bg-blue-500 rounded-full"
        />
      ))}
    </div>
  );
}

function WritingInner() {
  const params = useSearchParams();
  const initialChar = params.get('char') || '我';

  const [searchQuery, setSearchQuery] = useState(initialChar);
  const [charToWrite, setCharToWrite] = useState(initialChar);
  const [mode, setMode] = useState<'animate' | 'quiz'>('animate');
  
  const [hanziInfo, setHanziInfo] = useState<{ pinyin: string; meaning: string }>({ pinyin: '', meaning: '' });
  const [isLoadingMeaning, setIsLoadingMeaning] = useState(false);

  const [dynamicResult, setDynamicResult] = useState<VocabItem | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);

  // --- STATE CHO GHI ÂM & PLAYER ---
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const c = params.get('char');
    if (c) {
      setSearchQuery(c);
      setCharToWrite(c);
      setMode('animate');
    }
  }, [params]);

  useEffect(() => {
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [charToWrite]);

  // Cập nhật thời gian audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  async function fetchHanziDetails(hanzi: string) {
    const py = pinyin(hanzi, { toneType: 'symbol', type: 'array' }).join(' ');
    const localMatch = searchVocab(hanzi).find(v => v.simplified === hanzi);
    if (localMatch) {
      setHanziInfo({ pinyin: localMatch.pinyin, meaning: localMatch.meaningVi });
      return;
    }
    setHanziInfo({ pinyin: py, meaning: 'Đang tải nghĩa...' });
    setIsLoadingMeaning(true);
    try {
      const res = await fetch(`/api/translate?text=${encodeURIComponent(hanzi)}&from=zh`);
      const data = await res.json();
      setHanziInfo({ pinyin: py, meaning: data.translatedText || 'Không có nghĩa' });
    } catch (e) {
      setHanziInfo({ pinyin: py, meaning: 'Lỗi dịch' });
    } finally {
      setIsLoadingMeaning(false);
    }
  }

  async function fetchOnlineTranslation(text: string) {
    setIsTranslating(true);
    setDynamicResult(null);
    setTranslateError(false);
    try {
      const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&from=vi`);
      const data = await res.json();
      const translatedHanzi = data.translatedText || "";
      if (isHanzi(translatedHanzi)) {
        const generatedPinyin = pinyin(translatedHanzi, { toneType: 'symbol', type: 'array' }).join(' ');
        setDynamicResult({
          id: 'dynamic_' + Date.now(),
          simplified: translatedHanzi,
          pinyin: generatedPinyin,
          meaningVi: text,
          level: 0,
          example: { zh: "", pinyin: "", vi: "" }
        });
        setCharToWrite(translatedHanzi);
        setMode('animate');
        setHanziInfo({ pinyin: generatedPinyin, meaning: text });
      } else {
        setTranslateError(true);
        setCharToWrite('');
      }
    } catch (error) {
      setTranslateError(true);
      setCharToWrite('');
    } finally {
      setIsTranslating(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    setDynamicResult(null);
    setTranslateError(false);
    if (isHanzi(val) && val.trim().length > 0) {
      const trimmed = val.trim();
      setCharToWrite(trimmed);
      setMode('animate');
      fetchHanziDetails(trimmed);
    } else {
      setCharToWrite(''); 
      setHanziInfo({ pinyin: '', meaning: '' });
    }
  }

  useEffect(() => {
    if (!searchQuery.trim() || isHanzi(searchQuery)) return;
    const localResults = searchVocab(searchQuery);
    if (localResults.length === 0) {
      const timer = setTimeout(() => fetchOnlineTranslation(searchQuery), 800);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(audioBlob));
        recordStudyActivity(); 
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioUrl(null); 
      setIsPlaying(false);
    } catch (err) {
      alert('Không thể truy cập Microphone!');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }

  const searchResults = searchVocab(searchQuery);
  const isHanziPhrase = isHanzi(searchQuery) && searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* ... (Phần header và cột phải giữ nguyên) ... */}
      <div className="text-center md:text-left py-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center md:justify-start gap-3">
          <Sparkles className="text-blue-600" size={32} />
          Luyện viết & Phát âm
        </h1>
        <p className="text-slate-600">Tra cứu từ vựng, luyện viết thứ tự nét và tự ghi âm giọng đọc.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* CỘT TRÁI */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm sticky top-24 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex bg-slate-100/80 p-1 rounded-xl">
              <button
                onClick={() => setMode('animate')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'animate' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Xem mẫu
              </button>
              <button
                onClick={() => setMode('quiz')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'quiz' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Tự viết
              </button>
            </div>
            <button
              onClick={() => speak(charToWrite)}
              disabled={!charToWrite}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Volume2 size={18} /> Nghe mẫu
            </button>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-slate-100 border-dashed p-4 min-h-[300px] mb-4">
            {charToWrite ? (
              <>
                <HanziWriterCanvas character={charToWrite} size={240} mode={mode} />
                <div className="mt-4 text-3xl hanzi-target font-bold text-slate-800">{charToWrite}</div>
              </>
            ) : (
              <div className="text-slate-400 italic text-center">
                {isTranslating ? 'Đang tìm kiếm...' : 'Chưa có dữ liệu'}
              </div>
            )}
          </div>

          {/* KHU VỰC GHI ÂM & GLASS AUDIO PLAYER */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Mic size={16} className="text-blue-500" /> Luyện phát âm
            </div>
            
            {!audioUrl && !isRecording ? (
              <button
                onClick={startRecording}
                disabled={!charToWrite}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                <Mic size={20} /> Bắt đầu ghi âm
              </button>
            ) : isRecording ? (
              <div className="w-full flex items-center justify-between bg-white/80 backdrop-blur-md border border-red-100 p-2 pl-4 rounded-full shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Đang thu âm...</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-3"
                >
                  {/* Nút ghi lại */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bản ghi của bạn</span>
                    <button 
                      onClick={() => setAudioUrl(null)}
                      className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors bg-white/50 px-2 py-1 rounded-md"
                    >
                      <RotateCcw size={12} /> Ghi lại
                    </button>
                  </div>

                  {/* PLAYER UI MỚI */}
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200/60 p-3 pr-4 rounded-2xl shadow-sm">
                    <button 
                      onClick={togglePlay}
                      className="w-11 h-11 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                    >
                      {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                    
                    <div className="flex-1 flex flex-col justify-center gap-1">
                      <div className="flex items-center justify-between">
                        <FakeWaveform isPlaying={isPlaying} />
                        <span className="text-[11px] font-mono font-medium text-slate-400">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={duration || 0} 
                        value={currentTime} 
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                        style={{
                          background: `linear-gradient(to right, #2563eb ${(currentTime / (duration || 1)) * 100}%, #e2e8f0 ${(currentTime / (duration || 1)) * 100}%)`
                        }}
                      />
                    </div>
                  </div>
                  <audio ref={audioRef} src={audioUrl} className="hidden" />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* CỘT PHẢI (TÌM KIẾM) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm"
        >
          {/* ... (Giữ nguyên phần tìm kiếm và danh sách kết quả như cũ) ... */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Gõ chữ Hán, Pinyin hoặc tiếng Việt..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none transition-all text-lg bg-white"
            />
            {(isTranslating || isLoadingMeaning) && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={20} />}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700">
              {searchQuery ? 'Kết quả tra cứu' : 'Gợi ý (HSK)'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {dynamicResult && (
                <button
                  onClick={() => { setCharToWrite(dynamicResult.simplified); setMode('animate'); setHanziInfo({pinyin: dynamicResult.pinyin, meaning: dynamicResult.meaningVi}); }}
                  className={`col-span-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    charToWrite === dynamicResult.simplified ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-100 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="text-left">
                    <div className="hanzi-target text-3xl font-bold text-slate-800">{dynamicResult.simplified}</div>
                    <div className="text-sm text-blue-600 font-medium mt-1">{dynamicResult.pinyin}</div>
                    <div className="text-xs text-slate-500">{dynamicResult.meaningVi}</div>
                  </div>
                  <Sparkles size={20} className="text-blue-300 opacity-50" />
                </button>
              )}
              {isHanziPhrase && (
                <button
                  onClick={() => { setCharToWrite(searchQuery); setMode('animate'); }}
                  className={`col-span-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    charToWrite === searchQuery ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-400 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><PenTool size={20} /></div>
                    <div className="text-left">
                      <div className="font-semibold text-blue-800">Luyện viết cụm từ này</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="hanzi-target text-xl">{searchQuery}</span>
                        {hanziInfo.pinyin && <span className="text-sm text-blue-600 font-medium">{hanziInfo.pinyin}</span>}
                        {hanziInfo.meaning && <span className="text-sm text-slate-500">- {hanziInfo.meaning}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              )}
              {searchResults.map((v) => {
                if (isHanziPhrase && v.simplified === searchQuery.trim()) return null;
                return (
                  <button
                    key={v.id}
                    onClick={() => { 
                      setCharToWrite(v.simplified); 
                      setMode('animate'); 
                      setHanziInfo({ pinyin: v.pinyin, meaning: v.meaningVi });
                    }}
                    className={`text-left p-3 rounded-xl border-2 transition-all group ${
                      charToWrite === v.simplified ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="hanzi-target text-2xl font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{v.simplified}</div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium mt-1">{v.pinyin}</div>
                    <div className="text-xs text-slate-500 truncate">{v.meaningVi}</div>
                  </button>
                );
              })}
            </div>
            {searchQuery && searchResults.length === 0 && !isHanziPhrase && !dynamicResult && !isTranslating && (
              <div className="text-center py-8 text-slate-500 text-sm">
                {translateError ? <span className="text-orange-500">Không thể dịch từ này.</span> : "Không tìm thấy kết quả."}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function WritingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12 text-slate-500 animate-pulse">Đang tải...</div>}>
      <WritingInner />
    </Suspense>
  );
}
