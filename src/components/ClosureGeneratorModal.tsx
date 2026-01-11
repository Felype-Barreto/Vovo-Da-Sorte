import { useLottery } from '@/src/context/LotteryContext';
import { saveBet } from '@/src/megasena/bets-db';
import { analyzeClosureCostBenefit, generateGenericFechamento } from '@/src/megasena/closures';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type ClosureResult = {
  combinations: number[][];
  estimatedCost: number;
  totalGames: number;
  targetHits: number;
  description: string;
};

function formatTwoDigits(n: number) {
  return String(n).padStart(2, '0');
}

export default function ClosureGeneratorModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { selectedLottery } = useLottery();
  const config = getLotteryConfig(selectedLottery);

  const numberList = useMemo(() => {
    return selectedLottery === 'lotomania'
      ? Array.from({ length: 100 }, (_, i) => i)
      : Array.from({ length: config.totalNumbers }, (_, i) => i + 1);
  }, [selectedLottery, config.totalNumbers]);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [targetHits, setTargetHits] = useState('4');
  const [costPerGame, setCostPerGame] = useState('5.00');
  const [estimatedPrize, setEstimatedPrize] = useState('');
  const [closure, setClosure] = useState<ClosureResult | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showCombinations, setShowCombinations] = useState(false);

  const resetForm = () => {
    setSelectedNumbers([]);
    setTargetHits('4');
    setCostPerGame('5.00');
    setEstimatedPrize('');
    setClosure(null);
    setAnalysis(null);
    setSavedSuccess(false);
    setLoading(false);
    setShowCombinations(false);
  };

  useEffect(() => {
    if (visible) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, selectedLottery]);

  const toggleNumber = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );
  };

  const handleGenerateClosure = async () => {
    if (selectedNumbers.length < Math.max(10, config.numbersPerDraw + 2)) {
      Alert.alert(
        'Números Insuficientes',
        `Selecione pelo menos ${Math.max(10, config.numbersPerDraw + 2)} números`,
      );
      return;
    }

    try {
      setLoading(true);
      const guaranteed = parseInt(targetHits, 10) || 4;
      const result = await generateGenericFechamento(
        selectedLottery,
        selectedNumbers,
        guaranteed,
      );

      if (result) {
        const totalGames = Number((result as any)?.totalGames ?? 0) || 0;
        if (totalGames > 5000) {
          Alert.alert(
            'Fechamento muito grande',
            'Esse fechamento geraria muitas combinações e pode travar o celular. Tente reduzir o objetivo ou selecionar menos números.',
          );
          setClosure(null);
          setAnalysis(null);
          return;
        }

        setClosure(result as any);
        setShowCombinations(false);

        // Dá chance da UI renderizar antes de tarefas pesadas.
        await new Promise((r) => setTimeout(r, 0));

        // Analisar custo-benefício (pode ser pesado se tiver muitas combinações)
        if (totalGames <= 2000) {
          const costAnalysis = await analyzeClosureCostBenefit(result);
          setAnalysis(costAnalysis);
        } else {
          setAnalysis(null);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível gerar o fechamento');
      }
    } catch (error) {
      Alert.alert('Erro', `${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBet = async () => {
    if (!closure) return;

    try {
      setLoading(true);

      const cost = parseFloat(costPerGame) || 5.0;
      const totalCost = closure.totalGames * cost;

      // Salvar APENAS um resumo (evita travar salvando milhares de combinações).
      const closureId = `closure_${Date.now()}`;
      await saveBet({
        lotteryId: selectedLottery,
        numbers: selectedNumbers.slice().sort((a, b) => a - b),
        contest: undefined,
        createdAt: Date.now(),
        costPerGame: cost,
        totalCost,
        notes: `Fechamento: ${closure.targetHits} acertos • Jogos: ${closure.totalGames}`,
        isPlayed: false,
        closureId,
      });

      setSavedSuccess(true);
      Alert.alert(
        'Sucesso!',
        'Salvo no Histórico.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as apostas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const requiredMin = Math.max(10, config.numbersPerDraw + 2);
  const guaranteedHits = Math.max(0, parseInt(targetHits, 10) || 4);
  const cost = parseFloat(costPerGame) || 0;
  const totalCost = closure ? closure.totalGames * cost : 0;
  const prize = parseFloat(String(estimatedPrize).replace(',', '.')) || 0;
  const profitIfWin = closure && prize ? prize - totalCost : 0;

  const minNumber = selectedLottery === 'lotomania' ? 0 : 1;
  const maxNumber = selectedLottery === 'lotomania' ? 99 : config.totalNumbers;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Pressable style={styles.sheet} onPress={() => {}} accessibilityRole="none">
          <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Análise (Fechamento)</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [styles.iconButton, pressed ? { opacity: 0.75 } : null]}
                android_ripple={{ color: 'rgba(255,255,255,0.12)', radius: 22 }}
                accessibilityRole="button"
              >
                <FontAwesome name="close" size={22} color={config.hexColor} />
              </Pressable>
            </View>

            <View style={styles.body}>
            {!closure ? (
              <>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>1) Selecione números</Text>
                  <Text style={styles.smallText}>
                    Escolha um conjunto de números de {formatTwoDigits(minNumber)} a {formatTwoDigits(maxNumber)}.
                    O fechamento cria várias apostas para aumentar cobertura.
                  </Text>

                  <Text style={styles.smallTextStrong}>
                    Selecionados: {selectedNumbers.length}/{requiredMin}
                  </Text>

                  <FlatList
                    data={numberList}
                    keyExtractor={(n) => String(n)}
                    numColumns={6}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.gridRow}
                    contentContainerStyle={styles.grid}
                    renderItem={({ item: num }) => {
                      const selected = selectedNumbers.includes(num);
                      return (
                        <Pressable
                          onPress={() => toggleNumber(num)}
                          accessibilityRole="button"
                          android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
                          style={({ pressed }) => [
                            styles.numberCell,
                            selected
                              ? { backgroundColor: config.hexColor, borderColor: 'transparent' }
                              : { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.18)' },
                            pressed ? { opacity: 0.85 } : null,
                          ]}
                        >
                          <Text style={styles.numberCellText}>{formatTwoDigits(num)}</Text>
                        </Pressable>
                      );
                    }}
                  />

                  {selectedNumbers.length ? (
                    <Text style={styles.tinyMuted} numberOfLines={3}>
                      {selectedNumbers
                        .slice()
                        .sort((a, b) => a - b)
                        .map((n) => formatTwoDigits(n))
                        .join(', ')}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>2) Objetivo (acertos garantidos)</Text>
                  <Text style={styles.smallText}>
                    Se o sorteio estiver dentro dos seus números selecionados, o fechamento tenta garantir pelo menos este número de acertos.
                    Quanto maior o objetivo, mais combinações (e maior custo).
                  </Text>

                  <View style={styles.pillRow}>
                    {[3, 4, 5, 6].map((n) => {
                      const selected = targetHits === String(n);
                      return (
                        <Pressable
                          key={n}
                          accessibilityRole="button"
                          onPress={() => setTargetHits(String(n))}
                          android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
                          style={({ pressed }) => [
                            styles.pill,
                            selected
                              ? { backgroundColor: config.hexColor, borderColor: 'transparent' }
                              : { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.18)' },
                            pressed ? { opacity: 0.85 } : null,
                          ]}
                        >
                          <Text style={styles.pillText}>{n}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>3) Custo por jogo</Text>
                  <TextInput
                    value={costPerGame}
                    onChangeText={setCostPerGame}
                    placeholder="Ex: 5.00"
                    placeholderTextColor="rgba(255,255,255,0.55)"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                  <Text style={styles.tinyMuted}>Dica: use o valor oficial desta loteria para o custo ficar próximo do real.</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>4) Prêmio estimado (opcional)</Text>
                  <TextInput
                    value={estimatedPrize}
                    onChangeText={setEstimatedPrize}
                    placeholder="Ex: 1000000"
                    placeholderTextColor="rgba(255,255,255,0.55)"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                  <Text style={styles.tinyMuted}>
                    Serve só para mostrar um “lucro se ganhar” (estimado). O app não consegue prever ganho real.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleGenerateClosure}
                  disabled={selectedNumbers.length < requiredMin || loading}
                  android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { backgroundColor: config.hexColor },
                    pressed ? { opacity: 0.9 } : null,
                    selectedNumbers.length < requiredMin || loading ? { opacity: 0.55 } : null,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Gerar análise</Text>
                  )}
                </Pressable>

                {selectedNumbers.length < requiredMin ? (
                  <Text style={styles.tinyMuted}>
                    Para habilitar: selecione mais {requiredMin - selectedNumbers.length} números.
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Resultado</Text>
                  <Text style={styles.smallText}>{closure.description}</Text>
                  <Text style={styles.smallTextStrong}>
                    Objetivo: garantir {closure.targetHits} acertos quando o sorteio estiver dentro dos seus números selecionados.
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Combinações</Text>
                    <Text style={styles.statValue}>{closure.totalGames}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Custo total (estimado)</Text>
                    <Text style={styles.statValue}>{formatCurrency(totalCost || closure.estimatedCost)}</Text>
                  </View>
                </View>

                {prize ? (
                  <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Ganho (estimado)</Text>
                    <Text style={styles.smallText}>
                      Prêmio informado: {formatCurrency(prize)}
                    </Text>
                    <Text style={styles.smallTextStrong}>
                      Lucro se ganhar: {formatCurrency(profitIfWin)}
                    </Text>
                    <Text style={styles.tinyMuted}>
                      Isso não é chance/garantia — é só uma conta simples: prêmio − custo.
                    </Text>
                  </View>
                ) : null}

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Entenda</Text>
                  <Text style={styles.smallText}>
                    - Você escolheu {selectedNumbers.length} números.
                  </Text>
                  <Text style={styles.smallText}>
                    - O fechamento gera {closure.totalGames} apostas.
                  </Text>
                  <Text style={styles.smallText}>
                    - Objetivo atual: {guaranteedHits} acertos.
                  </Text>
                </View>

                {analysis?.recommendation ? (
                  <View style={[styles.card, styles.recommendationCard, { borderLeftColor: config.hexColor }]}>
                    <Text style={styles.sectionTitle}>Recomendação</Text>
                    <Text style={styles.smallText}>{String(analysis.recommendation)}</Text>
                  </View>
                ) : null}

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Combinações</Text>
                  <Text style={styles.tinyMuted}>
                    Para não travar, a lista só aparece se você abrir.
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowCombinations((v) => !v)}
                    android_ripple={{ color: 'rgba(255,255,255,0.10)' }}
                    style={({ pressed }) => [styles.secondaryButton, { flex: 0 }, pressed ? { opacity: 0.85 } : null]}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {showCombinations ? 'Esconder combinações' : 'Ver combinações'}
                    </Text>
                  </Pressable>

                  {showCombinations ? (
                    <View style={styles.comboBox}>
                      <Text style={styles.tinyMuted}>Mostrando 200 de {closure.totalGames}.</Text>
                      <FlatList
                        data={closure.combinations.slice(0, 200)}
                        keyExtractor={(_, idx) => `combo_${idx}`}
                        nestedScrollEnabled
                        renderItem={({ item, index }) => (
                          <Text style={styles.comboLine}>
                            {index + 1}. {item.map((n) => formatTwoDigits(n)).join(' - ')}
                          </Text>
                        )}
                      />
                    </View>
                  ) : null}
                </View>

                <View style={styles.actionsRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setClosure(null);
                      setAnalysis(null);
                    }}
                    android_ripple={{ color: 'rgba(255,255,255,0.10)' }}
                    style={({ pressed }) => [styles.secondaryButton, pressed ? { opacity: 0.85 } : null]}
                  >
                    <Text style={styles.secondaryButtonText}>Voltar</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleSaveBet}
                    disabled={loading}
                    android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { backgroundColor: config.hexColor, flex: 1 },
                      pressed ? { opacity: 0.9 } : null,
                      loading ? { opacity: 0.55 } : null,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Salvar em Meus Jogos</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(10, 18, 35, 0.96)',
    overflow: 'hidden',
  },
  sheetContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.78)',
  },
  smallTextStrong: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.86)',
  },
  tinyMuted: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.65)',
  },
  grid: {
    gap: 8,
  },
  gridRow: {
    gap: 8,
  },
  numberCell: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCellText: {
    fontWeight: '900',
    color: '#ffffff',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
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
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.70)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  recommendationCard: {
    borderLeftWidth: 4,
  },
  comboBox: {
    maxHeight: 240,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.18)',
    padding: 10,
  },
  comboLine: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.78)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});
