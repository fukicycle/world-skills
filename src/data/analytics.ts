import type { Event, JoinedResult, Member } from './worldskills';

export type Metric = 'gold' | 'medals' | 'points' | 'rank';

export interface MedalCount {
  gold: number;
  silver: number;
  bronze: number;
  excellence: number;
  entries: number;
}

export interface CountryEventStat extends MedalCount {
  member: Member;
  medals: number;
  points: number;
  rank: number; // gold-first medal ranking within the event; ties share a rank
}

export interface EventSummary extends MedalCount {
  event: Event;
  countries: number;
  medalCountries: number;
  skills: number;
}

// Points per result used by the "points" metric
export const POINTS = { gold: 3, silver: 2, bronze: 1, excellence: 0.5 };

const emptyCount = (): MedalCount => ({ gold: 0, silver: 0, bronze: 0, excellence: 0, entries: 0 });

function addResult(count: MedalCount, res: JoinedResult) {
  count.entries += 1;
  if (res.medal === 'GOLD') count.gold += 1;
  else if (res.medal === 'SILVER') count.silver += 1;
  else if (res.medal === 'BRONZE') count.bronze += 1;
  else if (res.medal === 'EXCELLENCE') count.excellence += 1;
}

const compareMedals = (a: MedalCount, b: MedalCount) =>
  b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.excellence - a.excellence;

// Medal table for one event, ordered gold-first (ties broken by silver, bronze,
// then excellence).
export function medalTable(results: JoinedResult[]): CountryEventStat[] {
  const byMember = new Map<number, { member: Member; count: MedalCount }>();
  for (const res of results) {
    let entry = byMember.get(res.memberId);
    if (!entry) {
      entry = { member: res.member, count: emptyCount() };
      byMember.set(res.memberId, entry);
    }
    addResult(entry.count, res);
  }

  const rows = Array.from(byMember.values())
    .map(({ member, count }) => ({
      ...count,
      member,
      medals: count.gold + count.silver + count.bronze,
      points: count.gold * POINTS.gold + count.silver * POINTS.silver + count.bronze * POINTS.bronze + count.excellence * POINTS.excellence,
      rank: 0,
    }))
    .sort((a, b) => compareMedals(a, b) || a.member.name.localeCompare(b.member.name));

  rows.forEach((row, i) => {
    const prev = rows[i - 1];
    row.rank = prev && compareMedals(prev, row) === 0 ? prev.rank : i + 1;
  });
  return rows;
}

export interface AnalyticsData {
  events: Event[]; // oldest first
  summaries: EventSummary[];
  tables: Map<number, CountryEventStat[]>; // by event id
  // stats[memberId][eventId]
  stats: Map<number, Map<number, CountryEventStat>>;
  members: Member[];
  allTime: Map<number, CountryEventStat>; // totals over every event (rank = all-time rank)
}

export function buildAnalytics(events: Event[], resultsByEvent: Map<number, JoinedResult[]>): AnalyticsData {
  const withResults = events
    .filter(ev => (resultsByEvent.get(ev.id)?.length ?? 0) > 0)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const tables = new Map<number, CountryEventStat[]>();
  const stats = new Map<number, Map<number, CountryEventStat>>();
  const members = new Map<number, Member>();

  const summaries = withResults.map(ev => {
    const results = resultsByEvent.get(ev.id)!;
    const table = medalTable(results);
    tables.set(ev.id, table);

    const total = emptyCount();
    results.forEach(res => addResult(total, res));
    for (const row of table) {
      members.set(row.member.id, row.member);
      if (!stats.has(row.member.id)) stats.set(row.member.id, new Map());
      stats.get(row.member.id)!.set(ev.id, row);
    }

    return {
      ...total,
      event: ev,
      countries: table.length,
      medalCountries: table.filter(r => r.medals > 0).length,
      skills: new Set(results.map(r => r.skillId)).size,
    };
  });

  const allTime = new Map<number, CountryEventStat>();
  medalTable(withResults.flatMap(ev => resultsByEvent.get(ev.id)!))
    .forEach(row => allTime.set(row.member.id, row));

  return {
    events: withResults,
    summaries,
    tables,
    stats,
    members: Array.from(members.values()),
    allTime,
  };
}

export function metricValue(stat: CountryEventStat | undefined, metric: Metric): number | null {
  if (!stat) return null; // did not compete
  return stat[metric];
}
