import { useLottery } from '@/src/context/LotteryContext';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import {
    calculateWithholding,
    determineBestRedemptionMethod,
    getPrizeRedemptionGuide,
} from '@/src/megasena/prize-redemption';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type PrizeAmountExample = number;

export default function PrizeRedemptionScreen() {
  const { selectedLottery } = useLottery();
  const config = getLotteryConfig(selectedLottery);
  const guide = getPrizeRedemptionGuide(selectedLottery);

  const [selectedAmount, setSelectedAmount] = useState(5000);

  const exampleAmounts: PrizeAmountExample[] = [1000, 5000, 10000, 50000, 100000];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!guide) {
    return (
      <ScrollView className="flex-1 bg-white dark:bg-slate-900" contentContainerStyle={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-lg font-bold text-slate-900 dark:text-white">
            Informações não disponíveis para esta loteria
          </Text>
        </View>
      </ScrollView>
    );
  }

  const { net: netAmount, tax: taxAmount } = calculateWithholding(selectedAmount);
  const redemption = determineBestRedemptionMethod(selectedAmount, selectedLottery);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900" showsVerticalScrollIndicator={false}>
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">
          Resgate de Prêmios
        </Text>
        <Text className="mt-1 text-sm text-slate-600 dark:text-slate-400">{config.name}</Text>

        {/* Simulador de imposto */}
        <View
          className="mt-6 rounded-lg border-2 p-4"
          style={{ borderColor: config.hexColor, backgroundColor: `${config.hexColor}15` }}
        >
          <Text className="font-bold text-slate-900 dark:text-white">
            Simular Imposto de Renda
          </Text>
          <Text className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Selecione um valor (vencedores acima de R$ 1.903,98 pagam 15%):
          </Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {exampleAmounts.map((amount) => (
              <Pressable
                key={amount}
                onPress={() => setSelectedAmount(amount)}
                className={`rounded-lg px-4 py-2 ${
                  selectedAmount === amount ? '' : 'border border-slate-300 dark:border-slate-600'
                }`}
                style={{
                  backgroundColor:
                    selectedAmount === amount
                      ? config.hexColor
                      : 'transparent',
                }}
              >
                <Text
                  className={`font-bold ${
                    selectedAmount === amount
                      ? 'text-white'
                      : 'text-slate-700 dark:text-white'
                  }`}
                >
                  {formatCurrency(amount)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-4 gap-2 rounded-lg bg-white p-3 dark:bg-slate-800">
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-600 dark:text-slate-400">Valor Bruto:</Text>
              <Text className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(selectedAmount)}
              </Text>
            </View>
            {taxAmount > 0 && (
              <View className="flex-row justify-between border-t border-slate-200 pt-2 dark:border-slate-600">
                <Text className="text-sm text-red-600 dark:text-red-400">Imposto (15%):</Text>
                <Text className="font-bold text-red-600 dark:text-red-400">
                  -{formatCurrency(taxAmount)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between border-t border-slate-200 pt-2 dark:border-slate-600">
              <Text className="font-bold text-slate-900 dark:text-white">Valor Líquido:</Text>
              <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(netAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Onde Resgatar */}
        <View className="mt-6">
          <View
            className="rounded-lg border-2 p-4"
            style={{ borderColor: redemption.method === 'loteria' ? '#10b981' : '#f97316', backgroundColor: redemption.method === 'loteria' ? '#10b98115' : '#f9731615' }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl">
              {redemption.method === 'loteria' ? '🏪' : '🏦'}
            </Text>
            <Text className="flex-1 font-bold text-slate-900 dark:text-white">
              {redemption.method === 'loteria' ? 'Lotérica' : 'CAIXA'}
            </Text>
            </View>
            <Text className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {redemption.reason}
            </Text>
            <View className="mt-3 gap-1">
              {redemption.places.map((place: string, idx: number) => (
                <View key={idx} className="flex-row gap-2">
                  <Text className="text-xs text-slate-600 dark:text-slate-400">✓</Text>
                  <Text className="flex-1 text-xs text-slate-600 dark:text-slate-400">
                    {place}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Documentação Necessária */}
        <View className="mt-6">
          <Text className="mb-3 font-bold text-slate-900 dark:text-white">
            📋 Documentos Necessários
          </Text>
          <View className="gap-2">
            {guide.documentation.map((doc: string, idx: number) => (
              <View
                key={idx}
                className="flex-row items-center gap-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-800"
              >
                <Text className="text-lg">✓</Text>
                <Text className="text-sm text-slate-700 dark:text-slate-300">{doc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Informações Legais */}
        <View className="mt-6 mb-8">
          <Text className="mb-3 font-bold text-slate-900 dark:text-white">
            Informações Importantes
          </Text>
          <View className="gap-2">
            {guide.legalWarnings.map((warning: string, idx: number) => (
              <View
                key={idx}
                className="flex-row gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20"
              >
                <Text className="text-lg">•</Text>
                <Text className="flex-1 text-sm text-yellow-800 dark:text-yellow-200">
                  {warning}
                </Text>
              </View>
            ))}
          </View>

          {/* Prazo de Resgate */}
          <View className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
            <Text className="font-bold text-red-700 dark:text-red-300">
              PRAZO: {guide.timeLimit.days} DIAS
            </Text>
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
              {guide.timeLimit.exceptionInfo ||
                `Após ${guide.timeLimit.days} dias do sorteio, o prêmio caduca e é destinado ao Fundo de Amparo ao Trabalhador`}
            </Text>
          </View>
        </View>

        {/* Contato CAIXA */}
        <View className="mb-8 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
          <Text className="font-bold text-slate-900 dark:text-white">
            Contato CAIXA - Loterias
          </Text>
          <Text className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            • Telefone: 4040-0104 (Capital SP) ou consulte a Central de Atendimento CAIXA
          </Text>
          <Text className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            • Website: www.caixa.gov.br/loterias
          </Text>
          <Text className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            • Você também pode verificar se foi premiado em qualquer agência CAIXA
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
