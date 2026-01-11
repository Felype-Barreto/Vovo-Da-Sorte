import { fetchCaixaMegaSenaDraw } from '@/src/megasena/caixa';

export async function fetchOfficialDraw(lotteryId: string, contest: string | number): Promise<number[] | null> {
  // Only Mega-Sena supported for now
  if (lotteryId === 'megasena') {
    try {
      const draw = await fetchCaixaMegaSenaDraw(Number(contest));
      return draw.numbers;
    } catch (e) {
      return null;
    }
  }
  // TODO: add support for other lotteries
  return null;
}
