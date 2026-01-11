import { preloadInterstitial, showInterstitialIfAllowed } from '@/src/ads/interstitialAd';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { RotateCcw } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View as RNView, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import ClosureGeneratorModal from '@/src/components/ClosureGeneratorModal';
import { useHelpModals } from '@/src/components/HelpModal';
import { useLottery } from '@/src/context/LotteryContext';
import { generateDeterministicBetVariant } from '@/src/megasena/frequencyGenerator';
import { fetchCaixaLotteryOverview, loadCaixaLotteryHistoryLite, type CaixaLotteryOverview } from '@/src/megasena/lottery-caixa';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import type { LotteryDraw, LotteryType } from '@/src/megasena/types';

export default function SimuladorScreen() {
  const { selectedLottery } = useLottery();
  const config = getLotteryConfig(selectedLottery);

  const minNumber = selectedLottery === 'lotomania' ? 0 : 1;
  const maxNumber = selectedLottery === 'lotomania' ? 99 : config.totalNumbers;

  const params = useLocalSearchParams<{ nums?: string | string[] }>();

  const [overview, setOverview] = useState<CaixaLotteryOverview | null>(null);
  const [draws, setDraws] = useState<LotteryDraw[] | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string>('');
  const [closureModalVisible, setClosureModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [variant, setVariant] = useState(0);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(Date.now());

  const { showHelp, HelpUI } = useHelpModals();

  const requestIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const my = requestIdRef.current + 1;
    requestIdRef.current = my;
    
    const loadDraws = async () => {
      try {
        setLoading(true);
        setProgress({ done: 0, total: 0 });
        setSourceLabel('Carregando dados reais da Caixa…');

        const ov = await fetchCaixaLotteryOverview(selectedLottery);
        if (!alive || requestIdRef.current !== my) return;
        setOverview(ov);

        const d = await loadCaixaLotteryHistoryLite(selectedLottery, {
          lastN: 80,
          concurrency: 2,
          delayMsBetweenRequests: 40,
          onProgress: (done, total) => {
            if (!alive || requestIdRef.current !== my) return;
            setProgress({ done, total });
          },
        });

        if (!alive || requestIdRef.current !== my) return;
        setDraws(d);
        setSourceLabel(d.length ? `Dados reais (Caixa) - ${d.length} sorteios` : 'Dados reais (Caixa)');
        setLastUpdateTimestamp(Date.now());
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        if (alive) {
          setOverview(null);
          setDraws([]);
          setSourceLabel('Não foi possível carregar dados reais da Caixa.');
        }
      } finally {
        if (alive && requestIdRef.current === my) {
          setLoading(false);
        }
      }
    };

    loadDraws();
      // Preload interstitial ad on mount
      preloadInterstitial();
    return () => {
      alive = false;
    };
  }, [selectedLottery]);

  const refreshData = async () => {
    const my = requestIdRef.current + 1;
    requestIdRef.current = my;
    
    setLoading(true);
    setProgress({ done: 0, total: 0 });
    setSourceLabel('Buscando os dados mais recentes da Caixa…');

    try {
      const ov = await fetchCaixaLotteryOverview(selectedLottery);
      if (requestIdRef.current !== my) return;
      setOverview(ov);

      const d = await loadCaixaLotteryHistoryLite(selectedLottery, {
        lastN: 80,
        concurrency: 2,
        delayMsBetweenRequests: 40,
        onProgress: (done, total) => {
          if (requestIdRef.current !== my) return;
          setProgress({ done, total });
        },
      });

      if (requestIdRef.current !== my) return;
      setDraws(d);
      setSourceLabel(d.length ? `Dados atualizados - ${d.length} sorteios` : 'Dados atualizados');
      setLastUpdateTimestamp(Date.now());
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      setSourceLabel('Falha ao atualizar dados.');
    } finally {
      if (requestIdRef.current === my) {
        setLoading(false);
      }
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'agora';
    if (minutes === 1) return 'há 1 minuto';
    if (minutes < 60) return `há ${minutes} minutos`;
    if (hours === 1) return 'há 1 hora';
    if (hours < 24) return `há ${hours} horas`;
    if (days === 1) return 'há 1 dia';
    return `há ${days} dias`;
  };

  const readyDraws = useMemo(() => draws ?? [], [draws]);
  const consumedParamRef = useRef(false);
  const [forcedBet, setForcedBet] = useState<number[] | null>(null);

  const betFromParams = useMemo(() => {
    const rawNums = Array.isArray(params.nums) ? params.nums[0] : params.nums;
    if (!rawNums) return [];

    const matches = String(rawNums).match(/\d{1,2}/g) ?? [];
    const nums = matches
      .map((m) => Number(m))
      .filter((n) => Number.isInteger(n) && n >= minNumber && n <= maxNumber);

    const unique: number[] = [];
    for (const n of nums) {
      if (!unique.includes(n)) unique.push(n);
      if (unique.length >= config.numbersPerDraw) break;
    }

    return unique.length === config.numbersPerDraw ? unique.slice().sort((a, b) => a - b) : [];
  }, [params.nums, config.numbersPerDraw, minNumber, maxNumber]);

  useEffect(() => {
    if (draws == null) return;
    if (betFromParams.length === config.numbersPerDraw && !consumedParamRef.current) {
      consumedParamRef.current = true;
      setForcedBet(betFromParams);
      return;
    }
  }, [draws, betFromParams, config.numbersPerDraw]);

  const generated = useMemo(() => {
    if (!readyDraws.length) {
      return {
        numbers: [] as number[],
        reasoning: 'Carregando base…',
      };
    }
    const r = generateDeterministicBetVariant(selectedLottery as LotteryType, readyDraws, variant);
    return { numbers: r.numbers, reasoning: r.reasoning };
  }, [readyDraws, selectedLottery, variant]);

  const bet = forcedBet?.length ? forcedBet : generated.numbers;
  const reasoning = forcedBet?.length
    ? 'Aposta recebida do app (baseada nos números frequentes exibidos).'
    : generated.reasoning;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={config.hexColor} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['rgba(147, 51, 234, 0.15)', 'rgba(147, 51, 234, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 18,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(147, 51, 234, 0.3)',
        }}
      >
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 28 }}>🎲</Text>
            <Text style={[styles.title, { fontSize: 28, marginBottom: 0 }]}>Gerador</Text>
          </RNView>
          <Pressable
            accessibilityRole="button"
            onPress={refreshData}
            disabled={loading}
            android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
            style={({ pressed }) => [{ padding: 8, opacity: loading ? 0.5 : (pressed ? 0.7 : 1) }]}
          >
            <RotateCcw size={24} color="rgba(255,255,255,0.90)" />
          </Pressable>
        </RNView>
        <Text style={[styles.subtitle, { fontSize: 15, marginBottom: 6 }]}>Apostas baseadas em frequências reais</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {config.name} • Atualizado {formatTimeAgo(lastUpdateTimestamp)}
        </Text>
      </LinearGradient>

      <View style={[styles.card, { borderColor: config.hexColor, backgroundColor: `${config.hexColor}15` }]}>
        <Text style={styles.cardTitle}>Aposta Sugerida</Text>
        <Text style={styles.betText}>{bet.length ? bet.map((n) => String(n).padStart(2, '0')).join('  ') : 'Sem base ainda'}</Text>

        <Text style={styles.reasoning}>{reasoning}</Text>

        {progress?.total ? (
          <Text style={styles.progress}>Carregando histórico: {progress.done}/{progress.total}</Text>
        ) : null}

        <RNView style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              setForcedBet(null);
              setVariant((v) => v + 1);
              // Show interstitial ad if allowed after generating a new bet
              setTimeout(() => {
                showInterstitialIfAllowed();
              }, 400);
            // Optionally, preload interstitial again after modal closes or after ad closes (handled in ad logic)
            }}
            disabled={!readyDraws.length}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: config.hexColor, opacity: pressed || !readyDraws.length ? 0.6 : 1 },
              pressed && { opacity: 0.85 }
            ]}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Gerar</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setClosureModalVisible(true)}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: config.hexColor, opacity: pressed ? 0.85 : 1 },
              pressed && { opacity: 0.85 }
            ]}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Análise</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => showHelp('statistics')}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.16)', borderWidth: 1, opacity: pressed ? 0.85 : 1 },
              pressed && { opacity: 0.85 }
            ]}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Ajuda</Text>
          </Pressable>
        </RNView>
      </View>

      <Text style={styles.note}>{sourceLabel || 'Carregando dados...'}</Text>

      {overview?.latestResult?.numbers?.length ? (
        <View style={[styles.card, { borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.06)' }]}>
          <Text style={[styles.cardTitle, { color: '#ffffff' }]}>Último resultado (Caixa)</Text>
          <Text style={[styles.note, { color: 'rgba(255,255,255,0.75)' }]}>Concurso {overview.latestResult.contest}</Text>
          <Text style={[styles.betText, { color: '#ffffff' }]}>
            {overview.latestResult.numbers.map((n) => String(n).padStart(2, '0')).join('  ')}
          </Text>
          <Text style={[styles.note, { color: 'rgba(255,255,255,0.75)' }]}>Esta loteria vai de {minNumber} a {maxNumber}.</Text>
        </View>
      ) : null}

      <ClosureGeneratorModal
        visible={closureModalVisible}
        onClose={() => setClosureModalVisible(false)}
      />

      {HelpUI}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 80,
    gap: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.78)',
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  betText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  reasoning: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.78)',
  },
  progress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
  },
  note: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
  },
});
