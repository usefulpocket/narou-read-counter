import { openDB } from 'idb';
import { startOfMonth, endOfMonth, endOfDay } from 'date-fns';
import { type DailyCount } from '../types';

const DB_NAME = 'NarouReadCounterDB';
const DB_VERSION = 1;

export async function getDailyCounts(targetDate: Date): Promise<DailyCount[]> {
  const db = await openDB(DB_NAME, DB_VERSION);
  const index = db.transaction('dailyCounts', 'readonly').store.index('dateIndex');

  const startDate = startOfMonth(targetDate);
  const endDate = endOfDay(endOfMonth(targetDate));

  const range = IDBKeyRange.bound(startDate, endDate);
  let cursor = await index.openCursor(range, 'prev');
  const results: DailyCount[] = [];

  while (cursor) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }

  return results;
}
