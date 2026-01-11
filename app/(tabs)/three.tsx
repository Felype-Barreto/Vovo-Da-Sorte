import { fetchCaixaLotteryDraw } from '@/src/megasena/lottery-caixa';
import { countHits } from '@/src/megasena/ticket';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { Text, View } from '@/components/Themed';
import { GlassCard } from '@/src/components/GlassCard';
import { NumberBall } from '@/src/components/NumberBall';
import { useLottery } from '@/src/context/LotteryContext';
import type { SavedBet } from '@/src/megasena/bets-db';
import { clearAllBets, deleteBet, listSavedBets, saveBet } from '@/src/megasena/bets-db';
import { groupBetsByLotteryAndContest } from '@/src/megasena/betsGrouping';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import type { LotteryType } from '@/src/megasena/types';

function formatTwoDigits(n: number) {
  return String(n).padStart(2, '0');
}

export default function ThreeScreen() {
  const { availableLotteries } = useLottery();
  const [bets, setBets] = useState<SavedBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  // manual add state
  const [lotteryId, setLotteryId] = useState<LotteryType>('megasena');
  const config = useMemo(() => getLotteryConfig(lotteryId), [lotteryId]);
  const minNumber = lotteryId === 'lotomania' ? 0 : 1;
  const maxNumber = lotteryId === 'lotomania' ? 99 : config.totalNumbers;
  const [contestText, setContestText] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const numberList = useMemo(() => {
    return lotteryId === 'lotomania'
      ? Array.from({ length: 100 }, (_, i) => i)
      : Array.from({ length: config.totalNumbers }, (_, i) => i + 1);
  }, [lotteryId, config.totalNumbers]);
  const requiredCount = config.numbersPerDraw;
  const groups = useMemo(() => groupBetsByLotteryAndContest(bets), [bets]);
  const [checkingBetId, setCheckingBetId] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<any>(null);
  async function reload() {
    try {
      setLoading(true);
      const all = await listSavedBets();
      setBets(all);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, []),
  );

  function toggleNumber(n: number) {
    setSelectedNumbers((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= requiredCount) return prev;
      return [...prev, n];
    });
  }

  async function saveManual() {
    if (selectedNumbers.length !== requiredCount) {
      Alert.alert('Faltam números', `Selecione ${requiredCount} números.`);
      return;
    }

    const contest = Number(contestText);
    if (!Number.isFinite(contest) || contest <= 0) {
      Alert.alert('Concurso inválido', 'Digite o número do concurso (ex: 2790).');
      return;
    }

    await saveBet({
      lotteryId,
      numbers: selectedNumbers.slice().sort((a, b) => a - b),
      contest,
      createdAt: Date.now(),
      costPerGame: 0,
      totalCost: 0,
      notes: 'Adicionado manualmente',
      isPlayed: false,
    });

    setAdding(false);
    setContestText('');
    setSelectedNumbers([]);
    await reload();
  }

  async function confirmDelete(betId: string) {
    Alert.alert('Remover', 'Remover este jogo do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await deleteBet(betId);
          await reload();
        },
      },
    ]);
  }

  async function confirmClearAll() {
    if (bets.length === 0) return;
    Alert.alert(
      'Limpar histórico',
      'Isso vai apagar TODOS os jogos salvos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await clearAllBets();
            await reload();
          },
        },
      ],
    );
  }

  // Função para conferir aposta
  async function checkBetResult(bet: SavedBet) {
    setCheckingBetId(bet.id);
    setCheckResult(null);
    try {
      const draw = await fetchCaixaLotteryDraw(bet.lotteryId, bet.contest);
      if (!draw?.numbers) {
        setCheckResult({ error: 'Não foi possível obter o resultado oficial.' });
        setCheckingBetId(null);
        return;
      }
      const hits = countHits(bet.numbers, draw.numbers);
      setCheckResult({
        bet,
        draw,
        hits,
      });
    } catch (e) {
      setCheckResult({ error: 'Erro ao buscar resultado.' });
    }
    setCheckingBetId(null);
  }


  return (
    <View style={{ flex: 1, backgroundColor: '#181c24' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 24 }}>
        <View style={{ borderRadius: 18, padding: 22, marginBottom: 18, borderWidth: 1.5, borderColor: '#20d361', backgroundColor: '#232a38', shadowColor: '#20d361', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 14, justifyContent: 'flex-start' }}>
            <Text style={{ fontSize: 30 }}>📝</Text>
            <Text style={[styles.title, { fontSize: 30, marginBottom: 0 }]}>Meus Jogos</Text>
          </RNView>
        </View>
        {/* Botões de ação centralizados e destacados */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 18 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAdding(true)}
            style={({ pressed }) => [{
              minHeight: 48,
              minWidth: 120,
              paddingHorizontal: 24,
              borderRadius: 18,
              backgroundColor: '#20d361',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#20d361',
              shadowOpacity: 0.12,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>Adicionar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={confirmClearAll}
            style={({ pressed }) => [{
              minHeight: 48,
              minWidth: 120,
              paddingHorizontal: 24,
              borderRadius: 18,
              backgroundColor: bets.length === 0 ? 'rgba(239,68,68,0.18)' : '#ef4444',
              borderWidth: 1.5,
              borderColor: '#ef4444',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: bets.length === 0 ? 0.4 : (pressed ? 0.7 : 1),
            }]}
            disabled={bets.length === 0}
          >
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>Limpar</Text>
          </Pressable>
        </RNView>

		<Text style={styles.subtitle}>
		  Aqui ficam os jogos salvos pelo Scanner e os adicionados manualmente.
		</Text>

		{loading ? <Text style={styles.subtitle}>Carregando…</Text> : null}

		{!loading && groups.length === 0 ? (
		  <GlassCard>
			<Text style={styles.sectionTitle}>Sem jogos ainda</Text>
			<Text style={styles.note}>Use o Scanner ou toque em “Adicionar”.</Text>
		  </GlassCard>
		) : null}

		{!loading
		  ? groups.map((g) => {
			  const lot = getLotteryConfig(g.key.lotteryId);
			  const contestLabel = g.key.contest ? `Concurso ${g.key.contest}` : 'Concurso não informado';

			  return (
				<GlassCard key={`${g.key.lotteryId}-${g.key.contest ?? 'x'}`} style={{ gap: 10 }}>
				  <Text style={styles.groupTitle}>{lot.name}</Text>
				  <Text style={styles.groupSubtitle}>{contestLabel}</Text>

          {g.bets.map((b) => (
            <RNView key={b.id} style={styles.betRow}>
              <RNView style={styles.betNumbers}>
                {b.numbers.slice(0, 20).map((n) => (
                  <NumberBall key={`${b.id}-${n}`} value={n} size={30} textColor="#0b1220" />
                ))}
              </RNView>
              <RNView style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => checkBetResult(b)}
                  style={({ pressed }) => [{
                    minHeight: 40,
                    minWidth: 110,
                    paddingHorizontal: 18,
                    borderRadius: 14,
                    backgroundColor: '#20d361',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#20d361',
                    shadowOpacity: 0.10,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    opacity: pressed || checkingBetId === b.id ? 0.7 : 1,
                  }]}
                  disabled={checkingBetId === b.id}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{checkingBetId === b.id ? 'Conferindo…' : 'Conferir'}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirmDelete(b.id)}
                  style={({ pressed }) => [{
                    minHeight: 40,
                    minWidth: 110,
                    paddingHorizontal: 18,
                    borderRadius: 14,
                    backgroundColor: '#ef4444',
                    borderWidth: 1.2,
                    borderColor: '#ef4444',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  }]}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Remover</Text>
                </Pressable>
              </RNView>
              {/* Resultado da conferência */}
              {checkResult && checkResult.bet?.id === b.id && (
                <GlassCard style={{ marginTop: 10, backgroundColor: '#1e293b', borderColor: '#20d361', borderWidth: 1 }}>
                  {checkResult.error ? (
                    <Text style={{ color: '#ef4444', fontWeight: '700' }}>{checkResult.error}</Text>
                  ) : (
                    <>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
                        Você acertou {checkResult.hits} número{checkResult.hits === 1 ? '' : 's'}!
                      </Text>
                      <Text style={{ color: '#fff', marginTop: 4 }}>
                        Resultado oficial do concurso {checkResult.draw.contest}:
                      </Text>
                      <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {checkResult.draw.numbers.map((n: number) => (
                          <NumberBall key={n} value={n} size={28} textColor="#0b1220" />
                        ))}
                      </RNView>
                      <Text style={{ color: '#fff', fontSize: 13, marginTop: 8 }}>
                        Atenção: esta conferência é apenas informativa. Confira sempre no site oficial da Caixa antes de descartar seu bilhete.
                      </Text>
                    </>
                  )}
                </GlassCard>
              )}
            </RNView>
          ))}
				</GlassCard>
			  );
			})
		  : null}
	  </ScrollView>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAdding(false)} />
          <View style={[styles.modalSheet, { paddingBottom: 0 }]}> 
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80, gap: 20 }}
            >
              <RNView style={[styles.modalHeader, { marginBottom: 18 }]}> 
                <Text style={[styles.modalTitle, { fontSize: 22 }]}>Adicionar jogo</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAdding(false)}
                  android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
                  style={({ pressed }) => [{ padding: 12, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={styles.modalClose}>X</Text>
                </Pressable>
              </RNView>

              {/* Etapa 1: Escolha do jogo */}
              <GlassCard style={{ gap: 18, padding: 18 }}>
                <Text style={[styles.sectionTitle, { fontSize: 17 }]}>1) 📊 Escolha o jogo</Text>
                <Text style={styles.note}>Toque no jogo que deseja adicionar</Text>
                <RNView style={{ gap: 6, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {availableLotteries.map((id) => {
                    const c = getLotteryConfig(id);
                    const selected = id === lotteryId;
                    return (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        accessibilityLabel={`Selecionar ${c.name}`}
                        onPress={() => {
                          setLotteryId(id);
                          setSelectedNumbers([]);
                        }}
                        android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
                        style={({ pressed }) => [
                          styles.lotteryButton,
                          { borderColor: selected ? c.hexColor : 'rgba(255,255,255,0.25)', minWidth: 80, marginBottom: 8 },
                          selected ? { 
                            backgroundColor: c.hexColor + '20',
                            borderWidth: 3,
                          } : { 
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            borderWidth: 2,
                          },
                          pressed ? { opacity: 0.85 } : null,
                        ]}
                      >
                        <RNView style={[styles.lotteryIndicator, { backgroundColor: c.hexColor }]} />
                        <Text 
                          style={styles.lotteryButtonText}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {c.name}
                        </Text>
                        {selected && (
                          <RNView style={[styles.selectedBadge, { backgroundColor: c.hexColor }]}>
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </RNView>
                        )}
                      </Pressable>
                    );
                  })}
                </RNView>
              </GlassCard>

              {/* Divisor visual */}
              <RNView style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.10)', marginVertical: 2 }} />

              {/* Etapa 2: Concurso */}
              <GlassCard style={{ gap: 14, padding: 18 }}>
                <Text style={[styles.sectionTitle, { fontSize: 17 }]}>2) Concurso</Text>
                <TextInput
                  value={contestText}
                  onChangeText={setContestText}
                  placeholder="Ex: 2790"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  keyboardType="number-pad"
                  style={[styles.input, { fontSize: 18, marginBottom: 2 }]}
                />
                <Text style={styles.note}>Digite o concurso em que você fez/apostou este jogo.</Text>
              </GlassCard>

              {/* Divisor visual */}
              <RNView style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.10)', marginVertical: 2 }} />

              {/* Etapa 3: Números */}
              <GlassCard style={{ gap: 14, padding: 18 }}>
                <Text style={[styles.sectionTitle, { fontSize: 17 }]}>3) Marque os números</Text>
                <Text style={styles.note}>
                  Selecione {requiredCount} números ({formatTwoDigits(minNumber)} a {formatTwoDigits(maxNumber)}).
                </Text>
                <Text style={styles.noteStrong}>
                  Selecionados: {selectedNumbers.length}/{requiredCount}
                  {selectedNumbers.length < requiredCount && (
                    <Text style={{ color: '#ef4444', fontWeight: '700' }}>  (Faltam {requiredCount - selectedNumbers.length})</Text>
                  )}
                </Text>

                {/* Números selecionados visualmente */}
                {selectedNumbers.length > 0 && (
                  <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10, marginTop: 2 }}>
                    {selectedNumbers.map((n) => (
                      <NumberBall key={n} value={n} size={24} textColor="#fff" backgroundColor={config.hexColor} />
                    ))}
                  </RNView>
                )}

                {/* Botão desfazer */}
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSelectedNumbers((prev) => prev.slice(0, -1))}
                    disabled={selectedNumbers.length === 0}
                    style={({ pressed }) => [{
                      minHeight: 36,
                      minWidth: 36,
                      borderRadius: 18,
                      backgroundColor: selectedNumbers.length === 0 ? 'rgba(255,255,255,0.10)' : '#64748b',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>↩</Text>
                  </Pressable>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Desfazer último número</Text>
                </RNView>

                <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start', paddingTop: 6 }}>
                  {numberList.map((n) => {
                    const sel = selectedNumbers.includes(n);
                    const cellWidth = lotteryId === 'lotofacil' || lotteryId === 'lotomania' ? '18%' : '14%';
                    return (
                      <Pressable
                        key={n}
                        accessibilityRole="button"
                        onPress={() => toggleNumber(n)}
                        android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
                        style={({ pressed }) => [{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: cellWidth,
                          marginBottom: 8,
                          opacity: pressed ? 0.8 : 1,
                        }]}
                        disabled={selectedNumbers.length >= requiredCount && !sel}
                      >
                        <NumberBall
                          value={n}
                          size={28}
                          textColor={sel ? '#fff' : '#0b1220'}
                          backgroundColor={sel ? config.hexColor : undefined}
                        />
                      </Pressable>
                    );
                  })}
                </RNView>

                {/* Mensagem de erro amigável */}
                {selectedNumbers.length !== requiredCount && (
                  <Text style={{ color: '#ef4444', fontWeight: '700', marginTop: 12, marginBottom: 2, textAlign: 'center' }}>
                    Selecione {requiredCount} números para salvar.
                  </Text>
                )}
                {(!contestText || isNaN(Number(contestText)) || Number(contestText) <= 0) && (
                  <Text style={{ color: '#ef4444', fontWeight: '700', marginTop: 2, marginBottom: 2, textAlign: 'center' }}>
                    Digite o número do concurso (ex: 2790).
                  </Text>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={saveManual}
                  android_ripple={{ color: 'rgba(0,0,0,0.12)', borderless: false }}
                  style={({ pressed }) => [{
                    marginTop: 28,
                    marginBottom: 8,
                    minHeight: 60,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedNumbers.length === requiredCount && contestText ? config.hexColor : 'rgba(255,255,255,0.18)',
                    opacity: pressed ? 0.8 : 1,
                    width: '100%',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOpacity: 0.10,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                  }]}
                  disabled={selectedNumbers.length !== requiredCount || !contestText}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20, letterSpacing: 0.5 }}>
                    Salvar no Histórico
                  </Text>
                </Pressable>
              </GlassCard>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 16,
    color: 'rgba(255,255,255,0.78)',
  },
  headerButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerDangerButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    backgroundColor: 'rgba(239,68,68,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.74)',
  },
  noteStrong: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.90)',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  groupSubtitle: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.80)',
  },
  betRow: {
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  betNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deleteButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    backgroundColor: 'rgba(239,68,68,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(10, 18, 35, 0.96)',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  lotteryButton: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  lotteryIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  lotteryButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.95)',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  selectedBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#001a17',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  cell: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  saveManualButton: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveManualButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
});
