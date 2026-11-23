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
  hanviet?: string; // Thêm trường âm Hán-Việt
};
