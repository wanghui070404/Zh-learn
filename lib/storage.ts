'use client';
import { useEffect, useState } from 'react';
import type { Flashcard } from './types';
import { newCardBase } from './srs';

const FLASHCARD_KEY = 'zh_flashcards_v1';
const LEARNED_KEY = 'zh_learned_words_v1';
const HISTORY_KEY = 'zh_study_history_v1'; // Lưu lịch sử học { "2023-10-25": 15, ... }

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

// --- QUẢN LÝ FLASHCARD ---
export function getCards(): Flashcard[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(FLASHCARD_KEY) || '[]'); } catch { return []; }
}

function saveCards(cards: Flashcard[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FLASHCARD_KEY, JSON.stringify(cards));
  emit();
}

export function addCard(input: Omit<Flashcard, 'id' | 'createdAt' | 'easiness' | 'interval' | 'repetitions' | 'dueDate'>) {
  const card: Flashcard = { ...newCardBase(), ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  saveCards([card, ...getCards()]);
  return card;
}

export function updateCard(card: Flashcard) {
  saveCards(getCards().map((c) => (c.id === card.id ? card : c)));
}

export function deleteCard(id: string) {
  saveCards(getCards().filter((c) => c.id !== id));
}

export function dueCards(): Flashcard[] {
  const now = Date.now();
  return getCards().filter((c) => c.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
}

// --- QUẢN LÝ TỪ ĐÃ THUỘC (MANUAL) ---
export function getLearnedWords(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LEARNED_KEY) || '[]'); } catch { return []; }
}

function saveLearnedWords(words: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEARNED_KEY, JSON.stringify(words));
  emit();
}

export function toggleLearnedWord(hanzi: string) {
  const words = getLearnedWords();
  if (words.includes(hanzi)) {
    saveLearnedWords(words.filter(w => w !== hanzi));
    return false;
  } else {
    saveLearnedWords([...words, hanzi]);
    return true;
  }
}

// --- GAMIFICATION: LỊCH SỬ HỌC, STREAK, HEATMAP ---
export function getStudyHistory(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}'); } catch { return {}; }
}

// Hàm này được gọi mỗi khi bạn ôn tập xong 1 thẻ hoặc học bài mới
export function recordStudyActivity() {
  const history = getStudyHistory();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  history[today] = (history[today] || 0) + 1;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    emit();
  }
}

// Tính toán chuỗi ngày học liên tiếp (Streak)
export function calculateStreak(history: Record<string, number>): number {
  const dates = Object.keys(history).sort(); // Sắp xếp tăng dần
  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Nếu hôm nay và hôm qua đều không học -> Streak = 0
  if (!history[todayStr] && !history[yesterdayStr]) return 0;

  let streak = 0;
  let checkDate = history[todayStr] ? new Date() : yesterday;

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (history[dStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // Lùi 1 ngày
    } else {
      break;
    }
  }
  return streak;
}

// --- HOOKS ---
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

export function useLearnedWords() {
  const [words, setWords] = useState<string[]>([]);
  useEffect(() => {
    const update = () => setWords(getLearnedWords());
    update();
    return subscribe(update);
  }, []);
  return words;
}

export function useStudyHistory() {
  const [history, setHistory] = useState<Record<string, number>>({});
  useEffect(() => {
    const update = () => setHistory(getStudyHistory());
    update();
    return subscribe(update);
  }, []);
  return history;
}
