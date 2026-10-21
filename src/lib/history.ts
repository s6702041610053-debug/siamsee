import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CategoryId } from './fortunes';

const KEY = 'siamsee:history:v1';
const MAX_ENTRIES = 200;

export type HistoryEntry = {
  id: string;
  number: number;
  category: CategoryId;
  at: number; // epoch ms
};

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export async function addHistory(number: number, category: CategoryId): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    number,
    category,
    at: Date.now(),
  };
  const list = await getHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify([entry, ...list].slice(0, MAX_ENTRIES)));
  return entry;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
