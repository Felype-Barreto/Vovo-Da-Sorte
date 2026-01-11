import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View as RNView, StyleSheet, TextInput } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { refreshMegaSenaHistory } from '@/src/megasena/history';
import { countHits } from '@/src/megasena/ticket';
import type { MegaSenaDraw } from '@/src/megasena/types';
import { formatNumbers } from '@/src/megasena/weighted';

function parseSixNumbers(text: string): number[] {
  const matches = text.match(/\d{1,2}/g) ?? [];
  const nums = matches
    .map((m) => Number(m))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 60);

  const unique: number[] = [];
  for (const n of nums) {
    if (!unique.includes(n)) unique.push(n);
    if (unique.length >= 6) break;
  }

  return unique.length === 6 ? unique.slice().sort((a, b) => a - b) : [];
}

function formatSixNumbersForInput(nums: number[]): string {
  return nums.map((n) => String(n).padStart(2, '0')).join(' ');
}

function parseMoneyBRL(text: string): number {
  const cleaned = (text ?? '').trim().replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function ESeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const params = useLocalSearchParams<{ nums?: string | string[] }>();

  const [draws, setDraws] = useState<MegaSenaDraw[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [lastN, setLastN] = useState('300');
  const [numbersText, setNumbersText] = useState('01 02 03 04 05 06');

  // Optional money inputs (default 0 to avoid misleading assumptions).
  const [betPriceText, setBetPriceText] = useState('0');
  const [quadraPrizeText, setQuadraPrizeText] = useState('0');
  const [quinaPrizeText, setQuinaPrizeText] = useState('0');
  const [senaPrizeText, setSenaPrizeText] = useState('0');

  async function loadHistory() {
    if (loading) return;
    setLoading(true);
    try {
      const n = Math.max(10, Math.min(800, Number(lastN) || 300));
      const d = await refreshMegaSenaHistory({ lastN: n });
      setDraws(d);
    } catch {
      setDraws([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const rawNums = Array.isArray(params.nums) ? params.nums[0] : params.nums;
    if (rawNums) {
      const parsed = parseSixNumbers(String(rawNums));
      if (parsed.length === 6) setNumbersText(formatSixNumbersForInput(parsed));
    }

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bet = useMemo(() => parseSixNumbers(numbersText), [numbersText]);

  const stats = useMemo(() => {
    const ready = draws ?? [];
    if (!ready.length || bet.length !== 6) {
      return {
        contests: ready.length,
        quadra: 0,
        quina: 0,
        sena: 0,
        spent: 0,
        won: 0,
        profit: 0,
      };
    }

    let quadra = 0;
    let quina = 0;
    let sena = 0;

    for (const d of ready) {
      const hits = countHits(bet, d.numbers);
      if (hits === 4) quadra += 1;
      else if (hits === 5) quina += 1;
      else if (hits === 6) sena += 1;
    }

    const betPrice = parseMoneyBRL(betPriceText);
    const quadraPrize = parseMoneyBRL(quadraPrizeText);
    const quinaPrize = parseMoneyBRL(quinaPrizeText);
    const senaPrize = parseMoneyBRL(senaPrizeText);

    const spent = betPrice * ready.length;
    const won = quadra * quadraPrize + quina * quinaPrize + sena * senaPrize;
    const profit = won - spent;

    return {
      contests: ready.length,
      quadra,
      quina,
      sena,
      spent,
      won,
      profit,
    };
  }, [draws, bet, betPriceText, quadraPrizeText, quinaPrizeText, senaPrizeText]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>E se?</Text>
      <Text style={styles.subtitle}>
        Simula jogar as mesmas 6 dezenas em cada concurso (limitado ao histórico carregado no app).
      </Text>

      <View style={[styles.card, { borderColor: colors.tabIconDefault }]}>
        <Text style={styles.cardTitle}>Dezenas (6)</Text>
        <TextInput
          value={numbersText}
          onChangeText={setNumbersText}
          placeholder="Ex: 01 02 03 04 05 06"
          placeholderTextColor={colors.tabIconDefault}
          style={[styles.input, { borderColor: colors.tabIconDefault, color: colors.text }]}
        />
        <Text style={styles.note}>
          {bet.length === 6 ? `Reconhecido: ${formatNumbers(bet)}` : 'Digite 6 dezenas entre 1 e 60.'}
        </Text>

        <Text style={[styles.cardTitle, { marginTop: 10 }]}>Histórico</Text>
        <RNView style={styles.row}>
          <TextInput
            value={lastN}
            onChangeText={setLastN}
            keyboardType="numeric"
            placeholder="300"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.inputSmall, { borderColor: colors.tabIconDefault, color: colors.text }]}
          />
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={loadHistory}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.tint, opacity: pressed || loading ? 0.85 : 1 },
            ]}>
            <Text style={[styles.buttonText, { color: colors.background }]}>
              {loading ? 'Carregando...' : 'Carregar'}
            </Text>
          </Pressable>
        </RNView>
        <Text style={styles.note}>Máximo: 800 concursos (pra não travar).</Text>
      </View>

      <View style={[styles.card, { borderColor: colors.tabIconDefault }]}>
        <Text style={styles.cardTitle}>Resultado</Text>
        <Text style={styles.value}>Concursos analisados: {stats.contests}</Text>
        <Text style={styles.value}>Quadra (4): {stats.quadra}</Text>
        <Text style={styles.value}>Quina (5): {stats.quina}</Text>
        <Text style={styles.value}>Sena (6): {stats.sena}</Text>

        <Text style={[styles.cardTitle, { marginTop: 10 }]}>Financeiro (opcional)</Text>
        <RNView style={styles.moneyRow}>
          <Text style={styles.moneyLabel}>Preço da aposta</Text>
          <TextInput
            value={betPriceText}
            onChangeText={setBetPriceText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.moneyInput, { borderColor: colors.tabIconDefault, color: colors.text }]}
          />
        </RNView>
        <RNView style={styles.moneyRow}>
          <Text style={styles.moneyLabel}>Prêmio quadra</Text>
          <TextInput
            value={quadraPrizeText}
            onChangeText={setQuadraPrizeText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.moneyInput, { borderColor: colors.tabIconDefault, color: colors.text }]}
          />
        </RNView>
        <RNView style={styles.moneyRow}>
          <Text style={styles.moneyLabel}>Prêmio quina</Text>
          <TextInput
            value={quinaPrizeText}
            onChangeText={setQuinaPrizeText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.moneyInput, { borderColor: colors.tabIconDefault, color: colors.text }]}
          />
        </RNView>
        <RNView style={styles.moneyRow}>
          <Text style={styles.moneyLabel}>Prêmio sena</Text>
          <TextInput
            value={senaPrizeText}
            onChangeText={setSenaPrizeText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.moneyInput, { borderColor: colors.tabIconDefault, color: colors.text }]}
          />
        </RNView>

        <Text style={[styles.value, { marginTop: 8 }]}>Gasto total: R$ {stats.spent.toLocaleString('pt-BR')}</Text>
        <Text style={styles.value}>Retorno total: R$ {stats.won.toLocaleString('pt-BR')}</Text>
        <Text style={styles.value}>Saldo: R$ {stats.profit.toLocaleString('pt-BR')}</Text>
      </View>

      <Text style={styles.footerNote}>
        Para simular desde 1996, é melhor ter um dataset completo offline/espelho (a API da Caixa exige 1 request por concurso).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    opacity: 0.7,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputSmall: {
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    minWidth: 90,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  moneyLabel: {
    opacity: 0.75,
  },
  moneyInput: {
    minWidth: 110,
    textAlign: 'right',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  footerNote: {
    opacity: 0.6,
  },
});
