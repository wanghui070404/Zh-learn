#!/bin/bash
set -e

echo ">>> Tạo cấu trúc thư mục..."
mkdir -p app/writing app/radicals app/vocabulary app/pronunciation app/grammar app/review
mkdir -p components lib data public

########################################
# ROOT FILES
########################################

cat > package.json <<'ENDOFFILE'
{
  "name": "zh-learn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "hanzi-writer": "3.7.0",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.0",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.38",
    "tailwindcss": "3.4.4",
    "typescript": "5.4.5"
  }
}
ENDOFFILE

cat > tsconfig.json <<'ENDOFFILE'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
ENDOFFILE

cat > next.config.js <<'ENDOFFILE'
/** @type {import('next').NextConfig} */
module.exports = { reactStrictMode: true };
ENDOFFILE

cat > tailwind.config.ts <<'ENDOFFILE'
import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
ENDOFFILE

cat > postcss.config.js <<'ENDOFFILE'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
ENDOFFILE

cat > .gitignore <<'ENDOFFILE'
node_modules
.next
out
.env*.local
ENDOFFILE

########################################
# APP
########################################

cat > app/globals.css <<'ENDOFFILE'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.hanzi-target {
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}
ENDOFFILE

cat > app/layout.tsx <<'ENDOFFILE'
import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Học tiếng Trung',
  description: 'Luyện viết, phát âm, từ vựng, ngữ pháp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 min-h-screen">
        <Nav />
        <main className="max-w-4xl mx-auto p-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
ENDOFFILE

cat > app/page.tsx <<'ENDOFFILE'
'use client';
import Link from 'next/link';
import { dueCards, useFlashcards } from '@/lib/storage';

export default function Home() {
  const cards = useFlashcards();
  const due = dueCards().length;
  const learned = cards.filter((c) => c.repetitions >= 2).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Học tiếng Trung mỗi ngày</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Tổng flashcard" value={cards.length} />
        <Stat label="Đến hạn hôm nay" value={due} />
        <Stat label="Đã thuộc" value={learned} />
        <Stat label="Còn mới" value={cards.length - learned} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Card href="/review" title="Ôn tập hôm nay" desc={`${due} thẻ đang chờ bạn`} />
        <Card href="/writing" title="Luyện viết" desc="Xem thứ tự nét và tự viết" />
        <Card href="/vocabulary" title="Từ vựng HSK 1" desc="Học từ và tạo flashcard" />
        <Card href="/pronunciation" title="Phát âm" desc="Nghe người thật nói qua YouGlish" />
        <Card href="/radicals" title="214 bộ thủ" desc="Nền tảng để nhớ chữ Hán" />
        <Card href="/grammar" title="Ngữ pháp HSK 1-2" desc="Mẫu câu cốt lõi" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block bg-white rounded-lg border p-4 hover:border-blue-400">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </Link>
  );
}
ENDOFFILE

cat > app/writing/page.tsx <<'ENDOFFILE'
'use client';
import { useState } from 'react';
import HanziWriterCanvas from '@/components/HanziWriterCanvas';
import { vocabulary } from '@/data/vocabulary';

export default function WritingPage() {
  const [char, setChar] = useState('我');
  const [mode, setMode] = useState<'animate' | 'quiz'>('animate');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Luyện viết chữ Hán</h1>

      <div className="bg-white rounded-lg border p-4">
        <input
          value={char}
          onChange={(e) => setChar(e.target.value.slice(0, 1))}
          placeholder="Nhập một chữ Hán..."
          className="border rounded p-2 w-full text-center text-2xl hanzi-target"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setMode('animate')}
            className={`px-4 py-2 rounded ${mode === 'animate' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Xem mẫu
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={`px-4 py-2 rounded ${mode === 'quiz' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
          >
            Tự viết
          </button>
        </div>

        <div className="mt-4">
          <HanziWriterCanvas character={char} mode={mode} />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="font-semibold mb-2">Chữ gợi ý (HSK 1)</div>
        <div className="flex flex-wrap gap-2">
          {vocabulary.slice(0, 20).map((v) => (
            <button
              key={v.id}
              onClick={() => { setChar(v.simplified); setMode('animate'); }}
              className="px-3 py-2 border rounded hanzi-target hover:bg-gray-50"
            >
              {v.simplified}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
ENDOFFILE

cat > app/radicals/page.tsx <<'ENDOFFILE'
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { radicals } from '@/data/radicals';

export default function RadicalsPage() {
  const [q, setQ] = useState('');
  const filtered = radicals.filter(
    (r) =>
      r.char.includes(q) ||
      r.pinyin.toLowerCase().includes(q.toLowerCase()) ||
      r.meaning.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">214 bộ thủ</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo chữ, pinyin hoặc nghĩa..."
        className="border rounded p-2 w-full"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {filtered.map((r) => (
          <Link
            key={r.n}
            href={`/writing`}
            className="bg-white border rounded p-3 hover:border-blue-400"
          >
            <div className="flex items-baseline gap-2">
              <span className="hanzi-target text-3xl">{r.char}</span>
              <span className="text-xs text-gray-500">#{r.n}</span>
            </div>
            <div className="text-sm mt-1">{r.pinyin}</div>
            <div className="text-xs text-gray-600">{r.meaning}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
ENDOFFILE

cat > app/vocabulary/page.tsx <<'ENDOFFILE'
'use client';
import { useState } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { addCard } from '@/lib/storage';
import type { VocabItem } from '@/lib/types';

export default function VocabularyPage() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<VocabItem | null>(null);

  const filtered = vocabulary.filter(
    (v) =>
      v.simplified.includes(q) ||
      v.pinyin.toLowerCase().includes(q.toLowerCase()) ||
      v.meaningVi.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Từ vựng HSK 1</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm từ..."
        className="border rounded p-2 w-full"
      />

      <div className="grid md:grid-cols-2 gap-2">
        {filtered.map((v) => (
          <div key={v.id} className="bg-white border rounded p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="hanzi-target text-3xl">{v.simplified}</div>
                <div className="text-blue-700">{v.pinyin}</div>
                <div className="text-sm text-gray-700">{v.meaningVi}</div>
              </div>
              <button
                onClick={() => setSelected(v)}
                className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
              >
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && <VocabModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function VocabModal({ item, onClose }: { item: VocabItem; onClose: () => void }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addCard({
      simplified: item.simplified,
      pinyin: item.pinyin,
      meaningVi: item.meaningVi,
      exampleZh: item.example.zh,
      examplePinyin: item.example.pinyin,
      exampleVi: item.example.vi,
      grammarNote: item.grammarNote,
      source: 'vocabulary',
    });
    setAdded(true);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div>
            <div className="hanzi-target text-5xl">{item.simplified}</div>
            <div className="text-blue-700 text-lg">{item.pinyin}</div>
            <div className="text-gray-700">{item.meaningVi}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 text-xl">×</button>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm font-semibold mb-1">Ví dụ</div>
          <div className="hanzi-target">{item.example.zh}</div>
          <div className="text-sm text-blue-700">{item.example.pinyin}</div>
          <div className="text-sm text-gray-700">{item.example.vi}</div>
        </div>

        {item.grammarNote && (
          <div className="border-t pt-3">
            <div className="text-sm font-semibold mb-1">Ngữ pháp liên quan</div>
            <div className="text-sm">{item.grammarNote}</div>
          </div>
        )}

        <div className="border-t pt-3 flex gap-2">
          <button
            onClick={handleAdd}
            disabled={added}
            className={`px-4 py-2 rounded text-white ${added ? 'bg-gray-400' : 'bg-blue-600'}`}
          >
            {added ? 'Đã thêm flashcard' : '+ Thêm flashcard'}
          </button>
          <a href={`/pronunciation?q=${encodeURIComponent(item.simplified)}`} className="px-4 py-2 rounded bg-gray-100">
            Nghe phát âm
          </a>
        </div>
      </div>
    </div>
  );
}
ENDOFFILE

cat > app/pronunciation/page.tsx <<'ENDOFFILE'
'use client';
import { useState } from 'react';
import YouGlishWidget from '@/components/YouGlishWidget';
import { addCard } from '@/lib/storage';

export default function PronunciationPage() {
  const [q, setQ] = useState('你');
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Phát âm – nghe người thật nói</h1>

      <div className="bg-white border rounded p-4">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setSaved(false); }}
          placeholder="Nhập từ/cụm từ tiếng Trung..."
          className="border rounded p-2 w-full hanzi-target"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              addCard({ simplified: q, pinyin: '', meaningVi: '', source: 'youglish' });
              setSaved(true);
            }}
            disabled={!q || saved}
            className={`px-4 py-2 rounded text-white ${saved ? 'bg-gray-400' : 'bg-blue-600'}`}
          >
            {saved ? 'Đã lưu' : '+ Lưu vào flashcard'}
          </button>
          <a
            href={`https://youglish.com/pronounce/${encodeURIComponent(q)}/chinese`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded bg-gray-100"
          >
            Mở YouGlish
          </a>
        </div>
      </div>

      {q && (
        <div className="bg-white border rounded p-4">
          <YouGlishWidget query={q} />
        </div>
      )}
    </div>
  );
}
ENDOFFILE

cat > app/grammar/page.tsx <<'ENDOFFILE'
import { grammarPoints } from '@/data/grammar';

export default function GrammarPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ngữ pháp HSK 1-2</h1>
      <div className="space-y-3">
        {grammarPoints.map((g) => (
          <div key={g.id} className="bg-white border rounded p-4">
            <div className="flex justify-between">
              <div className="font-semibold">{g.title}</div>
              <div className="text-xs text-gray-500">HSK {g.level}</div>
            </div>
            <div className="text-blue-700 text-sm mt-1">{g.formula}</div>
            <div className="text-sm text-gray-700 mt-1">{g.explanation}</div>
            <ul className="mt-2 space-y-1">
              {g.examples.map((ex, i) => (
                <li key={i} className="text-sm">
                  <span className="hanzi-target">{ex.zh}</span>
                  <span className="text-blue-700 ml-2">{ex.pinyin}</span>
                  <span className="text-gray-600 ml-2">— {ex.vi}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
ENDOFFILE

cat > app/review/page.tsx <<'ENDOFFILE'
'use client';
import { useEffect, useState } from 'react';
import { dueCards, updateCard } from '@/lib/storage';
import { reviewCard } from '@/lib/srs';
import type { Flashcard } from '@/lib/types';

export default function ReviewPage() {
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  useEffect(() => {
    setQueue(dueCards());
  }, []);

  const current = queue[idx];

  function rate(quality: number) {
    if (!current) return;
    updateCard(reviewCard(current, quality));
    setFlipped(false);
    setDone(done + 1);
    setIdx(idx + 1);
  }

  if (queue.length === 0) {
    return (
      <div className="bg-white border rounded p-6 text-center">
        <h1 className="text-xl font-bold">Không có thẻ đến hạn</h1>
        <p className="text-gray-600 mt-2">Hãy thêm flashcard mới từ trang Từ vựng hoặc Phát âm.</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="bg-white border rounded p-6 text-center">
        <h1 className="text-xl font-bold">Hoàn thành phiên ôn tập!</h1>
        <p className="text-gray-600 mt-2">Bạn đã ôn {done} thẻ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">Thẻ {idx + 1} / {queue.length}</div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-white border rounded p-8 min-h-[220px] cursor-pointer flex flex-col items-center justify-center text-center"
      >
        <div className="hanzi-target text-6xl">{current.simplified}</div>
        {flipped && (
          <div className="mt-4 space-y-2">
            {current.pinyin && <div className="text-blue-700 text-lg">{current.pinyin}</div>}
            {current.meaningVi && <div>{current.meaningVi}</div>}
            {current.exampleZh && (
              <div className="text-sm text-gray-700">
                <div className="hanzi-target">{current.exampleZh}</div>
                <div className="text-blue-700">{current.examplePinyin}</div>
                <div>{current.exampleVi}</div>
              </div>
            )}
            {current.grammarNote && <div className="text-xs text-gray-500">{current.grammarNote}</div>}
          </div>
        )}
        {!flipped && <div className="text-xs text-gray-400 mt-4">Bấm để xem đáp án</div>}
      </div>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => rate(1)} className="py-2 rounded bg-red-500 text-white">Lại</button>
          <button onClick={() => rate(3)} className="py-2 rounded bg-orange-500 text-white">Khó</button>
          <button onClick={() => rate(4)} className="py-2 rounded bg-green-600 text-white">Được</button>
          <button onClick={() => rate(5)} className="py-2 rounded bg-blue-600 text-white">Dễ</button>
        </div>
      )}
    </div>
  );
}
ENDOFFILE

########################################
# COMPONENTS
########################################

cat > components/Nav.tsx <<'ENDOFFILE'
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Tổng quan' },
  { href: '/writing', label: 'Luyện viết' },
  { href: '/radicals', label: '214 bộ thủ' },
  { href: '/vocabulary', label: 'Từ vựng' },
  { href: '/pronunciation', label: 'Phát âm' },
  { href: '/grammar', label: 'Ngữ pháp' },
  { href: '/review', label: 'Ôn tập' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="bg-white border-b mb-6">
      <div className="max-w-4xl mx-auto flex flex-wrap gap-1 p-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded text-sm ${
              path === l.href ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
ENDOFFILE

cat > components/HanziWriterCanvas.tsx <<'ENDOFFILE'
'use client';
import { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

type Props = {
  character: string;
  size?: number;
  mode?: 'animate' | 'quiz';
  onComplete?: () => void;
};

export default function HanziWriterCanvas({
  character,
  size = 250,
  mode = 'animate',
  onComplete,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !character) return;
    ref.current.innerHTML = '';

    const writer = HanziWriter.create(ref.current, character, {
      width: size,
      height: size,
      padding: 10,
      showOutline: true,
      strokeColor: '#1f2937',
    });

    if (mode === 'animate') {
      writer.animateCharacter();
    } else {
      writer.quiz({ onComplete: () => onComplete?.() });
    }

    return () => { writer.cancelQuiz(); };
  }, [character, size, mode, onComplete]);

  return <div ref={ref} className="flex justify-center" />;
}
ENDOFFILE

cat > components/YouGlishWidget.tsx <<'ENDOFFILE'
'use client';
import { useEffect, useRef } from 'react';

export default function YouGlishWidget({
  query,
  lang = 'chinese',
}: {
  query: string;
  lang?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query) return;

    const SCRIPT_ID = 'yg-widget-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://youglish.com/public/emb/widget.js';
      s.async = true;
      document.body.appendChild(s);
    }

    if (ref.current) {
      ref.current.innerHTML = '';
      const id = 'yg-widget-' + Math.random().toString(36).slice(2);
      const div = document.createElement('div');
      div.id = id;
      div.className = 'youglish-widget';
      div.setAttribute('data-query', query);
      div.setAttribute('data-lang', lang);
      div.setAttribute('data-components', '8415');
      div.setAttribute('data-bkg-color', 'theme_light');
      div.setAttribute('data-auto-start', '0');
      ref.current.appendChild(div);
    }
  }, [query, lang]);

  return (
    <div>
      <div ref={ref} />
      <p className="text-xs text-gray-500 mt-2">
        Powered by <a className="underline" href="https://youglish.com" target="_blank" rel="noreferrer">YouGlish.com</a>
      </p>
    </div>
  );
}
ENDOFFILE

########################################
# LIB
########################################

cat > lib/types.ts <<'ENDOFFILE'
export type Flashcard = {
  id: string;
  simplified: string;
  pinyin: string;
  meaningVi: string;
  exampleZh?: string;
  examplePinyin?: string;
  exampleVi?: string;
  grammarNote?: string;
  source?: string;
  createdAt: number;
  easiness: number;
  interval: number;
  repetitions: number;
  dueDate: number;
};

export type VocabItem = {
  id: string;
  simplified: string;
  pinyin: string;
  pos?: string;
  meaningVi: string;
  level: number;
  example: { zh: string; pinyin: string; vi: string };
  grammarNote?: string;
  radical?: string;
};
ENDOFFILE

cat > lib/srs.ts <<'ENDOFFILE'
import type { Flashcard } from './types';

export function reviewCard(card: Flashcard, quality: number): Flashcard {
  let { easiness, interval, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easiness);
    repetitions += 1;
  }

  easiness = Math.max(
    1.3,
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  const dueDate = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { ...card, easiness, interval, repetitions, dueDate };
}

export function newCardBase() {
  return {
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: Date.now(),
  };
}
ENDOFFILE

cat > lib/storage.ts <<'ENDOFFILE'
'use client';
import { useEffect, useState } from 'react';
import type { Flashcard } from './types';
import { newCardBase } from './srs';

const KEY = 'zh_flashcards_v1';
type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function getCards(): Flashcard[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(cards: Flashcard[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(cards));
  emit();
}

export function addCard(input: Omit<Flashcard, 'id' | 'createdAt' | 'easiness' | 'interval' | 'repetitions' | 'dueDate'>) {
  const card: Flashcard = {
    ...newCardBase(),
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  save([card, ...getCards()]);
  return card;
}

export function updateCard(card: Flashcard) {
  save(getCards().map((c) => (c.id === card.id ? card : c)));
}

export function deleteCard(id: string) {
  save(getCards().filter((c) => c.id !== id));
}

export function dueCards(): Flashcard[] {
  const now = Date.now();
  return getCards().filter((c) => c.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  useEffect(() => {
    const update = () => setCards(getCards());
    update();
    return subscribe(update);
  }, []);
  return cards;
}
ENDOFFILE

########################################
# DATA
########################################

cat > data/grammar.ts <<'ENDOFFILE'
export type GrammarPoint = {
  id: string;
  level: number;
  title: string;
  formula: string;
  explanation: string;
  examples: { zh: string; pinyin: string; vi: string }[];
};

export const grammarPoints: GrammarPoint[] = [
  { id: 'g_shi', level: 1, title: 'Câu với 是 (A 是 B)', formula: 'A + 是 + B', explanation: 'Dùng để nói A là B (giới thiệu tên, nghề, quốc tịch...).', examples: [
    { zh: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', vi: 'Tôi là học sinh.' },
    { zh: '他是老师。', pinyin: 'Tā shì lǎoshī.', vi: 'Anh ấy là giáo viên.' },
  ]},
  { id: 'g_de', level: 1, title: 'Trợ từ sở hữu 的', formula: 'A + 的 + B', explanation: 'Đặt 的 giữa người sở hữu và vật được sở hữu.', examples: [
    { zh: '我的书', pinyin: 'wǒ de shū', vi: 'sách của tôi' },
    { zh: '他的朋友', pinyin: 'tā de péngyou', vi: 'bạn của anh ấy' },
  ]},
  { id: 'g_ma', level: 1, title: 'Câu hỏi yes/no với 吗', formula: 'Câu + 吗？', explanation: 'Thêm 吗 cuối câu trần thuật để tạo câu hỏi có/không.', examples: [
    { zh: '你好吗？', pinyin: 'Nǐ hǎo ma?', vi: 'Bạn khỏe không?' },
    { zh: '你是学生吗？', pinyin: 'Nǐ shì xuéshēng ma?', vi: 'Bạn là học sinh à?' },
  ]},
  { id: 'g_bu', level: 1, title: 'Phủ định với 不', formula: '不 + động từ / tính từ', explanation: 'Dùng cho hiện tại và tương lai. Với 有 phải dùng 没有.', examples: [
    { zh: '我不去。', pinyin: 'Wǒ bù qù.', vi: 'Tôi không đi.' },
    { zh: '我没有钱。', pinyin: 'Wǒ méiyǒu qián.', vi: 'Tôi không có tiền.' },
  ]},
  { id: 'g_hen', level: 1, title: 'Tính từ làm vị ngữ với 很', formula: 'Chủ ngữ + 很 + tính từ', explanation: 'Khi tính từ đứng làm vị ngữ, thường thêm 很 (rất) để câu tự nhiên.', examples: [
    { zh: '我很好。', pinyin: 'Wǒ hěn hǎo.', vi: 'Tôi rất khỏe.' },
    { zh: '今天很热。', pinyin: 'Jīntiān hěn rè.', vi: 'Hôm nay rất nóng.' },
  ]},
  { id: 'g_you', level: 1, title: '有 / 没有', formula: 'Chủ ngữ + 有 + tân ngữ', explanation: 'Diễn tả sự sở hữu hoặc tồn tại. Phủ định là 没有.', examples: [
    { zh: '我有一只猫。', pinyin: 'Wǒ yǒu yì zhī māo.', vi: 'Tôi có một con mèo.' },
    { zh: '他没有车。', pinyin: 'Tā méiyǒu chē.', vi: 'Anh ấy không có xe.' },
  ]},
  { id: 'g_zai', level: 1, title: '在 (ở / đang)', formula: 'Chủ ngữ + 在 + địa điểm / 在 + động từ', explanation: '在 đứng trước địa điểm nghĩa là "ở"; đứng trước động từ nghĩa là "đang".', examples: [
    { zh: '我在家。', pinyin: 'Wǒ zài jiā.', vi: 'Tôi ở nhà.' },
    { zh: '他在看书。', pinyin: 'Tā zài kàn shū.', vi: 'Anh ấy đang đọc sách.' },
  ]},
  { id: 'g_hui_neng', level: 1, title: '会 / 能', formula: 'Chủ ngữ + 会/能 + động từ', explanation: '会: biết làm (kỹ năng học được). 能: có thể (điều kiện cho phép).', examples: [
    { zh: '我会说中文。', pinyin: 'Wǒ huì shuō Zhōngwén.', vi: 'Tôi biết nói tiếng Trung.' },
    { zh: '我今天不能去。', pinyin: 'Wǒ jīntiān bù néng qù.', vi: 'Hôm nay tôi không thể đi.' },
  ]},
  { id: 'g_xiang_yao', level: 1, title: '想 / 要', formula: 'Chủ ngữ + 想/要 + động từ', explanation: '想: muốn (nguyện vọng). 要: cần/muốn (mạnh hơn, có ý định).', examples: [
    { zh: '我想喝水。', pinyin: 'Wǒ xiǎng hē shuǐ.', vi: 'Tôi muốn uống nước.' },
    { zh: '我要买这个。', pinyin: 'Wǒ yào mǎi zhège.', vi: 'Tôi muốn mua cái này.' },
  ]},
  { id: 'g_tai_le', level: 2, title: '太…了', formula: '太 + tính từ + 了', explanation: 'Diễn tả mức độ quá cao: "quá...".', examples: [
    { zh: '太好了！', pinyin: 'Tài hǎo le!', vi: 'Tốt quá!' },
    { zh: '这个太贵了。', pinyin: 'Zhège tài guì le.', vi: 'Cái này đắt quá.' },
  ]},
  { id: 'g_dou_ye', level: 2, title: '都 / 也', formula: 'Chủ ngữ + 都/也 + động từ', explanation: '都: đều (tất cả). 也: cũng.', examples: [
    { zh: '我们都很好。', pinyin: 'Wǒmen dōu hěn hǎo.', vi: 'Chúng tôi đều khỏe.' },
    { zh: '我也喜欢。', pinyin: 'Wǒ yě xǐhuan.', vi: 'Tôi cũng thích.' },
  ]},
  { id: 'g_bi', level: 2, title: 'So sánh với 比', formula: 'A + 比 + B + tính từ', explanation: 'Dùng để so sánh: A ... hơn B.', examples: [
    { zh: '我比他高。', pinyin: 'Wǒ bǐ tā gāo.', vi: 'Tôi cao hơn anh ấy.' },
    { zh: '今天比昨天热。', pinyin: 'Jīntiān bǐ zuótiān rè.', vi: 'Hôm nay nóng hơn hôm qua.' },
  ]},
];
ENDOFFILE

cat > data/vocabulary.ts <<'ENDOFFILE'
import type { VocabItem } from '@/lib/types';

export const vocabulary: VocabItem[] = [
  { id: 'hsk1_wo', simplified: '我', pinyin: 'wǒ', pos: 'đại từ', meaningVi: 'tôi', level: 1, example: { zh: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', vi: 'Tôi là học sinh.' } },
  { id: 'hsk1_ni', simplified: '你', pinyin: 'nǐ', pos: 'đại từ', meaningVi: 'bạn', level: 1, example: { zh: '你好！', pinyin: 'Nǐ hǎo!', vi: 'Xin chào!' } },
  { id: 'hsk1_ta_m', simplified: '他', pinyin: 'tā', pos: 'đại từ', meaningVi: 'anh ấy', level: 1, example: { zh: '他是老师。', pinyin: 'Tā shì lǎoshī.', vi: 'Anh ấy là giáo viên.' } },
  { id: 'hsk1_ta_f', simplified: '她', pinyin: 'tā', pos: 'đại từ', meaningVi: 'cô ấy', level: 1, example: { zh: '她很漂亮。', pinyin: 'Tā hěn piàoliang.', vi: 'Cô ấy rất đẹp.' } },
  { id: 'hsk1_hao', simplified: '好', pinyin: 'hǎo', pos: 'tính từ', meaningVi: 'tốt, khỏe', level: 1, example: { zh: '我很好。', pinyin: 'Wǒ hěn hǎo.', vi: 'Tôi rất khỏe.' } },
  { id: 'hsk1_shi', simplified: '是', pinyin: 'shì', pos: 'động từ', meaningVi: 'là', level: 1, example: { zh: '这是我的书。', pinyin: 'Zhè shì wǒ de shū.', vi: 'Đây là sách của tôi.' }, grammarNote: 'Mẫu câu A 是 B - A là B.' },
  { id: 'hsk1_bu', simplified: '不', pinyin: 'bù', pos: 'phó từ', meaningVi: 'không', level: 1, example: { zh: '我不去。', pinyin: 'Wǒ bù qù.', vi: 'Tôi không đi.' }, grammarNote: '不 + động từ/tính từ để phủ định hiện tại/tương lai.' },
  { id: 'hsk1_ren', simplified: '人', pinyin: 'rén', pos: 'danh từ', meaningVi: 'người', level: 1, example: { zh: '他是中国人。', pinyin: 'Tā shì Zhōngguó rén.', vi: 'Anh ấy là người Trung Quốc.' } },
  { id: 'hsk1_da', simplified: '大', pinyin: 'dà', pos: 'tính từ', meaningVi: 'lớn', level: 1, example: { zh: '这个很大。', pinyin: 'Zhège hěn dà.', vi: 'Cái này rất lớn.' } },
  { id: 'hsk1_xiao', simplified: '小', pinyin: 'xiǎo', pos: 'tính từ', meaningVi: 'nhỏ', level: 1, example: { zh: '我的房间很小。', pinyin: 'Wǒ de fángjiān hěn xiǎo.', vi: 'Phòng của tôi rất nhỏ.' } },
  { id: 'hsk1_zhongguo', simplified: '中国', pinyin: 'Zhōngguó', pos: 'danh từ', meaningVi: 'Trung Quốc', level: 1, example: { zh: '中国很大。', pinyin: 'Zhōngguó hěn dà.', vi: 'Trung Quốc rất lớn.' } },
  { id: 'hsk1_xuesheng', simplified: '学生', pinyin: 'xuéshēng', pos: 'danh từ', meaningVi: 'học sinh, sinh viên', level: 1, example: { zh: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', vi: 'Tôi là học sinh.' } },
  { id: 'hsk1_laoshi', simplified: '老师', pinyin: 'lǎoshī', pos: 'danh từ', meaningVi: 'giáo viên', level: 1, example: { zh: '她是老师。', pinyin: 'Tā shì lǎoshī.', vi: 'Cô ấy là giáo viên.' } },
  { id: 'hsk1_pengyou', simplified: '朋友', pinyin: 'péngyou', pos: 'danh từ', meaningVi: 'bạn bè', level: 1, example: { zh: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyou.', vi: 'Anh ấy là bạn của tôi.' } },
  { id: 'hsk1_mingzi', simplified: '名字', pinyin: 'míngzi', pos: 'danh từ', meaningVi: 'tên', level: 1, example: { zh: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', vi: 'Bạn tên là gì?' } },
  { id: 'hsk1_jia', simplified: '家', pinyin: 'jiā', pos: 'danh từ', meaningVi: 'nhà, gia đình', level: 1, example: { zh: '我家有四口人。', pinyin: 'Wǒ jiā yǒu sì kǒu rén.', vi: 'Nhà tôi có bốn người.' } },
  { id: 'hsk1_shu', simplified: '书', pinyin: 'shū', pos: 'danh từ', meaningVi: 'sách', level: 1, example: { zh: '这是我的书。', pinyin: 'Zhè shì wǒ de shū.', vi: 'Đây là sách của tôi.' } },
  { id: 'hsk1_shui', simplified: '水', pinyin: 'shuǐ', pos: 'danh từ', meaningVi: 'nước', level: 1, example: { zh: '我要喝水。', pinyin: 'Wǒ yào hē shuǐ.', vi: 'Tôi muốn uống nước.' } },
  { id: 'hsk1_fan', simplified: '饭', pinyin: 'fàn', pos: 'danh từ', meaningVi: 'cơm', level: 1, example: { zh: '你吃饭了吗？', pinyin: 'Nǐ chīfàn le ma?', vi: 'Bạn ăn cơm chưa?' } },
  { id: 'hsk1_cha', simplified: '茶', pinyin: 'chá', pos: 'danh từ', meaningVi: 'trà', level: 1, example: { zh: '我喜欢喝茶。', pinyin: 'Wǒ xǐhuan hē chá.', vi: 'Tôi thích uống trà.' } },
  { id: 'hsk1_pingguo', simplified: '苹果', pinyin: 'píngguǒ', pos: 'danh từ', meaningVi: 'táo', level: 1, example: { zh: '这个苹果很甜。', pinyin: 'Zhège píngguǒ hěn tián.', vi: 'Quả táo này rất ngọt.' } },
  { id: 'hsk1_mao', simplified: '猫', pinyin: 'māo', pos: 'danh từ', meaningVi: 'mèo', level: 1, example: { zh: '我家有一只猫。', pinyin: 'Wǒ jiā yǒu yì zhī māo.', vi: 'Nhà tôi có một con mèo.' } },
  { id: 'hsk1_gou', simplified: '狗', pinyin: 'gǒu', pos: 'danh từ', meaningVi: 'chó', level: 1, example: { zh: '那只狗很大。', pinyin: 'Nà zhī gǒu hěn dà.', vi: 'Con chó kia rất lớn.' } },
  { id: 'hsk1_xihuan', simplified: '喜欢', pinyin: 'xǐhuan', pos: 'động từ', meaningVi: 'thích', level: 1, example: { zh: '我喜欢学中文。', pinyin: 'Wǒ xǐhuan xué Zhōngwén.', vi: 'Tôi thích học tiếng Trung.' } },
  { id: 'hsk1_ai', simplified: '爱', pinyin: 'ài', pos: 'động từ', meaningVi: 'yêu', level: 1, example: { zh: '我爱你。', pinyin: 'Wǒ ài nǐ.', vi: 'Anh yêu em.' } },
  { id: 'hsk1_chi', simplified: '吃', pinyin: 'chī', pos: 'động từ', meaningVi: 'ăn', level: 1, example: { zh: '我想吃米饭。', pinyin: 'Wǒ xiǎng chī mǐfàn.', vi: 'Tôi muốn ăn cơm.' } },
  { id: 'hsk1_he', simplified: '喝', pinyin: 'hē', pos: 'động từ', meaningVi: 'uống', level: 1, example: { zh: '你喝什么？', pinyin: 'Nǐ hē shénme?', vi: 'Bạn uống gì?' } },
  { id: 'hsk1_kan', simplified: '看', pinyin: 'kàn', pos: 'động từ', meaningVi: 'xem, nhìn', level: 1, example: { zh: '我看书。', pinyin: 'Wǒ kàn shū.', vi: 'Tôi đọc sách.' } },
  { id: 'hsk1_ting', simplified: '听', pinyin: 'tīng', pos: 'động từ', meaningVi: 'nghe', level: 1, example: { zh: '我听音乐。', pinyin: 'Wǒ tīng yīnyuè.', vi: 'Tôi nghe nhạc.' } },
  { id: 'hsk1_shuo', simplified: '说', pinyin: 'shuō', pos: 'động từ', meaningVi: 'nói', level: 1, example: { zh: '请说中文。', pinyin: 'Qǐng shuō Zhōngwén.', vi: 'Xin hãy nói tiếng Trung.' } },
  { id: 'hsk1_qu', simplified: '去', pinyin: 'qù', pos: 'động từ', meaningVi: 'đi', level: 1, example: { zh: '我去学校。', pinyin: 'Wǒ qù xuéxiào.', vi: 'Tôi đi đến trường.' } },
  { id: 'hsk1_lai', simplified: '来', pinyin: 'lái', pos: 'động từ', meaningVi: 'đến', level: 1, example: { zh: '请来我家。', pinyin: 'Qǐng lái wǒ jiā.', vi: 'Hãy đến nhà tôi.' } },
  { id: 'hsk1_you', simplified: '有', pinyin: 'yǒu', pos: 'động từ', meaningVi: 'có', level: 1, example: { zh: '我有一只猫。', pinyin: 'Wǒ yǒu yì zhī māo.', vi: 'Tôi có một con mèo.' } },
  { id: 'hsk1_meiyou', simplified: '没有', pinyin: 'méiyǒu', pos: 'động từ', meaningVi: 'không có', level: 1, example: { zh: '我没有钱。', pinyin: 'Wǒ méiyǒu qián.', vi: 'Tôi không có tiền.' }, grammarNote: 'Phủ định của 有 là 没有, không dùng 不有.' },
  { id: 'hsk1_jintian', simplified: '今天', pinyin: 'jīntiān', pos: 'danh từ', meaningVi: 'hôm nay', level: 1, example: { zh: '今天很热。', pinyin: 'Jīntiān hěn rè.', vi: 'Hôm nay rất nóng.' } },
  { id: 'hsk1_mingtian', simplified: '明天', pinyin: 'míngtiān', pos: 'danh từ', meaningVi: 'ngày mai', level: 1, example: { zh: '明天见。', pinyin: 'Míngtiān jiàn.', vi: 'Mai gặp lại.' } },
  { id: 'hsk1_zuotian', simplified: '昨天', pinyin: 'zuótiān', pos: 'danh từ', meaningVi: 'hôm qua', level: 1, example: { zh: '昨天我很忙。', pinyin: 'Zuótiān wǒ hěn máng.', vi: 'Hôm qua tôi rất bận.' } },
  { id: 'hsk1_xianzai', simplified: '现在', pinyin: 'xiànzài', pos: 'danh từ', meaningVi: 'bây giờ', level: 1, example: { zh: '现在几点？', pinyin: 'Xiànzài jǐ diǎn?', vi: 'Bây giờ là mấy giờ?' } },
  { id: 'hsk1_xingqi', simplified: '星期', pinyin: 'xīngqī', pos: 'danh từ', meaningVi: 'tuần, thứ', level: 1, example: { zh: '今天星期几？', pinyin: 'Jīntiān xīngqī jǐ?', vi: 'Hôm nay là thứ mấy?' } },
  { id: 'hsk1_zaoshang', simplified: '早上', pinyin: 'zǎoshang', pos: 'danh từ', meaningVi: 'buổi sáng', level: 1, example: { zh: '早上好！', pinyin: 'Zǎoshang hǎo!', vi: 'Chào buổi sáng!' } },
  { id: 'hsk1_wanshang', simplified: '晚上', pinyin: 'wǎnshang', pos: 'danh từ', meaningVi: 'buổi tối', level: 1, example: { zh: '晚上好！', pinyin: 'Wǎnshang hǎo!', vi: 'Chào buổi tối!' } },
  { id: 'hsk1_xiexie', simplified: '谢谢', pinyin: 'xièxie', pos: 'động từ', meaningVi: 'cảm ơn', level: 1, example: { zh: '谢谢你！', pinyin: 'Xièxie nǐ!', vi: 'Cảm ơn bạn!' } },
  { id: 'hsk1_zaijian', simplified: '再见', pinyin: 'zàijiàn', pos: 'động từ', meaningVi: 'tạm biệt', level: 1, example: { zh: '老师再见！', pinyin: 'Lǎoshī zàijiàn!', vi: 'Tạm biệt thầy/cô!' } },
  { id: 'hsk1_duibuqi', simplified: '对不起', pinyin: 'duìbuqǐ', pos: 'cụm từ', meaningVi: 'xin lỗi', level: 1, example: { zh: '对不起，我来晚了。', pinyin: 'Duìbuqǐ, wǒ lái wǎn le.', vi: 'Xin lỗi, tôi đến muộn.' } },
  { id: 'hsk1_qing', simplified: '请', pinyin: 'qǐng', pos: 'động từ', meaningVi: 'mời, xin', level: 1, example: { zh: '请进。', pinyin: 'Qǐng jìn.', vi: 'Mời vào.' } },
  { id: 'hsk1_shei', simplified: '谁', pinyin: 'shéi', pos: 'đại từ', meaningVi: 'ai', level: 1, example: { zh: '他是谁？', pinyin: 'Tā shì shéi?', vi: 'Anh ấy là ai?' } },
  { id: 'hsk1_shenme', simplified: '什么', pinyin: 'shénme', pos: 'đại từ', meaningVi: 'cái gì', level: 1, example: { zh: '这是什么？', pinyin: 'Zhè shì shénme?', vi: 'Đây là cái gì?' } },
  { id: 'hsk1_na', simplified: '哪', pinyin: 'nǎ', pos: 'đại từ', meaningVi: 'nào', level: 1, example: { zh: '你是哪国人？', pinyin: 'Nǐ shì nǎ guó rén?', vi: 'Bạn là người nước nào?' } },
  { id: 'hsk1_duoshao', simplified: '多少', pinyin: 'duōshao', pos: 'đại từ', meaningVi: 'bao nhiêu', level: 1, example: { zh: '这个多少钱？', pinyin: 'Zhège duōshao qián?', vi: 'Cái này bao nhiêu tiền?' } },
  { id: 'hsk1_ji', simplified: '几', pinyin: 'jǐ', pos: 'đại từ', meaningVi: 'mấy', level: 1, example: { zh: '你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', vi: 'Nhà bạn có mấy người?' } },
  { id: 'hsk1_hen', simplified: '很', pinyin: 'hěn', pos: 'phó từ', meaningVi: 'rất', level: 1, example: { zh: '我很好。', pinyin: 'Wǒ hěn hǎo.', vi: 'Tôi rất khỏe.' }, grammarNote: 'Tính từ làm vị ngữ thường cần 很 phía trước.' },
  { id: 'hsk1_ye', simplified: '也', pinyin: 'yě', pos: 'phó từ', meaningVi: 'cũng', level: 1, example: { zh: '我也喜欢。', pinyin: 'Wǒ yě xǐhuan.', vi: 'Tôi cũng thích.' } },
  { id: 'hsk1_dou', simplified: '都', pinyin: 'dōu', pos: 'phó từ', meaningVi: 'đều', level: 1, example: { zh: '我们都很好。', pinyin: 'Wǒmen dōu hěn hǎo.', vi: 'Chúng tôi đều khỏe.' } },
  { id: 'hsk1_xue', simplified: '学', pinyin: 'xué', pos: 'động từ', meaningVi: 'học', level: 1, example: { zh: '我学中文。', pinyin: 'Wǒ xué Zhōngwén.', vi: 'Tôi học tiếng Trung.' } },
  { id: 'hsk1_zhongwen', simplified: '中文', pinyin: 'Zhōngwén', pos: 'danh từ', meaningVi: 'tiếng Trung', level: 1, example: { zh: '我喜欢中文。', pinyin: 'Wǒ xǐhuan Zhōngwén.', vi: 'Tôi thích tiếng Trung.' } },
];
ENDOFFILE

echo ""
echo ">>> Script tạo file xong!"
echo ">>> Bước tiếp theo: chạy 'npm install' rồi 'npm run dev'"
