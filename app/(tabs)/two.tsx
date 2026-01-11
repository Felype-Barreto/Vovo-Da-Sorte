import React, { useEffect, useMemo, useState } from 'react';
import { View as RNView, ScrollView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { LotteryStatsCard } from '@/src/components/LotteryStatsCard';
import { useLottery } from '@/src/context/LotteryContext';
import { loadCaixaLotteryHistory } from '@/src/megasena/lottery-caixa';
import { getAllLotteryConfigs } from '@/src/megasena/lotteryConfigs';
import type { LotteryDraw, LotteryType } from '@/src/megasena/types';

type LotteryDataMap = Map<LotteryType, LotteryDraw[]>;

export default function MultiLotteryScreen() {
  const { availableLotteries } = useLottery();
  const [allDraws, setAllDraws] = useState<LotteryDataMap>(new Map());
  const [loading, setLoading] = useState(true);

  // Load data for all lotteries on mount
  useEffect(() => {
    let alive = true;

    async function loadAll() {
      const map: LotteryDataMap = new Map();

      for (const lotteryId of availableLotteries) {
        try {
          const draws = await loadCaixaLotteryHistory(lotteryId as LotteryType, {
            lastN: 100,
          });
          if (alive) {
            map.set(lotteryId as LotteryType, draws);
          }
        } catch (err) {
          console.warn(`[MultiLottery] Failed to load ${lotteryId}:`, err);
          if (alive) {
            map.set(lotteryId as LotteryType, []);
          }
        }
      }

      if (alive) {
        setAllDraws(map);
        setLoading(false);
      }
    }

    loadAll();

    return () => {
      alive = false;
    };
  }, [availableLotteries]);

  const configs = useMemo(() => getAllLotteryConfigs(), []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#181c24', alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-zinc-400 text-lg">Carregando loterias...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#181c24' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <View className="gap-1 mb-4">
          <Text className="text-2xl font-extrabold text-zinc-50">Comparativo de Loterias</Text>
          <Text className="text-zinc-400">Análise de frequência de todas as modalidades</Text>
        </View>

        <View className="gap-3">
          {configs.map((config) => {
            const draws = allDraws.get(config.id) ?? [];

            return (
              <RNView key={config.id}>
                <LotteryStatsCard
                  lotteryId={config.id}
                  draws={draws}
                  topCount={6}
                />
              </RNView>
            );
          })}
        </View>

        <View style={{ backgroundColor: '#232a38', borderRadius: 14, padding: 16, marginTop: 16, gap: 8 }}>
          <Text className="text-sm font-bold text-zinc-50">Sobre o Comparativo</Text>
          <Text className="text-xs text-zinc-400">
            Cada card mostra os 6 números mais frequentes nos últimos 100 sorteios de cada modalidade.
            Use essas informações para entender padrões e tendências em todas as loterias.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
