/**
 * Sistema de Calendário com Concursos Especiais de 2026
 * 
 * Identifica automaticamente os concursos especiais do ano,
 * que tendem a acumular mais prêmios e atraem mais apostadores.
 */

export interface SpecialContest {
  name: string; // Nome do concurso especial
  description: string;
  date: Date; // Data do concurso
  lotteries: string[]; // Loterias envolvidas
  emoji: string;
  expectedAccumulation: 'low' | 'medium' | 'high'; // Expectativa de acúmulo
  suggestedStrategy: string; // Estratégia recomendada
  multiplier: number; // Multiplicador esperado de prêmio
}

/**
 * Concursos Especiais de 2026 (baseados em datas fixas do Brasil)
 */
export const SPECIAL_CONTESTS_2026: SpecialContest[] = [
  {
    name: 'Mega da Virada',
    description: 'Maior concurso do ano, prêmio acumulado de 2025 + bilheteria de 2026',
    date: new Date(2026, 11, 31), // 31 de dezembro
    lotteries: ['megasena'],
    emoji: '',
    expectedAccumulation: 'high',
    suggestedStrategy: 'Aumentar número de análises e cotas. Prêmio histórico acima de R$ 100M',
    multiplier: 10,
  },
  {
    name: 'Quina de São João',
    description: 'Tradicional, acumula prêmios extras para quem acerta',
    date: new Date(2026, 5, 24), // 24 de junho
    lotteries: ['quina'],
    emoji: '',
    expectedAccumulation: 'high',
    suggestedStrategy: 'Aposte em números históricos de junho. Prêmio mínimo garantido',
    multiplier: 5,
  },
  {
    name: 'Lotofácil da Independência',
    description: 'Concurso especial de 7 de setembro',
    date: new Date(2026, 8, 7), // 7 de setembro
    lotteries: ['lotofacil'],
    emoji: '',
    expectedAccumulation: 'medium',
    suggestedStrategy: 'Analise padrões de números mais saídos em concursos de setembro',
    multiplier: 2,
  },
  {
    name: 'Dupla Sena de Páscoa',
    description: 'Concurso especial da Dupla Sena realizado próximo à Páscoa',
    date: new Date(2026, 2, 28), // Data estimada para 2026
    lotteries: ['duplasena'],
    emoji: '',
    expectedAccumulation: 'medium',
    suggestedStrategy: 'Aposte em padrões históricos de Páscoa',
    multiplier: 2,
  },
];

/**
 * Retorna concursos especiais próximos
 */
export function getUpcomingSpecialContests(
  limit: number = 5,
  today: Date = new Date(),
): SpecialContest[] {
  return SPECIAL_CONTESTS_2026.filter((contest) => contest.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

/**
 * Verifica se uma data é um concurso especial
 */
export function isSpecialContestDate(date: Date): SpecialContest | null {
  return (
    SPECIAL_CONTESTS_2026.find(
      (contest) =>
        contest.date.getDate() === date.getDate() &&
        contest.date.getMonth() === date.getMonth() &&
        contest.date.getFullYear() === date.getFullYear(),
    ) || null
  );
}

/**
 * Retorna concursos especiais do mês
 */
export function getMonthSpecialContests(month: number, year: number = 2026): SpecialContest[] {
  return SPECIAL_CONTESTS_2026.filter(
    (contest) => contest.date.getMonth() === month && contest.date.getFullYear() === year,
  ).sort((a, b) => a.date.getDate() - b.date.getDate());
}

/**
 * Calcula proximidade do próximo concurso especial
 */
export function daysUntilNextSpecialContest(today: Date = new Date()): number | null {
  const upcoming = getUpcomingSpecialContests(1, today)[0];
  if (!upcoming) return null;

  const timeDiff = upcoming.date.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Estratégia recomendada para próximo concurso especial
 */
export function getStrategyForNextContest(): {
  contest: SpecialContest | null;
  daysRemaining: number | null;
  recommendation: string;
} {
  const contest = getUpcomingSpecialContests(1)[0] || null;
  const daysRemaining = daysUntilNextSpecialContest();

  let recommendation = '';

  if (contest) {
    if (contest.expectedAccumulation === 'high') {
      recommendation = `${contest.name}: Faltam ${daysRemaining} dias. Altíssimo acúmulo esperado. ${contest.suggestedStrategy}`;
    } else if (contest.expectedAccumulation === 'medium') {
      recommendation = `${contest.name}: Faltam ${daysRemaining} dias. Bom acúmulo esperado. ${contest.suggestedStrategy}`;
    } else {
      recommendation = `${contest.name}: Faltam ${daysRemaining} dias. ${contest.suggestedStrategy}`;
    }
  } else {
    recommendation = 'Nenhum concurso especial próximo. Acompanhe as análises regulares.';
  }

  return { contest, daysRemaining, recommendation };
}

/**
 * Retorna todas as datas especiais do ano para marcar no calendário
 */
export function getSpecialContestDates(): Array<{
  date: string; // YYYY-MM-DD
  name: string;
  emoji: string;
}> {
  return SPECIAL_CONTESTS_2026.map((contest) => ({
    date: contest.date.toISOString().split('T')[0],
    name: contest.name,
    emoji: '',
  }));
}
