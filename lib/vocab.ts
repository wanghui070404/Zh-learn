import vocabularyData from '@/data/vocabulary.json';
import type { VocabItem } from './types';

export const vocabulary: VocabItem[] = vocabularyData as VocabItem[];

export function searchVocab(query: string) {
  if (!query) return vocabulary.slice(0, 50); // Trả về 50 từ đầu nếu không tìm kiếm
  
  const q = query.toLowerCase();
  return vocabulary.filter(v =>
    v.simplified.includes(query) ||
    v.pinyin.toLowerCase().includes(q) ||
    v.meaningVi.toLowerCase().includes(q)
  ).slice(0, 100); // Giới hạn 100 kết quả để không bị lag
}
