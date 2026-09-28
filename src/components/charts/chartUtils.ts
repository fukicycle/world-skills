import { useLayoutEffect, useRef, useState } from 'react';

export interface Category {
  key: string | number;
  label: string;        // axis label, e.g. "2024"
  compactLabel: string; // used when the axis is narrow, e.g. "'24"
  title: string;        // tooltip heading, e.g. "Lyon 2024"
}

// Tracks the rendered width of an element so SVG charts can lay out in pixels.
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

// Round tick values (steps of 1, 2 or 5 × 10^n) from 0 to at least `max`.
export function niceTicks(max: number, target = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map(m => m * magnitude).find(s => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = 0; v < max + step; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

// Show every n-th x label so they never overlap; the last label is always kept.
export function labelStride(bandWidth: number, labelWidth: number): number {
  return Math.max(1, Math.ceil(labelWidth / bandWidth));
}

// Rect whose top corners are rounded (the data end); the baseline stays square.
export function roundedTopRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export const formatNumber = (v: number) =>
  Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 1 });
