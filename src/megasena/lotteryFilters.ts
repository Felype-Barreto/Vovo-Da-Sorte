import type { LotteryDraw, LotteryType } from './types';

/**
 * Filter options specific to each lottery type.
 */
export type LotterySpecificFilters = {
  // Lotofácil specific
  repeatFromPreviousDraw?: boolean; // 8-10 numbers typically repeat

  // Lotomania specific
  includeMirrorGame?: boolean; // Generate mirror game (100 - n for each number)
};

/**
 * For Lotofácil: analyze and suggest numbers that repeated from previous draw.
 * Statistically, 8-10 numbers repeat from the previous draw.
 */
export function getLotofacilRepeatCandidates(
  draws: LotteryDraw[],
  count: number = 10,
): Array<{ number: number; repeatChance: number }> {
  if (draws.length < 2) return [];

  const latestDraw = draws[0];
  const previousDraw = draws[1];

  if (!latestDraw || !previousDraw) return [];

  const previousNumbers = new Set(previousDraw.numbers);
  const repeatingNumbers = latestDraw.numbers.filter((n) => previousNumbers.has(n));

  // Build frequency of repeats across multiple historical draws
  const repeatFrequency = new Map<number, number>();
  for (let i = 0; i < Math.min(draws.length - 1, 50); i += 1) {
    const current = draws[i];
    const previous = draws[i + 1];

    if (!current || !previous) continue;

    const prevSet = new Set(previous.numbers);
    for (const n of current.numbers) {
      if (prevSet.has(n)) {
        repeatFrequency.set(n, (repeatFrequency.get(n) ?? 0) + 1);
      }
    }
  }

  const candidates = Array.from(repeatFrequency.entries()).map(([number, freq]) => ({
    number,
    repeatChance: freq / Math.min(draws.length - 1, 50),
  }));

  candidates.sort((a, b) => b.repeatChance - a.repeatChance);
  return candidates.slice(0, count);
}

/**
 * For Lotomania: generate the "mirror" or "complementary" game.
 * Each number is converted to (100 - n), maintaining the same frequency of hits.
 */
export function getLotomaniaeMirrorGame(baseGame: number[]): number[] {
  const mirrored = baseGame.map((n) => 100 - n).sort((a, b) => a - b);
  return mirrored;
}

/**
 * For any lottery: check how many numbers match with a reference draw.
 */
export function countHitsAgainstDraw(playedNumbers: number[], referenceNumbers: number[]): number {
  const playedSet = new Set(playedNumbers);
  return referenceNumbers.filter((n) => playedSet.has(n)).length;
}

/**
 * For Dupla Sena: analyze both draws and suggest best numbers from either.
 * Dupla Sena has two draws per contest, increasing match probability.
 */
export function getDuplasenaStats(draws: LotteryDraw[]): {
  totalDraws: number;
  bestNumbersFromFirstDraw: Array<{ number: number; hits: number }>;
  bestNumbersFromSecondDraw: Array<{ number: number; hits: number }>;
  combinedBest: Array<{ number: number; hits: number }>;
} {
  // Note: In Dupla Sena, each contest has two separate draws with their own 6 numbers.
  // This would require extending LotteryDraw to handle multiple draws per contest.
  // For now, this is a placeholder for future enhancement.

  return {
    totalDraws: draws.length,
    bestNumbersFromFirstDraw: [],
    bestNumbersFromSecondDraw: [],
    combinedBest: [],
  };
}

/**
 * Apply specific filter to a list of draws based on lottery type.
 */
export function applyLotterySpecificFilter(
  draws: LotteryDraw[],
  lotteryId: LotteryType,
  filters: LotterySpecificFilters,
): LotteryDraw[] {
  if (lotteryId === 'lotofacil' && filters.repeatFromPreviousDraw) {
    // Filter to only show draws that had significant repeats from previous
    // This is more of an analysis feature than filtering
    return draws;
  }

  return draws;
}
