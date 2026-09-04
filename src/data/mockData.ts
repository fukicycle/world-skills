export interface Skill {
  id: number;
  baseId: number;
  name: string;
  number: string;
  type: string;
  sector: string; // IT, Manufacturing, Construction, Creative, Services, Transportation
}

export interface Member {
  id: number;
  code: string;
  name: string;
  flag: string; // Will store the real country flag image URL from API
  org: string;
}

export interface Event {
  id: number;
  name: string;
  code: string;
  host: string;
  date: string;
  closed: boolean; // True if event has concluded
}

export interface Competitor {
  personId: number | null;
  firstName: string;
  lastName: string;
  publicDisplayFullName: string;
  image: string; // Real participant photo URL
}

export interface JoinedResult {
  id: number;
  eventId: number;
  skillId: number;
  memberId: number;
  position: number;
  mark: number;
  medal: 'GOLD' | 'SILVER' | 'BRONZE' | 'EXCELLENCE' | 'NONE';
  competitors: Competitor[];
  albertVidalAward: boolean;
  bestOfNation: boolean;
  event: Event;
  skill: Skill;
  member: Member;
  skillName: { en: string; ja: string };
  memberName: { en: string; ja: string };
}

// Full translated name mappings to keep UI premium & clean
export const SKILL_NAMES: Record<number, { en: string; ja: string }> = {
  17: { en: "Web Technologies", ja: "Webデザイン・開発" },
  4: { en: "Mechatronics", ja: "メカトロニクス" },
  53: { en: "Cloud Computing", ja: "クラウドコンピューティング" },
  40: { en: "Graphic Design Technology", ja: "グラフィックデザイン" },
  32: { en: "Cooking", ja: "西洋料理" },
  36: { en: "Car Painting", ja: "自動車板金塗装" },
  9: { en: "IT Software Solutions for Business", ja: "ITソフトウェア・ソリューションズ" },
  23: { en: "Mobile Robotics", ja: "モバイルロボティクス" },
  24: { en: "Cabinetmaking", ja: "家具" }
};

export const MEMBER_NAMES: Record<number, { en: string; ja: string }> = {
  14: { en: "Japan", ja: "日本" },
  18: { en: "Switzerland", ja: "スイス" },
  15: { en: "South Korea", ja: "韓国" },
  8: { en: "France", ja: "フランス" },
  13: { en: "Singapore", ja: "シンガポール" },
  27: { en: "Brazil", ja: "ブラジル" }
};

export const SECTOR_NAMES: Record<string, { en: string; ja: string }> = {
  IT: { en: "Information & Communication Technology", ja: "情報通信技術（IT）" },
  Manufacturing: { en: "Manufacturing & Engineering Technology", ja: "製造・工学技術" },
  Construction: { en: "Construction & Building Technology", ja: "建設・建築技術" },
  Creative: { en: "Creative Arts & Fashion", ja: "クリエイティブ芸術・ファッション" },
  Services: { en: "Social & Personal Services", ja: "サービス業" },
  Transportation: { en: "Transportation & Logistics", ja: "運輸・ロジスティクス" }
};

// Real static events used for safe fallback in case of API outages
export const STATIC_EVENTS: Event[] = [
  { id: 579, name: "WorldSkills Lyon 2024", code: "WSC2024", host: "Lyon, France", date: "2024-09-10 to 2024-09-15", closed: true },
  { id: 594, name: "WorldSkills Competition 2022 Special Edition", code: "WSC2022SE", host: "Global", date: "2022-09-07 to 2022-11-26", closed: true },
  { id: 364, name: "WorldSkills Kazan 2019", code: "WSC2019", host: "Kazan, Russia", date: "2019-08-22 to 2019-08-27", closed: true }
];

// Dynamically fetch and filter the major WorldSkills International Competitions
export async function fetchEvents(): Promise<Event[]> {
  try {
    const response = await fetch('https://api.worldskills.org/events?limit=150&sort=start_date_desc');
    if (!response.ok) {
      throw new Error("Failed to fetch events from API");
    }
    const data = await response.json();
    const rawEvents = data.events || [];
    
    // Filter strictly for major global WorldSkills competitions starting with WSC
    const filtered: Event[] = rawEvents
      .filter((ev: any) => ev.type === 'competition' && ev.code && ev.code.startsWith('WSC'))
      .map((ev: any) => ({
        id: ev.id,
        name: ev.name,
        code: ev.code,
        host: ev.town || ev.country?.name?.text || '',
        date: `${ev.start_date || ''} to ${ev.end_date || ''}`,
        closed: ev.closed || false
      }));
      
    return filtered.length > 0 ? filtered : STATIC_EVENTS;
  } catch (error) {
    console.error("Failed to fetch events, using static fallback:", error);
    return STATIC_EVENTS;
  }
}

// Helper to resolve Sector of WorldSkills trades based on official Skill Numbers
export function getSectorBySkillNumber(num: string): string {
  const cleanNum = num.replace(/^0+/, ''); // Remove leading zeros for easy comparison
  const n = parseInt(cleanNum, 10);
  if (isNaN(n)) return "Manufacturing";

  // IT
  if ([2, 9, 17, 39, 53, 54].includes(n)) return "IT";
  
  // Construction
  if ([12, 13, 15, 18, 20, 21, 22, 24, 25, 26, 58].includes(n)) return "Construction";
  
  // Creative
  if ([28, 31, 40, 44, 50].includes(n)) return "Creative";
  
  // Services
  if ([29, 30, 32, 35, 41, 47, 51, 56].includes(n)) return "Services";
  
  // Transportation
  if ([14, 33, 36, 49, 62].includes(n)) return "Transportation";
  
  // Manufacturing (Default fallback as it covers the most number of trades)
  return "Manufacturing";
}

// Dynamically generated members & skills registries from loaded real results
export let members: Member[] = [];
export let skills: Skill[] = [];

// Interface mapping the real response structure from api.worldskills.org
interface ApiResult {
  id: number;
  competitors: {
    first_name: string;
    last_name: string;
    person_id: number;
    public_display_full_name: string;
    image?: {
      thumbnail: string;
    } | null;
  }[];
  member: {
    id: number;
    code: string;
    name: {
      text: string;
    };
    flag?: {
      thumbnail: string;
    } | null;
  };
  medal?: {
    code: 'GOLD' | 'SILVER' | 'BRONZE' | 'EXCELLENCE' | 'NONE';
    name: {
      text: string;
    };
  } | null;
  mark: number;
  position: number;
  best_of_nation: boolean;
  albert_vidal_award: boolean;
  skill: {
    id: number;
    base_id: number;
    number: string;
    type: string;
    name: {
      text: string;
    };
    event: {
      id: number;
      name: string;
      code: string;
      start_date?: string;
      end_date?: string;
    };
  };
}

// Main API asynchronous fetch client
export async function fetchResults(eventId: number): Promise<JoinedResult[]> {
  try {
    const response = await fetch(`https://api.worldskills.org/results?event=${eventId}&limit=1000`);
    if (!response.ok) {
      throw new Error(`Failed to fetch results for event ${eventId}`);
    }
    const data = await response.json();
    const rawResults = (data.results || []) as ApiResult[];

    // Map raw snake_case API data cleanly to JoinedResult models
    const mapped: JoinedResult[] = rawResults.map(res => {
      const mappedCompetitors = (res.competitors || []).map(c => ({
        personId: c.person_id,
        firstName: c.first_name || '',
        lastName: c.last_name || '',
        publicDisplayFullName: c.public_display_full_name || `${c.first_name} ${c.last_name}`.trim(),
        // Fallback to high-quality abstract avatar generator if participant has no photo
        image: c.image?.thumbnail || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.public_display_full_name)}&backgroundType=gradientLinear`
      }));

      const sector = getSectorBySkillNumber(res.skill.number);
      const skillNameEn = res.skill.name.text;
      
      const skillObj: Skill = {
        id: res.skill.id,
        baseId: res.skill.base_id,
        name: skillNameEn,
        number: res.skill.number,
        type: res.skill.type,
        sector
      };

      const flagUrl = res.member.flag?.thumbnail || `https://flagsapi.com/${res.member.code}/flat/64.png`;
      const memberObj: Member = {
        id: res.member.id,
        code: res.member.code,
        name: res.member.name.text,
        flag: flagUrl,
        org: ''
      };

      const eventObj: Event = {
        id: res.skill.event.id,
        name: res.skill.event.name,
        code: res.skill.event.code,
        host: '',
        date: `${res.skill.event.start_date || ''} to ${res.skill.event.end_date || ''}`,
        closed: true
      };

      return {
        id: res.id,
        eventId: res.skill.event.id,
        skillId: res.skill.id,
        memberId: res.member.id,
        position: res.position,
        mark: res.mark,
        medal: res.medal?.code || 'NONE',
        competitors: mappedCompetitors,
        albertVidalAward: res.albert_vidal_award || false,
        bestOfNation: res.best_of_nation || false,
        event: eventObj,
        skill: skillObj,
        member: memberObj,
        skillName: SKILL_NAMES[res.skill.base_id] || { en: skillNameEn, ja: skillNameEn },
        memberName: MEMBER_NAMES[res.member.id] || { en: res.member.name.text, ja: res.member.name.text }
      };
    });

    // Dynamically update the list of unique members and skills in this scope
    const uniqueSkillsMap = new Map<number, Skill>();
    const uniqueMembersMap = new Map<number, Member>();

    mapped.forEach(r => {
      uniqueSkillsMap.set(r.skill.id, r.skill);
      uniqueMembersMap.set(r.member.id, r.member);
    });

    skills = Array.from(uniqueSkillsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    members = Array.from(uniqueMembersMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return mapped;
  } catch (error) {
    console.error("API Fetch Error:", error);
    return []; // Return empty on crash
  }
}
