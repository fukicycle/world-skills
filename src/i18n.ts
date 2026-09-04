import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      title: "TECH ATHLETES",
      subtitle: "WorldSkills Hall of Fame",
      hallOfFame: "HALL OF FAME",
      champions: "CHAMPIONS",
      dashboard: "STATS",
      skills: "SKILLS",
      searchCountry: "Search country...",
      searchCompetitor: "Search competitor...",
      allSectors: "All Sectors",
      loadMore: "LOAD MORE",
      shareCard: "SHARE CARD",
      copied: "COPIED TO CLIPBOARD!",
      bestOfNation: "BEST OF NATION",
      worldMvp: "WORLD MVP",
      score: "SCORE",
      rank: "RANK",
      medalGold: "GOLD",
      medalSilver: "SILVER",
      medalBronze: "BRONZE",
      excellenceRate: "Excellence Rate",
      totalMedals: "Total Medals",
      powerIndex: "Tech Power Index",
      backToList: "BACK TO LIST",
      noResults: "No athletes found."
    }
  },
  ja: {
    translation: {
      title: "TECH ATHLETES",
      subtitle: "技能五輪世界大会 栄誉殿堂",
      hallOfFame: "栄誉殿堂",
      champions: "栄誉の壁",
      dashboard: "技術分析",
      skills: "職種",
      searchCountry: "国・地域を検索...",
      searchCompetitor: "選手名を検索...",
      allSectors: "すべての部門",
      loadMore: "さらに読み込む",
      shareCard: "カードを共有",
      copied: "リンクをコピーしました！",
      bestOfNation: "国別最優秀選手",
      worldMvp: "世界MVP",
      score: "得点",
      rank: "順位",
      medalGold: "金メダル",
      medalSilver: "銀メダル",
      medalBronze: "銅メダル",
      excellenceRate: "優秀賞獲得率",
      totalMedals: "総メダル数",
      powerIndex: "技術力指数",
      backToList: "一覧に戻る",
      noResults: "該当する選手が見つかりません。"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja', // Default to Japanese
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
