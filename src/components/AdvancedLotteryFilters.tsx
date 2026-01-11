import React, { useMemo } from 'react';
import { Pressable, View as RNView, ScrollView } from 'react-native';

import { Text } from '@/components/Themed';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import {
    countHitsAgainstDraw,
    getLotofacilRepeatCandidates,
    getLotomaniaeMirrorGame,
} from '@/src/megasena/lotteryFilters';
import type { LotteryDraw, LotteryType } from '@/src/megasena/types';
import { formatNumbers } from '@/src/megasena/weighted';

interface AdvancedFiltersProps {
  lotteryId: LotteryType;
  draws: LotteryDraw[];
  selectedGame?: number[];
  onApplyMirror?: (mirroredGame: number[]) => void;
}

export function AdvancedLotteryFilters({
  lotteryId,
  draws,
  selectedGame,
  onApplyMirror,
}: AdvancedFiltersProps) {
  const config = getLotteryConfig(lotteryId);

  // Lotofácil: repetição do sorteio anterior
  const lotofacilRepeats = useMemo(() => {
    if (lotteryId !== 'lotofacil' || draws.length < 2) return [];
    return getLotofacilRepeatCandidates(draws, 10);
  }, [lotteryId, draws]);

  // Lotomania: jogo espelho
  const mirrorGame = useMemo(() => {
    if (lotteryId !== 'lotomania' || !selectedGame || selectedGame.length === 0) return null;
    return getLotomaniaeMirrorGame(selectedGame);
  }, [lotteryId, selectedGame]);

  // Comparação com último sorteio
  const hitsAgainstLatest = useMemo(() => {
    if (!selectedGame || draws.length === 0) return null;
    const latestDraw = draws[0];
    if (!latestDraw) return null;
    return countHitsAgainstDraw(selectedGame, latestDraw.numbers);
  }, [selectedGame, draws]);

  if (!selectedGame || selectedGame.length === 0) {
    return (
      <RNView style={{ padding: 12, opacity: 0.5 }}>
        <Text style={{ fontSize: 12, color: '#999' }}>Gere uma aposta para ver filtros avançados</Text>
      </RNView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ gap: 12, padding: 12 }}>
      {/* Lotofácil: Repetição */}
      {lotteryId === 'lotofacil' && lotofacilRepeats.length > 0 && (
        <RNView
          style={{
            backgroundColor: '#f5f3ff',
            borderLeftWidth: 4,
            borderLeftColor: '#8b5cf6',
            padding: 12,
            borderRadius: 8,
          }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed', marginBottom: 8 }}>
            Números que Repetem (Lotofácil)
          </Text>
          <Text style={{ fontSize: 12, color: '#5b21b6', marginBottom: 10 }}>
            Estatisticamente, 8-10 números repetem do sorteio anterior. Aqui estão os candidatos:
          </Text>
          <RNView style={{ gap: 8 }}>
            {lotofacilRepeats.slice(0, 5).map(({ number, repeatChance }) => (
              <RNView
                key={number}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 8,
                  backgroundColor: '#f0e5ff',
                  borderRadius: 6,
                }}>
                <Text style={{ fontWeight: '700', color: '#7c3aed' }}>{String(number).padStart(2, '0')}</Text>
                <Text style={{ fontSize: 11, color: '#5b21b6' }}>
                  {Math.round(repeatChance * 100)}% de chance
                </Text>
              </RNView>
            ))}
          </RNView>
        </RNView>
      )}

      {/* Lotomania: Jogo Espelho */}
      {lotteryId === 'lotomania' && mirrorGame && (
        <RNView
          style={{
            backgroundColor: '#fff5f2',
            borderLeftWidth: 4,
            borderLeftColor: '#f97316',
            padding: 12,
            borderRadius: 8,
          }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#c2410c', marginBottom: 8 }}>
            Jogo Espelho (Lotomania)
          </Text>
          <Text style={{ fontSize: 12, color: '#92400e', marginBottom: 10 }}>
            Seu jogo espelhado (100 - cada número). Mesma distribuição de frequência:
          </Text>
          <RNView
            style={{
              padding: 10,
              backgroundColor: '#fed7aa',
              borderRadius: 6,
              marginBottom: 10,
            }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#7c2d12', textAlign: 'center' }}>
              {formatNumbers(mirrorGame)}
            </Text>
          </RNView>
          {onApplyMirror && (
            <Pressable
              onPress={() => onApplyMirror(mirrorGame)}
              style={{
                backgroundColor: '#f97316',
                padding: 10,
                borderRadius: 6,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>Usar Jogo Espelho</Text>
            </Pressable>
          )}
        </RNView>
      )}

      {/* Comparação com último sorteio */}
      {hitsAgainstLatest !== null && (
        <RNView
          style={{
            backgroundColor: '#f0f9ff',
            borderLeftWidth: 4,
            borderLeftColor: '#0284c7',
            padding: 12,
            borderRadius: 8,
          }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0c4a6e', marginBottom: 8 }}>
            Acertos vs. Último Sorteio
          </Text>
          <RNView
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              padding: 12,
              backgroundColor: '#cffafe',
              borderRadius: 6,
            }}>
            <RNView style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#0c4a6e' }}>
                {hitsAgainstLatest}
              </Text>
              <Text style={{ fontSize: 11, color: '#164e63' }}>acerto(s)</Text>
            </RNView>
            <RNView style={{ justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, color: '#164e63' }}>
                dos {config.numbersPerDraw} números sorteados
              </Text>
            </RNView>
          </RNView>
        </RNView>
      )}
    </ScrollView>
  );
}
