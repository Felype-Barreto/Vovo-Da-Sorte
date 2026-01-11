/**
 * Sistema de Análise de Cobertura Combinatória
 * 
 * Um "fechamento" é uma análise estatística de combinações que busca
 * capturar prêmios com base em um subconjunto dos números escolhidos.
 * 
 * Ex: Analisar 10 números na Mega com foco em Quadra
 * = Você escolhe 10 números
 * = O sistema gera ~210 combinações de 6 números
 * = Análise: em dados históricos, essa cobertura capturou Quadras
 * 
 * IMPORTANTE: Isto é análise estatística, NÃO uma garantia de resultados futuros.
 */

import { getLotteryConfig } from './lotteryConfigs';
import type { LotteryType } from './types';

export type ClosureStrategy = 'quadra' | 'quina' | 'sena';

export type ClosureResult = {
  totalGames: number;
  estimatedCost: number;
  costPerGame: number;
  targetHits: number;  // Número de acertos que se busca (não garantido)
  combinations: number[][];
  description: string;
};

/**
 * Calcula combinações usando o Triângulo de Pascal (eficiente)
 */
function combination(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 0; i < k; i += 1) {
    result = (result * (n - i)) / (i + 1);
  }

  return Math.round(result);
}

/**
 * Gera todas as combinações de um array
 */
function generateCombinations(arr: number[], size: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < arr.length; i += 1) {
      current.push(arr[i]!);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

/**
 * Calcula o número de jogos necessários para cobrir combinações
 * usando a fórmula de cobertura combinatória
 * NOTA: Isto não garante resultados em sorteios futuros
 */
export function calculateClosureMinimumGames(
  selectedCount: number,
  totalNumbers: number,
  numbersPerDraw: number,
  targetHits: number,
): number {
  // Fórmula: C(n, k) / C(target, k) onde n = números selecionados
  const totalCombinations = combination(totalNumbers, numbersPerDraw);
  const selectedCombinations = combination(selectedCount, numbersPerDraw);

  // Aproximação conservadora: número de combinações de k entre n selecionados
  return Math.ceil(combination(selectedCount, targetHits));
}

/**
 * Gera uma análise de cobertura otimizada (Mega-Sena com foco em Quadra)
 * Exemplo: 10 números na Mega = ~210 combinações de 6 para cobertura analítica de Quadra
 * AVISO: Isto é análise estatística, não uma promessa de resultados
 */
export function generateMegaSenaQuadraFechamento(selectedNumbers: number[]): ClosureResult {
  if (selectedNumbers.length < 9 || selectedNumbers.length > 20) {
    throw new Error('Mega-Sena Quadra requer 9-20 números selecionados');
  }

  const totalGames = combination(selectedNumbers.length, 6);
  const costPerGame = 5; // R$ 5 por jogo
  const estimatedCost = totalGames * costPerGame;

  const combinations = generateCombinations(
    selectedNumbers.sort((a, b) => a - b),
    6,
  );

  return {
    totalGames,
    estimatedCost,
    costPerGame,
    targetHits: 4, // Busca por Quadra (não garantido)
    combinations,
    description: `Análise de Cobertura: ${selectedNumbers.length} números → ${totalGames} combinações de 6 (R$ ${estimatedCost.toFixed(2)})`,
  };
}

/**
 * Análise de cobertura genérica para qualquer loteria
 * IMPORTANTE: Isto é uma análise matemática, não uma garantia de resultados
 */
export function generateGenericFechamento(
  lotteryId: LotteryType,
  selectedNumbers: number[],
  targetHits: number,
): ClosureResult {
  const config = getLotteryConfig(lotteryId);
  const minNumbers = targetHits + 2;
  const maxNumbers = Math.min(config.totalNumbers, selectedNumbers.length);

  if (selectedNumbers.length < minNumbers) {
    throw new Error(`Mínimo ${minNumbers} números para análise de cobertura com foco em ${targetHits} acertos`);
  }

  const combinations = generateCombinations(
    selectedNumbers.sort((a, b) => a - b),
    config.numbersPerDraw,
  );

  const costPerGame = 5; // Aproximação
  const estimatedCost = combinations.length * costPerGame;

  return {
    totalGames: combinations.length,
    estimatedCost,
    costPerGame,
    targetHits,
    combinations,
    description: `Análise de Cobertura: ${selectedNumbers.length} números → ${combinations.length} combinações (R$ ${estimatedCost.toFixed(2)})`,
  };
}

/**
 * Analisa o custo-benefício de uma cobertura combinatória
 * AVISO: Isto é análise matemática, não previsão de resultados
 */
export function analyzeClosureCostBenefit(closure: ClosureResult): {
  breakEvenOdds: number;
  costPerCombination: number;
  recommendation: string;
} {
  const breakEvenOdds = closure.estimatedCost / closure.targetHits;
  const costPerCombination = closure.estimatedCost / closure.totalGames;

  let recommendation = '';
  if (closure.totalGames > 1000) {
    recommendation = 'Alto custo: considere reduzir números ou alterar foco de acertos';
  } else if (closure.totalGames > 500) {
    recommendation = 'Custo moderado: análise extensa de cobertura';
  } else {
    recommendation = 'Custo baixo: cobertura mais concentrada';
  }

  return {
    breakEvenOdds,
    costPerCombination,
    recommendation,
  };
}

/**
 * Analisa se um sorteio capturou acertos em uma análise de cobertura
 * (Isto é análise histórica, não uma validação de garantia)
 */
export function validateClosureMatch(
  closureGames: number[][],
  drawnNumbers: number[],
  targetHits: number,
): { matchedGames: number[][]; totalMatches: number } {
  const matchedGames = closureGames.filter((game) => {
    const hitCount = game.filter((n) => drawnNumbers.includes(n)).length;
    return hitCount >= targetHits;
  });

  return {
    matchedGames,
    totalMatches: matchedGames.length,
  };
}
