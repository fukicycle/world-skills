import type { ReactNode } from 'react';

export interface TooltipRow {
  key: string | number;
  color: string;
  label: string;
  value: string;
  shape?: 'line' | 'rect';
}

interface Props {
  x: number;              // anchor, px from the chart container's left edge
  containerWidth: number;
  title: string;
  rows: TooltipRow[];
  footer?: ReactNode;
}

const TOOLTIP_WIDTH = 200;

export default function ChartTooltip({ x, containerWidth, title, rows, footer }: Props) {
  // Prefer the right of the anchor; flip left when it would overflow
  const left = x + 16 + TOOLTIP_WIDTH <= containerWidth
    ? x + 16
    : Math.max(0, x - 16 - TOOLTIP_WIDTH);

  return (
    <div className="chart-tooltip" style={{ left, width: TOOLTIP_WIDTH }} role="status">
      <div className="chart-tooltip-title">{title}</div>
      {rows.map(row => (
        <div className="chart-tooltip-row" key={row.key}>
          <span className={`chart-key ${row.shape ?? 'line'}`} style={{ background: row.color }} />
          <span className="chart-tooltip-value">{row.value}</span>
          <span className="chart-tooltip-label">{row.label}</span>
        </div>
      ))}
      {footer && <div className="chart-tooltip-footer">{footer}</div>}
    </div>
  );
}
