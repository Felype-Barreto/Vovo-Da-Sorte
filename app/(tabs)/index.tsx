

import { useAppOpenInterstitial } from '@/src/ads/useAppOpenInterstitial';
import { GlassCard } from '@/src/components/GlassCard';
import { NumberBall } from '@/src/components/NumberBall';
import { getAdUnitId, isAdEnabled } from '@/src/config/adConfig';
import { fetchCaixaLotteryOverview } from '@/src/megasena/lottery-caixa';
import { getAllLotteryConfigs } from '@/src/megasena/lotteryConfigs';
import { Award, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';

let BannerAd, BannerAdSize;
try {
  const gma = require('react-native-google-mobile-ads');
  BannerAd = gma.BannerAd;
  BannerAdSize = gma.BannerAdSize;
} catch {}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'agora';
  if (minutes === 1) return 'há 1 minuto';
  if (minutes < 60) return `há ${minutes} minutos`;
  if (hours === 1) return 'há 1 hora';
  if (hours < 24) return `há ${hours} horas`;
  if (days === 1) return 'há 1 dia';
  return `há ${days} dias`;
}

function HomeScreen() {
  useAppOpenInterstitial();
  const [loterias, setLoterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(false);
    try {
      const configs = getAllLotteryConfigs();
      const results = await Promise.all(
        configs.map(async (cfg) => {
          try {
            const overview = await fetchCaixaLotteryOverview(cfg.id);
            const maxPrize = overview.latestResult?.prizeBreakdown?.[0];
            return {
              nome: cfg.name,
              status: overview.latestResult?.wasAccumulated === false ? 'SAIU' : 'ABERTO',
              premio: overview.estimatedNextPrizeText,
              proximo: overview.nextDrawDateISO ? new Date(overview.nextDrawDateISO).toLocaleDateString('pt-BR') : '-',
              concurso: overview.latestResult?.contest,
              resultado: overview.latestResult?.numbers ?? [],
              data: overview.latestResult?.dateISO ? new Date(overview.latestResult.dateISO).toLocaleDateString('pt-BR') : '-',
              cor: cfg.hexColor,
              maxPrize,
              acumulou: overview.latestResult?.wasAccumulated,
            };
          } catch (e) {
            return {
              nome: cfg.name,
              status: 'ERRO',
              premio: '-',
              proximo: '-',
              concurso: '-',
              resultado: [],
              data: '-',
              cor: cfg.hexColor,
            };
          }
        })
      );
      setLoterias(results);
      setLastUpdate(Date.now());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#181c24' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
        {/* Header com botão de atualizar grande e explicação */}
        <View style={{ marginBottom: 16 }}>
          <GlassCard style={{ borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', padding: 18 }}>
            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 6 }}>🍀 Trevo Inteligente</Text>
              <Text style={{ color: '#e0ffe0', fontSize: 15, fontWeight: '500', marginBottom: 2 }}>Seu assistente pessoal de loterias</Text>
              <Text style={{ color: '#b2ffb2', fontSize: 13, marginBottom: 2 }}>
                Página atualizada {formatTimeAgo(lastUpdate)}
              </Text>
              <Pressable
                onPress={fetchAll}
                style={({ pressed }) => [{
                  backgroundColor: pressed ? '#20d361' : '#22c55e',
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  borderRadius: 14,
                  marginTop: 10,
                  marginBottom: 8,
                  alignItems: 'center',
                  shadowColor: '#22c55e',
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 10,
                }]}
                accessibilityRole="button"
                disabled={loading}
              >
                {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />}
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 }}>
                  🔄 Atualizar resultados
                </Text>
              </Pressable>
              <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 4 }}>
                Caso os resultados não carreguem, toque em "Atualizar resultados" acima.
              </Text>
              {error && (
                <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>
                  Não foi possível carregar os resultados. Tente novamente.
                </Text>
              )}
            </View>
          </GlassCard>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 18 }}>Loterias</Text>
          <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>Dados reais da Caixa</Text>
          <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>👇 Toque em um jogo para ver suas estatísticas</Text>
        </View>

        {/* Cards das Loterias */}
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={{ color: '#fff', fontSize: 18, marginTop: 12 }}>Carregando resultados...</Text>
          </View>
        ) : (
          loterias.filter(l => l.resultado && l.resultado.length > 0 && l.premio && l.premio !== '-').length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Nenhum resultado disponível</Text>
              <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>Tente atualizar novamente mais tarde.</Text>
            </View>
          ) : (
            loterias.filter(l => l.resultado && l.resultado.length > 0 && l.premio && l.premio !== '-').map((l, idx) => (
              <View
                key={l.nome}
                style={{
                  backgroundColor: '#232a38',
                  borderRadius: 22,
                  padding: 22,
                  marginBottom: 28,
                  borderLeftWidth: 8,
                  borderLeftColor: l.cor,
                  shadowColor: l.cor,
                  shadowOpacity: 0.18,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Award color={l.cor} size={32} style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 25, fontWeight: '900', color: l.cor }}>{l.nome}</Text>
                  {l.acumulou && (
                    <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', marginLeft: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#ef4444' }}>🔥 ACUMULOU</Text>
                    </View>
                  )}
                </View>
                {/* Próximo sorteio */}
                <View style={{ marginBottom: 10, marginTop: 8 }}>
                  <Text style={{ color: l.cor, fontSize: 18, fontWeight: 'bold' }}>📅 Próximo sorteio</Text>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 2 }}>{l.proximo}</Text>
                  <Text style={{ color: l.cor, fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>🏆 Prêmio Estimado</Text>
                  <Text style={{ color: l.cor, fontSize: 28, fontWeight: 'bold', marginBottom: 2 }}>{l.premio}</Text>
                </View>
                {/* Último sorteio */}
                <View style={{ marginBottom: 10, marginTop: 8, backgroundColor: '#1e293b', borderRadius: 10, padding: 10 }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>🎱 Último resultado</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>Concurso {l.concurso}</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>Data: <Text style={{ color: '#a3e635', fontWeight: 'bold' }}>{l.data}</Text></Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 }}>
                    {l.resultado.map((n) => (
                      <NumberBall key={n} value={n} size={44} />
                    ))}
                  </View>
                </View>
                {/* Faixa máxima de ganhadores */}
                {l.maxPrize && (
                  <View style={{ marginTop: 8, backgroundColor: 'rgba(32, 211, 97, 0.12)', borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                      {l.maxPrize.descricaoFaixa}:
                    </Text>
                    {l.maxPrize.numeroDeGanhadores > 0 ? (
                      <Text style={{ color: '#20d361', fontWeight: 'bold', fontSize: 15 }}>
                        {l.maxPrize.numeroDeGanhadores} ganhador(es)
                      </Text>
                    ) : (
                      <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 15 }}>
                        Sem ganhadores
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))
          )
        )}

        {/* Footer */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
          <Info size={16} color="#9ca3af" />
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#9ca3af', textAlign: 'center' }}>
            Este app apenas mostra informações. Você joga por sua conta e risco.
          </Text>
        </View>
      </ScrollView>

      {/* Banner AdMob fixo no rodapé */}
      {isAdEnabled && BannerAd && BannerAdSize && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#181c24', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 24 : 0 }}>
          <BannerAd
            unitId={getAdUnitId('banner')}
            size={BannerAdSize.ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdFailedToLoad={err => console.log('[AdMob] Banner error', err)}
          />
        </View>
      )}
    </View>
  );
}

export default HomeScreen;
