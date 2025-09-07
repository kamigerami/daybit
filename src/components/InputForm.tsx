'use client';

import React, { useState } from 'react';
import { Storage, formatDate, type DayEntry } from '@/lib/storage';
import toast from 'react-hot-toast';

interface InputFormProps {
  onEntryAdded: () => void;
}

export default function InputForm({ onEntryAdded }: InputFormProps) {
  const [word, setWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidWord = (input: string): boolean => {
    // Single non-space string, max 20 chars
    const regex = /^[^\s]+$/;
    return regex.test(input.trim()) && input.trim().length <= 20 && input.trim().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidWord(word)) {
      toast.error('Please enter a single word (no spaces, max 20 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const today = formatDate(new Date());
      const entry: DayEntry = {
        date: today,
        word: word.trim()
      };

      const existingEntry = Storage.getTodaysEntry();
      
      Storage.save(entry);
      
      if (existingEntry) {
        toast.success(`Updated today's word: ${word}`, {
          duration: 3000,
          icon: '✏️'
        });
      } else {
        toast.success(`Logged: ${word}`, {
          duration: 3000,
          icon: '✨'
        });
      }
      
      setWord('');
      handleEntryUpdate();
    } catch {
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's entry inside component render to ensure fresh data
  const [todaysEntry, setTodaysEntry] = useState<DayEntry | null>(null);
  const [hasEntryToday, setHasEntryToday] = useState(false);

  // Update today's entry when component mounts or when an entry is added
  React.useEffect(() => {
    const entry = Storage.getTodaysEntry();
    setTodaysEntry(entry);
    setHasEntryToday(entry !== null);
  }, []);

  // Update after entry is added
  const handleEntryUpdate = () => {
    const entry = Storage.getTodaysEntry();
    setTodaysEntry(entry);
    setHasEntryToday(entry !== null);
    onEntryAdded();
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={hasEntryToday && todaysEntry ? `Today: "${todaysEntry.word}"` : "How's your day?"}
            className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-center text-gray-800 placeholder-gray-400"
            maxLength={20}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="absolute right-3 top-3 text-sm text-gray-400">
            {word.length}/20
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!isValidWord(word) || isSubmitting}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
        >
          {isSubmitting ? 'Saving...' : hasEntryToday ? 'Update Today' : 'Log Word'}
        </button>
        
        {hasEntryToday && (
          <p className="text-sm text-gray-500 text-center">
            You can update today&apos;s word anytime
          </p>
        )}
      </form>
    </div>
  );
}