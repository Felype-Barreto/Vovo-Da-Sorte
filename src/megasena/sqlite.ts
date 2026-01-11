import * as SQLite from 'expo-sqlite';

import { fetchCaixaMegaSenaDraw, fetchCaixaMegaSenaLatestContestNumber } from './caixa';
import { refreshMegaSenaHistory } from './history';
import type { MegaSenaDraw } from './types';

const DB_NAME = 'megasena.db';

export type SyncStatus = {
  success: boolean;
  localLatestContest: number | null;
  caixaLatestContest: number | null;
  synced: boolean;
  newDrawsCount: number;
  error?: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    // Prefer async API in modern expo-sqlite.
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

export async function initMegaSenaDb(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await getDb();

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS megasena_draws (
        contest INTEGER PRIMARY KEY NOT NULL,
        dateISO TEXT NOT NULL,
        n1 INTEGER NOT NULL,
        n2 INTEGER NOT NULL,
        n3 INTEGER NOT NULL,
        n4 INTEGER NOT NULL,
        n5 INTEGER NOT NULL,
        n6 INTEGER NOT NULL,
        numbersJson TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_megasena_draws_dateISO ON megasena_draws(dateISO);
    `);
  })();

  return initPromise;
}

function numbersToColumns(numbers: number[]): [number, number, number, number, number, number] {
  const n = numbers.slice().sort((a, b) => a - b);
  return [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0, n[3] ?? 0, n[4] ?? 0, n[5] ?? 0] as any;
}

export async function upsertMegaSenaDraw(draw: MegaSenaDraw): Promise<void> {
  await initMegaSenaDb();
  const db = await getDb();

  const [n1, n2, n3, n4, n5, n6] = numbersToColumns(draw.numbers);
  const numbersJson = JSON.stringify(draw.numbers.slice().sort((a, b) => a - b));

  await db.runAsync(
    `INSERT INTO megasena_draws (contest, dateISO, n1, n2, n3, n4, n5, n6, numbersJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(contest) DO UPDATE SET
       dateISO=excluded.dateISO,
       n1=excluded.n1,
       n2=excluded.n2,
       n3=excluded.n3,
       n4=excluded.n4,
       n5=excluded.n5,
       n6=excluded.n6,
       numbersJson=excluded.numbersJson;`,
    [draw.contest, draw.dateISO, n1, n2, n3, n4, n5, n6, numbersJson],
  );
}

export async function upsertMegaSenaDraws(draws: MegaSenaDraw[]): Promise<void> {
  await initMegaSenaDb();
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const draw of draws) {
      await upsertMegaSenaDraw(draw);
    }
  });
}

export async function getMegaSenaMaxContest(): Promise<number | null> {
  await initMegaSenaDb();
  const db = await getDb();

  const row = await db.getFirstAsync<{ maxContest: number | null }>(
    'SELECT MAX(contest) AS maxContest FROM megasena_draws;',
  );

  return row?.maxContest ?? null;
}

export async function getMegaSenaDrawByDateISO(dateISO: string): Promise<MegaSenaDraw | null> {
  await initMegaSenaDb();
  const db = await getDb();

  const row = await db.getFirstAsync<{
    contest: number;
    dateISO: string;
    numbersJson: string;
  }>('SELECT contest, dateISO, numbersJson FROM megasena_draws WHERE dateISO = ? LIMIT 1;', [dateISO]);

  if (!row) return null;

  try {
    const numbers = (JSON.parse(row.numbersJson) as unknown[])
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 60)
      .slice(0, 6)
      .sort((a, b) => a - b);

    if (numbers.length !== 6) return null;

    return {
      contest: row.contest,
      dateISO: row.dateISO,
      numbers,
    };
  } catch {
    return null;
  }
}

export async function getMegaSenaLatestDrawFromDb(): Promise<MegaSenaDraw | null> {
  await initMegaSenaDb();
  const db = await getDb();

  const row = await db.getFirstAsync<{
    contest: number;
    dateISO: string;
    numbersJson: string;
  }>('SELECT contest, dateISO, numbersJson FROM megasena_draws ORDER BY contest DESC LIMIT 1;');

  if (!row) return null;

  try {
    const numbers = (JSON.parse(row.numbersJson) as unknown[])
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 60)
      .slice(0, 6)
      .sort((a, b) => a - b);

    if (numbers.length !== 6) return null;

    return { contest: row.contest, dateISO: row.dateISO, numbers };
  } catch {
    return null;
  }
}

export async function listMegaSenaDrawsFromDb(options?: {
  dateFromISO?: string;
  dateToISO?: string;
  limit?: number;
}): Promise<MegaSenaDraw[]> {
  await initMegaSenaDb();
  const db = await getDb();

  const dateFromISO = options?.dateFromISO?.trim();
  const dateToISO = options?.dateToISO?.trim();
  const limit = Math.max(1, Math.min(5000, options?.limit ?? 500));

  const where: string[] = [];
  const args: any[] = [];

  if (dateFromISO) {
    where.push('dateISO >= ?');
    args.push(dateFromISO);
  }
  if (dateToISO) {
    where.push('dateISO <= ?');
    args.push(dateToISO);
  }

  const sql = `
    SELECT contest, dateISO, numbersJson
    FROM megasena_draws
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY contest DESC
    LIMIT ${limit};
  `;

  const rows = await db.getAllAsync<{ contest: number; dateISO: string; numbersJson: string }>(sql, args);

  const out: MegaSenaDraw[] = [];
  for (const row of rows) {
    try {
      const numbers = (JSON.parse(row.numbersJson) as unknown[])
        .map((x) => Number(x))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 60)
        .slice(0, 6)
        .sort((a, b) => a - b);
      if (numbers.length !== 6) continue;
      out.push({ contest: row.contest, dateISO: row.dateISO, numbers });
    } catch {
      // ignore malformed
    }
  }

  return out;
}

export async function ensureMegaSenaDbUpToDate(): Promise<SyncStatus> {
  const result: SyncStatus = {
    success: false,
    localLatestContest: null,
    caixaLatestContest: null,
    synced: false,
    newDrawsCount: 0,
  };

  try {
    await initMegaSenaDb();

    const maxContest = await getMegaSenaMaxContest();
    result.localLatestContest = maxContest;

    // Seed DB (bounded) if empty.
    if (!maxContest) {
      const seed = await refreshMegaSenaHistory({ lastN: 300 });
      await upsertMegaSenaDraws(seed);
    }

    const currentMax = (await getMegaSenaMaxContest()) ?? 0;
    result.localLatestContest = currentMax;

    let latest: number;
    try {
      latest = await fetchCaixaMegaSenaLatestContestNumber();
      result.caixaLatestContest = latest;
    } catch (err) {
      result.error = `Falha ao obter número de concurso da Caixa: ${err instanceof Error ? err.message : String(err)}`;
      result.success = false;
      return result;
    }

    if (!latest || latest <= currentMax) {
      result.synced = true;
      result.success = true;
      return result;
    }

    // Download only missing contests.
    const missing: number[] = [];
    for (let c = currentMax + 1; c <= latest; c += 1) missing.push(c);

    const concurrency = 4;
    let index = 0;
    let downloaded = 0;

    async function worker() {
      while (index < missing.length) {
        const my = index;
        index += 1;
        const contest = missing[my]!;

        try {
          const draw = await fetchCaixaMegaSenaDraw(contest);
          await upsertMegaSenaDraw(draw);
          downloaded += 1;
        } catch {
          // ignore individual contest failures
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    result.newDrawsCount = downloaded;
    result.synced = true;
    result.success = true;
  } catch (err) {
    result.error = `Erro crítico no sync: ${err instanceof Error ? err.message : String(err)}`;
    result.success = false;
  }

  return result;
}
