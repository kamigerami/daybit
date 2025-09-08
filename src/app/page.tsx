'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import InputForm from '@/components/InputForm';
import Heatmap from '@/components/Heatmap';
import RecentWords from '@/components/RecentWords';
import { Storage, type DayEntry } from '@/lib/storage';

export default function Home() {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEntries = () => {
    const allEntries = Storage.getAll();
    setEntries(allEntries);
  };

  useEffect(() => {
    // Load entries only on client side to avoid hydration issues
    loadEntries();
    setIsLoaded(true);
  }, []);

  // Prevent hydration mismatch by ensuring client-side only rendering
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DayBit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <Header />
        
        <div className="space-y-6 sm:space-y-8">
          {/* Top row - Input and Recent Words */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            <InputForm onEntryAdded={loadEntries} />
            <RecentWords entries={entries} />
          </div>
          
          {/* Bottom row - Full width Heatmap */}
          <div className="w-full">
            <Heatmap entries={entries} />
          </div>
        </div>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Built with ❤️ for daily reflection • {' '}
            <span className="text-green-600 font-semibold">
              {entries.length} words logged
            </span>
          </p>
        </footer>
      </div>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
          },
        }}
      />
    </div>
  );
}