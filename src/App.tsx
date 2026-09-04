import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import './App.css';
import { 
  fetchResults,
  fetchEvents,
  type Event,
  type JoinedResult, 
  type Skill,
  type Member,
  SECTOR_NAMES,
  SKILL_NAMES,
  MEMBER_NAMES
} from './data/mockData';

// SVG Icons as React inline SVGs for zero extra dependencies
const Icons = {
  IT: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Manufacturing: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Construction: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="21" x2="22" y2="21" />
      <path d="M4 21v-3a8 8 0 0 1 16 0v3" />
      <path d="M10 7.2V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3.2" />
      <line x1="12" y1="11" x2="12" y2="14" />
    </svg>
  ),
  Creative: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19" />
      <path d="M6 14C6.5 14 7 14.5 7 15C7 15.5 6.5 16 5 16" />
      <circle cx="7.5" cy="10.5" r="1.5" />
      <circle cx="11.5" cy="7.5" r="1.5" />
      <circle cx="16.5" cy="9.5" r="1.5" />
      <circle cx="15.5" cy="14.5" r="1.5" />
    </svg>
  ),
  Services: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Transportation: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem', color: '#6b7280' }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2rem', height: '1.2rem' }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2rem', height: '1.2rem' }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v1a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
    </svg>
  ),
  Medal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Skills: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
};

export default function App() {
  const { t, i18n } = useTranslation();
  
  // App views navigation (Added 'champions' for the Mosaic Wall)
  const [currentView, setCurrentView] = useState<'hallOfFame' | 'champions' | 'dashboard' | 'skills'>('hallOfFame');
  
  // Real API loading states
  const [events, setEvents] = useState<Event[]>([]);
  const [allResults, setAllResults] = useState<JoinedResult[]>([]);
  const [allGoldResults, setAllGoldResults] = useState<JoinedResult[]>([]); // Dynamic cache for all events gold medalists
  const [isLoading, setIsLoading] = useState(true);

  // OGP / Focus Share Mode State
  const [focusCompetitor, setFocusCompetitor] = useState<JoinedResult | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Filter States
  const [selectedEventId, setSelectedEventId] = useState<number>(579); // Default: WSC Lyon 2024 (579)
  const [selectedSector, setSelectedSector] = useState<string | null>(null); // Null means all
  
  // Autocomplete & search inputs
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  
  // Champions Wall Filter States
  const [championsMedalFilter, setChampionsMedalFilter] = useState<'GOLD' | 'SILVER' | 'BRONZE'>('GOLD');
  const [championsCountrySearch, setChampionsCountrySearch] = useState('');
  const [selectedChampionsCountryId, setSelectedChampionsCountryId] = useState<number | null>(null);
  const [showChampionsCountrySuggestions, setShowChampionsCountrySuggestions] = useState(false);
  const championsCountryRef = useRef<HTMLDivElement>(null);
  
  const [competitorSearch, setCompetitorSearch] = useState('');
  const [showCompetitorSuggestions, setShowCompetitorSuggestions] = useState(false);

  // Skills Legend Sub-View modal state
  const [selectedSkillForLegend, setSelectedSkillForLegend] = useState<number | null>(null);

  // Refs for closing suggestion panels on outside click
  const countryRef = useRef<HTMLDivElement>(null);
  const competitorRef = useRef<HTMLDivElement>(null);

  // Parse skill numbers into integer to sort strictly ascending globally
  const getSkillNumberVal = (num: string): number => {
    const clean = num.replace(/^0+/, '');
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 9999 : parsed;
  };

  // Convert full names to shortened initial name format (E.g., "YUTO TAKAHASHI" -> "Y. TAKAHASHI")
  const getShortName = (fullName: string): string => {
    const parts = fullName.trim().toUpperCase().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    const firstInitial = parts[0][0];
    const lastNamePart = parts.slice(1).join(' ');
    return `${firstInitial}. ${lastNamePart}`;
  };

  // Extract short event year label (E.g., "WorldSkills Lyon 2024" -> "LYON '24")
  const getEventYearLabel = (eventName: string): string => {
    const parts = eventName.split(' ');
    const year = parts.pop() || '';
    const name = parts.pop() || 'WSC';
    const shortYear = year.slice(-2);
    return `${name.toUpperCase()} '${shortYear}`;
  };

  // 1. Initial Load, Dynamic Share Parameters, and All-Gold parallel fetching
  useEffect(() => {
    const initializeAndLoad = async () => {
      setIsLoading(true);
      const params = new URLSearchParams(window.location.search);
      const competitorIdParam = params.get('competitorId');
      
      // A. Dynamically fetch WSC global competitions from REST API!
      const loadedEvents = await fetchEvents();
      setEvents(loadedEvents);
      
      // B. Automatically select the most recent CLOSED (completed) event as default!
      const concludedEvents = loadedEvents.filter(ev => ev.closed);
      const defaultEvent = concludedEvents[0] || loadedEvents[0] || { id: 579, closed: true };
      setSelectedEventId(defaultEvent.id);

      // C. Parallel fetch results of ALL completed historical events for the Champions wall!
      const resultsArrays = await Promise.all(
        concludedEvents.map(ev => fetchResults(ev.id))
      );
      
      const combinedResults = resultsArrays.flat();
      const podiumMedalists = combinedResults
        .filter(r => r.medal === 'GOLD' || r.medal === 'SILVER' || r.medal === 'BRONZE')
        .sort((a, b) => getSkillNumberVal(a.skill.number) - getSkillNumberVal(b.skill.number) || b.eventId - a.eventId);
      
      setAllGoldResults(podiumMedalists);

      // Check if entering through a direct shared competitor ID link
      if (competitorIdParam) {
        const parsedId = parseInt(competitorIdParam, 10);
        const matchedResult = combinedResults.find(res => 
          res.competitors.some(c => c.personId === parsedId)
        );
        
        if (matchedResult) {
          setSelectedEventId(matchedResult.eventId);
          const idx = concludedEvents.findIndex(ev => ev.id === matchedResult.eventId);
          if (idx !== -1) {
            setAllResults(resultsArrays[idx]);
          } else {
            const olderData = await fetchResults(matchedResult.eventId);
            setAllResults(olderData);
          }
          
          setFocusCompetitor(matchedResult);
          setIsLoading(false);
          return;
        }
      }
      
      // Default: load most recent closed event results (corresponds to resultsArrays of defaultEvent)
      const defaultEventIdx = concludedEvents.findIndex(ev => ev.id === defaultEvent.id);
      setAllResults(resultsArrays[defaultEventIdx] || resultsArrays[0] || []);
      setIsLoading(false);
    };

    initializeAndLoad();

    // Listen for History popstate changes
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const competitorIdParam = params.get('competitorId');
      if (!competitorIdParam) {
        setFocusCompetitor(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Fetch results on Event Selector Change
  useEffect(() => {
    if (focusCompetitor && focusCompetitor.eventId === selectedEventId) return;

    let active = true;
    const loadEventData = async () => {
      setIsLoading(true);
      const data = await fetchResults(selectedEventId);
      if (active) {
        setAllResults(data);
        setIsLoading(false);
      }
    };

    loadEventData();
    return () => { active = false; };
  }, [selectedEventId]);

  // Suggestions dynamic lists computed reactively from active results set
  const availableMembers = Array.from(
    new Map(allResults.map(r => [r.member.id, r.member])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const availableSkills = Array.from(
    new Map(allResults.map(r => [r.skill.id, r.skill])).values()
  ).sort((a, b) => getSkillNumberVal(a.number) - getSkillNumberVal(b.number)); // SORT ASCENDING ALWAYS

  const availableCompetitors = Array.from(
    new Map(allResults.flatMap(r => r.competitors.map(c => [c.personId, c]))).values()
  ).sort((a, b) => a.publicDisplayFullName.localeCompare(b.publicDisplayFullName));

  // Suggest filters
  const countrySuggestions = countrySearch.trim() === '' 
    ? [] 
    : availableMembers.filter(m => {
        const lang = i18n.language as 'en' | 'ja';
        const nameText = MEMBER_NAMES[m.id]?.[lang] || m.name;
        return nameText.toLowerCase().includes(countrySearch.toLowerCase());
      });

  const competitorSuggestions = competitorSearch.trim() === ''
    ? []
    : availableCompetitors.filter(c => 
        c.publicDisplayFullName.toLowerCase().includes(competitorSearch.toLowerCase())
      );

  // Champions Wall Computed Filters and Autocomplete Suggestions
  const filteredWallResults = allGoldResults.filter(res => {
    // A. Filter by selected Medal code
    if (res.medal !== championsMedalFilter) return false;
    
    // B. Filter by selected Country (Member) ID
    if (selectedChampionsCountryId !== null && res.memberId !== selectedChampionsCountryId) return false;
    
    return true;
  });

  const championsMembers = Array.from(
    new Map(allGoldResults.map(r => [r.member.id, r.member])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const championsCountrySuggestions = championsCountrySearch.trim() === ''
    ? []
    : championsMembers.filter(m => {
        const lang = i18n.language as 'en' | 'ja';
        const nameText = MEMBER_NAMES[m.id]?.[lang] || m.name;
        return nameText.toLowerCase().includes(championsCountrySearch.toLowerCase());
      });

  // Close suggestions on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountrySuggestions(false);
      }
      if (competitorRef.current && !competitorRef.current.contains(event.target as Node)) {
        setShowCompetitorSuggestions(false);
      }
      if (championsCountryRef.current && !championsCountryRef.current.contains(event.target as Node)) {
        setShowChampionsCountrySuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Filter Core Logic (Always gold, silver, bronze)
  const filteredResults = allResults.filter(res => {
    // A. Sector Drill-down
    if (selectedSector && res.skill.sector !== selectedSector) return false;

    // B. Country Combobox
    if (selectedCountryId !== null && res.memberId !== selectedCountryId) return false;

    // C. Competitor Autocomplete
    if (competitorSearch.trim().length > 0) {
      const match = res.competitors.some(c => 
        c.publicDisplayFullName.toLowerCase().includes(competitorSearch.toLowerCase())
      );
      if (!match) return false;
    }

    return res.medal === 'GOLD' || res.medal === 'SILVER' || res.medal === 'BRONZE';
  });

  // Extract unique skills present in the filtered results, always sorted by skill number
  const activeSkillsInResults = Array.from(
    new Map(filteredResults.map(r => [r.skill.id, r.skill])).values()
  ).sort((a, b) => getSkillNumberVal(a.number) - getSkillNumberVal(b.number));

  // Translate country name dynamically
  const getCountryName = (member: Member) => {
    const lang = i18n.language as 'en' | 'ja';
    return MEMBER_NAMES[member.id]?.[lang] || member.name;
  };

  // Translate skill name dynamically
  const getSkillName = (skill: Skill) => {
    const lang = i18n.language as 'en' | 'ja';
    return SKILL_NAMES[skill.baseId]?.[lang] || skill.name;
  };

  // SNS Card URL Copier
  const handleShareCard = (competitorId: number | null) => {
    if (competitorId == null) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?competitorId=${competitorId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    });
  };

  // Open a result in focus mode, deep-linking to the first competitor that has a valid personId
  const openFocus = (res: JoinedResult) => {
    const shareId = res.competitors.find(c => c.personId != null)?.personId;
    const url = new URL(window.location.href);
    if (shareId != null) {
      url.searchParams.set('competitorId', shareId.toString());
    } else {
      url.searchParams.delete('competitorId');
    }
    window.history.pushState(null, '', url.toString());
    setFocusCompetitor(res);
  };

  const handleCloseFocusMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('competitorId');
    window.history.pushState(null, '', url.toString());
    setFocusCompetitor(null);
  };

  // 4. Stats Aggregation Logic (Country-wise aggregates)
  const countryStats = availableMembers.map(m => {
    const countryResults = allResults.filter(r => r.memberId === m.id);
    const gold = countryResults.filter(r => r.medal === 'GOLD').length;
    const silver = countryResults.filter(r => r.medal === 'SILVER').length;
    const bronze = countryResults.filter(r => r.medal === 'BRONZE').length;
    const excellence = countryResults.filter(r => r.medal === 'EXCELLENCE').length;
    
    const totalCompetitors = countryResults.length;
    const excellenceRate = totalCompetitors > 0 
      ? Math.round(((gold + silver + bronze + excellence) / totalCompetitors) * 100) 
      : 0;

    const powerIndex = (gold * 3) + (silver * 2) + (bronze * 1) + (excellence * 0.5);

    return {
      member: m,
      gold,
      silver,
      bronze,
      excellence,
      excellenceRate,
      powerIndex,
      total: gold + silver + bronze
    };
  }).sort((a, b) => b.powerIndex - a.powerIndex || b.gold - a.gold);

  // Group active skills by sectors
  const skillsBySector = Object.keys(SECTOR_NAMES).reduce<Record<string, Skill[]>>((acc, sec) => {
    acc[sec] = availableSkills.filter(s => s.sector === sec);
    return acc;
  }, {});

  return (
    <div className="app-container">
      
      {/* HEADER / NAVIGATION (Hidden in Full Screen Focus OGP share mode) */}
      {!focusCompetitor && (
        <header className="app-header">
          <div className="brand-title" onClick={() => setCurrentView('hallOfFame')} style={{ cursor: 'pointer' }}>
            {t('title')}
          </div>
          
          <nav className="nav-links">
            <button 
              className={`nav-btn ${currentView === 'hallOfFame' ? 'active' : ''}`}
              onClick={() => setCurrentView('hallOfFame')}
            >
              {t('hallOfFame')}
            </button>
            <button 
              className={`nav-btn ${currentView === 'champions' ? 'active' : ''}`}
              onClick={() => setCurrentView('champions')}
            >
              {t('champions')}
            </button>
            <button 
              className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              {t('dashboard')}
            </button>
            <button 
              className={`nav-btn ${currentView === 'skills' ? 'active' : ''}`}
              onClick={() => setCurrentView('skills')}
            >
              {t('skills')}
            </button>
            
            <select 
              className="lang-switch" 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="ja">JP</option>
              <option value="en">EN</option>
            </select>
          </nav>

          {/* Mobile-only language switch, styled and visible only on small screens */}
          <select 
            className="lang-switch mobile-only" 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="ja">JP</option>
            <option value="en">EN</option>
          </select>
        </header>
      )}

      {/* ====================================================
         FOCUS SHARE MODE (Single Athlete premium view)
         ==================================================== */}
      {focusCompetitor && (
        <div className="share-view-overlay">
          <div style={{ alignSelf: 'flex-start', marginBottom: '2rem' }}>
            <button className="glass-btn" onClick={handleCloseFocusMode} style={{ display: 'flex', fill: 'none', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', lineHeight: '0' }}>←</span> {t('backToList')}
            </button>
          </div>

          <div className="focus-card-wrapper">
            <div className={`focus-card glass-panel ${focusCompetitor.medal.toLowerCase()}`}>
              <div className="card-top">
                <span className="skill-tag">{getSkillName(focusCompetitor.skill)}</span>
                <span className={`medal-badge ${focusCompetitor.medal.toLowerCase()}`}>
                  {t(`medal${focusCompetitor.medal.charAt(0) + focusCompetitor.medal.slice(1).toLowerCase()}` as any)}
                </span>
              </div>

              {/* Badges */}
              <div className="award-badges">
                {focusCompetitor.albertVidalAward && (
                  <span className="award-pill mvp">{t('worldMvp')}</span>
                )}
                {focusCompetitor.bestOfNation && (
                  <span className="award-pill best-nation">{t('bestOfNation')}</span>
                )}
              </div>

              {/* Avatars */}
              <div className="focus-avatar-container">
                {focusCompetitor.competitors.map(c => (
                  <img key={c.personId} className="focus-avatar" src={c.image} alt={c.publicDisplayFullName} />
                ))}
              </div>

              {/* Names */}
              <div className="focus-name-container">
                <h1 className="focus-main-name">
                  {focusCompetitor.competitors.map(c => c.publicDisplayFullName).join(' & ')}
                </h1>
                <p className="focus-sub-name">{focusCompetitor.event.name}</p>
              </div>

              {/* Stats */}
              <div className="focus-metrics">
                <div className="focus-metric-card">
                  <div className={`focus-metric-val ${focusCompetitor.medal.toLowerCase()}`}>
                    #{focusCompetitor.position}
                  </div>
                  <div className="focus-metric-lbl">{t('rank')}</div>
                </div>
                <div className="focus-metric-card">
                  <div className="focus-metric-val">{focusCompetitor.mark}</div>
                  <div className="focus-metric-lbl">{t('score')}</div>
                </div>
              </div>

              {/* Country Flag & Name */}
              <div className="focus-footer">
                <img src={focusCompetitor.member.flag} alt="" style={{ height: '32px', borderRadius: '4px' }} />
                <span className="focus-country-name">{getCountryName(focusCompetitor.member)}</span>
              </div>
            </div>
          </div>

          <div className="share-action-area">
            <button className="glass-btn" onClick={() => handleShareCard(focusCompetitor.competitors.find(c => c.personId != null)?.personId ?? null)}>
              {t('shareCard')}
            </button>
            {showCopiedToast && (
              <span className="copied-toast">{t('copied')}</span>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
         VIEW 1: HALL OF FAME (Grouped by Skill Podium)
         ==================================================== */}
      {!focusCompetitor && currentView === 'hallOfFame' && (
        <main>
          {/* Advanced Filtering Area */}
          <section className="filter-bar glass-panel">
            
            {/* Event Timeline Scoping */}
            <div className="event-picker">
              {events.map(ev => (
                <button 
                  key={ev.id}
                  className={`event-chip ${selectedEventId === ev.id ? 'active' : ''}`}
                  onClick={() => setSelectedEventId(ev.id)}
                >
                  {ev.name.split('WorldSkills ').pop()}
                </button>
              ))}
            </div>

            {/* Visual Sector Filter */}
            <div className="sector-picker">
              <button 
                className={`sector-chip ${selectedSector === null ? 'active' : ''}`}
                onClick={() => setSelectedSector(null)}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: '800', opacity: '0.8' }}>A</div>
                {t('allSectors')}
              </button>
              {Object.entries(SECTOR_NAMES).map(([key, value]) => {
                const IconComponent = Icons[key as keyof typeof Icons] || (() => null);
                return (
                  <button 
                    key={key}
                    className={`sector-chip ${selectedSector === key ? 'active' : ''}`}
                    onClick={() => setSelectedSector(key)}
                  >
                    <IconComponent />
                    {i18n.language === 'en' ? value.en.split(' ')[0] : value.ja.replace('（IT）', '').split('・')[0]}
                  </button>
                );
              })}
            </div>

            {/* Smart Comboboxes */}
            <div className="search-row">
              {/* Country autocomplete */}
              <div className="search-input-wrapper" ref={countryRef}>
                <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                  <Icons.Search />
                </div>
                <input 
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder={t('searchCountry')}
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setShowCountrySuggestions(true);
                    if (e.target.value === '') {
                      setSelectedCountryId(null);
                    }
                  }}
                  onFocus={() => setShowCountrySuggestions(true)}
                />
                
                {showCountrySuggestions && countrySuggestions.length > 0 && (
                  <div className="autocomplete-suggestions glass-panel">
                    {countrySuggestions.map(m => {
                      const lang = i18n.language as 'en' | 'ja';
                      return (
                        <div 
                          key={m.id}
                          className="suggestion-item"
                          onClick={() => {
                            setSelectedCountryId(m.id);
                            setCountrySearch(MEMBER_NAMES[m.id]?.[lang] || m.name);
                            setShowCountrySuggestions(false);
                          }}
                        >
                          <img src={m.flag} alt="" style={{ width: '18px', height: '12px', marginRight: '0.5rem', borderRadius: '2px', objectFit: 'cover' }} />
                          {MEMBER_NAMES[m.id]?.[lang] || m.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Competitor Autocomplete */}
              <div className="search-input-wrapper" ref={competitorRef}>
                <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                  <Icons.Search />
                </div>
                <input 
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder={t('searchCompetitor')}
                  value={competitorSearch}
                  onChange={(e) => {
                    setCompetitorSearch(e.target.value);
                    setShowCompetitorSuggestions(true);
                  }}
                  onFocus={() => setShowCompetitorSuggestions(true)}
                />

                {showCompetitorSuggestions && competitorSuggestions.length > 0 && (
                  <div className="autocomplete-suggestions glass-panel">
                    {competitorSuggestions.map(c => (
                      <div 
                        key={c.personId}
                        className="suggestion-item"
                        onClick={() => {
                          setCompetitorSearch(c.publicDisplayFullName);
                          setShowCompetitorSuggestions(false);
                        }}
                      >
                        {c.publicDisplayFullName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* LOADING / SKELETON STATE */}
          {isLoading ? (
            <div className="empty-state glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: '600', color: 'var(--text-muted)' }}>FETCHING LIVE API DATA...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="empty-state glass-panel">
              {t('noResults')}
            </div>
          ) : (
            // SKILL-WISE PODIUM SECTIONS (No "Load More" - shows complete, clean, aligned sections!)
            <div>
              {activeSkillsInResults.map(sk => {
                const skillResults = filteredResults
                  .filter(r => r.skillId === sk.id)
                  .sort((a, b) => a.position - b.position); // Sorted Gold -> Silver -> Bronze

                return (
                  <section className="skill-group-section" key={sk.id}>
                    <div className="skill-group-header">
                      <span className="skill-group-title">{getSkillName(sk)}</span>
                      <span className="skill-group-number">SKILL {sk.number}</span>
                    </div>

                    <div className="skill-group-grid">
                      {skillResults.map(res => {
                        const medalClass = res.medal.toLowerCase();
                        return (
                          <article 
                            key={res.id} 
                            className={`competitor-card glass-panel glass-interactive ${medalClass}`}
                            onClick={() => openFocus(res)}
                          >
                            <div className="card-top">
                              <span className="skill-tag">{getSkillName(res.skill)}</span>
                              <span className={`medal-badge ${medalClass}`}>
                                {t(`medal${res.medal.charAt(0) + res.medal.slice(1).toLowerCase()}` as any)}
                              </span>
                            </div>

                            {/* Honors Pills */}
                            <div className="award-badges">
                              {res.albertVidalAward && (
                                <span className="award-pill mvp">{t('worldMvp')}</span>
                              )}
                              {res.bestOfNation && (
                                <span className="award-pill best-nation">{t('bestOfNation')}</span>
                              )}
                            </div>

                            {/* Athlete profiling */}
                            <div className="athletes-container">
                              <div className="avatars-overlap">
                                {res.competitors.map(c => (
                                  <div className="avatar-wrapper" key={c.personId}>
                                    <img className="athlete-avatar" src={c.image} alt={c.publicDisplayFullName} />
                                  </div>
                                ))}
                              </div>
                              
                              {res.competitors.length === 1 ? (
                                <h2 className="athlete-name">{res.competitors[0].publicDisplayFullName}</h2>
                              ) : (
                                <div className="team-names">
                                  {res.competitors.map(c => (
                                    <span key={c.personId} className="team-athlete-name">{c.publicDisplayFullName}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Footer mapping */}
                            <div className="card-footer">
                              <div className="member-flag-org">
                                <img src={res.member.flag} alt="" style={{ width: '18px', height: '12px', borderRadius: '1px', objectFit: 'cover' }} />
                                <span className="member-code">{res.member.code}</span>
                              </div>

                              <div className="stat-group">
                                <div className="stat-item">
                                  <span className="stat-val">{res.mark}</span>
                                  <span className="stat-lbl">{t('score')}</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-val">#{res.position}</span>
                                  <span className="stat-lbl">{t('rank')}</span>
                                </div>
                              </div>
                            </div>

                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ====================================================
         VIEW 1.5: CHAMPIONS WALL (Gold, Silver, Bronze Mosaic Grid with Sticky Filters)
         ==================================================== */}
      {!focusCompetitor && currentView === 'champions' && (
        <main>
          {/* Double-Sticky Filter Control Panel */}
          <div className="sticky-filter-panel glass-panel">
            
            {/* Left: Total Summary Count */}
            <div className="summary-count">
              {i18n.language === 'en' ? (
                <>TOTAL: <span>{filteredWallResults.length}</span> ATHLETES</>
              ) : (
                <>総勢 <span>{filteredWallResults.length}</span> 名</>
              )}
            </div>

            {/* Middle: Medal Switcher Segment Control */}
            <div className="segment-control">
              {(['GOLD', 'SILVER', 'BRONZE'] as const).map(mCode => {
                const medalClass = mCode.toLowerCase();
                const isActive = championsMedalFilter === mCode;
                const emoji = mCode === 'GOLD' ? '🥇' : mCode === 'SILVER' ? '🥈' : '🥉';
                return (
                  <button
                    key={mCode}
                    className={`segment-btn ${isActive ? `active ${medalClass}` : ''}`}
                    onClick={() => setChampionsMedalFilter(mCode)}
                  >
                    <span>{emoji}</span>
                    {t(`medal${mCode.charAt(0) + mCode.slice(1).toLowerCase()}` as any)}
                  </button>
                );
              })}
            </div>

            {/* Right: Country Autocomplete Filter */}
            <div className="search-input-wrapper champions-search-wrapper" ref={championsCountryRef}>
              <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                <Icons.Search />
              </div>
              <input 
                type="text"
                className="search-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2rem' }}
                placeholder={t('searchCountry')}
                value={championsCountrySearch}
                onChange={(e) => {
                  setChampionsCountrySearch(e.target.value);
                  setShowChampionsCountrySuggestions(true);
                  if (e.target.value === '') {
                    setSelectedChampionsCountryId(null);
                  }
                }}
                onFocus={() => setShowChampionsCountrySuggestions(true)}
              />
              
              {/* Clear button if search is active */}
              {selectedChampionsCountryId !== null && (
                <button 
                  onClick={() => {
                    setSelectedChampionsCountryId(null);
                    setChampionsCountrySearch('');
                  }}
                  style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                >
                  <Icons.Close />
                </button>
              )}
              
              {showChampionsCountrySuggestions && championsCountrySuggestions.length > 0 && (
                <div className="autocomplete-suggestions glass-panel">
                  {championsCountrySuggestions.map(m => {
                    const lang = i18n.language as 'en' | 'ja';
                    return (
                      <div 
                        key={m.id}
                        className="suggestion-item"
                        onClick={() => {
                          setSelectedChampionsCountryId(m.id);
                          setChampionsCountrySearch(MEMBER_NAMES[m.id]?.[lang] || m.name);
                          setShowChampionsCountrySuggestions(false);
                        }}
                      >
                        <img src={m.flag} alt="" style={{ width: '18px', height: '12px', marginRight: '0.5rem', borderRadius: '2px', objectFit: 'cover' }} />
                        {MEMBER_NAMES[m.id]?.[lang] || m.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Mosaic Tiled Grid Display */}
          {isLoading ? (
            <div className="empty-state glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: '600', color: 'var(--text-muted)' }}>MAPPING CHAMPIONS WALL...</span>
            </div>
          ) : filteredWallResults.length === 0 ? (
            <div className="empty-state glass-panel">
              {t('noResults')}
            </div>
          ) : (
            <section className="champions-mosaic-grid">
              {filteredWallResults.map(res => {
                const shortNameText = res.competitors.map(c => getShortName(c.publicDisplayFullName)).join(' & ');
                
                return (
                  <div 
                    key={res.id} 
                    className="champion-mosaic-tile glass-panel glass-interactive"
                    onClick={() => openFocus(res)}
                  >
                    {/* Floating Country Badge over circular Avatar (Supports team overlapping) */}
                    <div className="tile-avatar-wrapper">
                      {res.competitors.length === 1 ? (
                        <img className="tile-avatar" src={res.competitors[0].image} alt="" />
                      ) : (
                        <div className="avatars-overlap" style={{ justifyContent: 'center' }}>
                          {res.competitors.map(c => (
                            <div className="avatar-wrapper" key={c.personId} style={{ width: '38px', height: '38px' }}>
                              <img className="tile-avatar" src={c.image} alt="" style={{ border: '1.5px solid #0f1219' }} />
                            </div>
                          ))}
                        </div>
                      )}
                      <img className="tile-flag-badge" src={res.member.flag} alt="" />
                    </div>

                    {/* Shortened elegant name display */}
                    <span className="tile-name">{shortNameText}</span>
                    {/* Event context year */}
                    <span className="tile-year">{getEventYearLabel(res.event.name)}</span>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      )}

      {/* ====================================================
         VIEW 2: STATS DASHBOARD (Global power indexing)
         ==================================================== */}
      {!focusCompetitor && currentView === 'dashboard' && (
        <main className="stats-view">
          {isLoading ? (
            <div className="empty-state glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: '600', color: 'var(--text-muted)' }}>FETCHING LIVE STATS...</span>
            </div>
          ) : (
            <div className="stats-card glass-panel" style={{ overflowX: 'auto' }}>
              <div className="stats-table-header">
                <span>{t('searchCountry')}</span>
                <span style={{ textAlign: 'center' }}>🏅 {t('medalGold')}</span>
                <span style={{ textAlign: 'center' }}>🥈 {t('medalSilver')}</span>
                <span style={{ textAlign: 'center' }}>🥉 {t('medalBronze')}</span>
                <span style={{ textAlign: 'right' }}>📊 {t('powerIndex')}</span>
              </div>

              {countryStats.map(stat => (
                <div key={stat.member.id} className="stats-row">
                  <div className="stats-country">
                    <img src={stat.member.flag} alt="" style={{ width: '24px', height: '16px', borderRadius: '2px', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{getCountryName(stat.member)}</span>
                      <span style={{ fontSize: '0.65rem', color: varRef('--text-muted') }}>
                        {t('excellenceRate')}: {stat.excellenceRate}%
                      </span>
                    </div>
                  </div>

                  <div className="stats-medal-count gold" style={{ textAlign: 'center' }}>
                    {stat.gold > 0 ? stat.gold : '-'}
                  </div>
                  <div className="stats-medal-count silver" style={{ textAlign: 'center' }}>
                    {stat.silver > 0 ? stat.silver : '-'}
                  </div>
                  <div className="stats-medal-count bronze" style={{ textAlign: 'center' }}>
                    {stat.bronze > 0 ? stat.bronze : '-'}
                  </div>

                  <div className="stats-rate-container" style={{ justifyContent: 'flex-end' }}>
                    <div className="stats-rate-bar">
                      <div className="stats-rate-fill" style={{ width: `${Math.min(stat.powerIndex * 5, 100)}%` }} />
                    </div>
                    <span className="stats-rate-val">{stat.powerIndex}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ====================================================
         VIEW 3: SKILLS CATALOG & LEGENDS ARCHIVE
         ==================================================== */}
      {!focusCompetitor && currentView === 'skills' && (
        <main className="skills-catalog-view">
          {isLoading ? (
            <div className="empty-state glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: '600', color: 'var(--text-muted)' }}>FETCHING LIVE CATALOG...</span>
            </div>
          ) : selectedSkillForLegend !== null ? (
            <div className="skill-legend-panel glass-panel">
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="glass-btn" onClick={() => setSelectedSkillForLegend(null)}>
                  ← {t('backToList')}
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  {getSkillName(availableSkills.find(s => s.id === selectedSkillForLegend)!)}
                </h2>
              </div>

              <div className="legend-list">
                {/* Winners of this skill across the active results */}
                {allResults
                  .filter(r => r.skillId === selectedSkillForLegend && (r.medal === 'GOLD' || r.medal === 'SILVER' || r.medal === 'BRONZE'))
                  .sort((a, b) => a.position - b.position)
                  .map(leg => (
                    <div key={leg.id} className="legend-row">
                      <div className="legend-athlete">
                        <img src={leg.member.flag} alt="" style={{ width: '20px', height: '14px', marginRight: '0.75rem', borderRadius: '1px', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span className="legend-name">
                            {leg.competitors.map(c => c.publicDisplayFullName).join(' & ')}
                          </span>
                          <span className="legend-event">{leg.event.name}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', opacity: '0.8' }}>
                          {leg.mark} pts
                        </span>
                        <span className={`medal-badge ${leg.medal.toLowerCase()}`}>
                          {t(`medal${leg.medal.charAt(0) + leg.medal.slice(1).toLowerCase()}` as any)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            Object.entries(skillsBySector).map(([sectorKey, sectorSkills]) => (
              <section key={sectorKey} className="sector-section">
                <h3 className="sector-section-title">
                  {i18n.language === 'en' ? SECTOR_NAMES[sectorKey].en : SECTOR_NAMES[sectorKey].ja}
                </h3>
                
                <div className="skills-subgrid">
                  {sectorSkills.map(sk => (
                    <div 
                      key={sk.id}
                      className="skill-catalog-item glass-panel glass-interactive"
                      onClick={() => setSelectedSkillForLegend(sk.id)}
                    >
                      <div className="skill-catalog-info">
                        <span className="skill-catalog-num">SKILL {sk.number}</span>
                        <span className="skill-catalog-name">{getSkillName(sk)}</span>
                      </div>
                      <div className="skill-catalog-arrow">
                        <Icons.ChevronRight />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {!focusCompetitor && (
        <nav className="mobile-bottom-nav">
          <button 
            className={`bottom-nav-btn ${currentView === 'hallOfFame' ? 'active' : ''}`}
            onClick={() => setCurrentView('hallOfFame')}
          >
            <Icons.Trophy />
            <span>{t('hallOfFame')}</span>
          </button>
          <button 
            className={`bottom-nav-btn ${currentView === 'champions' ? 'active' : ''}`}
            onClick={() => setCurrentView('champions')}
          >
            <Icons.Medal />
            <span>{t('champions')}</span>
          </button>
          <button 
            className={`bottom-nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <Icons.Chart />
            <span>{t('dashboard')}</span>
          </button>
          <button 
            className={`bottom-nav-btn ${currentView === 'skills' ? 'active' : ''}`}
            onClick={() => setCurrentView('skills')}
          >
            <Icons.Skills />
            <span>{t('skills')}</span>
          </button>
        </nav>
      )}

    </div>
  );
}

// Inline helper for loading css variables safely
function varRef(name: string) {
  return `var(${name})`;
}
