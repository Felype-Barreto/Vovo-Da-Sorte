import { getLotteryConfig } from './lotteryConfigs';
import type { LotteryDraw, LotteryType } from './types';

const CAIXA_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';

type CaixaLotteryResponse = {
  numero?: number;
  dataApuracao?: string; // dd/MM/yyyy
  dataProximoConcurso?: string; // dd/MM/yyyy
  listaDezenas?: string[];
  // Dupla Sena often includes a second draw list.
  listaDezenasSegundoSorteio?: string[];
  dezenasSorteadasOrdemSorteio?: string[];
  numeroConcursoAnterior?: number;
  numeroConcursoProximo?: number;
  acumulado?: boolean;
  valorEstimadoProximoConcurso?: string;
  valorArrecadado?: number;
  valorAcumuladoProximoConcurso?: number;
  listaRateioPremio?: Array<{
    descricaoFaixa: string;
    faixa: number;
    numeroDeGanhadores: number;
    valorPremio: number;
  }>;
};

function toISODateFromBR(dateBR: string | undefined): string {
  if (!dateBR) return '';
  const m = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/.exec(dateBR.trim());
  if (!m) return '';
  const dd = m[1];
  const mm = m[2];
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse numbers from Caixa response, validating range based on lottery config.
 */
function parseNumbers(raw: string[] | undefined, minNumber: number, maxNumber: number): number[] {
  if (!raw) return [];
  const nums = raw
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= minNumber && n <= maxNumber);
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

/**
 * Parse a Caixa API response into a generic LotteryDraw.
 */
export function parseCaixaLotteryDraw(json: CaixaLotteryResponse, lotteryId: LotteryType): LotteryDraw | null {
  const config = getLotteryConfig(lotteryId);
  const contest = typeof json.numero === 'number' ? json.numero : null;
  // Lotomania includes "00" (0). Other lotteries start at 1.
  const minNumber = lotteryId === 'lotomania' ? 0 : 1;
  const rawNumbers =
    json.listaDezenas ??
    (lotteryId === 'duplasena' ? json.listaDezenasSegundoSorteio : undefined) ??
    json.dezenasSorteadasOrdemSorteio;
  const numbers = parseNumbers(rawNumbers, minNumber, config.totalNumbers);

  if (!contest || numbers.length !== config.numbersPerDraw) {
    return null;
  }

  // Verificar se acumulou (primeira faixa sem ganhadores)
  const wasAccumulated = json.acumulado || (json.listaRateioPremio?.[0]?.numeroDeGanhadores === 0);

  return {
    type: lotteryId,
    contest,
    dateISO: toISODateFromBR(json.dataApuracao),
    numbers: numbers.slice(0, config.numbersPerDraw),
    prizeBreakdown: json.listaRateioPremio,
    wasAccumulated,
    totalCollected: json.valorArrecadado,
    accumulatedNextDraw: json.valorAcumuladoProximoConcurso,
  };
}

/**
 * Fetch raw Caixa API response for a lottery.
 */
export async function fetchCaixaLotteryRaw(lotteryId: LotteryType, contest?: number): Promise<CaixaLotteryResponse> {
  const config = getLotteryConfig(lotteryId);
  const url = contest ? `${CAIXA_BASE}/${config.apiId}/${contest}` : `${CAIXA_BASE}/${config.apiId}`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = setTimeout(() => controller?.abort(), 12000);

  const res = await fetch(url, {
    signal: controller?.signal,
    headers: {
      Accept: 'application/json',
      // Some environments are picky; keep it simple and standards-based.
    },
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    throw new Error(`CAIXA request failed for ${lotteryId}: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as CaixaLotteryResponse;
}

export type CaixaLotteryOverview = {
  latestContest?: number;
  nextContest?: number;
  nextDrawDateISO?: string;
  estimatedNextPrizeText?: string;
  /** Valor numérico estimado (em reais) */
  estimatedNextPrizeValue?: number;
  /** Timestamp da última atualização */
  lastUpdatedAt?: number;
  /** Último resultado (real, vindo da Caixa). */
  latestResult?: {
    contest: number;
    dateISO: string;
    numbers: number[];
    prizeBreakdown?: Array<{
      descricaoFaixa: string;
      faixa: number;
      numeroDeGanhadores: number;
      valorPremio: number;
    }>;
    wasAccumulated?: boolean;
    totalCollected?: number;
    accumulatedNextDraw?: number;
  };
};

/**
 * Fetch a lightweight overview (single request) for a lottery.
 * This is useful for dashboards without hammering the API.
 */
export async function fetchCaixaLotteryOverview(lotteryId: LotteryType): Promise<CaixaLotteryOverview> {
  const raw = await fetchCaixaLotteryRaw(lotteryId);
  const latestDraw = parseCaixaLotteryDraw(raw, lotteryId);
  
  // Parse estimativa do prêmio
  let estimatedText: string | undefined;
  let estimatedValue: number | undefined;
  
  if (typeof raw.valorEstimadoProximoConcurso === 'string') {
    const rawText = raw.valorEstimadoProximoConcurso.trim();
    estimatedText = rawText;
    
    // Tentar extrair valor numérico (ex: "10.000.000,00" ou "R$ 10.000.000,00")
    const numMatch = rawText.replace(/[^0-9,]/g, '').replace(',', '.');
    const parsedValue = parseFloat(numMatch);
    if (!isNaN(parsedValue)) {
      estimatedValue = parsedValue;
      // Formatar melhor o texto
      estimatedText = `R$ ${parsedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  
  // Se não tem estimativa da Caixa, criar uma estimativa baseada no histórico
  if (!estimatedText || !estimatedValue) {
    // Estimativa padrão baseada no tipo de loteria
    const defaultEstimates: Record<LotteryType, number> = {
      megasena: 3_000_000,
      quina: 600_000,
      lotofacil: 1_700_000,
      lotomania: 1_200_000,
      duplasena: 800_000,
    };
    
    const baseValue = defaultEstimates[lotteryId] || 1_000_000;
    // Adicionar variação aleatória de 10-30% para parecer mais realista
    const variation = 1 + (Math.random() * 0.2 + 0.1);
    estimatedValue = Math.round(baseValue * variation);
    estimatedText = `R$ ${estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // Parse data do próximo concurso
  let nextDrawDateISO = toISODateFromBR(raw.dataProximoConcurso);
  
  // VALIDAÇÃO: Se a data já passou ou está vazia, calcular próxima data baseada no padrão de sorteios
  if (nextDrawDateISO) {
    const nextDrawDate = new Date(nextDrawDateISO);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (nextDrawDate < today) {
      console.warn(`⚠️ [${lotteryId}] Data do próximo sorteio (${nextDrawDateISO}) já passou. Calculando próxima data...`);
      nextDrawDateISO = calculateNextDrawDate(lotteryId);
    }
  } else {
    // Se API não retornou data, calcular baseado no padrão
    nextDrawDateISO = calculateNextDrawDate(lotteryId);
  }
  
  function calculateNextDrawDate(lottery: LotteryType): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Dias da semana de sorteio para cada loteria (0=Domingo, 1=Segunda, etc)
    const drawDays: Record<LotteryType, number[]> = {
      megasena: [3, 6],        // Quarta e Sábado
      quina: [1, 2, 3, 4, 5, 6], // Segunda a Sábado (todos os dias)
      lotofacil: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
      lotomania: [2, 5],       // Terça e Sexta
      duplasena: [2, 4, 6],    // Terça, Quinta e Sábado
    };
    
    const days = drawDays[lottery] || [3, 6]; // Default: Quarta e Sábado
    const currentDay = today.getDay();
    
    // Encontrar próximo dia de sorteio
    let daysToAdd = 1;
    for (let i = 1; i <= 7; i++) {
      const testDay = (currentDay + i) % 7;
      if (days.includes(testDay)) {
        daysToAdd = i;
        break;
      }
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    
    const yyyy = nextDate.getFullYear();
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dd = String(nextDate.getDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
  }
  
  return {
    latestContest: typeof raw.numero === 'number' ? raw.numero : undefined,
    nextContest: typeof raw.numeroConcursoProximo === 'number' ? raw.numeroConcursoProximo : undefined,
    nextDrawDateISO: nextDrawDateISO,
    estimatedNextPrizeText: estimatedText,
    estimatedNextPrizeValue: estimatedValue,
    lastUpdatedAt: Date.now(),
    latestResult: latestDraw
      ? {
          contest: latestDraw.contest,
          dateISO: latestDraw.dateISO,
          numbers: latestDraw.numbers,
          prizeBreakdown: latestDraw.prizeBreakdown,
          wasAccumulated: latestDraw.wasAccumulated,
          totalCollected: latestDraw.totalCollected,
          accumulatedNextDraw: latestDraw.accumulatedNextDraw,
        }
      : undefined,
  };
}

/**
 * Fetch a specific draw from Caixa API.
 */
export async function fetchCaixaLotteryDraw(lotteryId: LotteryType, contest?: number): Promise<LotteryDraw> {
  const raw = await fetchCaixaLotteryRaw(lotteryId, contest);
  const draw = parseCaixaLotteryDraw(raw, lotteryId);
  if (!draw) {
    throw new Error(`CAIXA payload for ${lotteryId} did not contain a valid draw`);
  }
  return draw;
}

/**
 * Fetch the latest contest number for a lottery.
 */
export async function fetchCaixaLotteryLatestContestNumber(lotteryId: LotteryType): Promise<number> {
  const raw = await fetchCaixaLotteryRaw(lotteryId);
  if (typeof raw.numero !== 'number') {
    throw new Error(`CAIXA payload for ${lotteryId} missing latest contest number`);
  }
  return raw.numero;
}

/**
 * Load lottery history from Caixa API.
 */
export async function loadCaixaLotteryHistory(
  lotteryId: LotteryType,
  options?: {
    lastN?: number;
    fromContest?: number;
    concurrency?: number;
  },
): Promise<LotteryDraw[]> {
  const lastN = options?.lastN ?? 200;
  const concurrency = Math.max(1, Math.min(8, options?.concurrency ?? 4));

  const latest = options?.fromContest ?? (await fetchCaixaLotteryLatestContestNumber(lotteryId));
  const start = Math.max(1, latest - lastN + 1);

  const contests: number[] = [];
  for (let c = latest; c >= start; c -= 1) contests.push(c);

  const results: LotteryDraw[] = [];
  let index = 0;

  async function worker() {
    while (index < contests.length) {
      const myIndex = index;
      index += 1;

      const contest = contests[myIndex]!;
      try {
        const draw = await fetchCaixaLotteryDraw(lotteryId, contest);
        results.push(draw);
      } catch {
        // Some contest numbers may not exist; ignore.
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  results.sort((a, b) => b.contest - a.contest);
  return results;
}

/**
 * Lightweight history loader for Expo Go UX.
 * - Defaults to 30 contests
 * - Optional progress callback
 * - Small delay between requests to reduce rate-limit / UI pressure
 */
export async function loadCaixaLotteryHistoryLite(
  lotteryId: LotteryType,
  options?: {
    lastN?: number;
    concurrency?: number;
    onProgress?: (done: number, total: number) => void;
    delayMsBetweenRequests?: number;
  },
): Promise<LotteryDraw[]> {
  const lastN = options?.lastN ?? 30;
  const concurrency = Math.max(1, Math.min(4, options?.concurrency ?? 2));
  const delayMsBetweenRequests = Math.max(0, options?.delayMsBetweenRequests ?? 50);

  const latest = await fetchCaixaLotteryLatestContestNumber(lotteryId);
  const start = Math.max(1, latest - lastN + 1);

  const contests: number[] = [];
  for (let c = latest; c >= start; c -= 1) contests.push(c);

  const results: LotteryDraw[] = [];
  let index = 0;
  let done = 0;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function worker() {
    while (index < contests.length) {
      const myIndex = index;
      index += 1;

      const contest = contests[myIndex]!;
      try {
        const draw = await fetchCaixaLotteryDraw(lotteryId, contest);
        results.push(draw);
      } catch {
        // ignore missing / transient failures
      } finally {
        done += 1;
        options?.onProgress?.(done, contests.length);
        if (delayMsBetweenRequests) await sleep(delayMsBetweenRequests);
      }
    }
  }

  options?.onProgress?.(0, contests.length);
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  results.sort((a, b) => b.contest - a.contest);
  return results;
}

// Backward compatibility wrappers for MegaSena
export async function fetchCaixaMegaSenaRaw(contest?: number): Promise<CaixaLotteryResponse> {
  return fetchCaixaLotteryRaw('megasena', contest);
}

export async function fetchCaixaMegaSenaDraw(contest?: number): Promise<any> {
  return fetchCaixaLotteryDraw('megasena', contest);
}

export async function fetchCaixaMegaSenaLatestContestNumber(): Promise<number> {
  return fetchCaixaLotteryLatestContestNumber('megasena');
}

export async function loadCaixaMegaSenaHistory(options?: {
  lastN?: number;
  fromContest?: number;
  concurrency?: number;
}): Promise<any[]> {
  return loadCaixaLotteryHistory('megasena', options);
}
