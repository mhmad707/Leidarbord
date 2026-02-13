
export interface SheetRow {
  [key: string]: string | number;
}

export interface LeaderboardConfig {
  nameColumn: string;
  scoreColumn: string;
  rankColumn?: string;
  groupColumn?: string;
  imageColumn?: string;
}

export interface GeminiAnalysis {
  summary: string;
  topPerformers: string[];
  trends: string;
  config: LeaderboardConfig;
}

export interface AppState {
  data: SheetRow[];
  analysis: GeminiAnalysis | null;
  loading: boolean;
  error: string | null;
  sheetUrl: string;
}
