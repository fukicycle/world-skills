import { useState, type ReactNode } from 'react';
import ChartTooltip from './ChartTooltip';
import { formatNumber, labelStride, niceTicks, roundedTopRect, useElementWidth, type Category } from './chartUtils';

export interface ColumnSeries {
  key: string;
  label: string;
  color: string;
}

interface Props {
  categories: Category[];
  series: ColumnSeries[];     // bottom to top
  values: number[][];         // values[categoryIndex][seriesIndex]
  totalLabel: string;
  height?: number;
  tooltipFooter?: (categoryIndex: number) => ReactNode;
  ariaLabel: string;
}

const MARGIN = { top: 24, right: 8, bottom: 28, left: 36 };
const GAP = 2;

export default function StackedColumnChart({ categories, series, values, totalLabel, height = 280, tooltipFooter, ariaLabel }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const totals = values.map(v => v.reduce((a, b) => a + b, 0));
  const ticks = niceTicks(Math.max(...totals, 1));
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;

  const band = categories.length > 0 ? plotW / categories.length : 0;
  const barW = Math.min(24, band * 0.6);
  const compact = band < 34;
  const stride = labelStride(band, compact ? 26 : 40);
  const lastIndex = categories.length - 1;

  return (
    <div className="chart" ref={ref} onPointerLeave={() => setActive(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map(t => (
            <g key={t}>
              <line className="chart-grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} />
              <text className="chart-tick" x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{formatNumber(t)}</text>
            </g>
          ))}
          <line className="chart-baseline" x1={MARGIN.left} x2={width - MARGIN.right} y1={y(0)} y2={y(0)} />

          {categories.map((cat, i) => {
            const cx = MARGIN.left + band * i + band / 2;
            const x = cx - barW / 2;
            let acc = 0;
            const visible = values[i].map((v, s) => ({ v, s })).filter(d => d.v > 0);
            const topSeries = visible[visible.length - 1]?.s;
            return (
              <g key={cat.key} className={active === i ? 'chart-col active' : 'chart-col'}>
                {visible.map(({ v, s }) => {
                  const y0 = y(acc);
                  acc += v;
                  const y1 = y(acc);
                  // 2px surface gap above each segment except the topmost
                  const h = Math.max(0, y0 - y1 - (s === topSeries ? 0 : GAP));
                  const top = s === topSeries ? y1 : y1 + GAP;
                  return s === topSeries
                    ? <path key={s} d={roundedTopRect(x, top, barW, h, 4)} fill={series[s].color} />
                    : <rect key={s} x={x} y={top} width={barW} height={h} fill={series[s].color} />;
                })}
                {(i === lastIndex || i === active) && (
                  <text className="chart-value" x={cx} y={y(totals[i]) - 6} textAnchor="middle">{formatNumber(totals[i])}</text>
                )}
                {(i % stride === 0 || i === lastIndex) && (i === lastIndex || lastIndex - i >= stride) && (
                  <text className="chart-tick" x={cx} y={height - MARGIN.bottom + 16} textAnchor="middle">
                    {compact ? cat.compactLabel : cat.label}
                  </text>
                )}
                {/* Hit target covers the whole band, not just the painted column */}
                <rect
                  className="chart-hit"
                  x={MARGIN.left + band * i}
                  y={MARGIN.top}
                  width={band}
                  height={plotH}
                  tabIndex={0}
                  aria-label={`${cat.title}: ${totalLabel} ${totals[i]}`}
                  onPointerMove={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
              </g>
            );
          })}
        </svg>
      )}
      {active !== null && (
        <ChartTooltip
          x={MARGIN.left + band * active + band / 2}
          containerWidth={width}
          title={categories[active].title}
          rows={[
            ...series.map((s, si) => ({ key: s.key, color: s.color, label: s.label, value: formatNumber(values[active][si]), shape: 'rect' as const })).reverse(),
            { key: 'total', color: 'transparent', label: totalLabel, value: formatNumber(totals[active]) },
          ]}
          footer={tooltipFooter?.(active)}
        />
      )}
    </div>
  );
}
