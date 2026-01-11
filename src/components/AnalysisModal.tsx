import { NumberBall } from '@/src/components/NumberBall';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import type { LotteryDraw, LotteryType } from '@/src/megasena/types';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface AnalysisModalProps {
  visible: boolean;
  lotteryType: LotteryType;
  draws: LotteryDraw[];
  onClose: () => void;
  onGenerateWithBase: () => void;
  loading?: boolean;
  progressText?: string;
  latestResult?: {
    contest: number;
    dateISO: string;
    numbers: number[];
  };
}

interface FrequencyData {
  number: number;
  frequency: number;
  percentage: number;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  visible,
  lotteryType,
  draws,
  onClose,
  onGenerateWithBase,
  loading,
  progressText,
  latestResult,
}) => {
  const config = getLotteryConfig(lotteryType);
  const minNumber = lotteryType === 'lotomania' ? 0 : 1;
  const maxNumber = lotteryType === 'lotomania' ? 99 : config.totalNumbers;

  const analysisDrawCount = Math.min(1000, draws.length);

  // Calcular frequências dos números
  const frequencyDataTop10 = useMemo(() => {
    const freq: Record<number, number> = {};

    draws.slice(0, analysisDrawCount).forEach((draw) => {
      draw.numbers.forEach((num) => {
        freq[num] = (freq[num] || 0) + 1;
      });
    });

    return Object.entries(freq)
      .map(([num, count]) => ({
        number: parseInt(num),
        frequency: count,
        // % de concursos em que o número apareceu (não é “chance de ganhar”, é incidência histórica)
        percentage: analysisDrawCount > 0 ? (count / analysisDrawCount) * 100 : 0,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }, [draws, analysisDrawCount]);

  const frequencyDataTop5 = useMemo(() => frequencyDataTop10.slice(0, 5), [frequencyDataTop10]);

  // Últimos 5 sorteios
  const recentDraws = useMemo(() => draws.slice(0, 5), [draws]);

  if (!visible) return null;

  const maxFreq = Math.max(1, ...frequencyDataTop5.map((d) => d.frequency));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Números e Histórico ({config.name})</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Último resultado (Caixa)</Text>
              {latestResult?.numbers?.length ? (
                <>
                  <Text style={styles.drawDate}>
                    Concurso {latestResult.contest} - {new Date(latestResult.dateISO).toLocaleDateString('pt-BR')}
                  </Text>
                  <View style={styles.numbersContainer}>
                    {latestResult.numbers.map((num) => (
                      <NumberBall key={num} value={num} size={46} />
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.noData}>Carregando…</Text>
              )}

              {loading ? (
                <Text style={styles.smallInfo}>{progressText ?? 'Carregando histórico…'}</Text>
              ) : draws.length === 0 ? (
                <Text style={styles.smallInfo}>
                  Se estiver demorando, pode ser a internet. Assim que carregar, vamos mostrar os números mais frequentes.
                </Text>
              ) : null}
            </View>

            {/* Histórico Recente */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Últimos 5 Sorteios</Text>
              {recentDraws.length ? (
                recentDraws.map((draw) => (
                  <View key={draw.contest} style={styles.drawItem}>
                    <Text style={styles.drawDate}>
                      Concurso {draw.contest} - {new Date(draw.dateISO).toLocaleDateString('pt-BR')}
                    </Text>
                    <View style={styles.numbersContainer}>
                      {draw.numbers.map((num) => (
                        <NumberBall key={num} value={num} size={42} />
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>{loading ? 'Carregando…' : 'Ainda não carregou o histórico.'}</Text>
              )}
            </View>

            {/* Gráfico de Tendência */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Números Mais Frequentes (ajuda)</Text>
              {frequencyDataTop10.length > 0 ? (
                <View style={styles.chartContainer}>
                  <Text style={styles.chartLabel}>
                    Base: últimos {analysisDrawCount.toLocaleString('pt-BR')} concursos.
                  </Text>

                  <View style={styles.topNumbersRow}>
                    {frequencyDataTop10.map((d) => (
                      <View key={d.number} style={styles.topNumberItem}>
                        <NumberBall value={d.number} size={54} />
                        <Text style={styles.topNumberCount}>{d.frequency}x</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.chartLabel}>Top 5 (visual simples):</Text>

                  <View style={styles.simpleChart}>
                    {frequencyDataTop5.map((d) => {
                      const pct = maxFreq > 0 ? Math.round((d.frequency / maxFreq) * 100) : 0;
                      return (
                        <View key={d.number} style={styles.barRow}>
                          <Text style={styles.barNumber}>{String(d.number).padStart(2, '0')}</Text>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${pct}%` }]} />
                          </View>
                          <Text style={styles.barValue}>
                            {d.frequency}x ({d.percentage.toFixed(1).replace('.', ',')}%)
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <Text style={styles.chartHint}>
                    “%” significa: em quantos concursos o número apareceu.
                    Isso é só uma ajuda visual (não é garantia de acerto).
                  </Text>
                </View>
              ) : (
                <Text style={styles.noData}>{loading ? 'Carregando…' : 'Dados insuficientes para estatística.'}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Como usar (bem simples)</Text>
              <Text style={styles.smallInfo}>
                • "Mais frequentes" = os que mais apareceram no período carregado.\n
                • Use isso só como referência para montar seu jogo.\n
                • Não existe garantia: loteria é aleatória.
              </Text>
              <Text style={styles.smallInfo}>
                Esta loteria sorteia {config.numbersPerDraw} números de {minNumber} a {maxNumber}.
              </Text>
            </View>
          </ScrollView>

          {/* Botão de Ação */}
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              onGenerateWithBase();
              onClose();
            }}
            disabled={draws.length === 0}
          >
            <LinearGradient
              colors={draws.length === 0 ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.12)'] : ['#20d361', 'rgba(32, 211, 97, 0.78)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Text style={[styles.actionButtonText, draws.length === 0 ? { color: 'rgba(255,255,255,0.80)' } : null]}>
                {draws.length === 0 ? 'Carregando base…' : 'Gerar Jogo com Esta Base'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(10, 18, 35, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.80)',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  drawItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  drawDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 8,
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chartContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(32, 211, 97, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chartLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 12,
  },
  topNumbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
    marginBottom: 12,
  },
  topNumberItem: {
    alignItems: 'center',
  },
  topNumberCount: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.78)',
  },
  simpleChart: {
    gap: 10,
    marginBottom: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barNumber: {
    width: 34,
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#20d361',
  },
  barValue: {
    width: 112,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.80)',
  },
  chartHint: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.65)',
  },
  noData: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.60)',
    fontStyle: 'italic',
  },
  smallInfo: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
  },
  actionButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonGradient: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#001a17',
    fontSize: 16,
    fontWeight: '900',
  },
});
