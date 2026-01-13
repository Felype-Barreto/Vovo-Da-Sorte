import { GlassCard } from '@/src/components/GlassCard';
import { NumberBall } from '@/src/components/NumberBall';
import { useConsent } from '@/src/context/ConsentContext';
import { useOnboarding } from '@/src/context/OnboardingContext';
import { ensureMegaSenaDbUpToDate, getMegaSenaLatestDrawFromDb } from '@/src/megasena/sqlite';
import type { MegaSenaDraw } from '@/src/megasena/types';
import { router } from 'expo-router';
import { BarChart3, Info, QrCode, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

/**
 * Tela de Bem-vindo
 * Aparece apenas na primeira abertura do app
 * Mostra o último sorteio da Mega-Sena em destaque
 */

export default function WelcomeScreen() {
  const { completeOnboarding } = useOnboarding();
  const { consentGiven } = useConsent();
  const [latestDraw, setLatestDraw] = useState<MegaSenaDraw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await ensureMegaSenaDbUpToDate();
        const draw = await getMegaSenaLatestDrawFromDb();
        if (alive) {
          setLatestDraw(draw);
        }
      } catch (err) {
        console.error('Erro ao carregar último sorteio:', err);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleGetStarted = async () => {
    // Se ainda não deu consentimento, mostrar tela de consentimento
    if (consentGiven === null) {
      router.push('/consent');
      return;
    }
    
    // Caso contrário, completar onboarding e ir para o app
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const formattedDate = latestDraw
    ? new Date(latestDraw.dateISO).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Carregando...';

  const numbers = latestDraw?.numbers ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#181c24' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 40,
          gap: 24,
          justifyContent: 'space-between',
        }}>
        {/* Header */}
        <View style={{ gap: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '300', color: 'rgba(255,255,255,0.70)' }}>Bem-vindo ao</Text>
          <Text style={{ fontSize: 42, fontWeight: '900', color: '#ffffff', lineHeight: 52 }}>
            Vovô da Sorte
          </Text>
          <Image source={require('../assets/images/logo-horizontal.png')} style={{ width: 220, height: 80, resizeMode: 'contain', marginBottom: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: '500', color: 'rgba(255,255,255,0.78)', lineHeight: 26, textAlign: 'center' }}>
            Confira resultados, veja estatísticas e receba dicas do Vovô para apostar melhor!
          </Text>
        </View>

        {/* Último Sorteio (Destaque) */}
        <GlassCard style={{ borderRadius: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.78)' }}>
            Último Sorteio da Mega-Sena
          </Text>

          {loading ? (
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>Buscando números...</Text>
          ) : latestDraw ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
                {numbers.map((n) => (
                  <NumberBall key={n} value={n} />
                ))}
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
                {formattedDate}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 16, color: '#20d361', textAlign: 'center' }}>Não foi possível carregar. Tente depois.</Text>
          )}
        </GlassCard>

        {/* Features Preview */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff' }}>
            O que você pode fazer:
          </Text>

          {[
            {
              Icon: BarChart3,
              title: 'Ver Padrões',
              desc: 'Descubra quais números saem com frequência',
            },
            {
              Icon: QrCode,
              title: 'Escanear Bilhetes',
              desc: 'Aponte para o código do bilhete e veja os acertos',
            },
            {
              Icon: Users,
              title: 'Bolões com Amigos',
              desc: 'Jogue junto e divida o prêmio com justiça',
            },
          ].map((feature, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <feature.Icon size={26} color="#20d361" />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff' }}>{feature.title}</Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.75)' }}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={handleGetStarted}
          android_ripple={{ color: '#e5e7eb' }}
          style={({ pressed }) => [{
            backgroundColor: '#20d361',
            borderRadius: 16,
            minHeight: 56,
            justifyContent: 'center',
            alignItems: 'center',
          }, pressed && { opacity: 0.85 }]}
        >
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#001a17' }}>Comecar Agora</Text>
        </Pressable>

        {/* Footer Text */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Info size={16} color="#9ca3af" />
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#9ca3af', textAlign: 'center' }}>
            Este app apenas mostra informações. Você joga por sua conta e risco.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
