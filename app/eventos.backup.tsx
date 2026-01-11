// Backup do arquivo original de eventos especiais

import { fetchCaixaLotteryOverview } from '@/src/megasena/lottery-caixa';
import { getUpcomingSpecialContests } from '@/src/megasena/special-contests';
import { useEffect, useState } from 'react';

export default function EventosScreen() {
  const eventos = getUpcomingSpecialContests(10);
  const [overviews, setOverviews] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [erroCaixa, setErroCaixa] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    setErroCaixa(null);
    const result: Record<string, any> = {};
    try {
      for (const evento of eventos) {
        for (const lotId of evento.lotteries) {
          try {
            const overview = await fetchCaixaLotteryOverview(lotId);
            let specialDraw = null;
            if (evento.date) {
              const history = await import('@/src/megasena/lottery-caixa').then(m => m.loadCaixaLotteryHistoryLite(lotId, { lastN: 40 }));
              const targetDate = evento.date.toISOString().slice(0, 10);
              const beforeOrEqual = history.filter(draw => draw.dateISO <= targetDate);
              specialDraw = beforeOrEqual.find(draw => draw.dateISO === targetDate);
              if (!specialDraw && beforeOrEqual.length > 0) {
                beforeOrEqual.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
                specialDraw = beforeOrEqual[0];
              }
            }
            result[lotId] = { ...overview, specialDraw };
          } catch {
            setErroCaixa('Não foi possível carregar os dados da Caixa. Tente novamente mais tarde.');
          }
        }
      }
      setOverviews(result);
    } catch {
      setErroCaixa('Não foi possível carregar os dados da Caixa. Tente novamente mais tarde.');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function formatDataExtenso(date: Date) {
    // ...
  }

  // ...restante do componente
}
