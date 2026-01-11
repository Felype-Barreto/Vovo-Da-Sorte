import { useLottery } from '@/src/context/LotteryContext';
import { getMegaSenaHistory } from '@/src/megasena/history';
import type { InvestmentSimulation, MonthBreakdown } from '@/src/megasena/investment-simulator';
import { simulateInvestment } from '@/src/megasena/investment-simulator';
import { listLotteryDraws } from '@/src/megasena/lottery-sqlite';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native';

export default function InvestmentScreen() {
  const { selectedLottery } = useLottery();
  const config = getLotteryConfig(selectedLottery);

  const [simulation, setSimulation] = useState<InvestmentSimulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<'hot' | 'cold' | 'balanced' | 'random'>('balanced');
  const [dailyCost, setDailyCost] = useState(5);

  const loadSimulation = async () => {
    try {
      setLoading(true);

      // Carregar histórico (últimos 2 anos ~= 750 sorteios)
      let draws: any[] = [];
      if (selectedLottery === 'megasena') {
        draws = await getMegaSenaHistory({ lastN: 750 });
      } else {
        draws = await listLotteryDraws(selectedLottery, { limit: 750 });
      }

      if (draws.length > 0) {
        const result = await simulateInvestment(draws, selectedLottery, dailyCost, strategy);
        setSimulation(result);
      }
    } catch (error) {
      console.error('Erro ao simular:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSimulation();
    }, [selectedLottery, strategy, dailyCost]),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value ?? 0).toFixed(2)}%`;
  };

  const StrategyButton = ({ label, value }: { label: string; value: typeof strategy }) => (
    <Pressable
      onPress={() => setStrategy(value)}
      className={`flex-1 rounded-lg py-2 ${
        strategy === value ? '' : 'border border-slate-300 dark:border-slate-600'
      }`}
      style={{
        backgroundColor: strategy === value ? config.hexColor : 'transparent',
      }}
    >
      <Text
        className={`text-center font-bold ${
          strategy === value ? 'text-white' : 'text-slate-700 dark:text-white'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );

  if (!simulation && loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" color={config.hexColor} />
        <Text className="mt-4 text-slate-600 dark:text-slate-400">Simulando 2 anos...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900" showsVerticalScrollIndicator={false}>
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">
          Simulador de Investimento
        </Text>
        <Text className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {config.name} • Últimos 2 anos
        </Text>

        {/* Seleção de estratégia */}
        <View className="mt-4 gap-2">
          <Text className="text-sm font-bold text-slate-700 dark:text-white">Estratégia</Text>
          <View className="flex-row gap-2">
            <StrategyButton label="Quentes" value="hot" />
            <StrategyButton label="Frios" value="cold" />
            <StrategyButton label="Balanceado" value="balanced" />
            <StrategyButton label="Aleatório" value="random" />
          </View>
        </View>

        {/* Custo diário */}
        <View className="mt-4">
          <Text className="text-sm font-bold text-slate-700 dark:text-white">
            Custo Diário: {formatCurrency(dailyCost)}
          </Text>
          <View className="mt-2 flex-row gap-1">
            {[2, 5, 10, 20].map((cost) => (
              <Pressable
                key={cost}
                onPress={() => setDailyCost(cost)}
                className={`flex-1 rounded-lg py-2 ${
                  dailyCost === cost ? '' : 'border border-slate-300 dark:border-slate-600'
                }`}
                style={{
                  backgroundColor: dailyCost === cost ? config.hexColor : 'transparent',
                }}
              >
                <Text
                  className={`text-center font-bold ${
                    dailyCost === cost ? 'text-white' : 'text-slate-700 dark:text-white'
                  }`}
                >
                  {formatCurrency(cost)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {simulation && (
          <>
            {/* KPIs Principais */}
            <View className="mt-6 gap-3">
              <View
                className="rounded-lg p-4"
                style={{ backgroundColor: `${config.hexColor}15`, borderColor: config.hexColor, borderWidth: 2 }}
              >
                <Text className="text-xs text-slate-600 dark:text-slate-400">INVESTIMENTO TOTAL</Text>
                <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(simulation.totalInvested)}
                </Text>
                <Text className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {simulation.totalDraws} sorteios • {simulation.strategy}
                </Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <Text className="text-xs text-emerald-700 dark:text-emerald-300">GANHOS</Text>
                  <Text className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(simulation.totalWon)}
                  </Text>
                </View>

                <View
                  className={`flex-1 rounded-lg border-2 p-3 ${
                    simulation.netProfit >= 0
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      simulation.netProfit >= 0
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    RESULTADO LÍQUIDO
                  </Text>
                  <Text
                    className={`text-lg font-bold ${
                      simulation.netProfit >= 0
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {simulation.netProfit >= 0 ? '+' : ''}{formatCurrency(simulation.netProfit)}
                  </Text>
                </View>
              </View>

              <View className="grid grid-cols-2 gap-3">
                <View className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <Text className="text-xs text-slate-600 dark:text-slate-400">ROI</Text>
                  <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatPercentage(simulation.roi)}
                  </Text>
                </View>

                <View className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <Text className="text-xs text-slate-600 dark:text-slate-400">TAXA DE VITÓRIA</Text>
                  <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatPercentage(simulation.hitSummary.winRate)}
                  </Text>
                </View>

                <View className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <Text className="text-xs text-slate-600 dark:text-slate-400">ACERTOS TOTAIS</Text>
                  <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    {simulation.hitSummary.totalHits}
                  </Text>
                </View>

                <View className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <Text className="text-xs text-slate-600 dark:text-slate-400">SORTEIOS VENCEDORES</Text>
                  <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    {simulation.hitSummary.winningDraws}
                  </Text>
                </View>
              </View>
            </View>

            {/* Hits por categoria */}
            {Object.keys(simulation.hitSummary.byCategory).length > 0 && (
              <View className="mt-6">
                <Text className="text-sm font-bold text-slate-700 dark:text-white">
                  Acertos por Categoria
                </Text>
                <View className="mt-2 gap-1">
                  {Object.entries(simulation.hitSummary.byCategory).map(([category, count]) => (
                    <View key={category} className="flex-row items-center justify-between rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                      <Text className="font-semibold text-slate-700 dark:text-white">{category}</Text>
                      <Text className="font-bold text-slate-900 dark:text-white">{count}x</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Breakdown mensal */}
            <View className="mt-6 mb-8">
              <Text className="text-sm font-bold text-slate-700 dark:text-white">
                Desempenho Mensal
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                <View className="gap-2">
                  {simulation.monthlyBreakdown.map((month: MonthBreakdown, idx: number) => (
                    <View
                      key={idx}
                      className="w-32 rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
                    >
                      <Text className="font-bold text-slate-900 dark:text-white">
                        {new Date(month.month + '-01').toLocaleDateString('pt-BR', {
                          month: 'short',
                          year: '2-digit',
                        })}
                      </Text>
                      <Text className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Apostas: {month.draws}
                      </Text>
                      <Text className="text-xs text-slate-600 dark:text-slate-400">
                        Custo: {formatCurrency(month.invested)}
                      </Text>
                      <Text className="text-xs text-slate-600 dark:text-slate-400">
                        Ganhos: {formatCurrency(month.won)}
                      </Text>
                      <Text
                        className={`mt-1 text-sm font-bold ${
                          month.profit >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
