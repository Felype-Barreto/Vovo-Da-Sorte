import { useLottery } from '@/src/context/LotteryContext';
import {
    calculateBolao,
    formatBolaoForWhatsApp,
    simulateBolaoScenarios,
    type BolaoParticipant
} from '@/src/megasena/bolao-calculator';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function BolaoCalculatorModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { selectedLottery } = useLottery();
  const config = getLotteryConfig(selectedLottery);

  const [participants, setParticipants] = useState<BolaoParticipant[]>([
    { name: 'Participante 1', contribution: 0, shares: 1 },
    { name: 'Participante 2', contribution: 0, shares: 1 },
  ]);
  const [prizeAmount, setPrizeAmount] = useState('1000.00');
  const [result, setResult] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const updateParticipant = (
    index: number,
    field: keyof BolaoParticipant,
    value: string | number,
  ) => {
    const newParticipants = [...participants];
    if (field === 'name') {
      newParticipants[index].name = String(value);
    } else if (field === 'contribution' || field === 'shares') {
      newParticipants[index][field] = parseFloat(String(value)) || 0;
    }
    setParticipants(newParticipants);
  };

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { name: `Participante ${participants.length + 1}`, contribution: 0, shares: 1 },
    ]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const totalContribution = participants.reduce((sum, p) => sum + p.contribution, 0);

  const handleCalculate = async () => {
    try {
      setLoading(true);

      if (totalContribution <= 0) {
        Alert.alert('Erro', 'Soma das contribuições deve ser maior que 0');
        return;
      }

      if (parseFloat(prizeAmount) <= 0) {
        Alert.alert('Erro', 'Prêmio deve ser maior que 0');
        return;
      }

      const bolaoResult = calculateBolao(totalContribution, participants, parseFloat(prizeAmount));
      setResult(bolaoResult);

      const bolaoScenarios = simulateBolaoScenarios(bolaoResult);
      setScenarios(bolaoScenarios);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao calcular bolão');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = formatBolaoForWhatsApp(result);
      await Clipboard.setStringAsync(text);
      Alert.alert('Copiado', 'Resultado copiado para a área de transferência');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar para a área de transferência');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-slate-900/70">
        <ScrollView
          className="flex-1 rounded-t-3xl bg-white dark:bg-slate-800"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700">
            <Text className="text-2xl font-extrabold dark:text-white">Calculador de Bolão</Text>
            <Pressable onPress={onClose}>
              <FontAwesome name="close" size={24} color={config.hexColor} />
            </Pressable>
          </View>

          <View className="flex-1 px-4 py-6">
            {!result ? (
              <>
                {/* Instruções */}
                <View className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <Text className="text-lg text-zinc-800">
                    Insira o nome, contribuição e cotas de cada participante.
                  </Text>
                </View>

                {/* Participantes */}
                <View className="mb-4">
                  <Text className="mb-3 text-xl font-extrabold dark:text-white">Participantes</Text>

                  {participants.map((participant, index) => (
                    <View
                      key={index}
                      className="mb-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-700"
                    >
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="font-semibold text-slate-900 dark:text-white">
                          #{index + 1}
                        </Text>
                        {participants.length > 1 && (
                          <Pressable onPress={() => removeParticipant(index)}>
                            <FontAwesome name="trash" size={18} color="#64748b" />
                          </Pressable>
                        )}
                      </View>

                      <TextInput
                        value={participant.name}
                        onChangeText={(value) => updateParticipant(index, 'name', value)}
                        placeholder="Nome"
                        className="mb-3 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-lg dark:border-slate-600 dark:bg-slate-600 dark:text-white"
                        placeholderTextColor="#9ca3af"
                      />

                      <View className="flex-row gap-2">
                        <View className="flex-1">
                          <Text className="text-base text-slate-700 dark:text-slate-300">
                            Contribuição (R$)
                          </Text>
                          <TextInput
                            value={String(participant.contribution || '')}
                            onChangeText={(value) => updateParticipant(index, 'contribution', value)}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-lg dark:border-slate-600 dark:bg-slate-600 dark:text-white"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>

                        <View className="flex-1">
                          <Text className="text-base text-slate-700 dark:text-slate-300">
                            Cotas
                          </Text>
                          <TextInput
                            value={String(participant.shares || '')}
                            onChangeText={(value) => updateParticipant(index, 'shares', value)}
                            placeholder="1"
                            keyboardType="number-pad"
                            className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-lg dark:border-slate-600 dark:bg-slate-600 dark:text-white"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Adicionar Participante */}
                <Pressable
                  onPress={addParticipant}
                  className="mb-4 rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-4 dark:border-slate-600 dark:bg-slate-700"
                >
                  <Text className="text-center text-lg font-extrabold text-slate-800 dark:text-white">
                    + Adicionar Participante
                  </Text>
                </Pressable>

                {/* Total */}
                <View className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:bg-slate-700">
                  <Text className="text-lg text-slate-700 dark:text-slate-300">
                    Total Apostado:
                  </Text>
                  <Text className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    R$ {totalContribution.toFixed(2)}
                  </Text>
                </View>

                {/* Prêmio */}
                <View className="mb-6">
                  <Text className="mb-2 text-lg font-extrabold dark:text-white">Prêmio simulado</Text>
                  <TextInput
                    value={prizeAmount}
                    onChangeText={setPrizeAmount}
                    placeholder="1000.00"
                    keyboardType="decimal-pad"
                    className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-lg dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Botão Calcular */}
                <Pressable
                  onPress={handleCalculate}
                  disabled={loading || totalContribution <= 0}
                  className={`rounded-2xl px-6 ${loading || totalContribution <= 0 ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: config.hexColor }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-lg font-extrabold text-white" style={{ minHeight: 56, textAlignVertical: 'center' }}>
                      Calcular Divisão
                    </Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                {/* Resultado */}
                <View className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <Text className="mb-2 text-xl font-extrabold text-zinc-900">Cálculo realizado</Text>
                  <Text className="text-lg text-zinc-800">
                    R$ {result.totalValue.toFixed(2)} apostado | R$ {result.prizeAmount.toFixed(2)} de prêmio
                  </Text>
                </View>

                {/* Divisão de Prêmio */}
                <View className="mb-4">
                  <Text className="mb-3 text-xl font-extrabold dark:text-white">
                    Divisão de Prêmio
                  </Text>

                  {result.participants.map((p: any, index: number) => (
                    <View
                      key={index}
                      className="mb-2 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-700"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </Text>
                        <Text className="text-base text-slate-700 dark:text-slate-300">
                          {p.shareholding.toFixed(1)}% | {p.shares} cota(s)
                        </Text>
                      </View>
                      <Text className="text-lg font-extrabold" style={{ color: config.hexColor }}>
                        R$ {p.prizeShare.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Cenários */}
                {scenarios.length > 0 && (
                  <View className="mb-4">
                    <Text className="mb-2 text-xl font-extrabold dark:text-white">Outros cenários</Text>
                    {scenarios.map((scenario, index) => (
                      <View
                        key={index}
                        className="mb-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-700"
                      >
                        <Text className="text-base text-slate-700 dark:text-slate-300">
                          {scenario.multiplier}x de prêmio: R$ {scenario.prizeAmount.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Botões de Ação */}
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      setResult(null);
                      setScenarios([]);
                    }}
                    className="flex-1 rounded-lg border-2 border-slate-300 py-2 dark:border-slate-600"
                  >
                    <Text className="text-center font-bold text-slate-700 dark:text-white">
                      Novo Cálculo
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleCopyToClipboard}
                    className="flex-1 rounded-lg py-2"
                    style={{ backgroundColor: config.hexColor }}
                  >
                    <Text className="text-center font-bold text-white">
                      📋 Copiar para WhatsApp
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
