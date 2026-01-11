import { getLotteryConfig } from './lotteryConfigs';
import type { LotteryDraw, LotteryType } from './types';

export type InvestmentSimulation = {
  lotteryId: LotteryType;
  startDate: string;
  endDate: string;
  dailyCost: number;
  strategy: 'hot' | 'cold' | 'balanced' | 'random';
  totalDraws: number;
  totalInvested: number;
  totalWon: number;
  netProfit: number;
  roi: number; // Return on Investment (%)
  monthlyBreakdown: MonthBreakdown[];
  hitSummary: HitSummary;
};

export type MonthBreakdown = {
  month: string;
  invested: number;
  won: number;
  profit: number;
  draws: number;
  hits: number;
};

export type HitSummary = {
  totalHits: number;
  byCategory: Record<string, number>;
  winningDraws: number;
  winRate: number; // Porcentagem de apostas que ganharam algo
};

/**
 * Simular investimento em loterias nos últimos 2 anos
 */
export async function simulateInvestment(
  draws: LotteryDraw<any>[],
  lotteryId: LotteryType,
  dailyCost: number = 5,
  strategy: 'hot' | 'cold' | 'balanced' | 'random' = 'balanced',
): Promise<InvestmentSimulation> {
  const config = getLotteryConfig(lotteryId);

  if (draws.length === 0) {
    return {
      lotteryId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      dailyCost,
      strategy,
      totalDraws: 0,
      totalInvested: 0,
      totalWon: 0,
      netProfit: 0,
      roi: 0,
      monthlyBreakdown: [],
      hitSummary: {
        totalHits: 0,
        byCategory: {},
        winningDraws: 0,
        winRate: 0,
      },
    };
  }

  // Agrupar por mês
  const monthlyData: Map<string, { invested: number; won: number; hits: number; draws: number }> =
    new Map();

  let totalInvested = 0;
  let totalWon = 0;
  let totalHits = 0;
  let winningDraws = 0;
  const categoryHits: Record<string, number> = {};

  // Simular cada sorteio
  for (const draw of draws) {
    const monthKey = draw.dateISO.substring(0, 7); // YYYY-MM

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { invested: 0, won: 0, hits: 0, draws: 0 });
    }

    const month = monthlyData.get(monthKey)!;

    // Estimar custo (pode variar, mas usando valor fixo para simplificar)
    const gameCost = dailyCost;
    month.invested += gameCost;
    totalInvested += gameCost;
    month.draws += 1;

    // Simular apostas com base na estratégia
    const bet = generateBetByStrategy(draw.numbers, strategy, config.numbersPerDraw);

    // Contar acertos
    const hits = bet.filter((num: number) => draw.numbers.includes(num)).length;

    if (hits >= 3) {
      totalHits += hits;
      month.hits += hits;
      winningDraws += 1;

      // Estimar prêmio (simplificado)
      const prizeEstimate = estimatePrize(lotteryId, hits);
      month.won += prizeEstimate;
      totalWon += prizeEstimate;

      // Categorizar hit
      const category = categorizeHit(lotteryId, hits);
      categoryHits[category] = (categoryHits[category] || 0) + 1;
    }
  }

  // Montar breakdown mensal
  const monthlyBreakdown: MonthBreakdown[] = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      invested: data.invested,
      won: data.won,
      profit: data.won - data.invested,
      draws: data.draws,
      hits: data.hits,
    }));

  const startDate = draws[0].dateISO;
  const endDate = draws[draws.length - 1].dateISO;
  const netProfit = totalWon - totalInvested;
  const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
  const winRate = draws.length > 0 ? (winningDraws / draws.length) * 100 : 0;

  return {
    lotteryId,
    startDate,
    endDate,
    dailyCost,
    strategy,
    totalDraws: draws.length,
    totalInvested,
    totalWon,
    netProfit,
    roi,
    monthlyBreakdown,
    hitSummary: {
      totalHits,
      byCategory: categoryHits,
      winningDraws,
      winRate,
    },
  };
}

/**
 * Gerar aposta por estratégia
 */
function generateBetByStrategy(
  availableNumbers: number[],
  strategy: 'hot' | 'cold' | 'balanced' | 'random',
  numbersPerDraw: number,
): number[] {
  const sorted = [...availableNumbers].sort((a, b) => b - a); // Simula frequência

  switch (strategy) {
    case 'hot':
      return sorted.slice(0, numbersPerDraw).sort((a, b) => a - b);
    case 'cold':
      return sorted.slice(-numbersPerDraw).sort((a, b) => a - b);
    case 'balanced':
      return [
        ...sorted.slice(0, Math.ceil(numbersPerDraw / 2)),
        ...sorted.slice(-Math.floor(numbersPerDraw / 2)),
      ].sort((a, b) => a - b);
    case 'random':
    default:
      const shuffled = [...availableNumbers].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, numbersPerDraw).sort((a, b) => a - b);
  }
}

/**
 * Estimar prêmio (valores muito aproximados)
 */
function estimatePrize(lotteryId: LotteryType, hits: number): number {
  const prizeMap: Record<LotteryType, Record<number, number>> = {
    megasena: {
      6: 500000,
      5: 30000,
      4: 300,
    },
    lotofacil: {
      15: 500000,
      14: 30000,
      13: 300,
      12: 10,
    },
    quina: {
      5: 300000,
      4: 30000,
      3: 300,
    },
    lotomania: {
      20: 500000,
      19: 30000,
      18: 3000,
      17: 100,
    },
    duplasena: {
      6: 500000,
      5: 30000,
      4: 300,
    },
  };

  return prizeMap[lotteryId]?.[hits] || 0;
}

/**
 * Categorizar tipo de hit
 */
function categorizeHit(lotteryId: LotteryType, hits: number): string {
  if (lotteryId === 'megasena') {
    if (hits === 6) return 'Sena';
    if (hits === 5) return 'Quina';
    if (hits === 4) return 'Quadra';
  } else if (lotteryId === 'lotofacil') {
    if (hits === 15) return 'Quina';
    if (hits === 14) return 'Quadra';
    if (hits === 13) return 'Terno';
    if (hits === 12) return 'Duque';
  } else if (lotteryId === 'quina') {
    if (hits === 5) return 'Quina';
    if (hits === 4) return 'Quadra';
    if (hits === 3) return 'Terno';
  } else if (lotteryId === 'lotomania') {
    if (hits === 20) return 'Sena';
    if (hits === 19) return 'Quina';
    if (hits === 18) return 'Quadra';
    if (hits === 17) return 'Terno';
  } else if (lotteryId === 'duplasena') {
    if (hits === 6) return 'Sena';
    if (hits === 5) return 'Quina';
    if (hits === 4) return 'Quadra';
  }
  return 'Acerto';
}
