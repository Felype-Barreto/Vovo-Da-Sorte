// Função utilitária para buscar o sorteio especial real por faixa de datas
import { loadCaixaLotteryHistoryLite } from './lottery-caixa';
import { LotteryDraw, LotteryType } from './types';

/**
 * Busca o sorteio especial real de uma loteria em uma faixa de datas
 * @param lotteryId - ID da loteria (ex: 'megasena')
 * @param startDate - Data inicial da faixa (Date ou string ISO)
 * @param endDate - Data final da faixa (Date ou string ISO)
 * @returns O sorteio especial encontrado ou null
 */
export async function findSpecialDrawByDateRange(
  lotteryId: LotteryType,
  startDate: Date | string,
  endDate: Date | string
): Promise<LotteryDraw | null> {
  const startISO = typeof startDate === 'string' ? startDate : startDate.toISOString().slice(0, 10);
  const endISO = typeof endDate === 'string' ? endDate : endDate.toISOString().slice(0, 10);
  // Busca os últimos 120 concursos, concorrência 4, delay 50ms (rápido e seguro)
  const history = await loadCaixaLotteryHistoryLite(lotteryId, {
    lastN: 120,
    concurrency: 4,
    delayMsBetweenRequests: 50,
  });
  // Filtra sorteios dentro da faixa
  const drawsInRange = history.filter(draw => draw.dateISO >= startISO && draw.dateISO <= endISO);
  if (drawsInRange.length === 0) return null;
  // Retorna o sorteio mais próximo do final da faixa (normalmente o especial)
  drawsInRange.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  return drawsInRange[0];
}
