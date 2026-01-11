export type MegaSenaDraw = {
  contest: number;
  dateISO: string;
  numbers: number[]; // 6 unique numbers from 1..60
  prizeBreakdown?: PrizeBreakdown[];
};

export type FrequencyTable = ReadonlyArray<number>; // index 0 unused; 1..60

// Prize breakdown (rateio) information
export type PrizeBreakdown = {
  descricaoFaixa: string; // ex: "6 acertos", "5 acertos"
  faixa: number; // 1, 2, 3...
  numeroDeGanhadores: number;
  valorPremio: number;
};

// Generic lottery types
export type LotteryType = 'megasena' | 'lotofacil' | 'quina' | 'lotomania' | 'duplasena';

export type LotteryConfig = {
  id: LotteryType;
  name: string;
  totalNumbers: number; // ex: 60 for Mega, 25 for Lotofácil
  numbersPerDraw: number; // ex: 6 for Mega, 15 for Lotofácil
  acumulatesWithoutWinner: boolean; // true for most, false for some
  apiId: string; // identifier used in Caixa API
  hexColor: string; // primary color for UI
  secondaryHexColor?: string; // accent color
  sumVariance?: number; // variance for sum validation in deterministic bet generation
};

export type LotteryDraw<T extends LotteryType = LotteryType> = {
  type: T;
  contest: number;
  dateISO: string;
  numbers: number[]; // variable length depending on lottery
  accumulatedAmount?: number; // optional jackpot info
  prizeBreakdown?: PrizeBreakdown[]; // information about winners
  wasAccumulated?: boolean; // true if no winner in top prize
  totalCollected?: number; // total amount collected (valorArrecadado)
  accumulatedNextDraw?: number; // accumulated for next draw
};

export type LotteryFrequencyTable<T extends LotteryType = LotteryType> = {
  type: T;
  frequencies: ReadonlyArray<number>; // index 0 unused; 1..totalNumbers
};

export type GeneratedBet<T extends LotteryType = LotteryType> = {
  type: T;
  numbers: number[];
  strategy?: string; // e.g., 'weighted-60-40', 'mirror', 'repetition'
};

// Backward compatibility - MegaSenaDraw is specific instance of LotteryDraw
export type MegaSenaLotteryDraw = LotteryDraw<'megasena'>;
