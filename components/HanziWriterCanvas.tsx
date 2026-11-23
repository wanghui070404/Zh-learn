'use client';
import { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

type Props = {
  character: string;
  size?: number;
  mode?: 'animate' | 'quiz';
  onComplete?: () => void;
};

function SingleCharWriter({ char, size, mode, onComplete }: { char: string, size: number, mode: 'animate' | 'quiz', onComplete?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !char) return;
    ref.current.innerHTML = '';

    try {
      const writer = HanziWriter.create(ref.current, char, {
        width: size,
        height: size,
        padding: 5,
        showOutline: true,
        strokeColor: '#1f2937',
      });

      if (mode === 'animate') {
        writer.animateCharacter();
      } else {
        writer.quiz({ onComplete: () => onComplete?.() });
      }

      return () => { writer.cancelQuiz(); };
    } catch (e) {
      // Nếu chữ Hán đó hiếm quá, thư viện không có dữ liệu nét vẽ
      if (ref.current) {
        ref.current.innerHTML = `<div style="width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; border:2px dashed #cbd5e1; border-radius:12px; color:#94a3b8; font-size:12px; text-align:center;">Không có dữ liệu nét vẽ</div>`;
      }
    }
  }, [char, size, mode, onComplete]);

  return <div ref={ref} />;
}

export default function HanziWriterCanvas({
  character,
  size = 250,
  mode = 'animate',
  onComplete,
}: Props) {
  // Tách từng chữ cái
  const chars = character.split('').filter(c => c.trim().length > 0);

  // Nếu câu dài quá (từ 4 chữ trở lên), thu nhỏ kích thước lại để không bị tràn màn hình
  let calculatedSize = size;
  if (chars.length === 2) calculatedSize = Math.floor(size * 0.7);
  else if (chars.length === 3) calculatedSize = Math.floor(size * 0.5);
  else if (chars.length >= 4) calculatedSize = Math.floor(size * 0.4);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {chars.map((c, i) => (
        <SingleCharWriter 
          key={`${c}-${i}`} 
          char={c} 
          size={calculatedSize} 
          mode={mode} 
          onComplete={onComplete} 
        />
      ))}
    </div>
  );
}
