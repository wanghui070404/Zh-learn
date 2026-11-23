import type { Flashcard } from './types';

// Hàm tính toán lịch ôn tập
export function calculateNextReview(card: Flashcard, quality: number) {
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
  return { ...card, easiness, interval, repetitions, dueDate, intervalDays: interval };
}

export function reviewCard(card: Flashcard, quality: number): Flashcard {
  const next = calculateNextReview(card, quality);
  const { intervalDays, ...rest } = next; // Bỏ intervalDays trước khi lưu
  return rest;
}

export function newCardBase() {
  return {
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: Date.now(),
  };
}
