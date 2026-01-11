import * as SQLite from 'expo-sqlite';

import { getLotteryConfig } from './lotteryConfigs';
import type { LotteryDraw, LotteryType } from './types';

const DB_NAME = 'lotteries.db';

export type SyncStatusGeneric = {
  lotteryId: LotteryType;
  success: boolean;
  localLatestContest: number | null;
  caixaLatestContest: number | null;
  synced: boolean;
  newDrawsCount: number;
  error?: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Map<LotteryType, Promise<void>> = new Map();

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

/**
 * Initialize database schema for a specific lottery type.
 */
async function initLotteryDb(lotteryId: LotteryType): Promise<void> {
  const existing = initPromise.get(lotteryId);
  if (existing) return existing;

  const promise = (async () => {
    const db = await getDb();
    const tableName = `${lotteryId}_draws`;

    // Dynamic SQL for variable column count
    const config = getLotteryConfig(lotteryId);
    const numberColumns = Array.from({ length: config.numbersPerDraw }, (_, i) => `n${i + 1} INTEGER NOT NULL`).join(',');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS ${tableName} (
        contest INTEGER PRIMARY KEY NOT NULL,
        dateISO TEXT NOT NULL,
        ${numberColumns},
        numbersJson TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_${lotteryId}_draws_dateISO ON ${tableName}(dateISO);
    `);
  })();

  initPromise.set(lotteryId, promise);
  return promise;
}

/**
 * Insert or update a lottery draw.
 */
export async function upsertLotteryDraw(draw: LotteryDraw): Promise<void> {
  await initLotteryDb(draw.type);
  const db = await getDb();

  const config = getLotteryConfig(draw.type);
  const tableName = `${draw.type}_draws`;
  const numbersJson = JSON.stringify(draw.numbers.slice().sort((a, b) => a - b));

  // Generate column placeholders and values
  const numberValues = draw.numbers.slice().sort((a, b) => a - b);
  while (numberValues.length < config.numbersPerDraw) {
    numberValues.push(0);
  }

  const numberColumns = Array.from({ length: config.numbersPerDraw }, (_, i) => `n${i + 1}`).join(',');
  const numberPlaceholders = Array.from({ length: config.numbersPerDraw }, () => '?').join(',');
  const updateNumberColumns = Array.from({ length: config.numbersPerDraw }, (_, i) => `n${i + 1}=excluded.n${i + 1}`).join(',');

  const sql = `
    INSERT INTO ${tableName} (contest, dateISO, ${numberColumns}, numbersJson)
    VALUES (?, ?, ${numberPlaceholders}, ?)
    ON CONFLICT(contest) DO UPDATE SET
      dateISO=excluded.dateISO,
      ${updateNumberColumns},
      numbersJson=excluded.numbersJson;
  `;

  await db.runAsync(sql, [draw.contest, draw.dateISO, ...numberValues, numbersJson]);
}

/**
 * Insert or update multiple lottery draws.
 */
export async function upsertLotteryDraws(draws: LotteryDraw[]): Promise<void> {
  if (draws.length === 0) return;

  await initLotteryDb(draws[0]!.type);
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const draw of draws) {
      await upsertLotteryDraw(draw);
    }
  });
}

/**
 * Get the maximum contest number for a lottery.
 */
export async function getMaxContest(lotteryId: LotteryType): Promise<number | null> {
  await initLotteryDb(lotteryId);
  const db = await getDb();
  const tableName = `${lotteryId}_draws`;

  const row = await db.getFirstAsync<{ maxContest: number | null }>(
    `SELECT MAX(contest) AS maxContest FROM ${tableName};`,
  );

  return row?.maxContest ?? null;
}

/**
 * Get a lottery draw by dateISO.
 */
export async function getLotteryDrawByDateISO(lotteryId: LotteryType, dateISO: string): Promise<LotteryDraw | null> {
  await initLotteryDb(lotteryId);
  const db = await getDb();
  const tableName = `${lotteryId}_draws`;

  const row = await db.getFirstAsync<any>(
    `SELECT * FROM ${tableName} WHERE dateISO = ? ORDER BY contest DESC LIMIT 1;`,
    [dateISO],
  );

  if (!row) return null;

  return {
    type: lotteryId,
    contest: row.contest,
    dateISO: row.dateISO,
    numbers: JSON.parse(row.numbersJson) as number[],
  };
}

/**
 * Get the latest lottery draw.
 */
export async function getLatestLotteryDraw(lotteryId: LotteryType): Promise<LotteryDraw | null> {
  await initLotteryDb(lotteryId);
  const db = await getDb();
  const tableName = `${lotteryId}_draws`;

  const row = await db.getFirstAsync<any>(
    `SELECT * FROM ${tableName} ORDER BY contest DESC LIMIT 1;`,
  );

  if (!row) return null;

  return {
    type: lotteryId,
    contest: row.contest,
    dateISO: row.dateISO,
    numbers: JSON.parse(row.numbersJson) as number[],
  };
}

/**
 * List all lottery draws with optional filters.
 */
export async function listLotteryDraws(
  lotteryId: LotteryType,
  options?: {
    dateFrom?: string; // YYYY-MM-DD
    dateTo?: string; // YYYY-MM-DD
    limit?: number;
    offset?: number;
  },
): Promise<LotteryDraw[]> {
  await initLotteryDb(lotteryId);
  const db = await getDb();
  const tableName = `${lotteryId}_draws`;

  let sql = `SELECT * FROM ${tableName}`;
  const params: any[] = [];

  if (options?.dateFrom) {
    sql += ` WHERE dateISO >= ?`;
    params.push(options.dateFrom);
  }

  if (options?.dateTo) {
    sql += params.length > 0 ? ` AND dateISO <= ?` : ` WHERE dateISO <= ?`;
    params.push(options.dateTo);
  }

  sql += ` ORDER BY contest DESC`;

  if (options?.limit) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  if (options?.offset) {
    sql += ` OFFSET ?`;
    params.push(options.offset);
  }

  sql += `;`;

  const rows = await db.getAllAsync<any>(sql, params);

  return rows.map((row) => ({
    type: lotteryId,
    contest: row.contest,
    dateISO: row.dateISO,
    numbers: JSON.parse(row.numbersJson) as number[],
  }));
}

/**
 * Clear all draws for a lottery (useful for testing/reset).
 */
export async function clearLotteryDraws(lotteryId: LotteryType): Promise<void> {
  await initLotteryDb(lotteryId);
  const db = await getDb();
  const tableName = `${lotteryId}_draws`;

  await db.runAsync(`DELETE FROM ${tableName};`);
}
