import BolaoCalculatorModal from '@/src/components/BolaoCalculatorModal';
import { GlassCard } from '@/src/components/GlassCard';
import { useHelpModals } from '@/src/components/HelpModal';
import { useLottery } from '@/src/context/LotteryContext';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import { LinearGradient } from 'expo-linear-gradient';
import { HelpCircle } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function BolaoScreen() {
  const { selectedLottery } = useLottery();
  const config = useMemo(() => getLotteryConfig(selectedLottery), [selectedLottery]);
  const [open, setOpen] = useState(false);
  const { showHelp, HelpUI } = useHelpModals();

  return (
    <View className="flex-1 bg-transparent">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 16 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-4xl font-extrabold text-white">Bolão</Text>
            <Text className="text-lg font-semibold text-zinc-200">
              Calcule a divisão proporcional por cotas e copie o texto pronto para WhatsApp.
            </Text>
          </View>
          <Pressable onPress={() => showHelp('bolao')} style={{ padding: 8 }}>
            <HelpCircle size={24} color="rgba(255,255,255,0.90)" />
          </Pressable>
        </View>

        <GlassCard>
          <Text className="text-lg font-bold text-white">Loteria selecionada</Text>
          <Text className="text-xl font-extrabold" style={{ color: '#20d361' }}>
            {config.name}
          </Text>
        </GlassCard>

        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={{ minHeight: 56 }}
          className="items-center justify-center rounded-2xl overflow-hidden">
          <LinearGradient
            colors={['#20d361', 'rgba(32, 211, 97, 0.78)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', minHeight: 56, alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-lg font-extrabold" style={{ color: '#001a17' }}>
              Abrir calculadora de bolão
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      {open ? <BolaoCalculatorModal visible={open} onClose={() => setOpen(false)} /> : null}

      {HelpUI}
    </View>
  );
}
