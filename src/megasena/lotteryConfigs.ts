import type { LotteryConfig } from './types';

/**
 * Configuration for all supported lottery types.
 * Each config defines the rules, API identifier, and UI styling.
 */

const CONFIGS: Record<string, LotteryConfig> = {
  megasena: {
    id: 'megasena',
    name: 'Mega-Sena',
    totalNumbers: 60,
    numbersPerDraw: 6,
    acumulatesWithoutWinner: true,
    apiId: 'megasena',
    hexColor: '#10b981', // emerald
    secondaryHexColor: '#059669', // emerald-600
  },
  lotofacil: {
    id: 'lotofacil',
    name: 'Lotofácil',
    totalNumbers: 25,
    numbersPerDraw: 15,
    acumulatesWithoutWinner: true,
    apiId: 'lotofacil',
    hexColor: '#8b5cf6', // violet
    secondaryHexColor: '#7c3aed', // violet-600
  },
  quina: {
    id: 'quina',
    name: 'Quina',
    totalNumbers: 80,
    numbersPerDraw: 5,
    acumulatesWithoutWinner: true,
    apiId: 'quina',
    hexColor: '#0ea5e9', // cyan
    secondaryHexColor: '#0284c7', // cyan-600
  },
  lotomania: {
    id: 'lotomania',
    name: 'Lotomania',
    totalNumbers: 100,
    numbersPerDraw: 20,
    acumulatesWithoutWinner: false,
    apiId: 'lotomania',
    hexColor: '#f97316', // orange
    secondaryHexColor: '#ea580c', // orange-600
  },
  duplasena: {
    id: 'duplasena',
    name: 'Dupla Sena',
    totalNumbers: 50,
    numbersPerDraw: 6,
    acumulatesWithoutWinner: true,
    apiId: 'duplasena',
    hexColor: '#ec4899', // pink
    secondaryHexColor: '#db2777', // pink-600
  },
};

/**
 * Get configuration for a specific lottery type.
 * @param lotteryId - The lottery type ID
 * @returns The lottery configuration
 * @throws Error if lottery type is not found
 */
export function getLotteryConfig(lotteryId: string): LotteryConfig {
  const config = CONFIGS[lotteryId.toLowerCase()];
  if (!config) {
    throw new Error(`Unknown lottery type: ${lotteryId}`);
  }
  return config;
}

/**
 * Get all available lottery configurations.
 */
export function getAllLotteryConfigs(): LotteryConfig[] {
  return Object.values(CONFIGS);
}

/**
 * Get all lottery IDs.
 */
export function getAllLotteryIds(): string[] {
  return Object.keys(CONFIGS);
}

/**
 * Check if a lottery type is valid.
 */
export function isValidLotteryId(id: string): boolean {
  return id.toLowerCase() in CONFIGS;
}
