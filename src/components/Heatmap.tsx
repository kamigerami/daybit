'use client';

import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../styles/heatmap.css';
import { type DayEntry } from '@/lib/storage';
import { useState } from 'react';

interface HeatmapProps {
  entries: DayEntry[];
}

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

export default function Heatmap({ entries }: HeatmapProps) {
  const [tooltipData, setTooltipData] = useState<{ date: Date; word?: string; streak?: number; visible: boolean; x: number; y: number }>({
    date: new Date(),
    visible: false,
    streak: undefined,
    x: 0,
    y: 0
  });

  // Calculate start date (365 days ago)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364); // 365 days total including today

  // Convert entries to react-calendar-heatmap format
  const heatmapData = entries.map(entry => {
    const date = new Date(entry.date);
    const intensity = getIntensity(date, entries);
    
    return {
      date: entry.date, // Keep as YYYY-MM-DD format
      count: intensity,
      word: entry.word
    };
  });

  // Custom class function for colors
  const classForValue = (value: any) => {
    if (!value) {
      return 'color-empty';
    }
    return `color-scale-${value.count}`;
  };

  // Custom title function for tooltips
  const titleForValue = (value: any) => {
    // For react-calendar-heatmap, empty squares don't have a value but the library
    // handles this internally - we'll focus on valid values only
    if (!value || !value.date) {
      return null; // Let the library handle empty squares
    }
    
    const actualDate = new Date(value.date);
    // Validate the date
    if (isNaN(actualDate.getTime())) {
      return null;
    }
    
    const formattedDate = actualDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const entry = entries.find(e => e.date === value.date);
    
    if (!entry) {
      return `${formattedDate}\nNo entry`;
    }
    
    const streak = calculateStreak(actualDate, entries);
    return `${formattedDate}\n${entry.word}${streak > 1 ? ` • ${streak} day streak` : ''}`;
  };

  const handleMouseEnter = (event: React.MouseEvent, value: any) => {
    // For empty squares, react-calendar-heatmap passes null value
    // We need to calculate the date from the square's position
    if (!value || !value.date) {
      return; // Don't show tooltip for empty squares for now
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const actualDate = new Date(value.date);
    
    // Validate the date
    if (isNaN(actualDate.getTime())) {
      return;
    }
    
    const entry = entries.find(e => e.date === value.date);
    const streak = entry ? calculateStreak(actualDate, entries) : 0;
    
    setTooltipData({
      date: actualDate,
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

  return (
    <div className="w-full mb-8">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Your Year at a Glance
        </h2>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex justify-center">
            <div className="inline-block heatmap-container" style={{ minWidth: '650px' }}>
              <CalendarHeatmap
                startDate={startDate}
                endDate={today}
                values={heatmapData}
                classForValue={classForValue}
                titleForValue={titleForValue}
                showMonthLabels={true}
                showWeekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                horizontal={true}
                onMouseOver={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-between items-center mt-4 md:mt-6 lg:mt-8 text-xs md:text-sm lg:text-base text-gray-500">
          <span>Less</span>
          <div className="flex gap-1 md:gap-1.5 lg:gap-2 items-center">
            <div 
              className="w-3.5 h-3.5 rounded-sm" 
              style={{ backgroundColor: '#ebedf0' }}
              title="No entries"
            ></div>
            <div 
              className="w-3.5 h-3.5 rounded-sm" 
              style={{ backgroundColor: '#9be9a8' }}
              title="1 day streak"
            ></div>
            <div 
              className="w-3.5 h-3.5 rounded-sm" 
              style={{ backgroundColor: '#40c463' }}
              title="2-3 day streak"
            ></div>
            <div 
              className="w-3.5 h-3.5 rounded-sm" 
              style={{ backgroundColor: '#30a14e' }}
              title="4-7 day streak"
            ></div>
            <div 
              className="w-3.5 h-3.5 rounded-sm" 
              style={{ backgroundColor: '#216e39' }}
              title="8+ day streak"
            ></div>
          </div>
          <span>More</span>
        </div>
      </div>
      
      {/* Custom Tooltip */}
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