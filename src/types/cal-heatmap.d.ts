declare module 'cal-heatmap' {
  interface CalHeatmapOptions {
    itemSelector?: HTMLElement | null;
    data?: {
      source: Record<string, number>;
      type: string;
      x: string;
      y: string;
    };
    date?: {
      start: Date;
      locale?: { weekStart: number };
    };
    range?: number;
    scale?: {
      color?: {
        type: string;
        range: string[];
        domain: number[];
      };
    };
    domain?: {
      type: string;
      gutter: number;
      label?: {
        text: string;
        textAlign: string;
        position: string;
      };
    };
    subDomain?: {
      type: string;
      gutter: number;
      width: number;
      height: number;
      radius: number;
    };
    tooltip?: {
      text: (date: Date, value: number) => string;
    };
  }

  export default class CalHeatmap {
    paint(options: CalHeatmapOptions): void;
    destroy(): void;
  }
}

declare module 'cal-heatmap/cal-heatmap.css';