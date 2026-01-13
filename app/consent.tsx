import { gatherUmpConsentIfAvailable } from '@/src/ads/umpConsent';
import { useConsent } from '@/src/context/ConsentContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

/**
 * 🔒 Tela de Consentimento Obrigatório
 * 
 * Exibida na primeira vez que o usuário abre o app.
 * Explica claramente:
 * - Por que precisamos do consentimento
 * - O que fazemos com os dados
 * - Como a publicidade funciona
 * - Direitos do usuário (LGPD/GDPR)
 */

export default function ConsentScreen() {
  const router = useRouter();
  const { setConsentGiven, setAdsConsent, setAdsPersonalizedConsent, setAnalyticsConsent } = useConsent();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      
      // 1. Marcar consentimento geral
      await setConsentGiven(true);
      await setAnalyticsConsent(true);
      await setAdsConsent(true);

      // 2. Mostrar formulário UMP (Google) para escolher personalização
      const umpResult = await gatherUmpConsentIfAvailable({
        debugGeography: __DEV__ ? 'EEA' : undefined,
        testDeviceIdentifiers: __DEV__ ? ['TEST_DEVICE_ID'] : undefined,
      });

      if (umpResult) {
        await setAdsPersonalizedConsent(umpResult.personalisedAdsAllowed);
        console.log('[Consent] UMP concluído:', umpResult);
      } else {
        // Sem UMP disponível, permitir anúncios não personalizados
        await setAdsPersonalizedConsent(false);
        console.log('[Consent] UMP não disponível, usando anúncios não personalizados');
      }

      // 3. Navegar para o app principal
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[Consent] Erro ao aceitar:', error);
      // Mesmo com erro, prosseguir para o app
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setLoading(true);
      
      // Marcar que o usuário recusou
      await setConsentGiven(false);
      await setAnalyticsConsent(false);
      await setAdsConsent(false);
      await setAdsPersonalizedConsent(false);

      // Voltar para a tela de boas-vindas
      router.replace('/welcome');
    } catch (error) {
      console.error('[Consent] Erro ao recusar:', error);
      router.replace('/welcome');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#20d361" />
        <Text style={{ marginTop: 16, fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
          Processando seu consentimento...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255,255,255,0.1)', 
        backgroundColor: 'rgba(0,0,0,0.3)', 
        paddingHorizontal: 16, 
        paddingVertical: 16 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <FontAwesome name="shield" size={24} color="#20d361" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
            Privacidade e Consentimento
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Introdução Amigável */}
        <View style={{ backgroundColor: 'rgba(32, 211, 97, 0.1)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(32, 211, 97, 0.3)' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#20d361', marginBottom: 12 }}>
            👴 Bem-vindo ao Vovô da Sorte!
          </Text>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22 }}>
            Antes de começar, precisamos do seu consentimento para algumas coisas importantes. Leia com calma e escolha o que é melhor para você.
          </Text>
        </View>

        {/* Seção: O que fazemos */}
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>
            📱 O que este app faz:
          </Text>
          <View style={{ gap: 10, paddingLeft: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Mostra resultados históricos de loterias (Mega-Sena, Quina, etc.)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Gera combinações de números baseadas em estatísticas
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Permite que você salve seus jogos e acompanhe resultados
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Exibe anúncios para manter o app gratuito
            </Text>
          </View>
        </View>

        {/* Seção: Dados e Privacidade */}
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>
            🔒 Seus dados e privacidade:
          </Text>
          <View style={{ gap: 10, paddingLeft: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Seus jogos salvos ficam apenas no seu celular
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Não coletamos dados pessoais sensíveis (CPF, telefone, etc.)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Usamos estatísticas anônimas para melhorar o app
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Você pode excluir seus dados a qualquer momento
            </Text>
          </View>
        </View>

        {/* Seção: Publicidade */}
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>
            💰 Como a publicidade funciona:
          </Text>
          <View style={{ gap: 10, paddingLeft: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Mostramos anúncios fixos no rodapé (sem pop-ups intrusivos)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Parceiros publicitários (Google AdMob) podem mostrar anúncios
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Você pode escolher se quer anúncios personalizados ou genéricos
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • A publicidade mantém o app 100% gratuito para você
            </Text>
          </View>
        </View>

        {/* Seção: Seus Direitos */}
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>
            ⚖️ Seus direitos (LGPD/GDPR):
          </Text>
          <View style={{ gap: 10, paddingLeft: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Você pode mudar suas preferências a qualquer momento
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Você pode solicitar exclusão de todos os seus dados
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Você tem direito de saber quais dados coletamos
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Você pode usar o app sem aceitar (mas sem anúncios personalizados)
            </Text>
          </View>
        </View>

        {/* Link para Termos e Política */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <Pressable
            onPress={() => router.push('/termos-uso')}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              { 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                backgroundColor: 'rgba(255,255,255,0.08)', 
                borderRadius: 12, 
                paddingVertical: 12, 
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)'
              },
              pressed && { opacity: 0.7 }
            ]}
          >
            <FontAwesome name="file-text-o" size={18} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
              Ler Termos de Uso completos
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/privacy-policy')}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              { 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                backgroundColor: 'rgba(255,255,255,0.08)', 
                borderRadius: 12, 
                paddingVertical: 12, 
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)'
              },
              pressed && { opacity: 0.7 }
            ]}
          >
            <FontAwesome name="shield" size={18} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
              Ler Política de Privacidade completa
            </Text>
          </Pressable>
        </View>

        {/* Espaçamento para os botões fixos */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Botões de Ação - Fixos no rodapé */}
      <View style={{ 
        borderTopWidth: 1, 
        borderTopColor: 'rgba(255,255,255,0.1)', 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        paddingHorizontal: 20, 
        paddingVertical: 16,
        gap: 12
      }}>
        {/* Botão Aceitar - Destaque */}
        <Pressable
          onPress={handleAccept}
          android_ripple={{ color: '#e5e7eb' }}
          style={({ pressed }) => [
            { 
              backgroundColor: '#20d361', 
              borderRadius: 14, 
              paddingVertical: 16, 
              alignItems: 'center', 
              justifyContent: 'center',
              shadowColor: '#20d361',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            },
            pressed && { opacity: 0.85 }
          ]}
        >
          <Text style={{ fontWeight: 'bold', color: '#001a17', fontSize: 17 }}>
            ✓ Aceitar e Continuar
          </Text>
        </Pressable>

        {/* Botão Recusar - Menor destaque */}
        <Pressable
          onPress={handleDecline}
          android_ripple={{ color: '#e5e7eb' }}
          style={({ pressed }) => [
            { 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: 14, 
              paddingVertical: 12, 
              alignItems: 'center', 
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)'
            },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Text style={{ fontWeight: '600', color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
            Recusar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
