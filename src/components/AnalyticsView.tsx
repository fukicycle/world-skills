import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildAnalytics, metricValue, POINTS, type Metric } from '../data/analytics';
import { countryName, eventLabel, eventShortLabel, type Event, type JoinedResult, type Lang } from '../data/worldskills';
import Heatmap from './charts/Heatmap';
import LineChart from './charts/LineChart';
import StackedColumnChart from './charts/StackedColumnChart';
import { formatNumber, type Category } from './charts/chartUtils';
import './AnalyticsView.css';

interface Props {
  events: Event[];
  history: Map<number, JoinedResult[]> | null;
  progress: { loaded: number; total: number };
}

// Categorical slots (validated for the dark surface); a country keeps its slot
// for as long as it stays selected.
const SERIES_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500'];
const MAX_SERIES = SERIES_COLORS.length;
const MEDAL_COLORS = { gold: '#d1a21f', silver: '#8d9ab4', bronze: '#b86a2b' };
const HEATMAP_ROWS = 15;
const TABLE_PREVIEW_ROWS = 20;
const METRICS: Metric[] = ['gold', 'medals', 'points', 'rank'];

export default function AnalyticsView({ events, history, progress }: Props) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language === 'en' ? 'en' : 'ja') as Lang;

  const data = useMemo(() => (history ? buildAnalytics(events, history) : null), [events, history]);

  const [metric, setMetric] = useState<Metric>('gold');
  // slots[i] = member id plotted with SERIES_COLORS[i]; null until the user edits it
  const [slots, setSlots] = useState<(number | null)[] | null>(null);
  const [tableEventId, setTableEventId] = useState<number | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!data || data.events.length === 0) {
    return (
      <main className="analytics-view">
        <div className="empty-state glass-panel analytics-loading">
          <div className="spinner" />
          <span>{t('loadingHistory', { loaded: progress.loaded, total: progress.total })}</span>
        </div>
      </main>
    );
  }

  const byAllTime = Array.from(data.allTime.values()).sort((a, b) => a.rank - b.rank);
  const japan = data.members.find(m => m.code === 'JP');
  const defaultSlots = [
    ...(japan ? [japan.id] : []),
    ...byAllTime.filter(r => r.member.id !== japan?.id).slice(0, MAX_SERIES - (japan ? 1 : 0)).map(r => r.member.id),
  ];
  const activeSlots = slots ?? defaultSlots;
  const memberById = new Map(data.members.map(m => [m.id, m]));
  const selected = activeSlots
    .map((id, slot) => (id === null ? null : { id, slot, member: memberById.get(id)! }))
    .filter((s): s is NonNullable<typeof s> => s !== null && s.member !== undefined);
  const colorOf = (id: number) => {
    const s = selected.find(x => x.id === id);
    return s ? SERIES_COLORS[s.slot] : undefined;
  };

  const addCountry = (id: number) => {
    if (selected.some(s => s.id === id)) return;
    const next = [...activeSlots];
    while (next.length < MAX_SERIES) next.push(null);
    const free = next.findIndex(v => v === null);
    if (free === -1) {
      setNotice(t('maxCountries', { count: MAX_SERIES }));
      return;
    }
    next[free] = id;
    setSlots(next);
    setNotice(null);
  };
  const removeCountry = (id: number) => {
    setSlots(activeSlots.map(v => (v === id ? null : v)));
    setNotice(null);
  };
  const toggleCountry = (id: number) => (selected.some(s => s.id === id) ? removeCountry(id) : addCountry(id));

  const categories: Category[] = data.events.map(ev => ({
    key: ev.id,
    label: eventShortLabel(ev),
    compactLabel: `'${eventShortLabel(ev).slice(2)}`,
    title: eventLabel(ev),
  }));
  const first = data.events[0];
  const last = data.events[data.events.length - 1];
  const metricLabel = (m: Metric) => t(`metric_${m}`);
  const formatMetric = (v: number) => (metric === 'rank' ? t('rankValue', { rank: v }) : formatNumber(v));

  // KPI tiles
  const totalGold = data.summaries.reduce((sum, s) => sum + s.gold, 0);
  const topAllTime = byAllTime[0];

  // Country trend series + heatmap rows
  const lineSeries = selected.map(s => ({
    key: s.id,
    label: countryName(s.member, lang),
    color: SERIES_COLORS[s.slot],
    values: data.events.map(ev => metricValue(data.stats.get(s.id)?.get(ev.id), metric)),
  }));
  const heatmapMembers = [
    ...byAllTime.slice(0, HEATMAP_ROWS).map(r => r.member),
    ...selected.filter(s => !byAllTime.slice(0, HEATMAP_ROWS).some(r => r.member.id === s.id)).map(s => s.member),
  ];
  const heatmapValues = heatmapMembers.map(m =>
    data.events.map(ev => metricValue(data.stats.get(m.id)?.get(ev.id), metric)),
  );
  const describeCell = (r: number, c: number) => {
    const m = heatmapMembers[r];
    const ev = data.events[c];
    const stat = data.stats.get(m.id)?.get(ev.id);
    const head = `${countryName(m, lang)} · ${eventLabel(ev)}`;
    if (!stat) return `${head} — ${t('didNotCompete')}`;
    return `${head} — ${t('cellDetail', { gold: stat.gold, silver: stat.silver, bronze: stat.bronze, excellence: stat.excellence, rank: stat.rank })}`;
  };
  const addable = data.members
    .filter(m => !selected.some(s => s.id === m.id))
    .sort((a, b) => countryName(a, lang).localeCompare(countryName(b, lang), lang));

  // Per-event medal table
  const tableEvent = data.events.find(ev => ev.id === tableEventId) ?? last;
  const table = data.tables.get(tableEvent.id) ?? [];
  const visibleRows = showAllRows ? table : table.slice(0, TABLE_PREVIEW_ROWS);

  return (
    <main className="analytics-view">
      <header className="analytics-intro">
        <h1>{t('analyticsTitle')}</h1>
        <p>{t('analyticsSource', { first: first.startDate.slice(0, 4), last: last.startDate.slice(0, 4), count: data.events.length })}</p>
      </header>

      <section className="kpi-row">
        <div className="kpi-tile glass-panel">
          <span className="kpi-label">{t('kpiEvents')}</span>
          <span className="kpi-value">{data.events.length}</span>
          <span className="kpi-sub">{first.startDate.slice(0, 4)}–{last.startDate.slice(0, 4)}</span>
        </div>
        <div className="kpi-tile glass-panel">
          <span className="kpi-label">{t('kpiMembers')}</span>
          <span className="kpi-value">{data.members.length}</span>
          <span className="kpi-sub">{t('kpiMembersSub', { count: data.summaries[data.summaries.length - 1].countries })}</span>
        </div>
        <div className="kpi-tile glass-panel">
          <span className="kpi-label">{t('kpiGold')}</span>
          <span className="kpi-value">{totalGold.toLocaleString()}</span>
          <span className="kpi-sub">{t('kpiGoldSub')}</span>
        </div>
        {topAllTime && (
          <div className="kpi-tile glass-panel">
            <span className="kpi-label">{t('kpiTop')}</span>
            <span className="kpi-value kpi-country">
              <img src={topAllTime.member.flag} alt="" />
              {countryName(topAllTime.member, lang)}
            </span>
            <span className="kpi-sub">{t('kpiTopSub', { gold: topAllTime.gold, medals: topAllTime.medals })}</span>
          </div>
        )}
      </section>

      {/* Medals per competition */}
      <section className="analytics-card glass-panel">
        <div className="analytics-card-head">
          <h2>{t('medalsPerEvent')}</h2>
          <p>{t('medalsPerEventDesc')}</p>
        </div>
        <div className="chart-legend">
          {(['gold', 'silver', 'bronze'] as const).map(k => (
            <span key={k} className="chart-legend-item">
              <span className="chart-key rect" style={{ background: MEDAL_COLORS[k] }} />
              {t(`medal${k.charAt(0).toUpperCase()}${k.slice(1)}`)}
            </span>
          ))}
        </div>
        <StackedColumnChart
          categories={categories}
          series={(['bronze', 'silver', 'gold'] as const).map(k => ({
            key: k,
            label: t(`medal${k.charAt(0).toUpperCase()}${k.slice(1)}`),
            color: MEDAL_COLORS[k],
          }))}
          values={data.summaries.map(s => [s.bronze, s.silver, s.gold])}
          totalLabel={t('totalMedals')}
          tooltipFooter={i => t('eventFooter', { countries: data.summaries[i].countries, skills: data.summaries[i].skills })}
          ariaLabel={t('medalsPerEvent')}
        />
        <details className="chart-table-toggle">
          <summary>{t('showTable')}</summary>
          <div className="analytics-table-scroll">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>{t('event')}</th>
                  <th>{t('medalGold')}</th>
                  <th>{t('medalSilver')}</th>
                  <th>{t('medalBronze')}</th>
                  <th>{t('medalExcellence')}</th>
                  <th>{t('countries')}</th>
                  <th>{t('medalCountries')}</th>
                  <th>{t('skillsCount')}</th>
                </tr>
              </thead>
              <tbody>
                {[...data.summaries].reverse().map(s => (
                  <tr key={s.event.id}>
                    <td>{eventLabel(s.event)}</td>
                    <td>{s.gold}</td>
                    <td>{s.silver}</td>
                    <td>{s.bronze}</td>
                    <td>{s.excellence}</td>
                    <td>{s.countries}</td>
                    <td>{s.medalCountries}</td>
                    <td>{s.skills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {/* Participation vs. medal spread */}
      <section className="analytics-card glass-panel">
        <div className="analytics-card-head">
          <h2>{t('spreadTitle')}</h2>
          <p>{t('spreadDesc')}</p>
        </div>
        <div className="chart-legend">
          <span className="chart-legend-item"><span className="chart-key line" style={{ background: SERIES_COLORS[0] }} />{t('countries')}</span>
          <span className="chart-legend-item"><span className="chart-key line" style={{ background: SERIES_COLORS[1] }} />{t('medalCountries')}</span>
        </div>
        <LineChart
          categories={categories}
          series={[
            { key: 'countries', label: t('countries'), color: SERIES_COLORS[0], values: data.summaries.map(s => s.countries) },
            { key: 'medalCountries', label: t('medalCountries'), color: SERIES_COLORS[1], values: data.summaries.map(s => s.medalCountries) },
          ]}
          height={240}
          emptyValueLabel="–"
          ariaLabel={t('spreadTitle')}
        />
      </section>

      {/* Country trends */}
      <section className="analytics-card glass-panel">
        <div className="analytics-card-head">
          <h2>{t('countryTrendTitle')}</h2>
          <p>{t('countryTrendDesc')}</p>
        </div>

        <div className="analytics-controls">
          <div className="segment-control" role="radiogroup" aria-label={t('metric')}>
            {METRICS.map(m => (
              <button
                key={m}
                role="radio"
                aria-checked={metric === m}
                className={`segment-btn ${metric === m ? 'active' : ''}`}
                onClick={() => setMetric(m)}
              >
                {metricLabel(m)}
              </button>
            ))}
          </div>
          <select
            className="analytics-select"
            value=""
            onChange={e => e.target.value && addCountry(Number(e.target.value))}
            disabled={selected.length >= MAX_SERIES}
            aria-label={t('addCountry')}
          >
            <option value="">{selected.length >= MAX_SERIES ? t('maxCountries', { count: MAX_SERIES }) : t('addCountry')}</option>
            {addable.map(m => (
              <option key={m.id} value={m.id}>{countryName(m, lang)}</option>
            ))}
          </select>
        </div>

        {/* Selected countries double as the legend */}
        <div className="country-chips">
          {selected.map(s => (
            <span key={s.id} className="country-chip">
              <span className="chart-key line" style={{ background: SERIES_COLORS[s.slot] }} />
              <img src={s.member.flag} alt="" />
              {countryName(s.member, lang)}
              <button type="button" onClick={() => removeCountry(s.id)} aria-label={t('remove', { name: countryName(s.member, lang) })}>×</button>
            </span>
          ))}
          {notice && <span className="analytics-notice">{notice}</span>}
        </div>

        {metric === 'points' && (
          <p className="analytics-footnote">{t('pointsNote', POINTS)}</p>
        )}

        {selected.length > 0 ? (
          <LineChart
            categories={categories}
            series={lineSeries}
            invert={metric === 'rank'}
            formatValue={formatMetric}
            emptyValueLabel={t('didNotCompete')}
            ariaLabel={`${t('countryTrendTitle')} (${metricLabel(metric)})`}
          />
        ) : (
          <div className="analytics-placeholder">{t('pickCountry')}</div>
        )}

        <h3 className="analytics-subhead">{t('heatmapTitle', { count: HEATMAP_ROWS, metric: metricLabel(metric) })}</h3>
        <Heatmap
          rows={heatmapMembers.map(m => ({ key: m.id, label: countryName(m, lang), flag: m.flag, seriesColor: colorOf(m.id) }))}
          columns={categories}
          values={heatmapValues}
          invert={metric === 'rank'}
          emptyLabel="–"
          describe={describeCell}
          hint={t('heatmapHint')}
          onRowClick={toggleCountry}
        />
      </section>

      {/* Medal table per event */}
      <section className="analytics-card glass-panel">
        <div className="analytics-card-head analytics-card-head-row">
          <div>
            <h2>{t('medalTableTitle')}</h2>
            <p>{t('medalTableDesc')}</p>
          </div>
          <select
            className="analytics-select"
            value={tableEvent.id}
            onChange={e => { setTableEventId(Number(e.target.value)); setShowAllRows(false); }}
            aria-label={t('event')}
          >
            {[...data.events].reverse().map(ev => (
              <option key={ev.id} value={ev.id}>{eventLabel(ev)}</option>
            ))}
          </select>
        </div>
        <div className="analytics-table-scroll">
          <table className="analytics-table medal-table">
            <thead>
              <tr>
                <th>{t('rank')}</th>
                <th className="col-country">{t('country')}</th>
                <th><span className="chart-key rect" style={{ background: MEDAL_COLORS.gold }} />{t('medalGold')}</th>
                <th><span className="chart-key rect" style={{ background: MEDAL_COLORS.silver }} />{t('medalSilver')}</th>
                <th><span className="chart-key rect" style={{ background: MEDAL_COLORS.bronze }} />{t('medalBronze')}</th>
                <th>{t('medalExcellence')}</th>
                <th>{t('metric_points')}</th>
                <th>{t('entries')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(row => (
                <tr key={row.member.id} className={row.member.code === 'JP' ? 'highlight' : ''}>
                  <td>{row.rank}</td>
                  <td className="col-country">
                    <img src={row.member.flag} alt="" />
                    {countryName(row.member, lang)}
                  </td>
                  <td>{row.gold || '–'}</td>
                  <td>{row.silver || '–'}</td>
                  <td>{row.bronze || '–'}</td>
                  <td>{row.excellence || '–'}</td>
                  <td>{formatNumber(row.points)}</td>
                  <td>{row.entries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {table.length > TABLE_PREVIEW_ROWS && (
          <button className="glass-btn analytics-more" onClick={() => setShowAllRows(v => !v)}>
            {showAllRows ? t('showLess') : t('showAll', { count: table.length })}
          </button>
        )}
      </section>
    </main>
  );
}
