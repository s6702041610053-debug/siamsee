import data from '../data/fortunes.json';

export type CategoryId = 'love' | 'study' | 'work' | 'money';

export type Level = 'ดีเลิศ' | 'ดีมาก' | 'ดี' | 'พอใช้' | 'ควรระวัง';

export type Fortune = {
  number: number;
  level: Level;
  title: string;
  poem: string[];
  meaning: string;
  advice: Record<CategoryId, string>;
};

export const CATEGORIES: { id: CategoryId; label: string; emoji: string; hint: string }[] = [
  { id: 'love', label: 'ความรัก', emoji: '💗', hint: 'คู่ครอง เนื้อคู่ ความสัมพันธ์' },
  { id: 'study', label: 'การเรียน', emoji: '📚', hint: 'สอบ เกรด การศึกษาต่อ' },
  { id: 'work', label: 'การงาน', emoji: '💼', hint: 'อาชีพ หัวหน้า เพื่อนร่วมงาน' },
  { id: 'money', label: 'การเงิน', emoji: '💰', hint: 'โชคลาภ รายรับ รายจ่าย' },
];

export const LEVEL_STYLE: Record<Level, { color: string; stars: number }> = {
  ดีเลิศ: { color: '#B8860B', stars: 5 },
  ดีมาก: { color: '#C8372D', stars: 4 },
  ดี: { color: '#2E7D32', stars: 3 },
  พอใช้: { color: '#8D6E63', stars: 2 },
  ควรระวัง: { color: '#5D4037', stars: 1 },
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
