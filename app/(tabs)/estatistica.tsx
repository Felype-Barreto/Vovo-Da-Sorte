import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, View as RNView, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { GlassCard } from '@/src/components/GlassCard';
import { NativeAdCard } from '@/src/components/NativeAdCard';
import { NumberBall } from '@/src/components/NumberBall';
import { useLottery } from '@/src/context/LotteryContext';
import { maybeNotifyNewResultKnownContest } from '@/src/megasena/alerts';
import { fetchCaixaLotteryOverview, loadCaixaLotteryHistoryLite, type CaixaLotteryOverview } from '@/src/megasena/lottery-caixa';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import { computeFrequencies, topNumbers } from '@/src/megasena/stats';
import type { LotteryDraw, LotteryType } from '@/src/megasena/types';

function formatDatePtBr(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export default function HistoricoScreen() {
  const { selectedLottery, setSelectedLottery, availableLotteries } = useLottery();

  const [overview, setOverview] = useState<CaixaLotteryOverview | null>(null);
  const [drawsByLottery, setDrawsByLottery] = useState<Map<LotteryType, LotteryDraw[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const requestIdRef = useRef(0);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(Date.now());

  const config = useMemo(() => getLotteryConfig(selectedLottery), [selectedLottery]);
  const minNumber = selectedLottery === 'lotomania' ? 0 : 1;
  const maxNumber = selectedLottery === 'lotomania' ? 99 : config.totalNumbers;

  const draws = useMemo(() => drawsByLottery.get(selectedLottery) ?? [], [drawsByLottery, selectedLottery]);

  const freq = useMemo(() => computeFrequencies(draws, maxNumber, minNumber), [draws, maxNumber, minNumber]);
  const top10 = useMemo(() => topNumbers(freq, 10, minNumber), [freq, minNumber]);
  const recent10 = useMemo(() => draws.slice(0, 10), [draws]);

  async function refreshSelectedLottery() {
    const my = requestIdRef.current + 1;
    requestIdRef.current = my;

    setLoading(true);
    setProgress({ done: 0, total: 0 });

    try {
      const ov = await fetchCaixaLotteryOverview(selectedLottery);
      if (requestIdRef.current !== my) return;
      setOverview(ov);

      await maybeNotifyNewResultKnownContest({
        lotteryId: selectedLottery,
        lotteryName: config.name,
        latestContest: ov?.latestResult?.contest,
      });

      const d = await loadCaixaLotteryHistoryLite(selectedLottery, {
        lastN: 40,
        concurrency: 2,
        delayMsBetweenRequests: 40,
        onProgress: (done, total) => {
          if (requestIdRef.current !== my) return;
          setProgress({ done, total });
        },
      });

      if (requestIdRef.current !== my) return;
      setDrawsByLottery((prev) => {
        const map = new Map(prev);
        map.set(selectedLottery, d);
        return map;
      });
      setLastUpdateTimestamp(Date.now());
    } catch {
      if (requestIdRef.current !== my) return;
      setOverview(null);
      setDrawsByLottery((prev) => {
        const map = new Map(prev);
        map.set(selectedLottery, []);
        return map;
      });
    } finally {
      if (requestIdRef.current !== my) return;
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSelectedLottery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLottery]);

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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={refreshSelectedLottery}
            android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
            style={({ pressed }) => [{ padding: 8, opacity: pressed || loading ? 0.65 : 1 }]}
          >
            <RotateCcw size={22} color="rgba(255,255,255,0.90)" />
          </Pressable>

          <RNView style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>{config.name} - Histórico</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              Atualizado {formatTimeAgo(lastUpdateTimestamp)}
            </Text>
          </RNView>
        </RNView>

        <LinearGradient
          colors={['rgba(32, 211, 97, 0.15)', 'rgba(32, 211, 97, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: 'rgba(32, 211, 97, 0.3)',
          }}
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Image source={require('../../assets/images/mascote-vovo.png')} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 6 }} />
            <Text style={[styles.title, { fontSize: 24, marginBottom: 0 }]}>Estatísticas do Vovô</Text>
          </RNView>
          <Text style={[styles.subtitle, { fontSize: 16 }]}>Dados reais da Caixa • Análise completa</Text>
        </LinearGradient>

        <GlassCard style={{ gap: 16 }}>
          <RNView style={{ gap: 8 }}>
            <Text style={styles.sectionTitle}>📊 Escolha o jogo</Text>
            <Text style={styles.selectorHint}>Toque no jogo para ver as estatísticas do Vovô</Text>
          </RNView>
          <RNView style={{ gap: 12 }}>
            {availableLotteries.map((lottery) => {
              const c = getLotteryConfig(lottery);
              const isSelected = lottery === selectedLottery;
              return (
                <Pressable
                  key={lottery}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ${c.name}`}
                  android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
                  onPress={() => setSelectedLottery(lottery)}
                  style={({ pressed }) => [
                    styles.lotteryButton,
                    {
                      opacity: pressed ? 0.85 : 1,
                      borderColor: isSelected ? c.hexColor : 'rgba(255,255,255,0.25)',
                      backgroundColor: isSelected ? c.hexColor + '20' : 'rgba(255,255,255,0.08)',
                      borderWidth: isSelected ? 3 : 2,
                    },
                  ]}
                >
                  <RNView style={[styles.lotteryIndicator, { backgroundColor: c.hexColor }]} />
                  <RNView style={{ flex: 1 }}>
                    <Text 
                      style={[styles.lotteryButtonText, isSelected ? { color: '#ffffff' } : null]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {c.name}
                    </Text>
                  </RNView>
                  {isSelected && (
                    <RNView style={[styles.selectedBadge, { backgroundColor: c.hexColor }]}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </RNView>
                  )}
                </Pressable>
              );
            })}
          </RNView>
        </GlassCard>

        <GlassCard style={{ gap: 10 }}>
          <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Último resultado</Text>
            {overview?.latestResult?.wasAccumulated && (
              <RNView
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#ef4444' }}>
                  🔥 ACUMULOU
                </Text>
              </RNView>
            )}
          </RNView>
          {overview?.latestResult?.numbers?.length ? (
            <>
              <Text style={styles.smallNote}>
                Concurso {overview.latestResult.contest} ({formatDatePtBr(overview.latestResult.dateISO)})
              </Text>
              <RNView style={styles.ballsRow}>
                {overview.latestResult.numbers.map((n) => (
                  <NumberBall key={n} value={n} size={50} />
                ))}
              </RNView>
              
              {/* Informações de arrecadação */}
              {overview?.latestResult && (overview.latestResult.totalCollected || overview.latestResult.accumulatedNextDraw) && (
                <RNView style={{ marginTop: 12, gap: 8 }}>
                  {overview.latestResult.totalCollected && (
                    <RNView
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        padding: 10,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>
                        💰 Arrecadação:
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6' }}>
                        {overview.latestResult.totalCollected.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Text>
                    </RNView>
                  )}
                  {overview.latestResult.accumulatedNextDraw && (
                    <RNView
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(249, 115, 22, 0.12)',
                        padding: 10,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>
                        🔥 Acumulado próximo:
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#f97316' }}>
                        {overview.latestResult.accumulatedNextDraw.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Text>
                    </RNView>
                  )}
                </RNView>
              )}

              {/* Informações de ganhadores */}
              {overview?.latestResult?.prizeBreakdown && overview.latestResult.prizeBreakdown.length > 0 && (
                <RNView style={{ marginTop: 12, gap: 8 }}>
                  <Text style={[styles.smallNote, { fontWeight: '700', color: 'rgba(255,255,255,0.9)' }]}>
                    🏆 Ganhadores:
                  </Text>
                  {overview.latestResult.prizeBreakdown.slice(0, 3).map((prize) => (
                    <RNView
                      key={prize.faixa}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: prize.numeroDeGanhadores > 0 ? 'rgba(32, 211, 97, 0.12)' : 'rgba(255,255,255,0.05)',
                        padding: 10,
                        borderRadius: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: prize.numeroDeGanhadores > 0 ? '#20d361' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      <RNView style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>
                          {prize.descricaoFaixa}
                        </Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                          {prize.numeroDeGanhadores === 0
                            ? 'Sem ganhadores'
                            : `${prize.numeroDeGanhadores} ${prize.numeroDeGanhadores === 1 ? 'ganhador' : 'ganhadores'}`}
                        </Text>
                      </RNView>
                      {prize.valorPremio > 0 && (
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#20d361' }}>
                          {prize.valorPremio.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </Text>
                      )}
                    </RNView>
                  ))}
                </RNView>
              )}
            </>
          ) : (
            <Text style={styles.smallNote}>{loading ? 'Carregando…' : 'Ainda não foi possível carregar.'}</Text>
          )}

          {loading ? (
            <Text style={styles.smallNote}>{progress?.total ? `Carregando histórico: ${progress.done}/${progress.total}` : 'Carregando histórico…'}</Text>
          ) : null}
        </GlassCard>

        <GlassCard style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Números mais frequentes (ajuda)</Text>
          <Text style={styles.smallNote}>
            São os números que mais apareceram nos últimos {draws.length} sorteios carregados.
            Isso não é garantia — é só uma referência para montar o jogo.
          </Text>
          <RNView style={styles.ballsRow}>
            {top10.map((x) => (
              <RNView key={x.number} style={styles.ballWithCount}>
                <NumberBall value={x.number} size={54} />
                <Text style={styles.countText}>{x.count}x</Text>
              </RNView>
            ))}
          </RNView>

          <Text style={styles.smallNote}>
            Dica: esta loteria sorteia {config.numbersPerDraw} números de {minNumber} a {maxNumber}.
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={refreshSelectedLottery}
            style={({ pressed }) => [styles.button, { opacity: pressed || loading ? 0.75 : 1 }]}
          >
            <Text style={styles.buttonText}>{loading ? 'Atualizando…' : 'Atualizar'}</Text>
          </Pressable>
        </GlassCard>

        <GlassCard style={{ gap: 10, marginBottom: 18 }}>
          <Text style={styles.sectionTitle}>Sorteios recentes</Text>
          {recent10.length ? (
            recent10.map((d, idx) => (
              <React.Fragment key={d.contest}>
                <RNView style={styles.rowItem}>
                  <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.rowTitle}>Concurso {d.contest}</Text>
                    {d.wasAccumulated && (
                      <RNView
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#ef4444' }}>
                          🔥 ACUMULOU
                        </Text>
                      </RNView>
                    )}
                  </RNView>
                  <Text style={styles.rowSub}>{formatDatePtBr(d.dateISO)}</Text>
                  <RNView style={styles.ballsRowSmall}>
                    {d.numbers.map((n) => (
                      <NumberBall key={n} value={n} size={40} />
                    ))}
                  </RNView>
                  {d.prizeBreakdown && d.prizeBreakdown.length > 0 && (
                    <RNView style={{ marginTop: 12, gap: 8 }}>
                      <Text style={[styles.smallNote, { fontWeight: '700', color: 'rgba(255,255,255,0.9)' }]}>
                        🏆 Ganhadores:
                      </Text>
                      {d.prizeBreakdown.slice(0, 3).map((prize) => (
                        <RNView
                          key={prize.faixa}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: prize.numeroDeGanhadores > 0 ? 'rgba(32, 211, 97, 0.12)' : 'rgba(255,255,255,0.05)',
                            padding: 10,
                            borderRadius: 8,
                            borderLeftWidth: 3,
                            borderLeftColor: prize.numeroDeGanhadores > 0 ? '#20d361' : 'rgba(255,255,255,0.2)',
                          }}
                        >
                          <RNView style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>
                              {prize.descricaoFaixa}
                            </Text>
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                              {prize.numeroDeGanhadores === 0
                                ? 'Sem ganhadores'
                                : `${prize.numeroDeGanhadores} ${prize.numeroDeGanhadores === 1 ? 'ganhador' : 'ganhadores'}`}
                            </Text>
                          </RNView>
                          {prize.valorPremio > 0 && (
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#20d361' }}>
                              {prize.valorPremio.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </Text>
                          )}
                        </RNView>
                      ))}
                    </RNView>
                  )}
                </RNView>
                {/* Exibe NativeAdCard após o terceiro item */}
                {idx === 2 && <NativeAdCard />}
              </React.Fragment>
            ))
          ) : (
            <Text style={styles.smallNote}>{loading ? 'Carregando…' : 'Sem histórico ainda.'}</Text>
          )}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  smallNote: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },
  selectorHint: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  lotteryButton: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  lotteryIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  lotteryButtonText: {
    fontSize: 19,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.9)',
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  selectedBadgeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#001a17',
  },
  ballsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  ballsRowSmall: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  ballWithCount: {
    alignItems: 'center',
  },
  countText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.78)',
  },
  rowItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    paddingTop: 12,
    marginTop: 8,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  rowSub: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
  },
});
