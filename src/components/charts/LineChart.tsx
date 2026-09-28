import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import ChartTooltip from './ChartTooltip';
import { formatNumber, labelStride, niceTicks, useElementWidth, type Category } from './chartUtils';

export interface LineSeries {
  key: string | number;
  label: string;
  color: string;
  values: (number | null)[]; // null = no data (gap in the line)
}

interface Props {
  categories: Category[];
  series: LineSeries[];
  invert?: boolean; // rank scales: 1 at the top
  height?: number;
  formatValue?: (v: number) => string;
  emptyValueLabel: string;
  ariaLabel: string;
}

const MARGIN = { top: 16, bottom: 28, left: 36 };
const LABEL_GAP = 14; // min vertical distance between end labels

// Rough text width so the right margin fits the end labels (CJK glyphs are wider)
const estimateTextWidth = (s: string) =>
  Array.from(s).reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 12 : 7), 0);

export default function LineChart({ categories, series, invert = false, height = 300, formatValue = formatNumber, emptyValueLabel, ariaLabel }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const showEndLabels = width >= 520;
  const rightMargin = showEndLabels
    ? Math.min(130, Math.max(...series.map(s => estimateTextWidth(s.label)), 0) + 20)
    : 12;
  const plotW = Math.max(0, width - MARGIN.left - rightMargin);
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const allValues = series.flatMap(s => s.values).filter((v): v is number => v !== null);
  const dataMax = Math.max(...allValues, invert ? 2 : 1);
  const ticks = invert
    ? niceTicks(dataMax).map(t => (t === 0 ? 1 : t))
    : niceTicks(dataMax);
  const yMin = invert ? 1 : 0;
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => {
    const t = (v - yMin) / (yMax - yMin || 1);
    return invert ? MARGIN.top + t * plotH : MARGIN.top + plotH - t * plotH;
  };

  const step = categories.length > 1 ? plotW / (categories.length - 1) : 0;
  const x = (i: number) => MARGIN.left + (categories.length > 1 ? step * i : plotW / 2);
  const compact = step < 34;
  const stride = labelStride(Math.max(step, 1), compact ? 26 : 40);
  const lastIndex = categories.length - 1;

  // Split each series into runs of consecutive values so gaps stay visible
  const runs = (values: (number | null)[]) => {
    const out: { i: number; v: number }[][] = [];
    let current: { i: number; v: number }[] = [];
    values.forEach((v, i) => {
      if (v === null) {
        if (current.length) out.push(current);
        current = [];
      } else {
        current.push({ i, v });
      }
    });
    if (current.length) out.push(current);
    return out;
  };

  // End labels at each series' last point, pushed apart when they collide
  const endLabels = series
    .map(s => {
      const last = s.values.reduce<number>((acc, v, i) => (v !== null ? i : acc), -1);
      return last < 0 ? null : { key: s.key, label: s.label, color: s.color, px: x(last), py: y(s.values[last]!), ly: y(s.values[last]!) };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null)
    .sort((a, b) => a.py - b.py);
  for (let i = 1; i < endLabels.length; i++) {
    endLabels[i].ly = Math.max(endLabels[i].ly, endLabels[i - 1].ly + LABEL_GAP);
  }
  const overflow = endLabels.length ? endLabels[endLabels.length - 1].ly - (height - MARGIN.bottom) : 0;
  if (overflow > 0) endLabels.forEach(l => { l.ly -= overflow; });

  const indexFromPointer = (e: PointerEvent<SVGRectElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - bounds.left;
    // The hit area starts half a step before the first point
    return Math.max(0, Math.min(lastIndex, Math.floor(px / (step || 1))));
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      setActive(prev => Math.max(0, Math.min(lastIndex, (prev ?? (delta > 0 ? -1 : lastIndex + 1)) + delta)));
    }
  };

  return (
    <div className="chart" ref={ref}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          {ticks.map(t => (
            <g key={t}>
              <line className="chart-grid" x1={MARGIN.left} x2={MARGIN.left + plotW} y1={y(t)} y2={y(t)} />
              <text className="chart-tick" x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{formatNumber(t)}</text>
            </g>
          ))}

          {categories.map((cat, i) => (i % stride === 0 || i === lastIndex) && (i === lastIndex || lastIndex - i >= stride) && (
            <text key={cat.key} className="chart-tick" x={x(i)} y={height - MARGIN.bottom + 18} textAnchor="middle">
              {compact ? cat.compactLabel : cat.label}
            </text>
          ))}

          {active !== null && (
            <line className="chart-crosshair" x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + plotH} />
          )}

          {series.map(s => (
            <g key={s.key}>
              {runs(s.values).map(run => run.length > 1 ? (
                <polyline
                  key={run[0].i}
                  className="chart-line"
                  points={run.map(p => `${x(p.i)},${y(p.v)}`).join(' ')}
                  stroke={s.color}
                />
              ) : (
                // An isolated point would be invisible as a line, so mark it
                <circle key={run[0].i} className="chart-dot" cx={x(run[0].i)} cy={y(run[0].v)} r={4} fill={s.color} />
              ))}
            </g>
          ))}

          {/* End markers, plus every series at the hovered position */}
          {series.map(s => s.values.map((v, i) => {
            if (v === null) return null;
            const isEnd = i === s.values.reduce<number>((acc, val, j) => (val !== null ? j : acc), -1);
            if (!isEnd && i !== active) return null;
            return <circle key={`${s.key}-${i}`} className="chart-dot" cx={x(i)} cy={y(v)} r={4} fill={s.color} />;
          }))}

          {showEndLabels && endLabels.map(l => (
            <g key={l.key}>
              {Math.abs(l.ly - l.py) > 2 && (
                <line className="chart-leader" x1={l.px + 6} y1={l.py} x2={l.px + 12} y2={l.ly} />
              )}
              <text className="chart-end-label" x={l.px + 14} y={l.ly} dy="0.32em">{l.label}</text>
            </g>
          ))}

          <rect
            className="chart-hit"
            x={MARGIN.left - step / 2}
            y={MARGIN.top}
            width={plotW + step}
            height={plotH}
            onPointerMove={e => setActive(indexFromPointer(e))}
            onPointerDown={e => setActive(indexFromPointer(e))}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      )}
      {active !== null && (
        <ChartTooltip
          x={x(active)}
          containerWidth={width}
          title={categories[active].title}
          rows={series
            .map(s => ({ s, v: s.values[active] }))
            .sort((a, b) => {
              if (a.v === null) return 1;
              if (b.v === null) return -1;
              return invert ? a.v - b.v : b.v - a.v;
            })
            .map(({ s, v }) => ({
              key: s.key,
              color: s.color,
              label: s.label,
              value: v === null ? emptyValueLabel : formatValue(v),
            }))}
        />
      )}
    </div>
  );
}
