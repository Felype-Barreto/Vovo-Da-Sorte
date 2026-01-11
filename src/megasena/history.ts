import { clearLotterySyncCache, syncLotteryData } from './sync';
import type { MegaSenaDraw } from './types';

let historyPromise: Promise<MegaSenaDraw[]> | null = null;

export async function getMegaSenaHistory(options?: { lastN?: number }): Promise<MegaSenaDraw[]> {
  if (!historyPromise) {
    historyPromise = syncLotteryData({ lastN: options?.lastN ?? 300 });
  }

  return historyPromise;
}

export async function clearMegaSenaHistoryCache(): Promise<void> {
  historyPromise = null;
  await clearLotterySyncCache();
}

export async function refreshMegaSenaHistory(options?: { lastN?: number }): Promise<MegaSenaDraw[]> {
  historyPromise = syncLotteryData({ lastN: options?.lastN ?? 300, forceRefresh: true });
  return historyPromise;
}
