import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { fetchCaixaMegaSenaRaw } from './caixa';
import type { LotteryType } from './types';

const ENABLED_KEY = 'alerts.megasena.jackpot.enabled.v1';
const LAST_NOTIFIED_CONTEST_KEY = 'alerts.megasena.jackpot.lastNotifiedContest.v1';

const NEW_RESULT_ENABLED_KEY = 'alerts.newResult.enabled.v1';
const NEW_RESULT_LAST_CONTEST_PREFIX = 'alerts.newResult.lastContest.';

export type JackpotInfo = {
  contest: number;
  nextContest: number | null;
  acumulado: boolean;
  estimatedNextJackpot: number; // BRL
};

function parseBRMoney(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;

  // Examples: "3500000,0", "0,0", sometimes with thousand separators.
  const cleaned = value.trim().replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchMegaSenaJackpotInfo(): Promise<JackpotInfo> {
  const raw = await fetchCaixaMegaSenaRaw();

  return {
    contest: typeof raw.numero === 'number' ? raw.numero : 0,
    nextContest: typeof raw.numeroConcursoProximo === 'number' ? raw.numeroConcursoProximo : null,
    acumulado: Boolean((raw as any).acumulado),
    estimatedNextJackpot: parseBRMoney((raw as any).valorEstimadoProximoConcurso),
  };
}

export async function isJackpotAlertEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ENABLED_KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

export async function setJackpotAlertEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

async function getLastNotifiedContest(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_NOTIFIED_CONTEST_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

async function setLastNotifiedContest(contest: number): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_NOTIFIED_CONTEST_KEY, String(contest));
  } catch {
    // ignore
  }
}

export async function ensureNotificationsPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function isNewResultAlertEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(NEW_RESULT_ENABLED_KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

export async function setNewResultAlertEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NEW_RESULT_ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

async function getLastNewResultContest(lotteryId: LotteryType): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(`${NEW_RESULT_LAST_CONTEST_PREFIX}${lotteryId}`);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

async function setLastNewResultContest(lotteryId: LotteryType, contest: number): Promise<void> {
  try {
    await AsyncStorage.setItem(`${NEW_RESULT_LAST_CONTEST_PREFIX}${lotteryId}`, String(contest));
  } catch {
    // ignore
  }
}

/**
 * Best-effort new-result notifier.
 * IMPORTANT: This checks during app usage (open/refresh). It is not a background service.
 */
export async function maybeNotifyNewResultKnownContest(options: {
  lotteryId: LotteryType;
  lotteryName: string;
  latestContest: number | undefined;
}): Promise<void> {
  const enabled = await isNewResultAlertEnabled();
  if (!enabled) return;

  const contest = typeof options.latestContest === 'number' ? options.latestContest : 0;
  if (!contest) return;

  const last = await getLastNewResultContest(options.lotteryId);
  // First run: set baseline without notifying.
  if (last == null) {
    await setLastNewResultContest(options.lotteryId, contest);
    return;
  }

  if (contest <= last) return;

  const allowed = await ensureNotificationsPermission();
  if (!allowed) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: options.lotteryName,
      body: `Saiu um resultado novo: Concurso ${contest}.`,
    },
    trigger: null,
  });

  await setLastNewResultContest(options.lotteryId, contest);
}

export async function maybeNotifyJackpotAbove(thresholdBRL: number): Promise<JackpotInfo | null> {
  const enabled = await isJackpotAlertEnabled();
  if (!enabled) return null;

  const info = await fetchMegaSenaJackpotInfo();
  if (!info.contest) return info;

  const last = await getLastNotifiedContest();
  if (last === info.contest) return info;

  if (info.estimatedNextJackpot < thresholdBRL) return info;

  const allowed = await ensureNotificationsPermission();
  if (!allowed) return info;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mega-Sena',
      body: `Estimativa do próximo concurso: R$ ${info.estimatedNextJackpot.toLocaleString('pt-BR')}.`,
    },
    trigger: null,
  });

  await setLastNotifiedContest(info.contest);
  return info;
}
