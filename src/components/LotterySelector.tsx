import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View as RNView } from 'react-native';

import { Text } from '@/components/Themed';
import { NumberBall } from '@/src/components/NumberBall';
import type { CaixaLotteryOverview } from '@/src/megasena/lottery-caixa';
import { getLotteryConfig } from '@/src/megasena/lotteryConfigs';
import type { LotteryType } from '@/src/megasena/types';

function formatDatePtBr(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

interface LotterySelectorProps {
  selected: LotteryType;
  onSelect: (lottery: LotteryType) => void;
  availableLotteries: LotteryType[];
  overviews?: Partial<Record<LotteryType, CaixaLotteryOverview>>;
}

export function LotterySelector({ selected, onSelect, availableLotteries, overviews }: LotterySelectorProps) {
  return (
    <RNView style={{ gap: 20 }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 24 }}>
        👇 Toque em um jogo para ver suas estatísticas
      </Text>
      {availableLotteries.map((lotteryId) => {
        const config = getLotteryConfig(lotteryId);
        const isSelected = lotteryId === selected;
        const overview = overviews?.[lotteryId];
        const latest = overview?.latestResult;
        // Maior faixa de acerto (ex: 6 para Mega, 15 para Lotofácil, etc)
        const maxFaixa = latest?.prizeBreakdown?.[0];
        const acumulou = latest?.wasAccumulated;

        return (
          <Pressable
            key={lotteryId}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar ${config.name}`}
            accessibilityHint="Toque para ver estatísticas detalhadas"
            onPress={() => onSelect(lotteryId)}
            android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            style={({ pressed }) => ({
              minHeight: 140,
              borderRadius: 20,
              borderWidth: isSelected ? 3 : 2,
              borderColor: isSelected ? config.hexColor : 'rgba(255,255,255,0.2)',
              backgroundColor: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
              opacity: pressed ? 0.85 : 1,
              marginVertical: 4,
              shadowColor: config.hexColor,
              shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
              shadowOpacity: isSelected ? 0.3 : 0.1,
              shadowRadius: isSelected ? 8 : 4,
              elevation: isSelected ? 6 : 3,
            })}
          >
            {/* Barra colorida superior mais grossa */}
            <RNView style={{ height: 8, backgroundColor: config.hexColor, borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
            {/* Foguinho acumulou */}
            {acumulou && (
              <RNView style={{ position: 'absolute', top: 10, right: 18, flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
                <MaterialCommunityIcons name="fire" size={22} color="#ff5252" style={{ marginRight: 2 }} />
                <Text style={{ color: '#ff5252', fontWeight: '900', fontSize: 13 }}>ACUMULOU</Text>
              </RNView>
            )}
            <RNView style={{ padding: 20, gap: 12 }}>
              {/* Nome do jogo - MUITO maior e mais destacado */}
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 }}>
                  {config.name}
                </Text>
                {/* Removido destaque 'ABERTO' para não confundir o usuário */}
              </RNView>

              {/* Estimativa do prêmio - DESTAQUE MÁXIMO */}
              <RNView style={{ 
                backgroundColor: 'rgba(32, 211, 97, 0.15)', 
                padding: 14, 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(32, 211, 97, 0.3)'
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
                  💰 Prêmio Estimado:
                </Text>
                <Text style={{ fontSize: 26, fontWeight: '900', color: '#20d361', letterSpacing: 0.5 }}>
                  {overview?.estimatedNextPrizeText || 'Carregando...'}
                </Text>
              </RNView>

              {/* Próximo sorteio - linha clara e legível */}
              <RNView style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: 12,
                borderRadius: 10,
                gap: 8
              }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>
                  📅 Próximo sorteio:
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff' }}>
                  {formatDatePtBr(overview?.nextDrawDateISO)}
                </Text>
              </RNView>

              {/* Último resultado - mais espaçoso */}
              {latest?.numbers?.length ? (
                <RNView style={{ gap: 8, marginTop: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>
                    🎱 Último resultado (Concurso {latest.contest}):
                  </Text>
                  <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    {latest.numbers.map((n) => (
                      <NumberBall key={n} value={n} size={32} textColor="#0b1220" />
                    ))}
                  </RNView>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                    Data: {formatDatePtBr(latest.dateISO)}
                  </Text>
                  {/* Maior acerto possível e ganhadores */}
                  {maxFaixa && (
                    <RNView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff', marginRight: 6 }}>
                        {maxFaixa.descricaoFaixa}
                      </Text>
                      {maxFaixa.numeroDeGanhadores === 0 ? (
                        <Text style={{ color: '#ff5252', fontWeight: '900', fontSize: 14 }}>Sem ganhadores</Text>
                      ) : (
                        <Text style={{ color: '#20d361', fontWeight: '900', fontSize: 14 }}>{maxFaixa.numeroDeGanhadores} ganhador(es)</Text>
                      )}
                    </RNView>
                  )}
                </RNView>
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                  Aguardando resultado...
                </Text>
              )}

              {/* Indicação para tocar - mais visível */}
              {!isSelected && (
                <RNView style={{ 
                  marginTop: 8,
                  padding: 10,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)'
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '700', 
                    color: config.hexColor,
                    textAlign: 'center' 
                  }}>
                    👆 Toque aqui para ver estatísticas completas
                  </Text>
                </RNView>
              )}
            </RNView>
          </Pressable>
        );
      })}
    </RNView>
  );
}
