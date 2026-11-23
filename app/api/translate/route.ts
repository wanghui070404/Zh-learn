import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const from = searchParams.get('from') || 'vi'; // Mặc định là vi -> zh
  const to = from === 'vi' ? 'zh-CN' : 'vi';

  if (!text) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    
    const translatedText = data[0][0][0]; 
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translate API Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
