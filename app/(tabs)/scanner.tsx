import { CameraView, useCameraPermissions } from 'expo-camera';
import { CheckCircle, HelpCircle, Trophy, XCircle } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View as RNView, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { GlassCard } from '@/src/components/GlassCard';
import { useHelpModals } from '@/src/components/HelpModal';
import { NumberBall } from '@/src/components/NumberBall';
import { saveBet } from '@/src/megasena/bets-db';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import { ensureMegaSenaDbUpToDate, getMegaSenaDrawByDateISO, getMegaSenaLatestDrawFromDb } from '@/src/megasena/sqlite';
import { computeFrequencies, topNumbers } from '@/src/megasena/stats';
import { countHits, parseCaixaQr } from '@/src/megasena/ticket';
import type { LotteryType, MegaSenaDraw } from '@/src/megasena/types';
import { formatNumbers } from '@/src/megasena/weighted';

function detectLotteryIdFromQr(data: string): LotteryType | null {
  const s = String(data ?? '').toLowerCase();
  if (!s) return null;

  if (s.includes('mega') || s.includes('megasena') || s.includes('mega-sena')) return 'megasena';
  if (s.includes('quina')) return 'quina';
  if (s.includes('lotofacil') || s.includes('loto-facil') || s.includes('lotofácil')) return 'lotofacil';
  if (s.includes('lotomania')) return 'lotomania';
  if (s.includes('dupla') || s.includes('dupla-sena') || s.includes('duplasena')) return 'duplasena';
  return null;
}

function detectContestFromQr(data: string): number | null {
  const s = String(data ?? '');
  if (!s) return null;

  const patterns = [
    /\bconcurso\D*(\d{3,6})\b/i,
    /\bconc\.?\D*(\d{3,6})\b/i,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m?.[1]) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

function stripDates(data: string): string {
  let s = String(data ?? '');
  if (!s) return s;
  // Remove common date formats so day/month don't pollute bet-number parsing.
  s = s.replace(/\b[0-3]\d[\/\-.][0-1]\d[\/\-.]\d{4}\b/g, ' ');
  s = s.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ');
  return s;
}

function parseNumbersForLottery(data: string, lotteryId: LotteryType): number[] {
  const cfg = getLotteryConfig(lotteryId);
  const required = cfg.numbersPerDraw;
  const min = lotteryId === 'lotomania' ? 0 : 1;
  const max = cfg.totalNumbers;

  const cleaned = stripDates(data);
  // We only take 1-2 digit tokens to avoid contest numbers (4+ digits).
  const matches = cleaned.match(/\d{1,2}/g) ?? [];
  const nums = matches
    .map((m) => Number(m))
    .filter((n) => Number.isInteger(n) && n >= min && n <= max);

  const unique: number[] = [];
  for (const n of nums) {
    if (!unique.includes(n)) unique.push(n);
    if (unique.length >= required) break;
  }

  if (unique.length !== required) return [];
  return unique.slice().sort((a, b) => a - b);
}

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [raw, setRaw] = useState<string>('');
  const [latestDraw, setLatestDraw] = useState<MegaSenaDraw | null>(null);
  const [matchedDraw, setMatchedDraw] = useState<MegaSenaDraw | null>(null);
  const [allDraws, setAllDraws] = useState<MegaSenaDraw[]>([]);

  const { showHelp, HelpUI } = useHelpModals();

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
        
        // Carregar todos os draws para análise estatística
        const { getMegaSenaHistory } = await import('@/src/megasena/history');
        const draws = await getMegaSenaHistory({ lastN: 300 });
        if (!alive) return;
        setAllDraws(draws);
      })
      .catch(() => {
        if (!alive) return;
        setLatestDraw(null);
      });

    return () => {
      alive = false;
    };
  }, [requestPermission]);

  const parsed = useMemo(() => parseCaixaQr(raw), [raw]);
  const ticketDate = parsed.dateISO;

  const detectedLotteryId = useMemo(() => detectLotteryIdFromQr(raw), [raw]);
  const lotteryId: LotteryType = detectedLotteryId ?? 'megasena';
  const lotteryConfig = useMemo(() => getLotteryConfig(lotteryId), [lotteryId]);
  const lotteryName = lotteryConfig.name;
  const isSupported = lotteryId === 'megasena';

  const ticketNumbers = useMemo(() => parseNumbersForLottery(raw, lotteryId), [raw, lotteryId]);
  const extractedContest = useMemo(() => detectContestFromQr(raw), [raw]);

  const matchedLabel = useMemo(() => {
    if (!matchedDraw) return '';
    const dateText = matchedDraw.dateISO ? new Date(matchedDraw.dateISO).toLocaleDateString('pt-BR') : '';
    if (ticketDate) {
      return `${lotteryName} — Concurso ${matchedDraw.contest}${dateText ? ` (${dateText})` : ''} — correspondente à data do bilhete.`;
    }
    return `${lotteryName} — Concurso ${matchedDraw.contest}${dateText ? ` (${dateText})` : ''} — usado para conferir (sem data no QR).`;
  }, [matchedDraw, ticketDate, lotteryName]);

  useEffect(() => {
    let alive = true;

    if (!isSupported) {
      setMatchedDraw(null);
      return () => {
        alive = false;
      };
    }

    if (!ticketDate) {
      if (!alive) return;
      setMatchedDraw(latestDraw ?? null);
      return;
    }

    getMegaSenaDrawByDateISO(ticketDate)
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
  }, [ticketDate, latestDraw, isSupported]);

  const contestToSave = useMemo(() => {
    if (typeof extractedContest === 'number') return extractedContest;
    if (lotteryId === 'megasena' && matchedDraw) return matchedDraw.contest;
    return null;
  }, [extractedContest, lotteryId, matchedDraw]);

  const hits = useMemo(() => {
    if (!matchedDraw || ticketNumbers.length !== 6) return null;
    return countHits(ticketNumbers, matchedDraw.numbers);
  }, [ticketNumbers, matchedDraw]);

  // Calcular número mais comum (curiosidade estatística)
  const mostCommonNumber = useMemo(() => {
    if (allDraws.length === 0) return null;
    const frequency = computeFrequencies(allDraws, 60, 1);
    const top = topNumbers(frequency, 1, 1);
    return top.length > 0 ? top[0] : null;
  }, [allDraws]);

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
      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.title}>Scanner</Text>
        <Pressable onPress={() => showHelp('scanner')} style={{ padding: 8 }}>
          <HelpCircle size={24} color="rgba(255,255,255,0.90)" />
        </Pressable>
      </RNView>
      <Text style={styles.subtitle}>Aponte para o QR do bilhete. Vou tentar extrair 6 dezenas.</Text>

      <RNView style={[styles.cameraWrap, { borderColor: 'rgba(32, 211, 97, 0.25)' }]}>
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

      <ScrollView style={{ flex: 1, marginTop: 12 }} showsVerticalScrollIndicator={false}>
        {/* Seção de Bilhete */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Bilhete</Text>
          <Text style={styles.note}>Jogo detectado: {lotteryName}</Text>
          {!isSupported && (
            <Text style={styles.warningText}>
              A conferência automática do sorteio está disponível apenas para Mega-Sena.
            </Text>
          )}
          <Text style={styles.value}>
            {ticketNumbers.length === lotteryConfig.numbersPerDraw ? formatNumbers(ticketNumbers) : 'Não reconhecido'}
          </Text>
          {ticketDate && <Text style={styles.note}>Data extraída: {ticketDate}</Text>}
          {contestToSave ? <Text style={styles.note}>Concurso: {contestToSave}</Text> : null}

          {ticketNumbers.length === lotteryConfig.numbersPerDraw ? (
            <Pressable
              accessibilityRole="button"
              onPress={async () => {
                try {
                  await saveBet({
                    lotteryId,
                    numbers: ticketNumbers,
                    contest: contestToSave ?? undefined,
                    createdAt: Date.now(),
                    costPerGame: 0,
                    totalCost: 0,
                    notes: 'Salvo pelo Scanner',
                    isPlayed: false,
                  });
                  setScanned(false);
                  setRaw('');
                  alert('Salvo no Histórico!');
                } catch (e) {
                  console.error(e);
                  alert('Não foi possível salvar.');
                }
              }}
              android_ripple={{ color: '#e5e7eb' }}
              style={({ pressed }) => [styles.saveButton, { opacity: pressed ? 0.85 : 1 }, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.saveButtonText}>Salvar no Histórico</Text>
            </Pressable>
          ) : null}
        </GlassCard>

        {/* Seção de Sorteio e Resultado */}
        {matchedDraw && ticketNumbers.length === lotteryConfig.numbersPerDraw && (
          <GlassCard style={styles.resultCard}>
            <Text style={styles.resultTitle}>🎯 Resultado da Conferência</Text>
            <Text style={styles.resultValue}>{matchedLabel || `Concurso ${matchedDraw.contest}`}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontStyle: 'italic' }}>
              Verificação baseada nos números oficiais {matchedDraw.dateISO ? `sorteados em ${new Date(matchedDraw.dateISO).toLocaleDateString('pt-BR')}` : `do Concurso ${matchedDraw.contest}`}
            </Text>

            {/* Comparação Visual: Seus Números vs Sorteados */}
            <RNView style={{ gap: 16, marginTop: 16 }}>
              {/* Seus números */}
              <RNView style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>
                  🎫 Seus Números:
                </Text>
                <RNView style={styles.ballsContainer}>
                  {ticketNumbers.map((num) => {
                    const isHit = matchedDraw.numbers.includes(num);
                    return (
                      <RNView key={num} style={{ position: 'relative' }}>
                        <NumberBall
                          value={num}
                          size={46}
                          backgroundColor={isHit ? '#20d361' : undefined}
                          textColor={isHit ? '#001a17' : undefined}
                        />
                        {isHit && (
                          <RNView
                            style={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              backgroundColor: '#20d361',
                              borderRadius: 10,
                              width: 20,
                              height: 20,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 2,
                              borderColor: '#001a17',
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '900', color: '#001a17' }}>✓</Text>
                          </RNView>
                        )}
                      </RNView>
                    );
                  })}
                </RNView>
              </RNView>

              {/* Números sorteados */}
              <RNView style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>
                  🏆 Números Sorteados:
                </Text>
                <RNView style={styles.ballsContainer}>
                  {matchedDraw.numbers.map((num) => (
                    <NumberBall key={num} value={num} size={46} />
                  ))}
                </RNView>
              </RNView>
            </RNView>

            {/* Resultado de Acertos */}
            {hits !== null && (
              <RNView
                style={[
                  styles.hitsSection,
                  {
                    backgroundColor: hits > 0 ? 'rgba(32, 211, 97, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    borderWidth: 2,
                    borderColor: hits > 0 ? 'rgba(32, 211, 97, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 16,
                  },
                ]}
              >
                {hits > 0 ? (
                  <>
                    <CheckCircle color="#20d361" size={40} />
                    <RNView style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={[styles.hitsText, { fontSize: 22, color: '#20d361' }]}>
                        {hits} {hits === 1 ? 'acerto' : 'acertos'}
                      </Text>
                      {hits >= 4 && (
                        <RNView
                          style={{
                            marginTop: 8,
                            backgroundColor: 'rgba(255, 215, 0, 0.2)',
                            padding: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 215, 0, 0.4)',
                          }}
                        >
                          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Trophy color="#ffd700" size={20} />
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffd700' }}>
                              {hits === 6
                                ? '🎉 POSSÍVEL SENA!'
                                : hits === 5
                                ? '🎉 POSSÍVEL QUINA!'
                                : '🎉 POSSÍVEL QUADRA!'}
                            </Text>
                          </RNView>
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 6, lineHeight: 18 }}>
                            Baseado na comparação com o {matchedDraw.dateISO ? `sorteio do Concurso ${matchedDraw.contest} realizado em ${new Date(matchedDraw.dateISO).toLocaleDateString('pt-BR')}` : `Concurso ${matchedDraw.contest}`}.
                          </Text>
                          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontStyle: 'italic' }}>
                            ⚠️ Confira seu bilhete em uma casa lotérica ou no site oficial da Caixa para validação final.
                          </Text>
                        </RNView>
                      )}
                      {hits < 4 && hits > 0 && (
                        <Text style={styles.hitsSubtext}>Continue tentando! Você está quase lá!</Text>
                      )}
                    </RNView>
                  </>
                ) : (
                  <>
                    <XCircle color="#ef4444" size={40} />
                    <RNView style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={[styles.hitsText, { color: '#ef4444' }]}>Nenhum acerto</Text>
                      <Text style={styles.hitsSubtext}>Próxima vez você consegue!</Text>
                    </RNView>
                  </>
                )}
              </RNView>
            )}

            {/* Informações de Prêmio do Concurso */}
            {matchedDraw.prizeBreakdown && matchedDraw.prizeBreakdown.length > 0 && hits !== null && hits >= 4 && (
              <RNView style={{ marginTop: 16, gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>
                  💰 Valores Oficiais do Concurso {matchedDraw.contest}{matchedDraw.dateISO ? ` - ${new Date(matchedDraw.dateISO).toLocaleDateString('pt-BR')}` : ''}:
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  Fonte: Dados extraídos da API oficial da Caixa Econômica Federal
                </Text>
                {matchedDraw.prizeBreakdown
                  .filter((p: { faixa: number }) => p.faixa <= 3)
                  .map((prize: { faixa: number; descricaoFaixa: string; numeroDeGanhadores: number; valorPremio: number }) => {
                    const isYourPrize = 
                      (hits === 6 && prize.faixa === 1) ||
                      (hits === 5 && prize.faixa === 2) ||
                      (hits === 4 && prize.faixa === 3);
                    
                    return (
                      <RNView
                        key={prize.faixa}
                        style={{
                          backgroundColor: isYourPrize ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255,255,255,0.05)',
                          padding: 10,
                          borderRadius: 8,
                          borderLeftWidth: 3,
                          borderLeftColor: isYourPrize ? '#ffd700' : 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <RNView style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>
                              {isYourPrize && '🏆 '}{prize.descricaoFaixa}{isYourPrize ? ' (Possível Premiação)' : ''}
                            </Text>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                              {prize.numeroDeGanhadores} {prize.numeroDeGanhadores === 1 ? 'ganhador' : 'ganhadores'} neste concurso
                            </Text>
                          </RNView>
                          {prize.valorPremio > 0 && (
                            <Text style={{ fontSize: 13, fontWeight: '800', color: isYourPrize ? '#ffd700' : '#20d361' }}>
                              {prize.valorPremio.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </Text>
                          )}
                        </RNView>
                      </RNView>
                    );
                  })}
              </RNView>
            )}

            {/* Disclaimer Legal */}
            <RNView style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: 'rgba(255,165,0,0.5)' }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 16 }}>
                📋 <Text style={{ fontWeight: '700' }}>Informações Importantes:</Text> Esta conferência é baseada nos dados públicos disponibilizados pela Caixa Econômica Federal para o Concurso {matchedDraw.contest}{matchedDraw.dateISO ? ` (${new Date(matchedDraw.dateISO).toLocaleDateString('pt-BR')})` : ''}. Os valores e quantidades de ganhadores são extraídos da API oficial. Para confirmação oficial e resgate de prêmios, compareça em uma casa lotérica com o bilhete original ou acesse o site oficial da Caixa.
              </Text>
            </RNView>

            {/* Curiosidade Estatística */}
            {mostCommonNumber && (
              <RNView style={styles.curiousitySection}>
                <Text style={styles.curiosityTitle}>📊 Curiosidade Estatística</Text>
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <NumberBall value={mostCommonNumber.number} size={40} />
                  <RNView style={{ flex: 1 }}>
                    <Text style={styles.curiosityText}>
                      Número mais comum nos últimos {allDraws.length} sorteios
                    </Text>
                    <Text style={styles.curiosityValue}>
                      Saiu {mostCommonNumber.count} vezes ({((mostCommonNumber.count / allDraws.length) * 100).toFixed(1)}%)
                    </Text>
                  </RNView>
                </RNView>
              </RNView>
            )}

            {ticketNumbers.length === 6 ? (
              <Pressable
                accessibilityRole="button"
                disabled={!matchedDraw}
                onPress={async () => {
                  try {
                    if (!matchedDraw) return;
                    await saveBet({
                      lotteryId: 'megasena',
                      numbers: ticketNumbers.slice().sort((a, b) => a - b),
                      contest: matchedDraw.contest,
                      createdAt: Date.now(),
                      costPerGame: 0,
                      totalCost: 0,
                      notes: 'Salvo pelo Scanner',
                      isPlayed: false,
                      closureId: null as any,
                    });
                    setScanned(false);
                    setRaw('');
                    alert('Salvo no Histórico!');
                  } catch (e) {
                    console.error(e);
                    alert('Não foi possível salvar.');
                  }
                }}
                android_ripple={{ color: '#e5e7eb' }}
                style={({ pressed }) => [
                  styles.saveButton,
                  { opacity: pressed ? 0.85 : 1 },
                  pressed && { opacity: 0.85 }
                ]}
              >
                <Text style={styles.saveButtonText}>Salvar no Histórico</Text>
              </Pressable>
            ) : null}
          </GlassCard>
        )}

        {/* Outros jogos podem ser salvos no histórico; conferência automática só Mega-Sena */}

        {/* Mensagem quando não há sorteio */}
        {!matchedDraw && ticketDate && (
          <RNView style={styles.errorCard}>
            <Text style={styles.errorText}>Sorteio não encontrado</Text>
          </RNView>
        )}

        {!!raw && (
          <RNView style={styles.debugCard}>
            <Text style={styles.note} numberOfLines={2}>
              QR: {raw}
            </Text>
          </RNView>
        )}
      </ScrollView>

      {HelpUI}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.72)',
  },
  cameraWrap: {
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  section: {
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20d361',
    letterSpacing: 0.4,
  },
  note: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.72)',
  },
  resultCard: {
    marginBottom: 12,
    gap: 12,
    borderColor: 'rgba(32, 211, 97, 0.45)',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#20d361',
  },
  resultDate: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  ballsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  hitsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  hitsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  hitsSubtext: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  curiousitySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(32, 211, 97, 0.3)',
    marginTop: 12,
  },
  curiosityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20d361',
  },
  curiosityText: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  curiosityValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20d361',
    marginTop: 4,
  },
  errorCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fca5a5',
    borderWidth: 1,
    borderColor: '#dc2626',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7f1d1d',
  },
  debugCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 12,
  },
  saveButton: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 211, 97, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(32, 211, 97, 0.35)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
