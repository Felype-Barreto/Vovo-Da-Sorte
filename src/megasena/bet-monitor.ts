import { recordBetResult } from './bets-db';
import { getLotteryConfig } from './lotteryConfigs';
import type { LotteryDraw, LotteryType } from './types';

/**
 * Tipos de prêmios por loteria e quantidade de acertos
 */
const PRIZE_TIERS = {
  megasena: {
    6: { type: 'sena', factor: 1000000 },
    5: { type: 'quina', factor: 50000 },
    4: { type: 'quadra', factor: 500 },
    3: { type: 'terno', factor: 0 }, // Não premia normalmente
    2: { type: 'duque', factor: 0 },
    1: { type: 'acerto_simples', factor: 0 },
    0: { type: 'nohit', factor: 0 },
  },
  lotofacil: {
    15: { type: 'quina', factor: 1000000 },
    14: { type: 'quadra', factor: 50000 },
    13: { type: 'terno', factor: 500 },
    12: { type: 'duque', factor: 10 },
    11: { type: 'acerto_simples', factor: 0 },
    0: { type: 'nohit', factor: 0 },
  },
  quina: {
    5: { type: 'sena', factor: 500000 },
    4: { type: 'quadra', factor: 50000 },
    3: { type: 'terno', factor: 500 },
    2: { type: 'duque', factor: 0 },
    1: { type: 'acerto_simples', factor: 0 },
    0: { type: 'nohit', factor: 0 },
  },
  lotomania: {
    20: { type: 'sena', factor: 1000000 },
    19: { type: 'quina', factor: 50000 },
    18: { type: 'quadra', factor: 5000 },
    17: { type: 'terno', factor: 100 },
    16: { type: 'duque', factor: 0 },
    0: { type: 'acerto_zero', factor: 10 }, // Ganha quem acerta exatamente 0
  },
  duplasena: {
    6: { type: 'sena', factor: 1000000 },
    5: { type: 'quina', factor: 50000 },
    4: { type: 'quadra', factor: 500 },
    3: { type: 'terno', factor: 0 },
    2: { type: 'duque', factor: 0 },
    1: { type: 'acerto_simples', factor: 0 },
    0: { type: 'nohit', factor: 0 },
  },
};

type PrizeInfo = {
  type: string;
  factor: number;
};

/**
 * Contar acertos entre dois arrays de números
 */
export function countHits(selectedNumbers: number[], drawnNumbers: number[]): number {
  return selectedNumbers.filter((num) => drawnNumbers.includes(num)).length;
}

/**
 * Estimar valor do prêmio com base na quantidade de acertos
 * (Este é um valor aproximado; valores reais dependem de acumulados e número de ganhadores)
 */
export function estimatePrizeAmount(
  lotteryId: LotteryType,
  hits: number,
  jackpot?: number | null,
): number {
  const tiers = PRIZE_TIERS[lotteryId as keyof typeof PRIZE_TIERS];
  if (!tiers) return 0;

  const prizeInfo = tiers[hits as keyof typeof tiers];
  if (!prizeInfo || prizeInfo.factor === 0) return 0;

  // Se houver jackpot, usar como base; senão, usar fator fixo
  if (jackpot && jackpot > 0) {
    return jackpot * prizeInfo.factor;
  }

  return prizeInfo.factor;
}

/**
 * Classificar resultado em categorias
 */
export function classifyResult(lotteryId: LotteryType, hits: number): string {
  const tiers = PRIZE_TIERS[lotteryId as keyof typeof PRIZE_TIERS];
  if (!tiers) return 'desconhecido';

  const tier = tiers[hits as keyof typeof tiers];
  return tier ? tier.type : 'nohit';
}

/**
 * Processar um sorteio contra apostas salvas e registrar resultados
 * Retorna número de apostas processadas
 */
export async function processDrawAgainstSavedBets(
  lotteryId: LotteryType,
  draw: LotteryDraw<any>,
  savedBets: Array<{ id: string; numbers: number[] }>,
): Promise<number> {
  const drawnNumbers = draw.numbers;
  let processedCount = 0;

  for (const bet of savedBets) {
    const hits = countHits(bet.numbers, drawnNumbers);

    // Só registrar resultados com prêmios
    if (hits >= 3 || lotteryId === 'lotomania') {
      // Lotomania pode ganhar com 0 acertos
      const acumulado = (draw as any).acumulado || (draw as any).jackpot || 0;
      const prizeAmount = estimatePrizeAmount(lotteryId, hits, acumulado);
      const resultType = classifyResult(lotteryId, hits) as 'sena' | 'quina' | 'partial' | 'nohit';

      try {
        await recordBetResult({
          betId: bet.id,
          drawContest: draw.contest,
          drawDate: draw.dateISO,
          hits,
          prizeAmount: prizeAmount > 0 ? prizeAmount : undefined,
          resultType,
        });

        processedCount++;
      } catch (error) {
        console.error(`Erro ao registrar resultado da aposta ${bet.id}:`, error);
      }
    }
  }

  return processedCount;
}

/**
 * Gerar notificação para uma vitória
 */
export function generateWinNotification(
  lotteryId: LotteryType,
  hits: number,
  prizeAmount?: number,
): {
  title: string;
  body: string;
  emoji: string;
} {
  const config = getLotteryConfig(lotteryId);
  const resultType = classifyResult(lotteryId, hits);
  const prizeText = prizeAmount ? ` - R$ ${(prizeAmount / 1).toLocaleString('pt-BR')}` : '';

  const notifications: Record<string, { title: string; emoji: string }> = {
    sena: { title: `SENA em ${config.name}!`, emoji: '' },
    quina: { title: `QUINA em ${config.name}!`, emoji: '' },
    quadra: { title: `QUADRA em ${config.name}!`, emoji: '' },
    terno: { title: `TERNO em ${config.name}!`, emoji: '' },
    duque: { title: `DUQUE em ${config.name}!`, emoji: '' },
    acerto_zero: { title: `ZERO em ${config.name}!`, emoji: '' },
    nohit: { title: `Nenhum acerto em ${config.name}`, emoji: '' },
  };

  const notif = notifications[resultType] || {
    title: `${hits} acerto(s) em ${config.name}`,
    emoji: '',
  };

  return {
    title: notif.title,
    body: `${hits} acerto(s)${prizeText}`,
    emoji: notif.emoji,
  };
}
