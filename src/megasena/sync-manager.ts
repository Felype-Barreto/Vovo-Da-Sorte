import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCaixaLotteryLatestContestNumber } from './lottery-caixa';
import { getMaxContest, upsertLotteryDraws } from './lottery-sqlite';
import { getAllLotteryIds } from './lotteryConfigs';
import { ensureMegaSenaDbUpToDate, type SyncStatus } from './sqlite';
import type { LotteryType } from './types';

const LAST_SYNC_KEY = '@megasena_last_sync_timestamp';
const LAST_MULTI_SYNC_KEY = '@all_lotteries_last_sync_timestamp';
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export type SyncCheckResult = {
  shouldSync: boolean;
  lastSyncTime: number | null;
  timeSinceLastSync: number | null;
  reason?: string;
};

export type MultiLotterySyncStatus = {
  success: boolean;
  synced: boolean;
  results: Map<LotteryType, { contest: number | null; newDraws: number; error?: string }>;
  totalNewDraws: number;
  error?: string;
};

/**
 * Check if we should perform a sync based on last sync time.
 * Always returns true on first run or if more than SYNC_INTERVAL_MS has passed.
 */
export async function shouldPerformSync(): Promise<SyncCheckResult> {
  try {
    const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr, 10) : null;
    const now = Date.now();

    if (!lastSyncTime) {
      return {
        shouldSync: true,
        lastSyncTime: null,
        timeSinceLastSync: null,
        reason: 'First run - no previous sync found',
      };
    }

    const timeSince = now - lastSyncTime;
    if (timeSince >= SYNC_INTERVAL_MS) {
      return {
        shouldSync: true,
        lastSyncTime,
        timeSinceLastSync: timeSince,
        reason: `Last sync was ${Math.floor(timeSince / 1000 / 60)} minutes ago`,
      };
    }

    return {
      shouldSync: false,
      lastSyncTime,
      timeSinceLastSync: timeSince,
      reason: `Recent sync ${Math.floor(timeSince / 1000 / 60)} minutes ago`,
    };
  } catch (err) {
    console.warn('[SyncManager] Error checking last sync time:', err);
    return {
      shouldSync: true,
      lastSyncTime: null,
      timeSinceLastSync: null,
      reason: 'Error reading sync time, forcing sync',
    };
  }
}

/**
 * Check if we should perform multi-lottery sync.
 */
export async function shouldPerformMultiSync(): Promise<SyncCheckResult> {
  try {
    const lastSyncStr = await AsyncStorage.getItem(LAST_MULTI_SYNC_KEY);
    const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr, 10) : null;
    const now = Date.now();

    if (!lastSyncTime) {
      return {
        shouldSync: true,
        lastSyncTime: null,
        timeSinceLastSync: null,
        reason: 'First multi-lottery sync',
      };
    }

    const timeSince = now - lastSyncTime;
    if (timeSince >= SYNC_INTERVAL_MS) {
      return {
        shouldSync: true,
        lastSyncTime,
        timeSinceLastSync: timeSince,
        reason: `Last multi-sync was ${Math.floor(timeSince / 1000 / 60)} minutes ago`,
      };
    }

    return {
      shouldSync: false,
      lastSyncTime,
      timeSinceLastSync: timeSince,
      reason: `Recent multi-sync ${Math.floor(timeSince / 1000 / 60)} minutes ago`,
    };
  } catch (err) {
    console.warn('[SyncManager] Error checking multi-sync time:', err);
    return {
      shouldSync: true,
      lastSyncTime: null,
      timeSinceLastSync: null,
      reason: 'Error reading sync time, forcing sync',
    };
  }
}

/**
 * Perform sync for all lotteries if needed.
 */
export async function performMultiSyncIfNeeded(): Promise<{ status: MultiLotterySyncStatus; checkResult: SyncCheckResult }> {
  const checkResult = await shouldPerformMultiSync();

  if (!checkResult.shouldSync) {
    return {
      status: {
        success: true,
        synced: false,
        results: new Map(),
        totalNewDraws: 0,
      },
      checkResult,
    };
  }

  const status: MultiLotterySyncStatus = {
    success: true,
    synced: true,
    results: new Map(),
    totalNewDraws: 0,
  };

  const allLotteries = getAllLotteryIds() as LotteryType[];

  for (const lotteryId of allLotteries) {
    try {
      const maxLocal = await getMaxContest(lotteryId);
      const maxCaixa = await fetchCaixaLotteryLatestContestNumber(lotteryId);

      if (!maxCaixa || maxCaixa <= (maxLocal ?? 0)) {
        status.results.set(lotteryId, { contest: maxLocal, newDraws: 0 });
        continue;
      }

      // Download missing contests
      const missing = [];
      for (let c = (maxLocal ?? 0) + 1; c <= maxCaixa; c += 1) {
        missing.push(c);
      }

      let downloaded = 0;
      for (const contest of missing) {
        try {
          const draw = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${lotteryId}/${contest}`)
            .then((r) => r.json());
          // Basic validation
          if (draw.numero) {
            const draws = [{ type: lotteryId, contest: draw.numero, dateISO: draw.dataApuracao || '', numbers: draw.listaDezenas || [] }];
            await upsertLotteryDraws(draws as any);
            downloaded += 1;
          }
        } catch {
          // ignore individual contest failures
        }
      }

      status.results.set(lotteryId, { contest: maxCaixa, newDraws: downloaded });
      status.totalNewDraws += downloaded;
    } catch (err) {
      console.warn(`[SyncManager] Error syncing ${lotteryId}:`, err);
      status.results.set(lotteryId, {
        contest: null,
        newDraws: 0,
        error: err instanceof Error ? err.message : String(err),
      });
      status.success = false;
    }
  }

  // Update timestamp
  try {
    await AsyncStorage.setItem(LAST_MULTI_SYNC_KEY, Date.now().toString());
  } catch (err) {
    console.warn('[SyncManager] Error saving multi-sync time:', err);
  }

  return { status, checkResult };
}

/**
 * Perform sync if needed and update last sync timestamp.
 * Always returns the sync status regardless of whether sync was performed.
 */
export async function performSyncIfNeeded(): Promise<{ status: SyncStatus; synced: boolean; checkResult: SyncCheckResult }> {
  const checkResult = await shouldPerformSync();

  if (!checkResult.shouldSync) {
    // Return a cached status without actually syncing
    return {
      status: {
        success: true,
        localLatestContest: null,
        caixaLatestContest: null,
        synced: false,
        newDrawsCount: 0,
      },
      synced: false,
      checkResult,
    };
  }

  const status = await ensureMegaSenaDbUpToDate();

  // Always update last sync time after an attempt (success or not)
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (err) {
    console.warn('[SyncManager] Error saving last sync time:', err);
  }

  return {
    status,
    synced: true,
    checkResult,
  };
}

/**
 * Force an immediate sync regardless of timing.
 */
export async function forceSyncNow(): Promise<{ status: SyncStatus; checkResult: SyncCheckResult }> {
  const status = await ensureMegaSenaDbUpToDate();

  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (err) {
    console.warn('[SyncManager] Error saving last sync time after force:', err);
  }

  return {
    status,
    checkResult: {
      shouldSync: true,
      lastSyncTime: Date.now(),
      timeSinceLastSync: 0,
      reason: 'Force sync triggered by user',
    },
  };
}
