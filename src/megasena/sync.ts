import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadCaixaMegaSenaHistory } from './caixa';
import type { MegaSenaDraw } from './types';

const CACHE_KEY = 'megasena.history.v1';
const LAST_BACKUP_KEY = 'last_backup.json';

const DEFAULT_TIMEOUT_MS = 12_000;

type CachedHistory = {
  fetchedAtISO: string;
  draws: MegaSenaDraw[];
};

type SyncOptions = {
  lastN?: number;
  timeoutMs?: number;
  forceRefresh?: boolean;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    promise
      .then((v) => {
        clearTimeout(id);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(id);
        reject(e);
      });
  });
}

async function tryWriteCache(draws: MegaSenaDraw[]): Promise<void> {
  try {
    const payload: CachedHistory = { fetchedAtISO: new Date().toISOString(), draws };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

async function tryReadCache(): Promise<MegaSenaDraw[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedHistory;
    if (!parsed || !Array.isArray(parsed.draws)) return null;
    return parsed.draws;
  } catch {
    return null;
  }
}

async function tryWriteLastBackupJson(draws: MegaSenaDraw[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_BACKUP_KEY, JSON.stringify(draws));
  } catch {
    // ignore
  }
}

async function tryReadLastBackupJson(): Promise<MegaSenaDraw[] | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as MegaSenaDraw[];
  } catch {
    return null;
  }
}

async function tryPrimaryCaixa(lastN: number): Promise<MegaSenaDraw[] | null> {
  try {
    const draws = await loadCaixaMegaSenaHistory({ lastN });
    return draws.length ? draws : null;
  } catch {
    return null;
  }
}

async function tryPlanCLastBackup(): Promise<MegaSenaDraw[] | null> {
  const draws = await tryReadLastBackupJson();
  return draws && draws.length ? draws : null;
}

export async function syncLotteryData(options?: SyncOptions): Promise<MegaSenaDraw[]> {
  const lastN = options?.lastN ?? 300;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const forceRefresh = options?.forceRefresh ?? false;

  const cached = await tryReadCache();

  const tryOnline = async (): Promise<MegaSenaDraw[] | null> => {
    // A) Tentativa Principal: Caixa (bounded)
    try {
      const caixa = await withTimeout(tryPrimaryCaixa(lastN), timeoutMs);
      if (caixa && caixa.length) {
        await tryWriteCache(caixa);
        await tryWriteLastBackupJson(caixa);
        return caixa;
      }
    } catch {
      // continue
    }
    return null;
  };

  // If we have cache and not forcing, try to refresh but don't block forever.
  if (cached && cached.length && !forceRefresh) {
    const fresh = await tryOnline();
    return fresh && fresh.length ? fresh : cached;
  }

  // No cache or forced refresh: try online first.
  const online = await tryOnline();
  if (online && online.length) return online;

  // C) Plano C: last_backup.json no AsyncStorage do celular
  const backup = await tryPlanCLastBackup();
  if (backup && backup.length) {
    await tryWriteCache(backup);
    return backup;
  }

  // Caixa-only mode: no synthetic fallback
  return [];
}

export async function clearLotterySyncCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
