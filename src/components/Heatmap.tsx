'use client';

import { useEffect, useState } from 'react';
import { type DayEntry } from '@/lib/storage';

interface HeatmapProps {
  entries: DayEntry[];
}

// Generate all days for the current year
const generateYearDays = (year: number) => {
  const days = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Start from the Sunday before the first day of the year
  const firstSunday = new Date(startDate);
  firstSunday.setDate(startDate.getDate() - startDate.getDay());
  
  // End at the Saturday after the last day of the year
  const lastSaturday = new Date(endDate);
  lastSaturday.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const current = new Date(firstSunday);
  while (current <= lastSaturday) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

const getIntensity = (date: Date, entries: DayEntry[]): number => {
  const dateStr = date.toISOString().split('T')[0];
  return entries.some(entry => entry.date === dateStr) ? 1 : 0;
};

const getIntensityColor = (intensity: number): string => {
  switch (intensity) {
    case 0: return '#ebedf0';
    case 1: return '#c6e48b';
    default: return '#ebedf0';
  }
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Heatmap({ entries }: HeatmapProps) {
  const [yearDays, setYearDays] = useState<Date[]>([]);
  const [tooltipData, setTooltipData] = useState<{ date: Date; word?: string; visible: boolean; x: number; y: number }>({
    date: new Date(),
    visible: false,
    x: 0,
    y: 0
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYearDays(generateYearDays(currentYear));
  }, []);

  const handleMouseEnter = (date: Date, event: React.MouseEvent) => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    const rect = event.currentTarget.getBoundingClientRect();
    
    setTooltipData({
      date,
      word: entry?.word,
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltipData(prev => ({ ...prev, visible: false }));
  };

  // Group days by weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < yearDays.length; i += 7) {
    weeks.push(yearDays.slice(i, i + 7));
  }

  // Get month labels positioned above their corresponding weeks
  const getMonthLabels = () => {
    const labels: { month: string; colIndex: number }[] = [];
    const currentYear = new Date().getFullYear();
    
    months.forEach((month, monthIndex) => {
      const firstDayOfMonth = new Date(currentYear, monthIndex, 1);
      
      // Find which week this month starts in
      let weekIndex = 0;
      for (let i = 0; i < weeks.length; i++) {
        const weekStart = weeks[i][0];
        const weekEnd = weeks[i][6];
        
        if (firstDayOfMonth >= weekStart && firstDayOfMonth <= weekEnd) {
          weekIndex = i;
          break;
        }
        
        // If first day is after this week, continue
        if (firstDayOfMonth > weekEnd) {
          weekIndex = i + 1;
        }
      }
      
      // Only add if the month actually starts in a visible week and avoid duplicates
      if (weekIndex < weeks.length && weekIndex >= 0) {
        const existingLabel = labels.find(l => l.colIndex === weekIndex);
        if (!existingLabel) {
          labels.push({ month, colIndex: weekIndex });
        }
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="w-full mb-8">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Your Year at a Glance
        </h2>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="relative flex mb-2 ml-8" style={{ height: '16px' }}>
              {monthLabels.map(({ month, colIndex }) => (
                <div
                  key={month}
                  className="absolute text-xs text-gray-600 font-medium"
                  style={{
                    left: `${colIndex * 16}px`, // 16px = 12px square + 4px gap
                    top: 0,
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
            
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-2">
                {days.map((day, index) => (
                  <div key={day} className="h-3 mb-1 flex items-center">
                    {index % 2 === 1 && (
                      <span className="text-xs text-gray-500 w-6 text-right pr-1">
                        {day}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((date, dayIndex) => {
                      const intensity = getIntensity(date, entries);
                      const isCurrentYear = date.getFullYear() === new Date().getFullYear();
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-gray-400"
                          style={{
                            backgroundColor: isCurrentYear ? getIntensityColor(intensity) : '#f6f8fa',
                            opacity: isCurrentYear ? 1 : 0.6
                          }}
                          onMouseEnter={(e) => handleMouseEnter(date, e)}
                          onMouseLeave={handleMouseLeave}
                          title={`${date.toLocaleDateString()} - ${entries.find(e => e.date === date.toISOString().split('T')[0])?.word || 'No entry'}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>
      
      {/* Tooltip */}
      {tooltipData.visible && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-2 py-1 rounded text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
          }}
        >
          {tooltipData.date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
          {tooltipData.word && ` — ${tooltipData.word}`}
          {!tooltipData.word && ' — No entry'}
        </div>
      )}
    </div>
  );
}