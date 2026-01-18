import { fetchCaixaLotteryOverview } from '@/src/megasena/lottery-caixa';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import { getUpcomingSpecialContests } from '@/src/megasena/special-contests';
import { Award, CalendarCheck, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

// ID do Intersticial fornecido
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-1873423099734846/2915395144';
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function EventosScreen() {
  const eventos = getUpcomingSpecialContests(10);
  const [overviews, setOverviews] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [erroCaixa, setErroCaixa] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    setErroCaixa(null);
    const result: Record<string, any> = {};
    try {
      for (const evento of eventos) {
        for (const lotId of evento.lotteries) {
          try {
            // Buscar overview normal
            const overview = await fetchCaixaLotteryOverview(lotId);
            // Buscar o sorteio exato do concurso especial (por data)
            let specialDraw = null;
            // Procurar o concurso mais próximo da data do evento
            if (evento.date) {
              // Buscar histórico dos últimos 40 concursos para encontrar o mais próximo da data
              const history = await import('@/src/megasena/lottery-caixa').then(m => m.loadCaixaLotteryHistoryLite(lotId, { lastN: 40 }));
              const targetDate = evento.date.toISOString().slice(0, 10);
              // Filtrar apenas sorteios até a data do evento (não pegar futuros)
              const beforeOrEqual = history.filter(draw => draw.dateISO <= targetDate);
              // Pega o sorteio de data exata, se existir, senão o mais próximo ANTES
              specialDraw = beforeOrEqual.find(draw => draw.dateISO === targetDate);
              if (!specialDraw && beforeOrEqual.length > 0) {
                // Ordena por data decrescente e pega o mais próximo antes
                beforeOrEqual.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
                specialDraw = beforeOrEqual[0];
              }
            }
            result[lotId] = { ...overview, specialDraw };
          } catch {
            setErroCaixa('Não foi possível carregar os dados da Caixa. Tente novamente mais tarde.');
          }
        }
      }
      setOverviews(result);
    } catch {
      setErroCaixa('Não foi possível carregar os dados da Caixa. Tente novamente mais tarde.');
    }
    setLoading(false);
  }

  useEffect(() => {
    // 1. Ouvinte para mostrar o anúncio assim que carregar
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      try {
        interstitial.show();
      } catch (e) {
        console.log("Erro ao mostrar intersticial:", e);
      }
    });

    // 2. Ouvinte de erro para não travar o app se o anúncio falhar
    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log("AdMob Interstitial Error:", error);
    });

    // 3. Inicia o carregamento do anúncio
    interstitial.load();

    // 4. Carrega os dados da Caixa
    fetchAll();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatDataExtenso(date: Date) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function formatDataCurta(date: Date) {
    return date.toLocaleDateString('pt-BR');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#181c24' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Star color="#20d361" size={38} style={{ marginRight: 14 }} accessibilityLabel="Ícone de estrela" />
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff' }}>Eventos Especiais</Text>
      </View>
      <Text style={{ fontSize: 18, color: '#20d361', marginBottom: 10, fontWeight: 'bold' }}>
        Todos os dados e resultados são retirados do site oficial da Caixa Econômica Federal. As datas dos sorteios são estimativas, podendo sofrer alterações pela Caixa. Consulte sempre o site oficial para confirmação.
      </Text>
      <Text style={{ fontSize: 16, color: '#fff', marginBottom: 22 }}>
        Veja abaixo os principais concursos especiais do ano, com informações detalhadas e valores reais divulgados pela Caixa.
      </Text>
      {loading && (
        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <ActivityIndicator size="large" color="#20d361" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Carregando dados reais da Caixa…</Text>
        </View>
      )}
      {erroCaixa && !loading && (
        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <Text style={{ color: '#ff5252', fontSize: 16, marginBottom: 10, textAlign: 'center' }}>{erroCaixa}</Text>
          <Text style={{ color: '#fff', fontSize: 15, marginBottom: 10, textAlign: 'center' }}>
            Verifique sua conexão com a internet ou tente novamente em alguns minutos.
          </Text>
          <View style={{ backgroundColor: '#20d361', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 }}>
            <Text style={{ color: '#001a17', fontWeight: 'bold', fontSize: 16 }} onPress={fetchAll}>
              Tentar novamente
            </Text>
          </View>
        </View>
      )}
      {eventos.map((evento) => (
        evento.lotteries.map((lotId) => {
          const config = getLotteryConfig(lotId);
          const overview = overviews[lotId];
          let tituloCard = '';
          if (evento.name.toLowerCase().includes('mega')) {
            tituloCard = 'Mega-Sena da ' + evento.name.replace('Mega da', '').replace('Mega Especial', 'Especial');
          } else if (evento.name.toLowerCase().includes('quina')) {
            tituloCard = 'Quina de ' + evento.name.replace('Quina de', '');
          } else if (evento.name.toLowerCase().includes('lotofácil')) {
            tituloCard = 'Lotofácil da ' + evento.name.replace('Lotofácil da', '').replace('Lotofácil do', '');
          } else if (evento.name.toLowerCase().includes('dupla')) {
            tituloCard = 'Dupla Sena do ' + evento.name.replace('Dupla Sena do', '');
          } else {
            tituloCard = evento.name + ' ' + config.name;
          }
          return (
            <View key={evento.name + lotId} style={{
              backgroundColor: '#232a38',
              borderRadius: 22,
              padding: 26,
              marginBottom: 28,
              borderLeftWidth: 8,
              borderLeftColor: config.hexColor,
              shadowColor: config.hexColor,
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 6,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Award color={config.hexColor} size={32} style={{ marginRight: 10 }} accessibilityLabel="Ícone de prêmio" />
                <Text style={{ fontSize: 25, fontWeight: '900', color: config.hexColor }}>{tituloCard}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <CalendarCheck color="#20d361" size={22} style={{ marginRight: 8 }} accessibilityLabel="Ícone de calendário" />
                <Text style={{ fontSize: 17, color: '#20d361', fontWeight: 'bold' }}>
                  {formatDataExtenso(evento.date)}
                  <Text style={{ color: '#b0b0b0', fontWeight: 'normal', fontSize: 15 }}>  ({formatDataCurta(evento.date)})</Text>
                  <Text style={{ color: '#20d361' }}> (data estimada)</Text>
                </Text>
              </View>
              <Text style={{ fontSize: 17, color: '#fff', marginBottom: 10 }}>{evento.description}</Text>
              {overview ? (
                <>
                  <Text style={{ fontSize: 17, color: '#fff', marginBottom: 2 }}>
                    Concurso: <Text style={{ color: config.hexColor, fontWeight: 'bold', fontSize: 18 }}>#{overview.nextContest}</Text>
                  </Text>
                  <Text style={{ fontSize: 17, color: '#fff', marginBottom: 2 }}>
                    Data do sorteio: <Text style={{ color: '#20d361', fontWeight: 'bold' }}>{overview.nextDrawDateISO ? formatDataExtenso(new Date(overview.nextDrawDateISO)) : '-'}</Text>
                  </Text>
                  {overview.estimatedNextPrizeText && overview.estimatedNextPrizeValue ? (
                    <View style={{
                      backgroundColor: '#fffbe6',
                      borderRadius: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      marginVertical: 8,
                      alignSelf: 'stretch',
                      borderWidth: 2,
                      borderColor: '#ffd700',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      justifyContent: 'center',
                      maxWidth: '100%',
                    }}>
                      <Star color="#ffd700" size={22} style={{ marginRight: 6 }} accessibilityLabel="Ícone de prêmio estimado" />
                      <Text style={{ color: '#b8860b', fontWeight: 'bold', fontSize: 18, textAlign: 'center', flexShrink: 1 }} numberOfLines={2}>
                        Prêmio estimado: {overview.estimatedNextPrizeText}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 16, marginBottom: 2 }}>
                      Prêmio estimado: Não disponível no momento. Consulte o site da Caixa para mais informações.
                    </Text>
                  )}
                  {/* Linha divisória entre concurso atual e último sorteio */}
                  <View style={{ height: 1, backgroundColor: '#444', marginVertical: 14, opacity: 0.7, borderRadius: 1 }} />
                  {overview.specialDraw ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ fontSize: 17, color: '#fff', fontWeight: 'bold', marginBottom: 2 }}>
                        Último sorteio:
                      </Text>
                      <Text style={{ fontSize: 16, color: '#20d361', marginBottom: 2 }}>
                        Concurso {overview.specialDraw.contest} ({overview.specialDraw.dateISO ? formatDataExtenso(new Date(overview.specialDraw.dateISO)) : '-'})
                      </Text>
                      <Text style={{ fontSize: 15, color: '#b0b0b0', marginBottom: 2 }}>
                        Data: {overview.specialDraw.dateISO ? formatDataCurta(new Date(overview.specialDraw.dateISO)) : '-'}
                      </Text>
                      <Text style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>
                        Números sorteados: <Text style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 17 }}>{overview.specialDraw.numbers?.join(', ')}</Text>
                      </Text>
                      {overview.specialDraw.totalCollected && (
                        <Text style={{ fontSize: 15, color: '#20d361', marginBottom: 2 }}>
                          Valor arrecadado: <Text style={{ fontWeight: 'bold' }}>R$ {overview.specialDraw.totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                        </Text>
                      )}
                      {overview.specialDraw.prizeBreakdown?.length ? (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 2 }}>
                            Faixas de premiação:
                          </Text>
                          {overview.specialDraw.prizeBreakdown.map((faixa, idx) => (
                            <Text key={idx} style={{ fontSize: 15, color: '#fff', marginBottom: 2 }}>
                              {faixa.descricaoFaixa}: <Text style={{ color: '#20d361', fontWeight: 'bold' }}>{faixa.numeroDeGanhadores}</Text> ganhador(es) - <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>R$ {faixa.valorPremio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                            </Text>
                          ))}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 15, color: '#fff', marginBottom: 2 }}>Sem informações de faixas.</Text>
                      )}
                      {overview.specialDraw.wasAccumulated === false && (
                        <Text style={{ fontSize: 15, color: '#ff5252', marginTop: 4 }}>
                          Este concurso não acumula. Prêmio distribuído integralmente!
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 15, marginBottom: 2 }}>Buscando dados reais…</Text>
                  )}
                  {/* Botão removido conforme solicitado */}
                </>
              ) : (
                <Text style={{ color: '#fff', fontSize: 15, marginBottom: 2 }}>Buscando dados reais…</Text>
              )}
              <Text style={{ fontSize: 15, color: '#fff', marginTop: 8 }}>
                Estratégia recomendada (baseada em dados históricos e informações públicas da Caixa): <Text style={{ color: '#20d361' }}>{evento.suggestedStrategy}</Text>
              </Text>
              <Text style={{ fontSize: 15, color: '#ff5252', marginTop: 4 }}>
                Este concurso especial não acumula. O prêmio principal será sempre distribuído para a maior faixa de acerto.
              </Text>
            </View>
          );
        })
      ))}
    </ScrollView>
  );
}
