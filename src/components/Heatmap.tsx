'use client';

import { useEffect, useState } from 'react';
import { type DayEntry } from '@/lib/storage';

interface HeatmapProps {
  entries: DayEntry[];
}

// Generate days for the last 12 months (like GitHub)
const generateLast12Months = () => {
  const days = [];
  const today = new Date();
  
  // Start from exactly 365 days ago (like GitHub)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364); // 365 days total including today
  
  // End today
  const endDate = new Date(today);
  
  // Start from the Sunday before the start date to align weeks properly
  const firstSunday = new Date(startDate);
  firstSunday.setDate(startDate.getDate() - startDate.getDay());
  
  // End at the Saturday after today to complete the week
  const lastSaturday = new Date(endDate);
  lastSaturday.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const current = new Date(firstSunday);
  while (current <= lastSaturday) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

const calculateStreak = (date: Date, entries: DayEntry[]): number => {
  const dateStr = date.toISOString().split('T')[0];
  const currentEntry = entries.find(e => e.date === dateStr);
  if (!currentEntry) return 0;

  let streak = 1;
  
  // Count consecutive days backwards from current date
  for (let i = 1; i < 365; i++) { // Limit to prevent infinite loops
    const checkDate = new Date(date);
    checkDate.setDate(date.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    const hasEntry = entries.some(e => e.date === checkDateStr);
    
    if (hasEntry) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const getIntensity = (date: Date, entries: DayEntry[]): number => {
  const dateStr = date.toISOString().split('T')[0];
  const entry = entries.find(e => e.date === dateStr);
  if (!entry) return 0;
  
  // Calculate consecutive days streak up to this date
  const streak = calculateStreak(date, entries);
  if (streak === 1) return 1;       // First day
  if (streak <= 3) return 2;        // Short streak (2-3 days)
  if (streak <= 7) return 3;        // Week streak (4-7 days)
  return 4;                         // Long streak (8+ days)
};

const getIntensityColor = (intensity: number): string => {
  switch (intensity) {
    case 0: return '#ebedf0';  // No entry - gray
    case 1: return '#9be9a8';  // 1 day - light green
    case 2: return '#40c463';  // 2-3 days - medium light green
    case 3: return '#30a14e';  // 4-7 days - medium dark green
    case 4: return '#216e39';  // 8+ days - dark green
    default: return '#ebedf0';
  }
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Heatmap({ entries }: HeatmapProps) {
  const [yearDays, setYearDays] = useState<Date[]>([]);
  const [tooltipData, setTooltipData] = useState<{ date: Date; word?: string; streak?: number; visible: boolean; x: number; y: number }>({
    date: new Date(),
    visible: false,
    streak: undefined,
    x: 0,
    y: 0
  });

  useEffect(() => {
    setYearDays(generateLast12Months());
  }, []);

  const handleMouseEnter = (date: Date, event: React.MouseEvent) => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    const streak = entry ? calculateStreak(date, entries) : 0;
    const rect = event.currentTarget.getBoundingClientRect();
    
    setTooltipData({
      date,
      word: entry?.word,
      streak,
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

  // Get month labels positioned above their corresponding weeks (GitHub style)
  const getMonthLabels = () => {
    const labels: { month: string; colIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      // Find the first day of the week that represents a new month
      for (const day of week) {
        const currentMonth = day.getMonth();
        
        // If this is a new month and it's the first week of that month (day <= 7)
        if (currentMonth !== lastMonth && day.getDate() <= 7) {
          const monthName = months[currentMonth];
          
          // Only add if we have enough space (at least 2 weeks from last label)
          const lastLabel = labels[labels.length - 1];
          if (!lastLabel || weekIndex - lastLabel.colIndex >= 2) {
            labels.push({ 
              month: monthName, 
              colIndex: weekIndex 
            });
            lastMonth = currentMonth;
            break;
          }
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
        
        <div className="overflow-x-auto pb-2">
          <div className="flex justify-center">
            <div className="inline-block" style={{ minWidth: '650px' }}>
            {/* Month labels */}
            <div className="relative flex mb-3 ml-4 md:ml-6 lg:ml-8">
              {monthLabels.map(({ month, colIndex }) => (
                <div
                  key={`${month}-${colIndex}`}
                  className="absolute text-xs md:text-sm lg:text-base text-gray-600 font-medium"
                  style={{
                    left: `${colIndex * 15}px`, // Adjusted empirical spacing for better alignment
                    top: 0,
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
            
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-1 md:mr-2 lg:mr-3">
                {days.map((day, index) => (
                  <div key={day} className="h-2 md:h-3 lg:h-3.5 mb-px md:mb-0.5 lg:mb-1 flex items-center">
                    {(index === 0 || index === 2 || index === 4 || index === 6) && (
                      <span className="text-xs md:text-sm text-gray-500 w-4 md:w-6 lg:w-8 text-right pr-1">
                        {day}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              <div className="flex gap-px md:gap-0.5 lg:gap-1">
                {weeks.map((week, weekIndex) => {
                  // Add extra spacing after weeks that end a month
                  const isMonthEnd = week.some(date => {
                    const nextWeek = weeks[weekIndex + 1];
                    if (!nextWeek) return false;
                    return date.getMonth() !== nextWeek[0].getMonth();
                  });
                  
                  return (
                    <div key={weekIndex} className={`flex flex-col gap-px md:gap-0.5 lg:gap-1 ${isMonthEnd ? 'mr-px md:mr-1 lg:mr-1.5' : ''}`}>
                      {week.map((date, dayIndex) => {
                        const intensity = getIntensity(date, entries);
                        const today = new Date();
                        const isToday = date.toDateString() === today.toDateString();
                        
                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-sm cursor-pointer transition-all duration-200 hover:ring-1 md:hover:ring-2 hover:ring-gray-400 ${
                              isToday ? 'ring-1 md:ring-2 ring-blue-400' : ''
                            }`}
                            style={{
                              backgroundColor: getIntensityColor(intensity),
                            }}
                            onMouseEnter={(e) => handleMouseEnter(date, e)}
                            onMouseLeave={handleMouseLeave}
                            title={`${date.toLocaleDateString()} - ${entries.find(e => e.date === date.toISOString().split('T')[0])?.word || 'No entry'}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-between items-center mt-4 md:mt-6 lg:mt-8 text-xs md:text-sm lg:text-base text-gray-500">
          <span>Less</span>
          <div className="flex gap-1 md:gap-1.5 lg:gap-2 items-center">
            <div 
              className="w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-sm" 
              style={{ backgroundColor: '#ebedf0' }}
              title="No entries"
            ></div>
            <div 
              className="w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-sm" 
              style={{ backgroundColor: '#9be9a8' }}
              title="1 day streak"
            ></div>
            <div 
              className="w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-sm" 
              style={{ backgroundColor: '#40c463' }}
              title="2-3 day streak"
            ></div>
            <div 
              className="w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-sm" 
              style={{ backgroundColor: '#30a14e' }}
              title="4-7 day streak"
            ></div>
            <div 
              className="w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-sm" 
              style={{ backgroundColor: '#216e39' }}
              title="8+ day streak"
            ></div>
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
          {tooltipData.word && (
            <>
              <br />
              <span className="font-medium">{tooltipData.word}</span>
              {tooltipData.streak && tooltipData.streak > 1 && (
                <span className="text-green-300"> • {tooltipData.streak} day streak</span>
              )}
            </>
          )}
          {!tooltipData.word && (
            <>
              <br />
              <span className="text-gray-300">No entry</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}