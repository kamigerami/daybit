'use client';

import { formatDisplayDate, type DayEntry } from '@/lib/storage';

interface RecentWordsProps {
  entries: DayEntry[];
}

export default function RecentWords({ entries }: RecentWordsProps) {
  const recentEntries = entries.slice(0, 7);

  if (recentEntries.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Recent Words
          </h2>
          <div className="text-center text-gray-500">
            <p className="mb-2">No entries yet!</p>
            <p className="text-sm">Start by logging your first word above.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Recent Words
        </h2>
        <div className="space-y-3">
          {recentEntries.map((entry, index) => (
            <div 
              key={entry.date}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index === 0 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {index === 0 ? '📅' : '📝'}
                </span>
                <div>
                  <div className="text-sm text-gray-600">
                    {formatDisplayDate(entry.date)}
                    {index === 0 && (
                      <span className="ml-2 text-green-600 font-medium">Today</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="font-semibold text-gray-800 text-lg">
                {entry.word}
              </div>
            </div>
          ))}
        </div>
        
        {entries.length > 7 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing last 7 entries • {entries.length} total
          </div>
        )}
      </div>
    </div>
  );
}