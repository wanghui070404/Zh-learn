export type SpeakSource = 'worker-google' | 'webspeech' | 'none';
export type SpeakResult = { ok: boolean; source: SpeakSource };

const WORKER_URL = 'https://zh-tts-proxy.huy-mx.workers.dev/';

let currentAudio: HTMLAudioElement | null = null;

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function webSpeech(text: string, rate: number): SpeakResult {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { ok: false, source: 'none' };
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return { ok: true, source: 'webspeech' };
}

export async function speak(text: string, rate = 0.9): Promise<SpeakResult> {
  if (!text) return { ok: false, source: 'none' };
  stopCurrent();

  try {
    const url = `${WORKER_URL}?text=${encodeURIComponent(text)}`;
    
    // Tải âm thanh về dưới dạng Blob để lách luật Autoplay
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob); // Tạo URL nội bộ (blob:...)
    
    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    
    // Phát âm thanh
    await audio.play();
    currentAudio = audio;

    // Dọn dẹp bộ nhớ sau khi phát xong
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };

    return { ok: true, source: 'worker-google' };
  } catch (error) {
    console.warn('[speak] Lỗi khi tải/phát từ Worker, dùng giọng hệ thống:', error);
    return webSpeech(text, rate);
  }
}
