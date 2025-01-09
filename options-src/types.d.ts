export interface DailyCount {
  date: Date;
  ncode: string;
  episode_count: number;
  count: number;
}
export interface DailyStat {
  date: string;
  totalCount: number;
  novelCount: number;
  episodeCount: number;
}
