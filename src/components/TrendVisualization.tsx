import React, { useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';

import type { MegaSenaDraw } from '@/src/megasena/types';

interface TrendVisualizationProps {
  draws: MegaSenaDraw[];
  metric: 'frequency' | 'appearance_gap' | 'sum';
  title: string;
  description?: string;
}

/**
 * Componente de Visualização de Tendências
 * Renderiza gráficos interativos mostrando evolução de métricas ao longo do tempo
 */
export const TrendVisualization: React.FC<TrendVisualizationProps> = ({
  draws,
  metric,
  title,
  description,
}) => {
  const windowWidth = Dimensions.get('window').width;

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    if (draws.length === 0) return [];

    switch (metric) {
      case 'sum':
        // Soma das dezenas ao longo do tempo
        return draws.map((draw, idx) => ({
          x: idx,
          y: draw.numbers.reduce((a, b) => a + b, 0),
          date: draw.dateISO,
        }));

      case 'appearance_gap':
        // Espaço entre sorteios de números específicos
        const numberAppearances: Record<number, number[]> = {};
        draws.forEach((draw, idx) => {
          draw.numbers.forEach((num) => {
            if (!numberAppearances[num]) {
              numberAppearances[num] = [];
            }
            numberAppearances[num]!.push(idx);
          });
        });

        // Calcular gaps médios
        return Object.entries(numberAppearances)
          .slice(0, 10) // Top 10 números
          .map(([num, indices]) => {
            const gaps: number[] = [];
            for (let i = 1; i < indices.length; i++) {
              gaps.push(indices[i]! - indices[i - 1]!);
            }
            const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
            return {
              x: parseInt(num),
              y: avgGap,
            };
          });

      case 'frequency':
      default:
        // Frequência de números ao longo do tempo (rolling)
        const windowSize = 20; // Últimos 20 sorteios
        return draws.slice(0, Math.min(50, draws.length)).map((draw, idx) => {
          const window = draws.slice(Math.max(0, idx - windowSize), idx + 1);
          const freq: Record<number, number> = {};
          window.forEach((d) => {
            d.numbers.forEach((num) => {
              freq[num] = (freq[num] || 0) + 1;
            });
          });
          const avgFrequency = Object.values(freq).reduce((a, b) => a + b, 0) / 60; // 60 números totais
          return {
            x: idx,
            y: avgFrequency,
            date: draw.dateISO,
          };
        });
    }
  }, [draws, metric]);

  const minY = Math.min(...chartData.map((d) => d.y));
  const maxY = Math.max(...chartData.map((d) => d.y));
  const avgY = chartData.reduce((a, b) => a + b.y, 0) / chartData.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      <View style={styles.chartContainer}>
        <View style={styles.chartContent}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>{maxY.toFixed(0)}</Text>
            <Text style={styles.yAxisLabel}>{((minY + maxY) / 2).toFixed(0)}</Text>
            <Text style={styles.yAxisLabel}>{minY.toFixed(0)}</Text>
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {chartData.map((dataPoint, idx) => {
              const normalizedHeight =
                ((dataPoint.y - minY) / (maxY - minY)) * 200;
              return (
                <View
                  key={idx}
                  style={styles.barWrapper}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(normalizedHeight, 5),
                      },
                    ]}
                  />
                  {idx % Math.ceil(chartData.length / 5) === 0 && (
                    <Text style={styles.xAxisLabel}>
                      {idx}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mínimo</Text>
          <Text style={styles.statValue}>{minY.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Média</Text>
          <Text style={styles.statValue}>{avgY.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Máximo</Text>
          <Text style={styles.statValue}>{maxY.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400' as const,
  },
  noData: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center' as const,
    paddingVertical: 20,
  },
  chartContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 12,
  },
  chartContent: {
    flexDirection: 'row' as const,
    height: 250,
    flex: 1,
    gap: 8,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between' as const,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right' as const,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: 2,
    paddingBottom: 30,
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: '#20d361',
  },
  xAxisLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500' as const,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#20d361',
    marginTop: 4,
  },
};
