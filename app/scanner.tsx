import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useMemo, useState } from 'react';
import { View as RNView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { saveBet } from '@/src/megasena/bets-db';
import { getLotteryDrawByDateISO } from '@/src/megasena/lottery-sqlite';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import { countHits, parseCaixaQr } from '@/src/megasena/ticket';
import type { LotteryDraw, LotteryType } from '@/src/megasena/types';
import { formatNumbers } from '@/src/megasena/weighted';

export default function ScannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [raw, setRaw] = useState<string>('');
  const [latestDraw, setLatestDraw] = useState<LotteryDraw | null>(null);
  const [matchedDraw, setMatchedDraw] = useState<LotteryDraw | null>(null);
  const [lotteryType, setLotteryType] = useState<LotteryType>('megasena');

  useEffect(() => {
    let alive = true;

    requestPermission().catch(() => {
      // ignore permission errors; UI handles missing permission
    });

    ensureMegaSenaDbUpToDate()
      .then(async () => {
        if (!alive) return;
        const latest = await getMegaSenaLatestDrawFromDb();
        if (!alive) return;
        setLatestDraw(latest);
      })
      .catch(() => {
        if (!alive) return;
        setLatestDraw(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Detecta tipo de loteria pelo QR (base simples: quantidade de números)
  const parsed = useMemo(() => parseCaixaQr(raw), [raw]);
  const ticketNumbers = parsed.numbers;
  const ticketDate = parsed.dateISO;
  useEffect(() => {
    if (ticketNumbers.length === 15) setLotteryType('lotofacil');
    else if (ticketNumbers.length === 5) setLotteryType('quina');
    else if (ticketNumbers.length === 20) setLotteryType('lotomania');
    else if (ticketNumbers.length === 6) setLotteryType('megasena');
    else if (ticketNumbers.length === 6) setLotteryType('duplasena');
    // Adapte para outros tipos se necessário
  }, [ticketNumbers]);

  useEffect(() => {
    let alive = true;
    if (!ticketDate) {
      if (!alive) return;
      setMatchedDraw(latestDraw ?? null);
      return;
    }
    getLotteryDrawByDateISO(lotteryType, ticketDate)
      .then((d) => {
        if (!alive) return;
        setMatchedDraw(d);
      })
      .catch(() => {
        if (!alive) return;
        setMatchedDraw(latestDraw ?? null);
      });
    return () => {
      alive = false;
    };
  }, [ticketDate, latestDraw, lotteryType]);

  const hits = useMemo(() => {
    if (!matchedDraw) return null;
    const config = getLotteryConfig(lotteryType);
    if (ticketNumbers.length !== config.numbersPerDraw) return null;
    return countHits(ticketNumbers, matchedDraw.numbers);
  }, [ticketNumbers, matchedDraw, lotteryType]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scanner</Text>
        <Text style={styles.subtitle}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scanner</Text>
        <Text style={styles.subtitle}>Sem permissão de câmera.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanner</Text>
      <Text style={styles.subtitle}>Aponte para o QR do bilhete. Vou tentar extrair 6 dezenas.</Text>

      <RNView style={[styles.cameraWrap, { borderColor: colors.tabIconDefault }]}> 
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (scanned) return;
            setScanned(true);
            setRaw(String(data ?? ''));
          }}
          style={StyleSheet.absoluteFillObject}
        />
      </RNView>

      <View style={[styles.card, { borderColor: colors.tabIconDefault }]}> 
        <Text style={styles.cardTitle}>Bilhete</Text>
        <Text style={styles.value}>{ticketNumbers.length === 6 ? formatNumbers(ticketNumbers) : 'Não reconhecido'}</Text>
        {ticketDate && <Text style={styles.note}>Data extraída: {ticketDate}</Text>}

        <Text style={styles.cardTitle}>Sorteio correspondente</Text>
        <Text style={styles.value}>
          {matchedDraw
            ? `Concurso ${matchedDraw.contest} (${matchedDraw.dateISO})`
            : ticketDate
              ? 'Resultado ainda não disponível'
              : 'Indisponível'}
        </Text>
        {matchedDraw && <Text style={styles.note}>{formatNumbers(matchedDraw.numbers)}</Text>}

        <Text style={styles.cardTitle}>Acertos</Text>
        <Text style={styles.value}>
          {matchedDraw && matchedDraw.numbers && hits != null
            ? hits === 0
              ? '0 (nenhum acerto)'
              : `${hits} ${hits === 1 ? 'número acertado' : 'números acertados'}`
            : ticketDate
              ? 'Resultado ainda não disponível'
              : '—'}
        </Text>

        {!!raw && (
          <Text style={styles.note} numberOfLines={2}>
            QR: {raw}
          </Text>
        )}

        {/* Botão de salvar no histórico */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? '#059669' : '#10b981', width: '100%' },
            ]}
            onPress={async () => {
              try {
                if (!ticketNumbers.length || !lotteryType) {
                  alert('Bilhete inválido.');
                  return;
                }
                await saveBet({
                  lotteryId: lotteryType,
                  numbers: ticketNumbers,
                  contest: matchedDraw?.contest,
                  createdAt: Date.now(),
                  costPerGame: 0,
                  totalCost: 0,
                  isPlayed: false,
                });
                alert('Bilhete salvo no histórico!');
              } catch (e) {
                alert('Erro ao salvar bilhete: ' + (e as Error).message);
              }
            }}
            android_ripple={{ color: '#a7f3d0' }}
          >
            <Text style={[styles.buttonText, { color: '#fff', textAlign: 'center' }]}>Salvar no histórico</Text>
          </Pressable>
        </View>
      </View>
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
  cameraWrap: {
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.8,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 6,
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
    marginTop: 8,
    opacity: 0.6,
  },
});
