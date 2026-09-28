// Japanese names and WorldSkills sectors for every skill name that appears in
// WSC results (1997 onwards). Keyed by the normalised English name from the API
// because skill numbers and base IDs are reassigned between competitions.

export type SectorKey = 'IT' | 'Manufacturing' | 'Construction' | 'Creative' | 'Services' | 'Transportation';

interface SkillInfo {
  ja: string;
  sector: SectorKey;
}

const CATALOG: Record<string, SkillInfo> = {
  // Information & Communication Technology
  'cloud computing': { ja: 'クラウドコンピューティング', sector: 'IT' },
  'cyber security': { ja: 'サイバーセキュリティ', sector: 'IT' },
  'information network cabling': { ja: '情報ネットワーク施工', sector: 'IT' },
  'digital interactive media design': { ja: 'デジタルインタラクティブメディアデザイン', sector: 'IT' },
  'ict network infrastructure': { ja: '情報ネットワーク施工', sector: 'IT' },
  'information technology': { ja: '情報技術', sector: 'IT' },
  'intelligent security technology': { ja: 'インテリジェントセキュリティ技術', sector: 'IT' },
  'software applications development': { ja: 'ソフトウェアアプリケーション開発', sector: 'IT' },
  'software testing': { ja: 'ソフトウェアテスト', sector: 'IT' },
  'it network systems administration': { ja: 'ITネットワークシステム管理', sector: 'IT' },
  'it pc/network support': { ja: 'IT PC・ネットワークサポート', sector: 'IT' },
  'it software solutions for business': { ja: '業務用ITソフトウェア・ソリューションズ', sector: 'IT' },
  'it/software applications': { ja: 'ITソフトウェアアプリケーション', sector: 'IT' },
  'mobile applications development': { ja: 'モバイルアプリケーション開発', sector: 'IT' },
  'offset printing': { ja: 'オフセット印刷', sector: 'IT' },
  'print media technology': { ja: '印刷', sector: 'IT' },
  'printing': { ja: '印刷', sector: 'IT' },
  'telecommunication distribution technology': { ja: '通信配線技術', sector: 'IT' },
  'web design': { ja: 'ウェブデザイン', sector: 'IT' },
  'web design and development': { ja: 'ウェブデザイン', sector: 'IT' },
  'web technologies': { ja: 'ウェブ技術', sector: 'IT' },

  // Manufacturing & Engineering Technology
  'additive manufacturing': { ja: '積層造形', sector: 'Manufacturing' },
  'chemical laboratory technology': { ja: '化学分析', sector: 'Manufacturing' },
  'cnc machining': { ja: 'CNC加工', sector: 'Manufacturing' },
  'cnc milling': { ja: 'CNCフライス盤', sector: 'Manufacturing' },
  'cnc turning': { ja: 'CNC旋盤', sector: 'Manufacturing' },
  'construction metal work': { ja: '構造物鉄工', sector: 'Manufacturing' },
  'construction steel work': { ja: '構造物鉄工', sector: 'Manufacturing' },
  'electronic applications': { ja: '電子機器組立て', sector: 'Manufacturing' },
  'electronics': { ja: '電子機器組立て', sector: 'Manufacturing' },
  'fitting': { ja: '仕上げ', sector: 'Manufacturing' },
  'industrial control': { ja: '工場電気設備', sector: 'Manufacturing' },
  'industrial electronics': { ja: '電子機器組立て', sector: 'Manufacturing' },
  'industrial mechanic millwright': { ja: '産業機械', sector: 'Manufacturing' },
  'industrial mechanics': { ja: '産業機械', sector: 'Manufacturing' },
  'industrial mechanics millwright': { ja: '産業機械', sector: 'Manufacturing' },
  'industrial wiring': { ja: '工場電気設備', sector: 'Manufacturing' },
  'industry 4.0': { ja: 'インダストリー4.0', sector: 'Manufacturing' },
  'instrument making': { ja: '精密機器製作', sector: 'Manufacturing' },
  'manufacturing team challenge': { ja: '製造チームチャレンジ', sector: 'Manufacturing' },
  'mech. eng. cadd': { ja: '機械製図CAD', sector: 'Manufacturing' },
  'mechanical device control': { ja: '機械制御', sector: 'Manufacturing' },
  'mechanical engineering cad': { ja: '機械製図CAD', sector: 'Manufacturing' },
  'mechanical engineering design - cad': { ja: '機械製図CAD', sector: 'Manufacturing' },
  'mechanical engineering drafting cad': { ja: '機械製図CAD', sector: 'Manufacturing' },
  'mechanical systems technician': { ja: '機械システム', sector: 'Manufacturing' },
  'mechatronics': { ja: 'メカトロニクス', sector: 'Manufacturing' },
  'mobile robotics': { ja: '移動式ロボット', sector: 'Manufacturing' },
  'autonomous mobile robotics': { ja: '自律移動ロボット', sector: 'Manufacturing' },
  'mould making': { ja: '金型', sector: 'Manufacturing' },
  'optoelectronic technology': { ja: '光電子技術', sector: 'Manufacturing' },
  'pattern making': { ja: '木型', sector: 'Manufacturing' },
  'plastic die engineering': { ja: 'プラスチック金型', sector: 'Manufacturing' },
  'polymechanics and automation': { ja: '精密機器組立て', sector: 'Manufacturing' },
  'polymechanics/automation': { ja: '精密機器組立て', sector: 'Manufacturing' },
  'press tool making': { ja: 'プレス金型', sector: 'Manufacturing' },
  'prototype modelling': { ja: '試作モデル製作', sector: 'Manufacturing' },
  'renewable energy': { ja: '再生可能エネルギー', sector: 'Manufacturing' },
  'robot systems integration': { ja: 'ロボットシステムインテグレーション', sector: 'Manufacturing' },
  'sheet metal technology': { ja: '板金', sector: 'Manufacturing' },
  'sheet metal work': { ja: '板金', sector: 'Manufacturing' },
  'sheet-construction steelwork': { ja: '構造物鉄工', sector: 'Manufacturing' },
  'unmanned aerial systems': { ja: '無人航空機システム', sector: 'Manufacturing' },
  'water technology': { ja: '水処理技術', sector: 'Manufacturing' },
  'welding': { ja: '溶接', sector: 'Manufacturing' },

  // Construction & Building Technology
  'architectural stonemasonry': { ja: '石工', sector: 'Construction' },
  'bricklaying': { ja: 'れんが積み', sector: 'Construction' },
  'cabinetmaking': { ja: '家具', sector: 'Construction' },
  'carpentry': { ja: '大工', sector: 'Construction' },
  'commercial wiring': { ja: '電工', sector: 'Construction' },
  'concrete construction work': { ja: 'コンクリート建設', sector: 'Construction' },
  'digital construction': { ja: 'デジタル建設', sector: 'Construction' },
  'electrical installations': { ja: '電工', sector: 'Construction' },
  'joinery': { ja: '建具', sector: 'Construction' },
  'landscape gardening': { ja: '造園', sector: 'Construction' },
  'metal roofing': { ja: '建築板金', sector: 'Construction' },
  'painting and decorating': { ja: '塗装', sector: 'Construction' },
  'plastering': { ja: '左官', sector: 'Construction' },
  'plastering and drywall systems': { ja: '左官・内装仕上げ', sector: 'Construction' },
  'plumbing': { ja: '配管', sector: 'Construction' },
  'plumbing and heating': { ja: '配管', sector: 'Construction' },
  'refrigeration': { ja: '冷凍空調技術', sector: 'Construction' },
  'refrigeration and air conditioning': { ja: '冷凍空調技術', sector: 'Construction' },
  'refrigeration technic': { ja: '冷凍空調技術', sector: 'Construction' },
  'stonemasonry': { ja: '石工', sector: 'Construction' },
  'tinsmith (roofing)': { ja: '建築板金', sector: 'Construction' },
  'wall and floor tiling': { ja: 'タイル張り', sector: 'Construction' },

  // Creative Arts & Fashion
  '3d digital game art': { ja: '3Dデジタルゲームアート', sector: 'Creative' },
  'creative modelling': { ja: 'クリエイティブモデリング', sector: 'Creative' },
  'fashion technology': { ja: '洋裁', sector: 'Creative' },
  'floristry': { ja: 'フラワー装飾', sector: 'Creative' },
  'graphic design technology': { ja: 'グラフィックデザイン', sector: 'Creative' },
  'industrial design technology': { ja: 'インダストリアルデザイン', sector: 'Creative' },
  'jewellery': { ja: '貴金属装身具', sector: 'Creative' },
  'ladies dressmaking': { ja: '婦人服', sector: 'Creative' },
  'visual merchandising': { ja: 'ビジュアルマーチャンダイジング', sector: 'Creative' },
  'visual merchandising and window dressing': { ja: 'ビジュアルマーチャンダイジング', sector: 'Creative' },
  'visual merchandising/window dressing': { ja: 'ビジュアルマーチャンダイジング', sector: 'Creative' },

  // Social & Personal Services
  'bakery': { ja: 'パン製造', sector: 'Services' },
  'beauty care': { ja: 'ビューティーセラピー', sector: 'Services' },
  'beauty therapy': { ja: 'ビューティーセラピー', sector: 'Services' },
  'caring': { ja: 'ヘルスケア・ソーシャルケア', sector: 'Services' },
  'confectioner/pastry cook': { ja: '製菓', sector: 'Services' },
  'cookery': { ja: '西洋料理', sector: 'Services' },
  'dental prosthetics': { ja: '歯科技工', sector: 'Services' },
  'cooking': { ja: '西洋料理', sector: 'Services' },
  'hairdressing': { ja: '美容・理容', sector: 'Services' },
  'health and social care': { ja: 'ヘルスケア・ソーシャルケア', sector: 'Services' },
  'hotel reception': { ja: 'ホテルレセプション', sector: 'Services' },
  "ladies' hairdressing": { ja: '美容', sector: 'Services' },
  "ladies'/men's hairdressing": { ja: '美容・理容', sector: 'Services' },
  "men's hairdressing": { ja: '理容', sector: 'Services' },
  'pâtisserie and confectionery': { ja: '製菓', sector: 'Services' },
  'restaurant service': { ja: 'レストランサービス', sector: 'Services' },
  'retail sales': { ja: '販売', sector: 'Services' },

  // Transportation & Logistics
  'agricultural mechanics': { ja: '農業機械整備', sector: 'Transportation' },
  'aircraft maintenance': { ja: '航空機整備', sector: 'Transportation' },
  'autobody repair': { ja: '車体修理', sector: 'Transportation' },
  'automobile technology': { ja: '自動車工', sector: 'Transportation' },
  'car painting': { ja: '車体塗装', sector: 'Transportation' },
  'freight forwarding': { ja: '物流・フォワーディング', sector: 'Transportation' },
  'heavy vehicle maintenance': { ja: '重機整備', sector: 'Transportation' },
  'heavy vehicle technology': { ja: '重機整備', sector: 'Transportation' },
  'logistics and freight forwarding': { ja: '物流・フォワーディング', sector: 'Transportation' },
  'rail vehicle technology': { ja: '鉄道車両技術', sector: 'Transportation' },
  'transport technology': { ja: '輸送技術', sector: 'Transportation' },
};

const normalise = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

// Fallback for skill names added after this catalog was written, based on the
// current official skill numbering.
function sectorBySkillNumber(num: string): SectorKey {
  const n = parseInt(num.replace(/^0+/, ''), 10);
  if ([2, 9, 17, 39, 53, 54].includes(n)) return 'IT';
  if ([12, 13, 15, 18, 20, 21, 22, 24, 25, 26, 58].includes(n)) return 'Construction';
  if ([28, 31, 40, 44, 50].includes(n)) return 'Creative';
  if ([29, 30, 32, 35, 41, 47, 51, 56].includes(n)) return 'Services';
  if ([14, 33, 36, 49, 62].includes(n)) return 'Transportation';
  return 'Manufacturing';
}

export function lookupSkill(englishName: string, number: string): { en: string; ja: string; sector: SectorKey } {
  const en = englishName.trim();
  const info = CATALOG[normalise(englishName)];
  return info
    ? { en, ja: info.ja, sector: info.sector }
    : { en, ja: en, sector: sectorBySkillNumber(number) };
}
