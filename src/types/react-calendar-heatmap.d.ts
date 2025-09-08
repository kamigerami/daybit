declare module 'react-calendar-heatmap' {
  import { ComponentType } from 'react';

  export interface HeatmapValue {
    date: string;
    count: number;
    word?: string;
    [key: string]: unknown;
  }

  export interface CalendarHeatmapProps {
    startDate: Date;
    endDate: Date;
    values: HeatmapValue[];
    classForValue?: (value: HeatmapValue | null) => string;
    titleForValue?: (value: HeatmapValue | null) => string | null;
    showMonthLabels?: boolean;
    showWeekdayLabels?: string[] | boolean;
    horizontal?: boolean;
    onMouseOver?: (event: React.MouseEvent, value: HeatmapValue | null) => void;
    onMouseLeave?: (event: React.MouseEvent, value: HeatmapValue | null) => void;
    onClick?: (value: HeatmapValue | null) => void;
  }

  const CalendarHeatmap: ComponentType<CalendarHeatmapProps>;
  export default CalendarHeatmap;
}