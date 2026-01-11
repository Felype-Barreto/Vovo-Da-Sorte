import * as SQLite from 'expo-sqlite';
import type { LotteryType } from './types';

const DB_NAME = 'lotteries.db';

export type SavedBet = {
  id: string; // UUID
  lotteryId: LotteryType;
  numbers: number[];
  contest?: number; // concurso associado (para agrupar no histórico)
  createdAt: number; // timestamp
  playedAt?: number; // quando foi/será apostado
  costPerGame: number;
  totalCost: number;
  notes?: string;
  isPlayed: boolean;
  closureId?: string; // referência a um fechamento se aplicável
};

export type BetResult = {
  id: string;
  betId: string;
  drawContest: number;
  drawDate: string;
  hits: number;
  prizeAmount?: number;
  resultType: 'nohit' | 'partial' | 'quina' | 'sena';
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

export async function initBetsDb(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await getDb();

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS saved_bets (
        id TEXT PRIMARY KEY NOT NULL,
        lotteryId TEXT NOT NULL,
        numbers TEXT NOT NULL,
        contest INTEGER,
        createdAt INTEGER NOT NULL,
        playedAt INTEGER,
        costPerGame REAL NOT NULL,
        totalCost REAL NOT NULL,
        notes TEXT,
        isPlayed INTEGER NOT NULL DEFAULT 0,
        closureId TEXT
      );
      
      CREATE TABLE IF NOT EXISTS bet_results (
        id TEXT PRIMARY KEY NOT NULL,
        betId TEXT NOT NULL,
        drawContest INTEGER NOT NULL,
        drawDate TEXT NOT NULL,
        hits INTEGER NOT NULL,
        prizeAmount REAL,
        resultType TEXT NOT NULL,
        FOREIGN KEY(betId) REFERENCES saved_bets(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_saved_bets_lotteryId ON saved_bets(lotteryId);
      CREATE INDEX IF NOT EXISTS idx_saved_bets_createdAt ON saved_bets(createdAt);
      CREATE INDEX IF NOT EXISTS idx_bet_results_betId ON bet_results(betId);
    `);

    // Migration: add contest column if DB existed before.
    const cols = await db.getAllAsync<any>('PRAGMA table_info(saved_bets);');
    const hasContest = cols.some((c: any) => c?.name === 'contest');
    if (!hasContest) {
      await db.execAsync('ALTER TABLE saved_bets ADD COLUMN contest INTEGER;');
    }
  })();

  return initPromise;
}

/**
 * Salvar uma aposta
 */
export async function saveBet(bet: Omit<SavedBet, 'id'>): Promise<string> {
  await initBetsDb();
  const db = await getDb();

  const id = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const numbersJson = JSON.stringify(bet.numbers);

  await db.runAsync(
    `INSERT INTO saved_bets (id, lotteryId, numbers, contest, createdAt, playedAt, costPerGame, totalCost, notes, isPlayed, closureId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      bet.lotteryId,
      numbersJson,
      typeof bet.contest === 'number' ? bet.contest : null,
      bet.createdAt,
      bet.playedAt || null,
      bet.costPerGame,
      bet.totalCost,
      bet.notes || null,
      bet.isPlayed ? 1 : 0,
      bet.closureId || null,
    ],
  );

  return id;
}

/**
 * Listar apostas salvas
 */
export async function listSavedBets(lotteryId?: LotteryType): Promise<SavedBet[]> {
  await initBetsDb();
  const db = await getDb();

  let sql = 'SELECT * FROM saved_bets';
  const params: any[] = [];

  if (lotteryId) {
    sql += ' WHERE lotteryId = ?';
    params.push(lotteryId);
  }

  sql += ' ORDER BY createdAt DESC;';

  const rows = await db.getAllAsync<any>(sql, params);

  return rows.map((row) => ({
    id: row.id,
    lotteryId: row.lotteryId,
    numbers: JSON.parse(row.numbers),
    contest: typeof row.contest === 'number' ? row.contest : null,
    createdAt: row.createdAt,
    playedAt: row.playedAt,
    costPerGame: row.costPerGame,
    totalCost: row.totalCost,
    notes: row.notes,
    isPlayed: row.isPlayed === 1,
    closureId: row.closureId,
  }));
}

/**
 * Obter uma aposta específica
 */
export async function getBet(betId: string): Promise<SavedBet | null> {
  await initBetsDb();
  const db = await getDb();

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM saved_bets WHERE id = ?;',
    [betId],
  );

  if (!row) return null;

  return {
    id: row.id,
    lotteryId: row.lotteryId,
    numbers: JSON.parse(row.numbers),
    contest: typeof row.contest === 'number' ? row.contest : null,
    createdAt: row.createdAt,
    playedAt: row.playedAt,
    costPerGame: row.costPerGame,
    totalCost: row.totalCost,
    notes: row.notes,
    isPlayed: row.isPlayed === 1,
    closureId: row.closureId,
  };
}

/**
 * Atualizar uma aposta
 */
export async function updateBet(betId: string, updates: Partial<SavedBet>): Promise<void> {
  await initBetsDb();
  const db = await getDb();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.playedAt !== undefined) {
    fields.push('playedAt = ?');
    values.push(updates.playedAt);
  }
  if (updates.isPlayed !== undefined) {
    fields.push('isPlayed = ?');
    values.push(updates.isPlayed ? 1 : 0);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  if (fields.length === 0) return;

  values.push(betId);
  const sql = `UPDATE saved_bets SET ${fields.join(', ')} WHERE id = ?;`;
  await db.runAsync(sql, values);
}

/**
 * Deletar uma aposta
 */
export async function deleteBet(betId: string): Promise<void> {
  await initBetsDb();
  const db = await getDb();

  // Deletar resultados associados
  await db.runAsync('DELETE FROM bet_results WHERE betId = ?;', [betId]);
  // Deletar a aposta
  await db.runAsync('DELETE FROM saved_bets WHERE id = ?;', [betId]);
}

/**
 * Limpa todo o histórico (todas as apostas e resultados).
 */
export async function clearAllBets(): Promise<void> {
  await initBetsDb();
  const db = await getDb();

  await db.execAsync('DELETE FROM bet_results;');
  await db.execAsync('DELETE FROM saved_bets;');
}

/**
 * Registrar um resultado de aposta
 */
export async function recordBetResult(result: Omit<BetResult, 'id'>): Promise<string> {
  await initBetsDb();
  const db = await getDb();

  const id = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.runAsync(
    `INSERT INTO bet_results (id, betId, drawContest, drawDate, hits, prizeAmount, resultType)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, result.betId, result.drawContest, result.drawDate, result.hits, result.prizeAmount || null, result.resultType],
  );

  return id;
}

/**
 * Listar resultados de uma aposta
 */
export async function getBetResults(betId: string): Promise<BetResult[]> {
  await initBetsDb();
  const db = await getDb();

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM bet_results WHERE betId = ? ORDER BY drawDate DESC;',
    [betId],
  );

  return rows.map((row) => ({
    id: row.id,
    betId: row.betId,
    drawContest: row.drawContest,
    drawDate: row.drawDate,
    hits: row.hits,
    prizeAmount: row.prizeAmount,
    resultType: row.resultType,
  }));
}

/**
 * Estatísticas gerais de apostas
 */
export async function getBetsStatistics(): Promise<{
  totalBets: number;
  totalSpent: number;
  totalWon: number;
  netProfit: number;
  betsByLottery: Map<LotteryType, number>;
}> {
  await initBetsDb();
  const db = await getDb();

  const bets = await listSavedBets();
  const totalBets = bets.length;
  const totalSpent = bets.reduce((sum, bet) => sum + bet.totalCost, 0);

  const results = await db.getAllAsync<any>('SELECT SUM(prizeAmount) as total FROM bet_results;');
  const totalWon = results[0]?.total ?? 0;
  const netProfit = totalWon - totalSpent;

  const betsByLottery = new Map<LotteryType, number>();
  for (const bet of bets) {
    betsByLottery.set(bet.lotteryId, (betsByLottery.get(bet.lotteryId) ?? 0) + 1);
  }

  return {
    totalBets,
    totalSpent,
    totalWon,
    netProfit,
    betsByLottery,
  };
}
