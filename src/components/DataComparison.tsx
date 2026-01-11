import { BarChart3, TrendingUp } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MegaSenaDraw } from '@/src/megasena/types';

interface ComparisonSet {
  id: string;
  label: string;
  draws: MegaSenaDraw[];
  color: string;
}

interface DataComparisonProps {
  allDraws: MegaSenaDraw[];
}

/**
 * Componente de Comparação de Dados
 * Permite comparar diferentes subconjuntos de dados lado a lado
 */
export const DataComparison: React.FC<DataComparisonProps> = ({ allDraws }) => {
  const [comparisonSets, setComparisonSets] = useState<ComparisonSet[]>([
    {
      id: 'all',
      label: 'Todos (últimos 100)',
      draws: allDraws.slice(0, 100),
      color: '#20d361',
    },
  ]);
  const [selectedFilter, setSelectedFilter] = useState<'time' | 'pattern' | 'custom'>('time');

  // Gerar conjuntos de comparação automaticamente
  const generateTimeComparisons = () => {
    const newSets: ComparisonSet[] = [
      {
        id: 'last_30',
        label: 'Últimos 30 sorteios',
        draws: allDraws.slice(0, 30),
        color: '#20d361',
      },
      {
        id: 'last_60',
        label: 'Últimos 60 sorteios',
        draws: allDraws.slice(0, 60),
        color: '#10b981',
      },
      {
        id: 'last_90',
        label: 'Últimos 90 sorteios',
        draws: allDraws.slice(0, 90),
        color: '#059669',
      },
    ];
    setComparisonSets(newSets);
  };

  const generatePatternComparisons = () => {
    const newSets: ComparisonSet[] = [];

    // Padrão 1: Somas altas vs baixas
    const sums = allDraws.map((d) => d.numbers.reduce((a, b) => a + b, 0));
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;

    newSets.push({
      id: 'high_sum',
      label: 'Somas Altas (acima da média)',
      draws: allDraws.filter((d) => d.numbers.reduce((a, b) => a + b, 0) > avgSum),
      color: '#ef4444',
    });

    newSets.push({
      id: 'low_sum',
      label: 'Somas Baixas (abaixo da média)',
      draws: allDraws.filter((d) => d.numbers.reduce((a, b) => a + b, 0) < avgSum),
      color: '#3b82f6',
    });

    // Padrão 2: Números altos vs baixos
    const highNumbers = allDraws.filter((d) =>
      d.numbers.some((n) => n > 40)
    );
    const lowNumbers = allDraws.filter((d) =>
      d.numbers.every((n) => n <= 40)
    );

    if (highNumbers.length > 0) {
      newSets.push({
        id: 'high_nums',
        label: 'Com números altos (>40)',
        draws: highNumbers,
        color: '#f59e0b',
      });
    }

    if (lowNumbers.length > 0) {
      newSets.push({
        id: 'low_nums',
        label: 'Apenas números baixos (≤40)',
        draws: lowNumbers,
        color: '#8b5cf6',
      });
    }

    setComparisonSets(newSets);
  };

  // Calcular estatísticas para cada set
  const stats = useMemo(() => {
    return comparisonSets.map((set) => {
      if (set.draws.length === 0) {
        return {
          id: set.id,
          count: 0,
          avgSum: 0,
          avgFrequency: 0,
          mostCommon: 0,
          leastCommon: 0,
        };
      }

      const sums = set.draws.map((d) => d.numbers.reduce((a, b) => a + b, 0));
      const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;

      // Frequências
      const frequencies: Record<number, number> = {};
      set.draws.forEach((draw) => {
        draw.numbers.forEach((num) => {
          frequencies[num] = (frequencies[num] || 0) + 1;
        });
      });

      const freqValues = Object.values(frequencies);
      const avgFreq = freqValues.reduce((a, b) => a + b, 0) / freqValues.length;

      const sortedByFreq = Object.entries(frequencies)
        .sort((a, b) => b[1] - a[1]);

      return {
        id: set.id,
        count: set.draws.length,
        avgSum: avgSum.toFixed(1),
        avgFrequency: avgFreq.toFixed(2),
        mostCommon: parseInt(sortedByFreq[0]?.[0] || '0'),
        leastCommon: parseInt(sortedByFreq[sortedByFreq.length - 1]?.[0] || '0'),
      };
    });
  }, [comparisonSets]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BarChart3 color="#20d361" size={24} />
        <Text style={styles.title}>Comparação de Dados</Text>
      </View>

      <Text style={styles.subtitle}>Selecione um tipo de filtro para comparar</Text>

      {/* Botões de Filtro */}
      <View style={styles.filterButtons}>
        <Pressable
          onPress={() => {
            setSelectedFilter('time');
            generateTimeComparisons();
          }}
          style={[
            styles.filterButton,
            selectedFilter === 'time' && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'time' && styles.filterButtonTextActive,
            ]}
          >
            Por Período
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelectedFilter('pattern');
            generatePatternComparisons();
          }}
          style={[
            styles.filterButton,
            selectedFilter === 'pattern' && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'pattern' && styles.filterButtonTextActive,
            ]}
          >
            Por Padrão
          </Text>
        </Pressable>
      </View>

      {/* Tabela de Comparação */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.comparisonTable}>
          {/* Header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableHeader, styles.labelColumn]}>
              Conjunto
            </Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Sorteios</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Soma Média</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Freq Média</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Mais Comum</Text>
          </View>

          {/* Rows */}
          {stats.map((stat, idx) => (
            <View key={stat.id} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
              <View
                style={[
                  styles.tableCell,
                  styles.labelColumn,
                  { borderLeftWidth: 4, borderLeftColor: comparisonSets[idx]?.color },
                ]}
              >
                <Text style={styles.tableLabel}>{comparisonSets[idx]?.label}</Text>
              </View>
              <Text style={[styles.tableCell, styles.tableValue]}>{stat.count}</Text>
              <Text style={[styles.tableCell, styles.tableValue]}>{stat.avgSum}</Text>
              <Text style={[styles.tableCell, styles.tableValue]}>{stat.avgFrequency}</Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableValue,
                  { color: comparisonSets[idx]?.color, fontWeight: '700' },
                ]}
              >
                {String(stat.mostCommon).padStart(2, '0')}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Insights Detectados</Text>

        {stats.length >= 2 && (
          <>
            {/* Comparação de soma */}
            <View style={styles.insight}>
              <TrendingUp color="#20d361" size={16} />
              <View style={{ flex: 1 }}>
                <Text style={styles.insightText}>
                  Diferença de soma:{' '}
                  <Text style={styles.insightValue}>
                    {(parseFloat(String(stats[0]?.avgSum || '0')) - parseFloat(String(stats[1]?.avgSum || '0'))).toFixed(1)}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Comparação de frequência */}
            <View style={styles.insight}>
              <TrendingUp color="#10b981" size={16} />
              <View style={{ flex: 1 }}>
                <Text style={styles.insightText}>
                  Diferença de frequência:{' '}
                  <Text style={styles.insightValue}>
                    {(parseFloat(String(stats[0]?.avgFrequency || '0')) - parseFloat(String(stats[1]?.avgFrequency || '0'))).toFixed(2)}
                  </Text>
                </Text>
              </View>
            </View>
          </>
        )}

        <Text style={styles.insightNote}>
          Use estas comparações para identificar padrões e tendências nos dados.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#20d361',
    borderColor: '#20d361',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  comparisonTable: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    minWidth: 80,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: '700',
    fontSize: 11,
    color: '#6b7280',
  },
  labelColumn: {
    minWidth: 140,
    paddingHorizontal: 12,
  },
  tableLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  tableValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  insightsContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 12,
    gap: 8,
  },
  insightsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#047857',
  },
  insightValue: {
    fontWeight: '700',
    color: '#065f46',
  },
  insightNote: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
