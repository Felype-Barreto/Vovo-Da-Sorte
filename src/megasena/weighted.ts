import { getLotteryConfig } from './lotteryConfigs';
import { computeFrequencies, topNumbers } from './stats';
import type { LotteryDraw, LotteryFrequencyTable, LotteryType } from './types';

function pickOneWeightedIndex(
  weights: ReadonlyArray<number>,
  random: () => number,
): number {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) {
    total += Math.max(0, weights[i] ?? 0);
  }

  if (total <= 0) return -1;

  let r = random() * total;
  for (let i = 0; i < weights.length; i += 1) {
    const w = Math.max(0, weights[i] ?? 0);
    if (w === 0) continue;
    r -= w;
    if (r <= 0) return i;
  }

  return -1;
}

/**
 * Generate a weighted bet based on frequency analysis.
 * Works for any lottery type.
 * @param freq - Frequency table (index 0 unused, 1..totalNumbers)
 * @param picks - How many numbers to pick
 * @param random - Random function (default: Math.random)
 * @returns Array of picked numbers
 */
export function generateWeightedBet(
  freq: LotteryFrequencyTable | ReadonlyArray<number>,
  picks: number = 6,
  random: () => number = Math.random,
): number[] {
  // Handle both old FrequencyTable and new LotteryFrequencyTable
  const frequencies = 'frequencies' in freq ? freq.frequencies : freq;
  
  const weights = Array.from({ length: frequencies.length }, (_, n) => {
    if (n === 0) return 0;
    const count = frequencies[n] ?? 0;
    return Math.max(0, count) + 1; // +1 to keep unseen numbers selectable
  });

  const chosen: number[] = [];

  while (chosen.length < picks) {
    const idx = pickOneWeightedIndex(weights, random);
    if (idx === -1) break;

    chosen.push(idx);
    weights[idx] = 0;
  }

  chosen.sort((a, b) => a - b);
  return chosen;
}

export function formatNumbers(numbers: number[]): string {
  return numbers.map((n) => String(n).padStart(2, '0')).join(' - ');
}

function isEven(n: number): boolean {
  return n % 2 === 0;
}

/**
 * Build coldness table for any lottery.
 * Coldness = how many draws since each number last appeared.
 */
function buildColdnessTable(drawsDesc: LotteryDraw[], totalNumbers: number): number[] {
  const coldness = Array.from({ length: totalNumbers + 1 }, () => 0);

  for (let n = 1; n <= totalNumbers; n += 1) {
    let idx = -1;
    for (let i = 0; i < drawsDesc.length; i += 1) {
      if (drawsDesc[i]!.numbers.includes(n)) {
        idx = i;
        break;
      }
    }
    coldness[n] = idx >= 0 ? idx : drawsDesc.length + 50;
  }

  return coldness;
}

function weightedPickFromCandidates(
  candidates: number[],
  weightByNumber: ReadonlyArray<number>,
  exclude: Set<number>,
  parity: 'even' | 'odd',
  random: () => number,
): number | null {
  const filtered = candidates.filter((n) => !exclude.has(n) && (parity === 'even' ? isEven(n) : !isEven(n)));
  if (filtered.length === 0) return null;

  let total = 0;
  const weights = filtered.map((n) => {
    const w = Math.max(0, weightByNumber[n] ?? 0);
    total += w;
    return w;
  });

  if (total <= 0) {
    const i = Math.floor(random() * filtered.length);
    return filtered[Math.max(0, Math.min(filtered.length - 1, i))]!;
  }

  let r = random() * total;
  for (let i = 0; i < filtered.length; i += 1) {
    r -= weights[i]!;
    if (r <= 0) return filtered[i]!;
  }

  return filtered[filtered.length - 1]!;
}

/**
 * Generate a hot/cold balanced bet for any lottery type.
 * 60% hot (frequent) + 40% cold (rare) numbers, with parity balance.
 */
export function generateHotColdBalancedBet(
  drawsDesc: LotteryDraw[] | any[],
  lotteryId: LotteryType = 'megasena',
  options?: {
    hotChance?: number; // default 0.6
    hotSetSize?: number; // default 10
    coldSetSize?: number; // default 10
    random?: () => number;
  },
): number[] {
  const config = getLotteryConfig(lotteryId);
  const random = options?.random ?? Math.random;
  const hotChance = typeof options?.hotChance === 'number' ? options.hotChance : 0.6;
  const hotSetSize = Math.min(options?.hotSetSize ?? 10, config.totalNumbers / 2);
  const coldSetSize = Math.min(options?.coldSetSize ?? 10, config.totalNumbers / 2);

  const freq = computeFrequencies(drawsDesc, config.totalNumbers, 1);
  const coldness = buildColdnessTable(drawsDesc, config.totalNumbers);

  const hotSet = new Set(topNumbers(freq, hotSetSize, 1).map((x) => x.number));

  const coldCandidates = Array.from({ length: config.totalNumbers }, (_, i) => i + 1);
  coldCandidates.sort((a, b) => (coldness[b] ?? 0) - (coldness[a] ?? 0) || a - b);
  const coldSet = new Set(coldCandidates.slice(0, coldSetSize));

  const freqWeights = Array.from(
    { length: config.totalNumbers + 1 },
    (_, n) => (n === 0 ? 0 : Math.max(0, freq[n] ?? 0) + 1),
  );
  const coldWeights = Array.from(
    { length: config.totalNumbers + 1 },
    (_, n) => (n === 0 ? 0 : Math.max(0, coldness[n] ?? 0) + 1),
  );

  const hotNumbers = Array.from(hotSet);
  const coldNumbers = Array.from(coldSet);
  const allNumbers = Array.from({ length: config.totalNumbers }, (_, i) => i + 1);

  // Generate parity plan (even/odd distribution)
  const evensNeeded = Math.ceil(config.numbersPerDraw / 2);
  const oddsNeeded = config.numbersPerDraw - evensNeeded;
  const parityPlan: Array<'even' | 'odd'> = [];
  for (let i = 0; i < evensNeeded; i += 1) parityPlan.push('even');
  for (let i = 0; i < oddsNeeded; i += 1) parityPlan.push('odd');

  // Shuffle parity plan (Fisher-Yates)
  for (let i = parityPlan.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = parityPlan[i]!;
    parityPlan[i] = parityPlan[j]!;
    parityPlan[j] = tmp;
  }

  const chosen = new Set<number>();
  const result: number[] = [];

  for (let i = 0; i < config.numbersPerDraw; i += 1) {
    const parity = parityPlan[i]!;

    const preferHot = random() < hotChance;
    const primary = preferHot ? hotNumbers : coldNumbers;
    const secondary = preferHot ? coldNumbers : hotNumbers;
    const primaryWeights = preferHot ? freqWeights : coldWeights;
    const secondaryWeights = preferHot ? coldWeights : freqWeights;

    const pick =
      weightedPickFromCandidates(primary, primaryWeights, chosen, parity, random) ??
      weightedPickFromCandidates(secondary, secondaryWeights, chosen, parity, random) ??
      weightedPickFromCandidates(allNumbers, freqWeights, chosen, parity, random);

    if (pick == null) break;
    chosen.add(pick);
    result.push(pick);
  }

  result.sort((a, b) => a - b);
  return result;
}

