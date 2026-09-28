import { lookupSkill, type SectorKey } from './skillCatalog';

export type Lang = 'en' | 'ja';
export type Medal = 'GOLD' | 'SILVER' | 'BRONZE' | 'EXCELLENCE' | 'NONE';

export interface Skill {
  id: number;
  baseId: number;
  number: string;
  type: string;
  sector: SectorKey;
  name: { en: string; ja: string };
}

export interface Member {
  id: number;
  code: string;
  name: string;
  flag: string;
}

export interface Event {
  id: number;
  name: string;
  code: string;
  host: string;
  startDate: string;
  endDate: string;
  closed: boolean;
}

export interface Competitor {
  personId: number | null;
  firstName: string;
  lastName: string;
  publicDisplayFullName: string;
  image: string;
}

export interface JoinedResult {
  id: number;
  eventId: number;
  skillId: number;
  memberId: number;
  position: number;
  mark: number;
  medal: Medal;
  competitors: Competitor[];
  albertVidalAward: boolean;
  bestOfNation: boolean;
  event: Event;
  skill: Skill;
  member: Member;
}

export const SECTOR_NAMES: Record<SectorKey, { en: string; ja: string }> = {
  IT: { en: 'Information & Communication Technology', ja: '情報通信技術（IT）' },
  Manufacturing: { en: 'Manufacturing & Engineering Technology', ja: '製造・工学技術' },
  Construction: { en: 'Construction & Building Technology', ja: '建設・建築技術' },
  Creative: { en: 'Creative Arts & Fashion', ja: 'クリエイティブ芸術・ファッション' },
  Services: { en: 'Social & Personal Services', ja: 'サービス業' },
  Transportation: { en: 'Transportation & Logistics', ja: '運輸・ロジスティクス' },
};

const API = 'https://api.worldskills.org';
const PAGE_SIZE = 1000;

// Used when the events endpoint is unreachable
export const STATIC_EVENTS: Event[] = [
  { id: 611, name: 'WorldSkills Shanghai 2026', code: 'WSC2026', host: 'Shanghai', startDate: '2026-09-23', endDate: '2026-09-28', closed: false },
  { id: 579, name: 'WorldSkills Lyon 2024', code: 'WSC2024', host: 'Lyon', startDate: '2024-09-11', endDate: '2024-09-14', closed: true },
  { id: 594, name: 'WorldSkills Competition 2022 Special Edition', code: 'WSC2022SE', host: '', startDate: '2022-10-20', endDate: '2022-11-27', closed: true },
  { id: 364, name: 'WorldSkills Kazan 2019', code: 'WSC2019', host: 'Kazan', startDate: '2019-08-23', endDate: '2019-08-27', closed: true },
];

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

// Member codes that are not ISO 3166 region codes, or whose WorldSkills name
// differs from the generic region name.
const MEMBER_NAME_OVERRIDES: Record<string, { en?: string; ja: string }> = {
  UK: { ja: 'イギリス' },
  TW: { ja: 'チャイニーズ・タイペイ' },
  HK: { ja: '香港（中国）' },
  MO: { ja: 'マカオ（中国）' },
  IT: { ja: '南チロル（イタリア）' },
};

const regionNamesJa = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
  ? new Intl.DisplayNames(['ja'], { type: 'region' })
  : null;

export function countryName(member: Pick<Member, 'code' | 'name'>, lang: Lang): string {
  const override = MEMBER_NAME_OVERRIDES[member.code];
  if (lang === 'en') return override?.en ?? member.name;
  if (override) return override.ja;
  try {
    const ja = regionNamesJa?.of(member.code);
    if (ja && ja !== member.code) return ja;
  } catch {
    // Not a valid region code
  }
  return member.name;
}

export function skillName(skill: Pick<Skill, 'name'>, lang: Lang): string {
  return skill.name[lang];
}

export function eventLabel(event: Pick<Event, 'name'>): string {
  return event.name.replace(/^WorldSkills (Competition )?/, '');
}

// Compact axis label, e.g. "2024" or "2022 SE"
export function eventShortLabel(event: Pick<Event, 'code'>): string {
  return event.code.replace(/^WSC/, '').replace(/SE$/, ' SE');
}

export function isPodium(medal: Medal): boolean {
  return medal === 'GOLD' || medal === 'SILVER' || medal === 'BRONZE';
}

// The API uses MFE (Medallion for Excellence), MFE2 (from 2026) and DIPLOMA
// (before 2005) for the same tier below bronze.
function normaliseMedal(code: string | undefined): Medal {
  if (code === 'GOLD' || code === 'SILVER' || code === 'BRONZE') return code;
  if (code && (code.startsWith('MFE') || code === 'DIPLOMA')) return 'EXCELLENCE';
  return 'NONE';
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

interface ApiEvent {
  id: number;
  name: string;
  type: string;
  code: string | null;
  town: string;
  start_date: string;
  end_date: string;
  closed: boolean;
  cancelled: boolean;
  country?: { name?: { text: string } } | null;
}

// WorldSkills Competitions (WSC) that have started, newest first. Events whose
// results are not published yet are dropped later by the caller.
export async function fetchEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API}/events?limit=200&sort=start_date_desc`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const today = new Date().toISOString().slice(0, 10);

    const events: Event[] = ((data.events || []) as ApiEvent[])
      .filter(ev => ev.type === 'competition' && ev.code?.startsWith('WSC') && !ev.cancelled && ev.start_date <= today)
      .map(ev => ({
        id: ev.id,
        name: ev.name,
        code: ev.code!,
        host: ev.town || ev.country?.name?.text || '',
        startDate: ev.start_date,
        endDate: ev.end_date,
        closed: ev.closed,
      }))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));

    return events.length > 0 ? events : STATIC_EVENTS;
  } catch (error) {
    console.error('Failed to fetch events, using static fallback:', error);
    return STATIC_EVENTS;
  }
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

interface ApiResult {
  id: number;
  competitors: {
    first_name: string;
    last_name: string;
    person_id: number | null;
    public_display_full_name: string;
    image?: { thumbnail: string } | null;
  }[];
  member: {
    id: number;
    code: string;
    name: { text: string };
    flag?: { thumbnail: string } | null;
  };
  medal?: { code: string } | null;
  mark: number;
  position: number;
  best_of_nation: boolean;
  albert_vidal_award: boolean;
  skill: {
    id: number;
    base_id: number;
    number: string;
    type: string;
    name: { text: string };
  };
}

function toJoinedResult(res: ApiResult, event: Event): JoinedResult {
  const competitors = (res.competitors || []).map(c => {
    const fullName = c.public_display_full_name || `${c.first_name} ${c.last_name}`.trim();
    return {
      personId: c.person_id ?? null,
      firstName: c.first_name || '',
      lastName: c.last_name || '',
      publicDisplayFullName: fullName,
      // Initials avatar for competitors without a photo
      image: c.image?.thumbnail || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundType=gradientLinear`,
    };
  });

  const names = lookupSkill(res.skill.name.text, res.skill.number);
  const flagCode = res.member.code === 'UK' ? 'GB' : res.member.code;

  return {
    id: res.id,
    eventId: event.id,
    skillId: res.skill.id,
    memberId: res.member.id,
    position: res.position,
    mark: res.mark,
    medal: normaliseMedal(res.medal?.code),
    competitors,
    albertVidalAward: res.albert_vidal_award || false,
    bestOfNation: res.best_of_nation || false,
    event,
    skill: {
      id: res.skill.id,
      baseId: res.skill.base_id,
      number: res.skill.number,
      type: res.skill.type,
      sector: names.sector,
      name: { en: names.en, ja: names.ja },
    },
    member: {
      id: res.member.id,
      code: res.member.code,
      name: res.member.name.text,
      flag: res.member.flag?.thumbnail || `https://flagsapi.com/${flagCode}/flat/64.png`,
    },
  };
}

// In-flight and completed requests, shared by every caller so each event is
// downloaded at most once per page load.
const resultsCache = new Map<number, Promise<JoinedResult[]>>();

async function downloadResults(event: Event): Promise<JoinedResult[]> {
  const all: ApiResult[] = [];
  let total = Infinity;
  while (all.length < total) {
    const response = await fetch(`${API}/results?event=${event.id}&limit=${PAGE_SIZE}&offset=${all.length}`);
    if (!response.ok) throw new Error(`HTTP ${response.status} for event ${event.id}`);
    const data = await response.json();
    const page = (data.results || []) as ApiResult[];
    total = data.total_count ?? page.length;
    if (page.length === 0) break;
    all.push(...page);
  }
  return all.map(res => toJoinedResult(res, event));
}

export function fetchResults(event: Event): Promise<JoinedResult[]> {
  const cached = resultsCache.get(event.id);
  if (cached) return cached;

  const request = downloadResults(event).catch(error => {
    console.error('API Fetch Error:', error);
    resultsCache.delete(event.id); // allow a retry on the next call
    return [] as JoinedResult[];
  });
  resultsCache.set(event.id, request);
  return request;
}

export async function fetchAllResults(
  events: Event[],
  onProgress?: (loaded: number) => void,
): Promise<Map<number, JoinedResult[]>> {
  let loaded = 0;
  const entries = await Promise.all(events.map(async ev => {
    const results = await fetchResults(ev);
    onProgress?.(++loaded);
    return [ev.id, results] as const;
  }));
  return new Map(entries);
}
