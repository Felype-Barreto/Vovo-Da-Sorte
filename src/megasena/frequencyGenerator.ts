import { getLotteryConfig } from './lotteryConfigs';
import type { LotteryDraw, LotteryType } from './types';

/**
 * Motor de Geração Determinístico (Sem Aleatoriedade)
 * 
 * Algoritmo:
 * 1. Ranking de frequência (números que mais saíram historicamente)
 * 2. Lei dos Grandes Números: Identifica números "atrasados"
 * 3. Tendência: Analisa vizinhos do último concurso
 * 4. Validação: Soma das dezenas deve estar na média histórica
 */

interface FrequencyStats {
  number: number;
  frequency: number;
  daysWithoutAppearing: number;
  timesAppeared: number;
}

interface GenerationResult {
  numbers: number[];
  sum: number;
  reasoning: string;
  confidence: number;
}

function getLotteryRange(lotteryType: LotteryType, totalNumbers: number): { min: number; max: number; rangeCount: number } {
  // Lotomania uses 00..99.
  if (lotteryType === 'lotomania') {
    return { min: 0, max: 99, rangeCount: 100 };
  }
  return { min: 1, max: totalNumbers, rangeCount: totalNumbers };
}

function clampInt(n: number, min: number, max: number): number {
  const x = Math.floor(n);
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

/**
 * Calcula estatísticas de frequência de um número
 */
function calculateFrequencyStats(
  number: number,
  draws: LotteryDraw[],
): FrequencyStats {
  let timesAppeared = 0;
  let lastDrawIndex = -1;

  for (let i = 0; i < draws.length; i++) {
    if (draws[i]!.numbers.includes(number)) {
      timesAppeared++;
      if (lastDrawIndex === -1) {
        lastDrawIndex = i;
      }
    }
  }

  const daysWithoutAppearing = lastDrawIndex >= 0 ? lastDrawIndex : draws.length;
  const frequency = timesAppeared > 0 ? timesAppeared / draws.length : 0;

  return {
    number,
    frequency,
    daysWithoutAppearing,
    timesAppeared,
  };
}

/**
 * Identifica números "atrasados" usando Lei dos Grandes Números
 * Um número está atrasado se não apareceu há mais tempo que o esperado
 */
function findDelayedNumbers(
  draws: LotteryDraw[],
  minNumber: number,
  maxNumber: number,
  numbersPerDraw: number,
): number[] {
  const stats: FrequencyStats[] = [];
  for (let n = minNumber; n <= maxNumber; n += 1) {
    stats.push(calculateFrequencyStats(n, draws));
  }

  // Esperança de intervalo (em sorteios) para um número reaparecer: ~ rangeCount / numbersPerDraw
  const rangeCount = Math.max(1, maxNumber - minNumber + 1);
  const expectedGap = rangeCount / Math.max(1, numbersPerDraw);

  return stats
    .filter((s) => s.daysWithoutAppearing > expectedGap * 1.5)
    .sort((a, b) => b.daysWithoutAppearing - a.daysWithoutAppearing)
    .slice(0, 12)
    .map((s) => s.number);
}

/**
 * Encontra vizinhos dos números do último concurso
 * Números "vizinhos" têm tendência de aparecer próximos
 */
function findNeighborsOfLastDraw(
  draws: LotteryDraw[],
  minNumber: number,
  maxNumber: number,
): number[] {
  if (draws.length === 0) return [];

  const lastNumbers = draws[0]!.numbers;
  const neighbors: number[] = [];

  for (const num of lastNumbers) {
    // Números adjacentes (num-1, num+1)
    if (num > minNumber && !lastNumbers.includes(num - 1)) {
      neighbors.push(num - 1);
    }
    if (num < maxNumber && !lastNumbers.includes(num + 1)) {
      neighbors.push(num + 1);
    }
  }

  return [...new Set(neighbors)];
}

function takeDistinctFromList(
  selected: Set<number>,
  list: number[],
  startIndex: number,
  take: number,
  minNumber: number,
  maxNumber: number,
) {
  if (take <= 0 || list.length === 0) return;
  let idx = ((startIndex % list.length) + list.length) % list.length;
  let guard = 0;
  while (selected.size < take + selected.size && guard < list.length * 2) {
    const candidate = list[idx]!;
    if (Number.isInteger(candidate) && candidate >= minNumber && candidate <= maxNumber) {
      selected.add(candidate);
    }
    idx = (idx + 1) % list.length;
    guard += 1;
    if (selected.size >= take + (selected.size - take)) {
      // noop
    }
  }
}

function fillToSize(
  selected: Set<number>,
  size: number,
  candidates: number[],
  minNumber: number,
  maxNumber: number,
) {
  for (const n of candidates) {
    if (selected.size >= size) break;
    if (Number.isInteger(n) && n >= minNumber && n <= maxNumber) selected.add(n);
  }

  // Last resort: sequential fill
  for (let n = minNumber; n <= maxNumber && selected.size < size; n += 1) {
    selected.add(n);
  }
}

/**
 * Gera um jogo usando o algoritmo determinístico
 */
export function generateDeterministicBet(
  lotteryType: LotteryType,
  draws: LotteryDraw[],
): GenerationResult {
  return generateDeterministicBetVariant(lotteryType, draws, 0);
}

/**
 * Same deterministic generator, but produces stable "variations" without randomness.
 * variantIndex changes which numbers are picked from the ranked lists.
 */
export function generateDeterministicBetVariant(
  lotteryType: LotteryType,
  draws: LotteryDraw[],
  variantIndex: number,
): GenerationResult {
  const config = getLotteryConfig(lotteryType);
  const { min: minNumber, max: maxNumber, rangeCount } = getLotteryRange(lotteryType, config.totalNumbers);
  const picks = Math.max(1, config.numbersPerDraw);
  const safeVariant = Number.isFinite(variantIndex) ? Math.floor(variantIndex) : 0;

  if (draws.length === 0) {
    const base = Array.from({ length: picks }, (_, i) => clampInt(minNumber + i, minNumber, maxNumber));
    return {
      numbers: base,
      sum: base.reduce((a, b) => a + b, 0),
      reasoning: 'Sem histórico carregado ainda; usando números iniciais.',
      confidence: 0.1,
    };
  }

  // Rank by frequency
  const stats: FrequencyStats[] = [];
  for (let n = minNumber; n <= maxNumber; n += 1) {
    stats.push(calculateFrequencyStats(n, draws));
  }

  const hotRank = stats.slice().sort((a, b) => b.frequency - a.frequency || a.number - b.number).map((s) => s.number);
  const delayedRank = findDelayedNumbers(draws, minNumber, maxNumber, picks);
  const neighbors = findNeighborsOfLastDraw(draws, minNumber, maxNumber);

  const selected = new Set<number>();

  // Mix plan: 1 vizinho (tendência), restante divide entre quentes e atrasados.
  const trendCount = 1;
  const remaining = Math.max(0, picks - trendCount);
  const hotCount = Math.ceil(remaining * 0.7);
  const delayedCount = Math.max(0, remaining - hotCount);

  // Trend (neighbors) - pick deterministic by variant
  if (neighbors.length) {
    const pick = neighbors[((safeVariant % neighbors.length) + neighbors.length) % neighbors.length]!;
    selected.add(pick);
  }

  // Hot and delayed with offsets
  if (hotRank.length) {
    const start = Math.max(0, safeVariant) % hotRank.length;
    for (let i = 0; i < hotCount && i < hotRank.length; i += 1) {
      selected.add(hotRank[(start + i) % hotRank.length]!);
    }
  }
  if (delayedRank.length) {
    const start = Math.max(0, safeVariant * 2) % delayedRank.length;
    for (let i = 0; i < delayedCount && i < delayedRank.length; i += 1) {
      selected.add(delayedRank[(start + i) % delayedRank.length]!);
    }
  }

  // Fill to required size using ranked hot list
  fillToSize(selected, picks, hotRank, minNumber, maxNumber);

  let numbers = Array.from(selected).slice(0, picks).sort((a, b) => a - b);

  // **Passo 5**: Validação contra "Soma Áurea"
  const sum = numbers.reduce((a, b) => a + b, 0);
  const expectedSum = calculateExpectedSum(draws, minNumber, maxNumber, picks);
  const sumRange = calculateSumRange(expectedSum, config.sumVariance || 30);

  // Se a soma está fora do intervalo, ajustar números
  if (sum < sumRange.min || sum > sumRange.max) {
    numbers = adjustSumToRange(numbers, sumRange, minNumber, maxNumber);
  }

  const finalSum = numbers.reduce((a, b) => a + b, 0);
  const top3 = stats.slice().sort((a, b) => b.frequency - a.frequency).slice(0, 3);
  const confidence = Math.min(1, top3.reduce((acc, s) => acc + s.frequency, 0) / Math.max(1, top3.length));

  return {
    numbers,
    sum: finalSum,
    reasoning: `Base: ${Math.min(draws.length, 300).toLocaleString('pt-BR')} concursos. Mistura: quentes + atrasados + vizinho. Variação #${Math.max(0, safeVariant)}. Soma validada (${sumRange.min}-${sumRange.max}).`,
    confidence,
  };
}

/**
 * Calcula a soma esperada baseada no histórico
 */
function calculateExpectedSum(draws: LotteryDraw[], minNumber: number, maxNumber: number, picks: number): number {
  if (draws.length === 0) {
    const avg = (minNumber + maxNumber) / 2;
    return avg * picks;
  }

  const sums = draws.map((d) => d.numbers.reduce((a, b) => a + b, 0));
  return sums.reduce((a, b) => a + b, 0) / sums.length;
}

/**
 * Define o intervalo aceitável para a soma
 */
function calculateSumRange(
  expectedSum: number,
  variance: number,
): { min: number; max: number } {
  return {
    min: Math.ceil(expectedSum - variance),
    max: Math.floor(expectedSum + variance),
  };
}

/**
 * Ajusta números para que a soma fique dentro do intervalo aceitável
 */
function adjustSumToRange(
  numbers: number[],
  range: { min: number; max: number },
  minNumber: number,
  maxNumber: number,
): number[] {
  let adjusted = [...numbers];
  let currentSum = adjusted.reduce((a, b) => a + b, 0);

  // Se a soma é muito baixa, trocar números menores por maiores
  if (currentSum < range.min) {
    for (let i = 0; i < adjusted.length && currentSum < range.min; i++) {
      for (let n = maxNumber; n > adjusted[i]!; n--) {
        if (!adjusted.includes(n)) {
          const diff = n - adjusted[i]!;
          adjusted[i] = n;
          currentSum += diff;
          break;
        }
      }
    }
  }

  // Se a soma é muito alta, trocar números maiores por menores
  if (currentSum > range.max) {
    for (let i = adjusted.length - 1; i >= 0 && currentSum > range.max; i--) {
      for (let n = minNumber; n < adjusted[i]!; n++) {
        if (!adjusted.includes(n)) {
          const diff = adjusted[i]! - n;
          adjusted[i] = n;
          currentSum -= diff;
          break;
        }
      }
    }
  }

  return adjusted.sort((a, b) => a - b);
}
