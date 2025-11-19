
export interface GDPDataPoint {
  country: string;
  code: string; // ISO Alpha-3 preferred or Alpha-2
  lat: number;
  lng: number;
  gdp: number; // In Billions USD
  growthRate: number; // Percentage
  rank: number;
  color?: string;
}

export interface AIAnalysis {
  summary: string;
  keySectors: string[];
  outlook: string;
}

export enum ViewMode {
  GDP_NOMINAL = 'GDP_NOMINAL',
  GROWTH_RATE = 'GROWTH_RATE',
}

export type Language = 'en' | 'zh' | 'fr' | 'ja';

export interface TranslationDictionary {
  appTitle: string;
  poweredBy: string;
  clickToExplore: string;
  rankingsTitle: string;
  searchPlaceholder: string;
  economiesTracked: string;
  globalRank: string;
  gdpNominal: string;
  growthRate: string;
  aiInsights: string;
  keySectors: string;
  outlook: string;
  analyzing: string;
  analysisUnavailable: string;
  compareTitle: string;
  compareSubtitle: string;
  comparativeInsight: string;
  gdpDifference: string;
  growthDelta: string;
  rankingGap: string;
  positions: string;
  difference: string;
  larger: string;
  noCountriesFound: string;
  settings: string;
  selectLanguage: string;
  continue: string;
}
