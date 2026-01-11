import type { FrequencyTable, LotteryDraw } from './types';

/**
 * Compute frequency table for any lottery type.
 * @param draws - Array of lottery draws
 * @param maxNumber - Maximum value that can appear in this lottery (inclusive)
 * @param minNumber - Minimum value that can appear in this lottery (inclusive). Default 1.
 * @returns Frequency array indexed by the actual number value (e.g., freq[10] = count).
 */
export function computeFrequencies(
  draws: LotteryDraw[] | any[],
  maxNumber: number = 60,
  minNumber: number = 1,
): number[] {
  const safeMax = Math.max(0, Math.floor(maxNumber));
  const freq = Array.from({ length: safeMax + 1 }, () => 0);

  for (const draw of draws) {
    for (const n of draw.numbers) {
      if (Number.isInteger(n) && n >= minNumber && n <= safeMax) {
        freq[n] += 1;
      }
    }
  }

  return freq;
}

export function topNumbers(
  freq: FrequencyTable | number[],
  limit: number,
  minNumber: number = 1,
): Array<{ number: number; count: number }> {
  const items: Array<{ number: number; count: number }> = [];

  const maxNum = Math.max(0, freq.length - 1);
  const start = Math.max(0, Math.floor(minNumber));

  for (let n = start; n <= maxNum; n += 1) {
    items.push({ number: n, count: freq[n] ?? 0 });
  }

  items.sort((a, b) => b.count - a.count || a.number - b.number);
  return items.slice(0, Math.max(0, limit));
}
