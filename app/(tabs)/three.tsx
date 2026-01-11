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

  return (
	<View style={{ flex: 1, backgroundColor: '#181c24' }}>
	  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
		<View style={{ borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#20d361', backgroundColor: '#232a38' }}>
		  <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
			<RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
			  <Text style={{ fontSize: 28 }}>📝</Text>
			  <Text style={[styles.title, { fontSize: 28, marginBottom: 0 }]}>Meus Jogos</Text>
			</RNView>
			<RNView style={styles.headerActions}>
			  <Pressable
				accessibilityRole="button"
				onPress={() => setAdding(true)}
				style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.85 : 1 }]}
			  >
				<Text style={styles.headerButtonText}>Adicionar</Text>
			  </Pressable>
			  <Pressable
				accessibilityRole="button"
				onPress={confirmClearAll}
				style={({ pressed }) => [
				  styles.headerDangerButton,
				  bets.length === 0 ? { opacity: 0.4 } : null,
                  { opacity: pressed ? 0.75 : 1 },
				]}
				disabled={bets.length === 0}
			  >
				<Text style={styles.headerButtonText}>Limpar</Text>
			  </Pressable>
			</RNView>
		  </RNView>
		</View>

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

					  <Pressable
						accessibilityRole="button"
						onPress={() => confirmDelete(b.id)}
						style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.75 : 1 }]}
					  >
						<Text style={styles.deleteButtonText}>Remover</Text>
					  </Pressable>
					</RNView>
				  ))}
				</GlassCard>
			  );
			})
		  : null}
	  </ScrollView>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAdding(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 64, gap: 14 }}
            >
              <RNView style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adicionar jogo</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAdding(false)}
                  android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
                  style={({ pressed }) => [{ padding: 10, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={styles.modalClose}>X</Text>
                </Pressable>
              </RNView>

              <GlassCard style={{ gap: 12 }}>
                <Text style={styles.sectionTitle}>1) 📊 Escolha o jogo</Text>
                <Text style={styles.note}>Toque no jogo que deseja adicionar</Text>
                <RNView style={{ gap: 10 }}>
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
                          { borderColor: selected ? c.hexColor : 'rgba(255,255,255,0.25)' },
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

              <GlassCard style={{ gap: 10 }}>
                <Text style={styles.sectionTitle}>2) Concurso</Text>
                <TextInput
                  value={contestText}
                  onChangeText={setContestText}
                  placeholder="Ex: 2790"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  keyboardType="number-pad"
                  style={styles.input}
                />
                <Text style={styles.note}>Digite o concurso em que você fez/apostou este jogo.</Text>
              </GlassCard>

              <GlassCard style={{ gap: 10 }}>
                <Text style={styles.sectionTitle}>3) Marque os números</Text>
                <Text style={styles.note}>
                  Selecione {requiredCount} números ({formatTwoDigits(minNumber)} a {formatTwoDigits(maxNumber)}).
                </Text>
                <Text style={styles.noteStrong}>
                  Selecionados: {selectedNumbers.length}/{requiredCount}
                </Text>

                <RNView style={styles.grid}>
                  {numberList.map((n) => {
                    const sel = selectedNumbers.includes(n);
                    const cellWidth = lotteryId === 'lotofacil' || lotteryId === 'lotomania' ? '19%' : '16%';
                    return (
                      <Pressable
                        key={n}
                        accessibilityRole="button"
                        onPress={() => toggleNumber(n)}
                        android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
                        style={({ pressed }) => [
                          styles.cell,
                          { width: cellWidth },
                          sel ? { backgroundColor: config.hexColor, borderColor: 'transparent' } : null,
                          pressed
                            ? {
                                opacity: 0.92,
                                backgroundColor: sel ? config.hexColor : 'rgba(255,255,255,0.12)',
                              }
                            : null,
                        ]}
                      >
                        <Text style={styles.cellText}>{formatTwoDigits(n)}</Text>
                      </Pressable>
                    );
                  })}
                </RNView>

                <Pressable
                  accessibilityRole="button"
                  onPress={saveManual}
                  android_ripple={{ color: 'rgba(0,0,0,0.12)', borderless: false }}
                  style={({ pressed }) => [
                    styles.saveManualButton,
                    { backgroundColor: config.hexColor, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={styles.saveManualButtonText}>Salvar no Histórico</Text>
                </Pressable>
              </GlassCard>
            </ScrollView>
          </Pressable>
        </Pressable>
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
