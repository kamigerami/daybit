export interface DayEntry {
  date: string; // YYYY-MM-DD format
  word: string;
}

import { UserSession } from './userSession';

const getStorageKey = () => UserSession.getStorageKey();

export class Storage {
  static save(entry: DayEntry): void {
    const entries = this.getAll();
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    localStorage.setItem(getStorageKey(), JSON.stringify(entries));
  }
  
  static getAll(): DayEntry[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return [];
    
    try {
      const entries = JSON.parse(stored) as DayEntry[];
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  }
  
  static getEntry(date: string): DayEntry | null {
    const entries = this.getAll();
    return entries.find(e => e.date === date) || null;
  }
  
  static getRecent(limit: number = 7): DayEntry[] {
    return this.getAll().slice(0, limit);
  }
  
  static getTodaysEntry(): DayEntry | null {
    const today = new Date().toISOString().split('T')[0];
    return this.getEntry(today);
  }
  
  static clear(): void {
    localStorage.removeItem(getStorageKey());
  }
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};