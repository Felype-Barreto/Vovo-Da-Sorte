import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface EducationTip {
  id: string;
  title: string;
  category: 'statistics' | 'visualization' | 'data_cleaning' | 'interpretation';
  content: string;
  tip: string;
}

const EDUCATION_TIPS: EducationTip[] = [
  {
    id: 'avg_vs_median',
    title: 'Média vs Mediana',
    category: 'statistics',
    content:
      'A média é a soma de todos os valores dividida pela quantidade. A mediana é o valor do meio quando os dados estão ordenados. Use mediana quando há valores extremos (outliers) que podem distorcer a média.',
    tip: 'Dica: Se a média e a mediana são muito diferentes, seus dados provavelmente têm outliers significativos.',
  },
  {
    id: 'desvio_padrao',
    title: 'Desvio Padrão (σ)',
    category: 'statistics',
    content:
      'Mede o quão dispersos os dados estão em relação à média. Um desvio padrão pequeno significa que os valores estão próximos da média. Um grande significa que estão espalhados.',
    tip: 'Dica: Aproximadamente 68% dos dados estão dentro de ±1 desvio padrão da média (regra 68-95-99.7).',
  },
  {
    id: 'line_chart',
    title: 'Gráficos de Linha',
    category: 'visualization',
    content:
      'Ideais para mostrar tendências ao longo do tempo. Cada ponto representa um valor e a linha conecta os pontos em sequência temporal. Use quando você quer ver padrões de crescimento ou declínio.',
    tip: 'Dica: Gráficos de linha são perfeitos para dados de série temporal (ex: sorteios ao longo dos meses).',
  },
  {
    id: 'bar_chart',
    title: 'Gráficos de Barras',
    category: 'visualization',
    content:
      'Excelentes para comparar quantidades entre categorias. Cada barra representa uma categoria e a altura representa o valor. Use para comparar frequências ou contagens.',
    tip: 'Dica: Ordene as barras por altura (decrescente) para identificar rapidamente os maiores valores.',
  },
  {
    id: 'frequency',
    title: 'Análise de Frequência',
    category: 'interpretation',
    content:
      'Mostra com que frequência cada valor aparece no conjunto de dados. Útil para identificar padrões e números que aparecem mais ou menos vezes.',
    tip: 'Dica: Em loterias, números com frequência muito alta ou muito baixa podem indicar padrões ou anomalias.',
  },
  {
    id: 'outliers',
    title: 'Identificando Outliers',
    category: 'data_cleaning',
    content:
      'Outliers são valores muito diferentes dos outros. Podem indicar erros ou eventos especiais. Uma forma comum é considerar outliers valores além de ±3 desvios padrão da média.',
    tip: 'Dica: Sempre investigue outliers antes de removê-los. Eles podem ser informações valiosas!',
  },
  {
    id: 'correlation',
    title: 'Correlação entre Variáveis',
    category: 'interpretation',
    content:
      'Correlação mede como duas variáveis se movem juntas. Correlação 1 = perfeita positiva, -1 = perfeita negativa, 0 = nenhuma relação. Importante: correlação ≠ causação!',
    tip: 'Dica: Só porque duas coisas estão correlacionadas não significa que uma causa a outra.',
  },
  {
    id: 'sample_size',
    title: 'Tamanho da Amostra',
    category: 'data_cleaning',
    content:
      'Quanto maior a amostra, mais confiáveis são as conclusões. Amostras pequenas podem levar a conclusões incorretas. Sempre considere se você tem dados suficientes.',
    tip: 'Dica: Com menos de 30 pontos de dados, seja cauteloso com suas conclusões.',
  },
  {
    id: 'bias',
    title: 'Viés nos Dados',
    category: 'data_cleaning',
    content:
      'Viés ocorre quando os dados não são representativos. Exemplo: se você só coleta dados em um dia da semana, seus dados podem ser enviesados. Sempre questione como os dados foram coletados.',
    tip: 'Dica: Procure por padrões temporais - dados coletados em diferentes períodos podem ter características diferentes.',
  },
];

/**
 * Seção de Educação em Análise de Dados
 * Fornece dicas e tutoriais sobre interpretação de dados
 */
export const EducationSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTips = selectedCategory
    ? EDUCATION_TIPS.filter((t) => t.category === selectedCategory)
    : EDUCATION_TIPS;

  const categories = [
    { id: 'statistics', label: 'Estatística' },
    { id: 'visualization', label: 'Visualização' },
    { id: 'interpretation', label: 'Interpretação' },
    { id: 'data_cleaning', label: 'Limpeza de Dados' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BookOpen color="#20d361" size={24} />
        <Text style={styles.title}>Dicas de Especialista</Text>
      </View>

      <Text style={styles.subtitle}>
        Aprenda técnicas para extrair o máximo de seus dados
      </Text>

      {/* Filtro de Categorias */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() =>
              setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
            }
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === cat.id && styles.categoryButtonTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Lista de Dicas */}
      <View style={styles.tipsContainer}>
        {filteredTips.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <Pressable
              onPress={() =>
                setExpandedId(expandedId === tip.id ? null : tip.id)
              }
              style={styles.tipHeader}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipCategory}>
                  {categories.find((c) => c.id === tip.category)?.label}
                </Text>
              </View>
              {expandedId === tip.id ? (
                <ChevronUp color="#20d361" size={24} />
              ) : (
                <ChevronDown color="#9ca3af" size={24} />
              )}
            </Pressable>

            {expandedId === tip.id && (
              <View style={styles.tipContent}>
                <Text style={styles.tipText}>{tip.content}</Text>
                <View style={styles.tipBox}>
                  <Text style={styles.tipHighlight}>{tip.tip}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Rodapé com dica geral */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          <Text style={styles.footerBold}>Dica Ouro:</Text> A melhor forma
          de aprender análise de dados é praticar. Experimente diferentes
          visualizações e filtros com seus dados para desenvolver intuição.
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
  categoriesScroll: {
    marginVertical: 8,
  },
  categoryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#20d361',
    borderColor: '#20d361',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  tipsContainer: {
    gap: 8,
  },
  tipCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  tipCategory: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  tipContent: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  tipBox: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#20d361',
    padding: 12,
    borderRadius: 4,
  },
  tipHighlight: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  footerText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  footerBold: {
    fontWeight: '700',
  },
});
