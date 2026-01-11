export function parseTicketNumbersFromQrData(data: string): number[] {
  if (!data) return [];

  // Extract all 1-2 digit numbers and keep only 1..60.
  const matches = data.match(/\d{1,2}/g) ?? [];
  const nums = matches
    .map((m) => Number(m))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 60);

  // Keep order, unique.
  const unique: number[] = [];
  for (const n of nums) {
    if (!unique.includes(n)) unique.push(n);
    if (unique.length >= 6) break;
  }

  return unique.length === 6 ? unique.slice().sort((a, b) => a - b) : [];
}

function toISODateFromBR(dateBR: string): string {
  const m = /^([0-3]\d)[/\-.]([0-1]\d)[/\-.](\d{4})$/.exec(dateBR.trim());
  if (!m) return '';
  const dd = m[1];
  const mm = m[2];
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}`;
}

function toISODateFromISO(dateISO: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO.trim());
  if (!m) return '';
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export type ParsedCaixaQr = {
  numbers: number[];
  dateISO: string | null;
};

// Best-effort parser for Caixa QR strings.
// We do not assume a fixed format; we try to extract:
// - 6 unique numbers between 1..60
// - a draw date if present (dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd)
export function parseCaixaQr(data: string): ParsedCaixaQr {
  const numbers = parseTicketNumbersFromQrData(data);

  let dateISO: string | null = null;
  if (data) {
    const br = data.match(/\b([0-3]\d)[/\-.]([0-1]\d)[/\-.](\d{4})\b/);
    if (br) {
      const iso = toISODateFromBR(br[0]);
      if (iso) dateISO = iso;
    }

    if (!dateISO) {
      const isoM = data.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
      if (isoM) {
        const iso = toISODateFromISO(isoM[0]);
        if (iso) dateISO = iso;
      }
    }
  }

  return { numbers, dateISO };
}

export function countHits(bet: number[], draw: number[]): number {
  const drawSet = new Set(draw);
  let hits = 0;
  for (const n of bet) if (drawSet.has(n)) hits += 1;
  return hits;
}
