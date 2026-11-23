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
