import type { MegaSenaDraw } from './types';

const CAIXA_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';

type CaixaMegaSenaResponse = {
  numero?: number;
  dataApuracao?: string; // dd/MM/yyyy
  listaDezenas?: string[];
  dezenasSorteadasOrdemSorteio?: string[];
  numeroConcursoAnterior?: number;
  numeroConcursoProximo?: number;
  acumulado?: boolean;
  valorEstimadoProximoConcurso?: string;
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

function parseNumbers(raw: string[] | undefined): number[] {
  if (!raw) return [];
  const nums = raw
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 60);
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

export function parseCaixaMegaSenaDraw(json: CaixaMegaSenaResponse): MegaSenaDraw | null {
  const contest = typeof json.numero === 'number' ? json.numero : null;
  const numbers = parseNumbers(json.listaDezenas ?? json.dezenasSorteadasOrdemSorteio);
  if (!contest || numbers.length < 6) return null;

  return {
    contest,
    dateISO: toISODateFromBR(json.dataApuracao),
    numbers: numbers.slice(0, 6),
  };
}

export async function fetchCaixaMegaSenaRaw(contest?: number): Promise<CaixaMegaSenaResponse> {
  const url = contest ? `${CAIXA_BASE}/${contest}` : CAIXA_BASE;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`CAIXA request failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as CaixaMegaSenaResponse;
}

export async function fetchCaixaMegaSenaDraw(contest?: number): Promise<MegaSenaDraw> {
  const raw = await fetchCaixaMegaSenaRaw(contest);
  const draw = parseCaixaMegaSenaDraw(raw);
  if (!draw) {
    throw new Error('CAIXA payload did not contain a valid draw');
  }
  return draw;
}

export async function fetchCaixaMegaSenaLatestContestNumber(): Promise<number> {
  const raw = await fetchCaixaMegaSenaRaw();
  if (typeof raw.numero !== 'number') {
    throw new Error('CAIXA payload missing latest contest number');
  }
  return raw.numero;
}

export async function loadCaixaMegaSenaHistory(options?: {
  lastN?: number;
  fromContest?: number;
  concurrency?: number;
}): Promise<MegaSenaDraw[]> {
  const lastN = options?.lastN ?? 200;
  const concurrency = Math.max(1, Math.min(8, options?.concurrency ?? 4));

  const latest = options?.fromContest ?? (await fetchCaixaMegaSenaLatestContestNumber());
  const start = Math.max(1, latest - lastN + 1);

  const contests: number[] = [];
  for (let c = latest; c >= start; c -= 1) contests.push(c);

  const results: MegaSenaDraw[] = [];
  let index = 0;

  async function worker() {
    while (index < contests.length) {
      const myIndex = index;
      index += 1;

      const contest = contests[myIndex]!;
      try {
        const draw = await fetchCaixaMegaSenaDraw(contest);
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
