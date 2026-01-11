import { extractDrawsFromHistoryJson } from './normalize';
import { computeFrequencies, topNumbers } from './stats';

export type HotNumber = { number: number; count: number };
export type ColdNumber = {
  number: number;
  drawsSinceLastSeen: number | null;
  lastSeenContest: number | null;
  lastSeenDateISO: string | null;
};

export type MegaSenaAnalysis = {
  hot10: HotNumber[];
  cold10: ColdNumber[];
  averageSum: number;
  drawsCount: number;
};

// Parsing/normalization lives in src/megasena/normalize.ts

function sumNumbers(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

export function analyzeMegaSenaHistoryJson(historyJson: unknown): MegaSenaAnalysis {
  const draws = extractDrawsFromHistoryJson(historyJson);

  if (draws.length === 0) {
    return {
      hot10: [],
      cold10: [],
      averageSum: 0,
      drawsCount: 0,
    };
  }

  const freq = computeFrequencies(draws, 60, 1);
  const hot10 = topNumbers(freq, 10, 1);

  const coldAll: ColdNumber[] = [];

  for (let n = 1; n <= 60; n += 1) {
    let foundIndex = -1;
    for (let i = 0; i < draws.length; i += 1) {
      if (draws[i]!.numbers.includes(n)) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      coldAll.push({
        number: n,
        drawsSinceLastSeen: null,
        lastSeenContest: null,
        lastSeenDateISO: null,
      });
    } else {
      const last = draws[foundIndex]!;
      coldAll.push({
        number: n,
        drawsSinceLastSeen: foundIndex,
        lastSeenContest: last.contest,
        lastSeenDateISO: last.dateISO || null,
      });
    }
  }

  coldAll.sort((a, b) => {
    const ag = a.drawsSinceLastSeen ?? Number.POSITIVE_INFINITY;
    const bg = b.drawsSinceLastSeen ?? Number.POSITIVE_INFINITY;
    return bg - ag || a.number - b.number;
  });

  const totalSum = draws.reduce((acc, d) => acc + sumNumbers(d.numbers), 0);
  const averageSum = totalSum / draws.length;

  return {
    hot10,
    cold10: coldAll.slice(0, 10),
    averageSum,
    drawsCount: draws.length,
  };
}
