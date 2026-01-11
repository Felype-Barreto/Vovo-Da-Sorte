import type { SavedBet } from './bets-db';
import type { LotteryType } from './types';

export type BetGroupKey = {
  lotteryId: LotteryType;
  contest: number | null;
};

export type BetGroup = {
  key: BetGroupKey;
  bets: SavedBet[];
};

export function groupBetsByLotteryAndContest(bets: SavedBet[]): BetGroup[] {
  const map = new Map<string, BetGroup>();

  for (const bet of bets) {
    const contest = typeof bet.contest === 'number' ? bet.contest : null;
    const id = `${bet.lotteryId}::${contest ?? 'null'}`;

    const existing = map.get(id);
    if (existing) {
      existing.bets.push(bet);
    } else {
      map.set(id, { key: { lotteryId: bet.lotteryId, contest }, bets: [bet] });
    }
  }

  // Sort groups: contest desc first, unknown contest last. Within contest, keep createdAt desc.
  const groups = Array.from(map.values());
  for (const g of groups) {
    g.bets.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  groups.sort((a, b) => {
    const ac = a.key.contest;
    const bc = b.key.contest;
    if (ac == null && bc == null) return a.key.lotteryId.localeCompare(b.key.lotteryId);
    if (ac == null) return 1;
    if (bc == null) return -1;
    if (bc !== ac) return bc - ac;
    return a.key.lotteryId.localeCompare(b.key.lotteryId);
  });

  return groups;
}
