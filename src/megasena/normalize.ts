import type { MegaSenaDraw } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

function toStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.every((v) => typeof v === 'string')) return value as string[];
  return null;
}

function toNumberArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const nums: number[] = [];
  for (const v of value) {
    const n = toInt(v);
    if (n === null) return null;
    nums.push(n);
  }
  return nums;
}

function normalizeNumbers(raw: unknown): number[] | null {
  const asNumbers = toNumberArray(raw);
  if (asNumbers) return asNumbers;

  const asStrings = toStringArray(raw);
  if (asStrings) {
    const nums: number[] = [];
    for (const s of asStrings) {
      const n = toInt(s);
      if (n === null) return null;
      nums.push(n);
    }
    return nums;
  }

  return null;
}

export function normalizeDraw(raw: unknown): MegaSenaDraw | null {
  if (!isRecord(raw)) return null;

  const contest = toInt(raw.contest) ?? toInt(raw.concurso) ?? toInt(raw.numero) ?? toInt(raw.id);

  const dateISO =
    (typeof raw.dateISO === 'string' && raw.dateISO) ||
    (typeof raw.data === 'string' && raw.data) ||
    (typeof raw.date === 'string' && raw.date) ||
    '';

  const numbers =
    normalizeNumbers(raw.numbers) ??
    normalizeNumbers(raw.dezenas) ??
    normalizeNumbers(raw.numeros) ??
    normalizeNumbers(raw.resultado) ??
    normalizeNumbers(raw.listaDezenas);

  if (contest === null || !numbers) return null;

  const cleaned = Array.from(new Set(numbers.filter((n) => Number.isInteger(n) && n >= 1 && n <= 60)));

  if (cleaned.length < 6) return null;

  cleaned.sort((a, b) => a - b);
  return {
    contest,
    dateISO: typeof dateISO === 'string' ? dateISO : '',
    numbers: cleaned.slice(0, 6),
  };
}

export function extractDrawsFromHistoryJson(historyJson: unknown): MegaSenaDraw[] {
  const candidates: unknown[] = [];

  if (Array.isArray(historyJson)) {
    candidates.push(...historyJson);
  } else if (isRecord(historyJson)) {
    const maybeArrays = [
      historyJson.draws,
      historyJson.concursos,
      historyJson.resultados,
      historyJson.items,
      historyJson.data,
      // common GitHub formats:
      historyJson.megasena,
    ];

    for (const value of maybeArrays) {
      if (Array.isArray(value)) {
        candidates.push(...value);
        break;
      }
    }
  }

  const draws: MegaSenaDraw[] = [];
  for (const item of candidates) {
    const d = normalizeDraw(item);
    if (d) draws.push(d);
  }

  draws.sort((a, b) => b.contest - a.contest || (b.dateISO > a.dateISO ? 1 : -1));
  return draws;
}
