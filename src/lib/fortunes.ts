import data from '../data/fortunes.json';

export type CategoryId = 'love' | 'study' | 'work' | 'money';

export type Level = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Caution';

export type Fortune = {
  number: number;
  level: Level;
  title: string;
  poem: string[];
  meaning: string;
  advice: Record<CategoryId, string>;
};

export const CATEGORIES: { id: CategoryId; label: string; emoji: string; hint: string }[] = [
  { id: 'love', label: 'Love', emoji: '💗', hint: 'Partner, soulmate, relationships' },
  { id: 'study', label: 'Study', emoji: '📚', hint: 'Exams, grades, further study' },
  { id: 'work', label: 'Work', emoji: '💼', hint: 'Career, boss, coworkers' },
  { id: 'money', label: 'Money', emoji: '💰', hint: 'Luck, income, spending' },
];

export const LEVEL_STYLE: Record<Level, { color: string; stars: number }> = {
  Excellent: { color: '#B8860B', stars: 5 },
  'Very Good': { color: '#C8372D', stars: 4 },
  Good: { color: '#2E7D32', stars: 3 },
  Fair: { color: '#8D6E63', stars: 2 },
  Caution: { color: '#5D4037', stars: 1 },
};

export const FORTUNES = data as Fortune[];
export const FORTUNE_COUNT = FORTUNES.length; // 28

export function getFortune(n: number): Fortune | undefined {
  return FORTUNES.find((f) => f.number === n);
}

export function getCategory(id: string | undefined) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function randomStickNumber(): number {
  return 1 + Math.floor(Math.random() * FORTUNE_COUNT);
}
