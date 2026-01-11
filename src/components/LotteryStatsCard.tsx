import { useMemo } from 'react';
import { View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import { computeFrequencies, topNumbers } from '@/src/megasena/stats';
import type { LotteryDraw, LotteryType } from '@/src/megasena/types';

interface LotteryStatsCardProps {
  lotteryId: LotteryType;
  draws: LotteryDraw[];
  topCount?: number;
}

export function LotteryStatsCard({ lotteryId, draws, topCount = 10 }: LotteryStatsCardProps) {
  const config = getLotteryConfig(lotteryId);

  const topFrequent = useMemo(() => {
    if (draws.length === 0) return [];
      const freq = computeFrequencies(draws, config.totalNumbers, 1);
      return topNumbers(freq, topCount, 1);
  }, [draws, config.totalNumbers, topCount]);

  if (draws.length === 0) {
    return (
      <View
        style={{
          backgroundColor: config.hexColor,
          borderRadius: 12,
          padding: 16,
          opacity: 0.5,
        }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 8 }}>
          {config.name}
        </Text>
        <Text style={{ fontSize: 14, color: '#ffffff', opacity: 0.8 }}>Carregando...</Text>
      </View>
    );
  }

  const latestDraw = draws[0];

  return (
    <View
      style={{
        backgroundColor: config.hexColor,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 4 }}>
        {config.name}
      </Text>
      <Text style={{ fontSize: 12, color: '#ffffff', opacity: 0.9, marginBottom: 12 }}>
        Concurso {latestDraw?.contest} • {latestDraw?.dateISO}
      </Text>

      <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffff', opacity: 0.9, marginBottom: 8 }}>
        Top {topCount} Números Quentes
      </Text>

      <RNView
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 6,
        }}>
        {topFrequent.map(({ number, count }) => (
          <RNView
            key={number}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)',
            }}>
            <Text
              style={{
                color: '#ffffff',
                fontSize: 12,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              {String(number).padStart(2, '0')} ({count}x)
            </Text>
          </RNView>
        ))}
      </RNView>
    </View>
  );
}
