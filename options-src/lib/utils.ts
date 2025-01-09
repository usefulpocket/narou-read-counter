import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { type DailyCount, type DailyStat } from '../types';

export function groupedDailyCounts(dailyCounts: DailyCount[]): DailyStat[] {
  const grouped = Object.groupBy(dailyCounts, item => format(item.date, 'M月d日', { locale: ja }));
  return Object.entries(grouped).map(([dateString, items]) => {
    return items.reduce((acc, current) => {
      acc.date = dateString;
      acc.episodeCount += current.episode_count || 0;
      acc.novelCount += 1;
      acc.totalCount += current.count || 0;
      return acc;
    }, { episodeCount: 0, novelCount: 0, totalCount: 0 } as DailyStat);
  });
}
