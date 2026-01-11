import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertCircle, Bell, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MegaSenaDraw } from '@/src/megasena/types';

interface Anomaly {
  id: string;
  timestamp: number;
  type: 'high_frequency' | 'unusual_sum' | 'gap_pattern' | 'repeated_sequence';
  severity: 'low' | 'medium' | 'high';
  description: string;
  value: number;
  expectedRange: [number, number];
  drawInfo: string;
}

interface AnomalyDetectorProps {
  draws: MegaSenaDraw[];
  onAnomalyDetected?: (anomaly: Anomaly) => void;
}

/**
 * Sistema de Detecção de Anomalias
 * Monitora dados de loterias e alerta sobre padrões incomuns
 */
export const AnomalyDetector: React.FC<AnomalyDetectorProps> = ({
  draws,
  onAnomalyDetected,
}) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Detectar anomalias quando os draws mudam
  useEffect(() => {
    if (draws.length === 0) return;

    const detectedAnomalies: Anomaly[] = [];

    // Análise 1: Frequência incomum
    const frequencies: Record<number, number> = {};
    draws.forEach((draw) => {
      draw.numbers.forEach((num) => {
        frequencies[num] = (frequencies[num] || 0) + 1;
      });
    });

    const freqValues = Object.values(frequencies);
    const avgFreq = freqValues.reduce((a, b) => a + b, 0) / freqValues.length;
    const stdDevFreq = Math.sqrt(
      freqValues.reduce((sq, n) => sq + Math.pow(n - avgFreq, 2), 0) / freqValues.length
    );

    // Números com frequência > 3 desvios padrão
    Object.entries(frequencies).forEach(([numStr, freq]) => {
      if (freq > avgFreq + 3 * stdDevFreq) {
        detectedAnomalies.push({
          id: `high_freq_${numStr}_${Date.now()}`,
          timestamp: Date.now(),
          type: 'high_frequency',
          severity: 'high',
          description: `Número ${numStr} apareceu ${freq} vezes (altamente anômalo)`,
          value: freq,
          expectedRange: [
            Math.max(0, avgFreq - 2 * stdDevFreq),
            avgFreq + 2 * stdDevFreq,
          ],
          drawInfo: `Frequência normal: ${avgFreq.toFixed(1)} ± ${stdDevFreq.toFixed(1)}`,
        });
      }
    });

    // Análise 2: Soma incomum
    const sums = draws.map((d) => d.numbers.reduce((a, b) => a + b, 0));
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
    const stdDevSum = Math.sqrt(
      sums.reduce((sq, s) => sq + Math.pow(s - avgSum, 2), 0) / sums.length
    );

    if (sums.length > 0) {
      const lastSum = sums[0]!;
      if (lastSum > avgSum + 2 * stdDevSum || lastSum < avgSum - 2 * stdDevSum) {
        detectedAnomalies.push({
          id: `unusual_sum_${Date.now()}`,
          timestamp: Date.now(),
          type: 'unusual_sum',
          severity: 'medium',
          description: `Soma do sorteio (${lastSum}) está fora do normal`,
          value: lastSum,
          expectedRange: [
            avgSum - 2 * stdDevSum,
            avgSum + 2 * stdDevSum,
          ],
          drawInfo: `${draws[0]?.dateISO || 'Sorteio recente'}`,
        });
      }
    }

    // Análise 3: Padrão de intervalo entre números
    if (draws.length > 0) {
      const lastDraw = draws[0]!;
      const nums = [...lastDraw.numbers].sort((a, b) => a - b);
      const gaps: number[] = [];

      for (let i = 1; i < nums.length; i++) {
        gaps.push(nums[i]! - nums[i - 1]!);
      }

      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const hasWideGap = gaps.some((g) => g > avgGap * 3);
      const hasNoGap = gaps.some((g) => g === 1);

      if (hasWideGap) {
        detectedAnomalies.push({
          id: `gap_pattern_${Date.now()}`,
          timestamp: Date.now(),
          type: 'gap_pattern',
          severity: 'low',
          description: `Intervalo incomum entre números (${Math.max(...gaps)} espaços)`,
          value: Math.max(...gaps),
          expectedRange: [Math.min(...gaps), avgGap],
          drawInfo: `Números: ${formatNumbers(lastDraw.numbers)}`,
        });
      }
    }

    // Análise 4: Sequências repetidas
    if (draws.length > 1) {
      const lastDraw = draws[0]!;
      const prevDraw = draws[1]!;
      const repeated = lastDraw.numbers.filter((n) =>
        prevDraw.numbers.includes(n)
      );

      if (repeated.length >= 4) {
        detectedAnomalies.push({
          id: `repeated_seq_${Date.now()}`,
          timestamp: Date.now(),
          type: 'repeated_sequence',
          severity: 'medium',
          description: `${repeated.length} números se repetiram em sorteios consecutivos`,
          value: repeated.length,
          expectedRange: [0, 2],
          drawInfo: `Números repetidos: ${formatNumbers(repeated)}`,
        });
      }
    }

    // Armazenar apenas anomalias novas
    setAnomalies((prev) => {
      const newAnomalies = detectedAnomalies.filter(
        (a) => !prev.some((p) => p.id === a.id)
      );
      newAnomalies.forEach((a) => {
        onAnomalyDetected?.(a);
        // Persistir anomalias
        saveAnomalies([...prev, ...newAnomalies]);
      });
      return [...prev, ...newAnomalies];
    });
  }, [draws, onAnomalyDetected]);

  const visibleAnomalies = anomalies.filter((a) => !dismissedIds.has(a.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
      default:
        return '#3b82f6';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#fef2f2';
      case 'medium':
        return '#fffbeb';
      case 'low':
      default:
        return '#eff6ff';
    }
  };

  if (visibleAnomalies.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell color="#20d361" size={20} />
        <Text style={styles.headerText}>
          {visibleAnomalies.length} Anomalias Detectadas
        </Text>
      </View>

      {visibleAnomalies.map((anomaly) => (
        <View
          key={anomaly.id}
          style={[
            styles.anomalyCard,
            { backgroundColor: getSeverityBgColor(anomaly.severity) },
          ]}
        >
          <View style={styles.anomalyContent}>
            <View style={styles.anomalyTitle}>
              <AlertCircle
                color={getSeverityColor(anomaly.severity)}
                size={20}
              />
              <Text
                style={[
                  styles.anomalyHeading,
                  { color: getSeverityColor(anomaly.severity) },
                ]}
              >
                {anomaly.type === 'high_frequency'
                  ? 'Frequência Alta'
                  : anomaly.type === 'unusual_sum'
                    ? 'Soma Incomum'
                    : anomaly.type === 'gap_pattern'
                      ? 'Padrão de Intervalo'
                      : 'Sequência Repetida'}
              </Text>
            </View>

            <Text style={styles.anomalyDescription}>
              {anomaly.description}
            </Text>

            <View style={styles.anomalyDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Valor Observado:</Text>
                <Text style={styles.detailValue}>{anomaly.value.toFixed(1)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Intervalo Normal:</Text>
                <Text style={styles.detailValue}>
                  {anomaly.expectedRange[0].toFixed(1)} -{' '}
                  {anomaly.expectedRange[1].toFixed(1)}
                </Text>
              </View>
            </View>

            <Text style={styles.anomalyInfo}>{anomaly.drawInfo}</Text>
          </View>

          <Pressable
            onPress={() => handleDismiss(anomaly.id)}
            style={styles.dismissButton}
          >
            <X color="#6b7280" size={20} />
          </Pressable>
        </View>
      ))}
    </View>
  );
};

// Helper functions
function formatNumbers(nums: number[]): string {
  return nums.sort((a, b) => a - b).map((n) => String(n).padStart(2, '0')).join(', ');
}

async function saveAnomalies(anomalies: Anomaly[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      'detected_anomalies',
      JSON.stringify(anomalies.slice(-50)) // Manter últimas 50
    );
  } catch (err) {
    console.error('Erro ao salvar anomalias:', err);
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  anomalyCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  anomalyContent: {
    flex: 1,
    gap: 8,
  },
  anomalyTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anomalyHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  anomalyDescription: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  anomalyDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  anomalyInfo: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  dismissButton: {
    padding: 8,
    marginLeft: 8,
  },
});
