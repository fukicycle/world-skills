import { useState } from 'react';
import { formatNumber, type Category } from './chartUtils';

export interface HeatmapRow {
  key: number;
  label: string;
  flag: string;
  seriesColor?: string; // set when the row is also plotted in the line chart
}

interface Props {
  rows: HeatmapRow[];
  columns: Category[];
  values: (number | null)[][]; // values[row][column]
  invert?: boolean;            // rank scales: lower is better
  emptyLabel: string;
  describe: (row: number, column: number) => string;
  hint: string;
  onRowClick?: (key: number) => void;
}

// Sequential blue ramp stepped for the dark surface (low -> high)
const RAMP = ['#104281', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#6da7ec', '#86b6ef'];
const DARK_TEXT_FROM = 5; // ramp index from which dark ink is more legible
const RANK_FLOOR = 30;    // ranks beyond this all share the faintest step

export default function Heatmap({ rows, columns, values, invert = false, emptyLabel, describe, hint, onRowClick }: Props) {
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);

  const max = Math.max(1, ...values.flat().filter((v): v is number => v !== null));
  const intensity = (v: number) => {
    if (invert) {
      const worst = Math.min(max, RANK_FLOOR);
      return worst <= 1 ? 1 : 1 - (Math.min(v, worst) - 1) / (worst - 1);
    }
    return v / max;
  };

  return (
    <div className="heatmap">
      <div className="heatmap-readout" aria-live="polite">
        {active ? describe(active.r, active.c) : hint}
      </div>
      <div className="heatmap-scroll">
        <div
          className="heatmap-grid"
          style={{ gridTemplateColumns: `var(--heatmap-label-width) repeat(${columns.length}, minmax(2.25rem, 1fr))` }}
          onPointerLeave={() => setActive(null)}
        >
          <div className="heatmap-corner" />
          {columns.map(col => (
            <div key={col.key} className="heatmap-col-label" title={col.title}>{col.compactLabel}</div>
          ))}

          {rows.map((row, r) => (
            <div className="heatmap-row" key={row.key} style={{ display: 'contents' }}>
              <button
                type="button"
                className={`heatmap-row-label ${row.seriesColor ? 'selected' : ''}`}
                onClick={() => onRowClick?.(row.key)}
              >
                <span className="chart-key line" style={{ background: row.seriesColor ?? 'transparent' }} />
                <img src={row.flag} alt="" />
                <span className="heatmap-row-name">{row.label}</span>
              </button>
              {columns.map((col, c) => {
                const v = values[r][c];
                const zero = v === 0 && !invert;
                const step = v === null || zero ? -1 : Math.round(intensity(v) * (RAMP.length - 1));
                const isActive = active?.r === r && active?.c === c;
                return (
                  <div
                    key={col.key}
                    className={`heatmap-cell ${v === null ? 'empty' : ''} ${zero ? 'zero' : ''} ${isActive ? 'active' : ''}`}
                    style={step >= 0 ? { background: RAMP[step], color: step >= DARK_TEXT_FROM ? '#0a0c10' : '#f3f4f6' } : undefined}
                    tabIndex={0}
                    aria-label={describe(r, c)}
                    onPointerEnter={() => setActive({ r, c })}
                    onFocus={() => setActive({ r, c })}
                    onBlur={() => setActive(null)}
                  >
                    {v === null ? emptyLabel : formatNumber(v)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
