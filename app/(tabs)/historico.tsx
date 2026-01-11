// RESTAURADO: Versão avançada da aba Meus Jogos
import { GlassCard } from '@/src/components/GlassCard';
import { NumberBall } from '@/src/components/NumberBall';
import { clearAllBets, deleteBet, listSavedBets } from '@/src/megasena/bets-db';
import { fetchOfficialDraw } from '@/src/megasena/fetchOfficialDraw';
import { getAllLotteryIds, getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const RNView = View;

function formatTwoDigits(n: number) {
  return n.toString().padStart(2, '0');
}

export default function HistoricoScreen() {
  // Estados principais
  const [bets, setBets] = useState<any[]>([]);
  const [groups, setGroups] = useState<{ key: { lotteryId: string, contest?: string }, bets: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showCheck, setShowCheck] = useState<string | false>(false);
  const [lotteryId, setLotteryId] = useState(getAllLotteryIds()[0]);
  const [contestText, setContestText] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  // Configuração da loteria selecionada
  const config = getLotteryConfig(lotteryId);
  const requiredCount = config.numbersPerDraw;
  const minNumber = 1;
  const maxNumber = config.totalNumbers;
  const numberList = Array.from({ length: maxNumber - minNumber + 1 }, (_, i) => i + minNumber);

  // Carregar apostas do banco
  async function reload() {
    setLoading(true);
    const all = await listSavedBets();
    setBets(all);
    // Agrupar por loteria e concurso
    const groupMap: Record<string, { key: { lotteryId: string, contest?: string }, bets: any[] }> = {};
    for (const b of all) {
      const contestStr = b.contest !== undefined && b.contest !== null ? String(b.contest) : undefined;
      const groupKey = b.lotteryId + '-' + (contestStr || 'x');
      if (!groupMap[groupKey]) {
        groupMap[groupKey] = { key: { lotteryId: b.lotteryId, contest: contestStr }, bets: [] };
      }
      groupMap[groupKey].bets.push(b);
    }
    setGroups(Object.values(groupMap));
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function toggleNumber(n: number) {
    if (selectedNumbers.includes(n)) {
      setSelectedNumbers(selectedNumbers.filter(x => x !== n));
    } else if (selectedNumbers.length < requiredCount) {
      setSelectedNumbers([...selectedNumbers, n]);
    }
  }

  function undoLastNumber() {
    setSelectedNumbers(selectedNumbers.slice(0, -1));
  }

  async function saveManual() {
    if (selectedNumbers.length !== requiredCount) {
      Alert.alert('Selecione todos os números necessários.');
      return;
    }
    // Salvar aposta manual (exemplo, ajuste conforme seu banco)
    const newBet = {
      id: Date.now().toString(),
      lotteryId,
      contest: contestText,
      numbers: selectedNumbers,
      createdAt: new Date().toISOString(),
    };
    // Aqui você deve salvar no banco real
    // await saveBet(newBet);
    setAdding(false);
    setSelectedNumbers([]);
    setContestText('');
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
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 28 }}>📝</Text>
            <Text style={[styles.title, { fontSize: 28, marginBottom: 0 }]}>Meus Jogos</Text>
          </RNView>
          <RNView style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 8 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAdding(true)}
              style={({ pressed }) => [{
                minHeight: 48,
                paddingHorizontal: 28,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: '#20d361',
                backgroundColor: '#20d36122',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 4,
                opacity: pressed ? 0.7 : 1,
                shadowColor: '#20d361',
                shadowOpacity: 0.18,
                shadowRadius: 4,
                elevation: 2,
              }]}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#20d361' }}>Adicionar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={confirmClearAll}
              style={({ pressed }) => [{
                minHeight: 48,
                paddingHorizontal: 28,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: '#ef4444',
                backgroundColor: '#ef444422',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 4,
                opacity: bets.length === 0 ? 0.4 : (pressed ? 0.7 : 1),
                shadowColor: '#ef4444',
                shadowOpacity: 0.18,
                shadowRadius: 4,
                elevation: 2,
              }]}
              disabled={bets.length === 0}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ef4444' }}>Limpar</Text>
            </Pressable>
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
          ? groups.map((g, idx) => {
              const lot = getLotteryConfig(g.key.lotteryId);
              const contestLabel = g.key.contest ? `Concurso ${g.key.contest}` : 'Concurso não informado';

              return (
                <RNView key={`${g.key.lotteryId}-${g.key.contest ?? 'x'}`} style={{ marginBottom: 22 }}>
                  {/* Título do grupo com cor da loteria e destaque */}
                  <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: 8 }}>
                    <RNView style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: lot.hexColor, marginRight: 4 }} />
                    <Text style={{ fontSize: 19, fontWeight: 'bold', color: lot.hexColor }}>{lot.name}</Text>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#fff', marginLeft: 8 }}>{contestLabel}</Text>
                  </RNView>
                  <GlassCard style={{ gap: 10, marginTop: 2 }}>
                    {g.bets.map((b: any) => (
                      <RNView key={b.id} style={[styles.betRow, { marginBottom: 8 }]}> 
                        <RNView style={styles.betNumbers}>
                          {b.numbers.slice(0, 20).map((n: number) => (
                            <NumberBall
                              key={`${b.id}-${n}`}
                              value={n}
                              size={34}
                              textColor="#0b1220"
                              style={{
                                shadowColor: '#000',
                                shadowOpacity: 0.18,
                                shadowRadius: 3,
                                elevation: 2,
                                marginRight: 2,
                              }}
                            />
                          ))}
                        </RNView>
                        <RNView style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => setShowCheck(b.id)}
                            style={({ pressed }) => [{
                              backgroundColor: '#20d361',
                              borderRadius: 10,
                              paddingHorizontal: 18,
                              paddingVertical: 8,
                              borderWidth: 1,
                              borderColor: '#20d361',
                              opacity: pressed ? 0.7 : 1,
                              shadowColor: '#20d361',
                              shadowOpacity: 0.18,
                              shadowRadius: 4,
                              elevation: 2,
                            }]}
                          >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Conferir</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                              Alert.alert(
                                'Remover jogo',
                                'Tem certeza que deseja remover este jogo do histórico?',
                                [
                                  { text: 'Cancelar', style: 'cancel' },
                                  {
                                    text: 'Remover',
                                    style: 'destructive',
                                    onPress: () => confirmDelete(b.id),
                                  },
                                ]
                              );
                            }}
                            style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.75 : 1 }]}
                          >
                            <Text style={styles.deleteButtonText}>Remover</Text>
                          </Pressable>
                        </RNView>
                      </RNView>
                    ))}
                  </GlassCard>
                  {/* Separador visual entre grupos */}
                  {idx < groups.length - 1 && (
                    <RNView style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.10)', marginVertical: 18, borderRadius: 1 }} />
                  )}
                </RNView>
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
                  {getAllLotteryIds().map((id: string) => {
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

                {/* Números já selecionados, em destaque e ordem de seleção */}
                {selectedNumbers.length > 0 && (
                  <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    {selectedNumbers.map((n, idx) => (
                      <RNView key={n} style={{
                        backgroundColor: config.hexColor,
                        borderRadius: 16,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginRight: 4,
                        marginBottom: 4,
                      }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{formatTwoDigits(n)}</Text>
                      </RNView>
                    ))}
                  </RNView>
                )}

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
                          sel
                            ? {
                                backgroundColor: config.hexColor,
                                borderColor: '#fff',
                                borderWidth: 2,
                                shadowColor: config.hexColor,
                                shadowOpacity: 0.5,
                                shadowRadius: 4,
                              }
                            : null,
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
                {/* Fim do grid de números */}

                {/* Botão Desfazer */}
                <Pressable
                  accessibilityRole="button"
                  onPress={undoLastNumber}
                  android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
                  style={({ pressed }) => [{
                    marginTop: 10,
                    alignSelf: 'flex-start',
                    backgroundColor: '#232a38',
                    borderRadius: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.18)',
                    opacity: pressed ? 0.7 : 1,
                  }]}
                  disabled={selectedNumbers.length === 0}
                >
                  <Text style={{ color: selectedNumbers.length === 0 ? '#aaa' : '#fff', fontWeight: 'bold', fontSize: 15 }}>
                    Desfazer último número
                  </Text>
                </Pressable>

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

      {/* Modal de conferir jogos */}
      <Modal visible={!!showCheck} transparent animationType="slide" onRequestClose={() => setShowCheck(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowCheck(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Conferir jogo</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowCheck(false)}
                android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
                style={({ pressed }) => [{ padding: 10, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.modalClose}>X</Text>
              </Pressable>
            </RNView>
            {/* Exibir detalhes do jogo selecionado para conferência */}
            {(() => {
              const [resultadoConcurso, setResultadoConcurso] = React.useState<number[] | null>(null);
              const [loadingResult, setLoadingResult] = React.useState(false);
              React.useEffect(() => {
                if (!showCheck) return;
                const allBets = groups.flatMap(g => g.bets);
                const bet = allBets.find(b => b.id === showCheck);
                if (!bet) return;
                setResultadoConcurso(null);
                setLoadingResult(true);
                fetchOfficialDraw(bet.lotteryId, bet.contest).then((res) => {
                  setResultadoConcurso(res);
                  setLoadingResult(false);
                }).catch(() => {
                  setResultadoConcurso(null);
                  setLoadingResult(false);
                });
              }, [showCheck]);

              if (!showCheck) return null;
              const allBets = groups.flatMap(g => g.bets);
              const bet = allBets.find(b => b.id === showCheck);
              if (!bet) return <Text style={styles.note}>Jogo não encontrado.</Text>;
              const lot = getLotteryConfig(bet.lotteryId);

              return (
                <RNView style={{ gap: 10 }}>
                  <Text style={{ color: lot.hexColor, fontWeight: 'bold', fontSize: 18 }}>{lot.name}</Text>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Concurso {bet.contest}</Text>
                  <Text style={styles.noteStrong}>Seu jogo:</Text>
                  <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {bet.numbers.map((n: number) => (
                      <NumberBall key={n} value={n} size={32} textColor="#0b1220" />
                    ))}
                  </RNView>
                  <Text style={styles.noteStrong}>Resultado do concurso:</Text>
                  {loadingResult && <Text style={styles.note}>Buscando resultado oficial…</Text>}
                  {!loadingResult && resultadoConcurso && (
                    <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {resultadoConcurso.map((n) => (
                        <NumberBall key={n} value={n} size={32} textColor="#0b1220" style={{ backgroundColor: '#2563eb', borderColor: '#fff', borderWidth: 2 }} />
                      ))}
                    </RNView>
                  )}
                  {!loadingResult && resultadoConcurso && (
                    <Text style={styles.noteStrong}>
                      Você possivelmente acertou{' '}
                      <Text style={{ color: '#22c55e', fontWeight: 'bold' }}>
                        {bet.numbers.filter((n: number) => resultadoConcurso.includes(n)).length}
                      </Text>{' '}
                      número{bet.numbers.filter((n: number) => resultadoConcurso.includes(n)).length === 1 ? '' : 's'}.
                    </Text>
                  )}
                  {!loadingResult && resultadoConcurso === null && (
                    <Text style={styles.note}>Não foi possível obter o resultado oficial desse concurso.</Text>
                  )}
                  <Text style={styles.note}>
                    <Text style={{ fontWeight: 'bold' }}>Aviso:</Text> Conferência baseada em dados públicos da Caixa. Para resultados oficiais e prêmios, consulte uma lotérica Caixa ou o site oficial. Não nos responsabilizamos por eventuais divergências ou premiações.
                  </Text>
                </RNView>
              );
            })()}
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
  headerCheckButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(32,211,97,0.45)',
    backgroundColor: 'rgba(32,211,97,0.18)',
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
