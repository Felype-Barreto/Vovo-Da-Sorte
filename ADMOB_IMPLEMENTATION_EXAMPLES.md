# 🎬 Exemplo Prático: Integração em Telas Reais

## 🏠 Exemplo 1: Home Screen com Banner

**Arquivo**: `app/(tabs)/index.tsx`

```tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { AdBanner } from '@/src/components/AdBanner';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>🎰 Trevo Inteligente</Text>
        
        <Text style={styles.subtitle}>Bem-vindo ao melhor app de loterias</Text>
        
        {/* Seu conteúdo aqui */}
        <View style={styles.card}>
          <Text style={styles.cardText}>Próximo sorteio em 2 dias</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>Você tem 5 jogos salvos</Text>
        </View>
      </ScrollView>

      {/* Banner de Anúncio - Rodapé */}
      {/* 
        ✅ Só aparece se:
        - isAdEnabled = true
        - consentGiven = true
        - adsConsent = true
      */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#047857',
  },

  cardText: {
    fontSize: 16,
    color: '#1F2937',
  },
});
```

---

## 🔒 Exemplo 2: Feature Premium com Reward Ad

**Arquivo**: `app/(tabs)/simulador.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardedAdModal } from '@/src/components/RewardedAdModal';

const UNLOCK_KEY = 'advancedSimulator_unlockedUntil';

export default function SimuladorScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Verificar se feature está desbloqueada
   */
  const checkUnlockStatus = async () => {
    try {
      const unlocked = await AsyncStorage.getItem(UNLOCK_KEY);
      if (unlocked) {
        const unlockedDate = new Date(unlocked);
        if (unlockedDate > new Date()) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
          await AsyncStorage.removeItem(UNLOCK_KEY);
        }
      } else {
        setIsUnlocked(false);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcular tempo restante
   */
  useEffect(() => {
    if (!isUnlocked) return;

    const interval = setInterval(async () => {
      const unlocked = await AsyncStorage.getItem(UNLOCK_KEY);
      if (unlocked) {
        const unlockedDate = new Date(unlocked);
        const now = new Date();
        const diff = unlockedDate.getTime() - now.getTime();

        if (diff <= 0) {
          setIsUnlocked(false);
          setTimeRemaining('');
          clearInterval(interval);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked]);

  /**
   * Carregar status ao montar
   */
  useEffect(() => {
    checkUnlockStatus();
  }, []);

  /**
   * Usuário ganhou a recompensa
   */
  const handleRewardEarned = async () => {
    try {
      const unlockedUntil = new Date();
      unlockedUntil.setHours(unlockedUntil.getHours() + 24);

      await AsyncStorage.setItem(
        UNLOCK_KEY,
        unlockedUntil.toISOString()
      );

      setIsUnlocked(true);
      console.log('✅ Simulador Avançado desbloqueado por 24h!');
    } catch (error) {
      console.error('Erro ao desbloquear:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Status */}
        <View
          style={[
            styles.statusBox,
            isUnlocked
              ? styles.unlockedStatus
              : styles.lockedStatus,
          ]}
        >
          <Text style={styles.statusIcon}>
            {isUnlocked ? '🔓' : '🔒'}
          </Text>
          <Text style={styles.statusTitle}>
            {isUnlocked
              ? 'Simulador Avançado Desbloqueado'
              : 'Simulador Avançado'}
          </Text>
          {isUnlocked && (
            <Text style={styles.statusTime}>
              Acesso por: {timeRemaining}
            </Text>
          )}
        </View>

        {/* Conteúdo */}
        {isUnlocked ? (
          <>
            {/* Conteúdo Premium */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Análise Avançada</Text>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Próximos Números Prováveis</Text>
                <Text style={styles.resultValue}>15, 23, 42, 56, 61, 2</Text>
                <Text style={styles.resultDetail}>
                  Confiança: 87.3%
                </Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Padrão Detectado</Text>
                <Text style={styles.resultValue}>Padrão Ascendente</Text>
                <Text style={styles.resultDetail}>
                  Números pares: +12% frequência
                </Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Recomendação</Text>
                <Text style={styles.resultValue}>
                  Jogo Otimizado
                </Text>
                <Text style={styles.resultDetail}>
                  Baseado em análise de 500 sorteios
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Conteúdo Bloqueado */}
            <View style={styles.lockedContent}>
              <Text style={styles.lockedIcon}>👁️</Text>
              <Text style={styles.lockedText}>
                Acesso ao Simulador Avançado bloqueado
              </Text>
              <Text style={styles.lockedSubtext}>
                Clique em "Desbloquear" para ganhar acesso por 24h
              </Text>
            </View>

            {/* Feature Preview */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>O que você vai ganhar:</Text>
              <Text style={styles.previewItem}>✅ Análise avançada</Text>
              <Text style={styles.previewItem}>✅ Previsão de padrões</Text>
              <Text style={styles.previewItem}>✅ Números mais prováveis</Text>
              <Text style={styles.previewItem}>✅ Por 24 horas</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Botão de Desbloqueio */}
      {!isUnlocked && (
        <Pressable
          style={styles.unlockButton}
          onPress={() => setShowRewardModal(true)}
        >
          <Text style={styles.unlockButtonText}>
            🎬 Desbloquear com Vídeo
          </Text>
        </Pressable>
      )}

      {/* Modal de Reward Ad */}
      <RewardedAdModal
        visible={showRewardModal}
        title="🎬 Simulador Avançado"
        description="Assista um vídeo curto para desbloquear"
        rewardText="Acesso por 24h"
        onDismiss={() => setShowRewardModal(false)}
        onReward={handleRewardEarned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusBox: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  unlockedStatus: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#047857',
  },

  lockedStatus: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },

  statusIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  statusTime: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },

  resultCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#047857',
  },

  resultLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },

  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },

  resultDetail: {
    fontSize: 12,
    color: '#6B7280',
  },

  lockedContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  lockedIcon: {
    fontSize: 64,
    marginBottom: 12,
  },

  lockedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },

  lockedSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  previewCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#047857',
  },

  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
  },

  previewItem: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },

  unlockButton: {
    backgroundColor: '#047857',
    paddingVertical: 14,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

---

## 📊 Exemplo 3: Hook useRewardedAd

**Arquivo**: `app/(tabs)/investigacao.tsx` (ou qualquer tela)

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRewardedAd } from '@/src/components/useRewardedAd';

export default function InvestigacaoScreen() {
  const { showRewardedAd, isLoading, canShowAd } = useRewardedAd();

  const handleUnlockReport = async () => {
    if (!canShowAd) {
      console.log('Anúncio não disponível');
      return;
    }

    // Mostrar anúncio
    const earned = await showRewardedAd();

    if (earned) {
      // Usuário completou o vídeo!
      console.log('✅ Relatório desbloqueado!');
      // Salvar em AsyncStorage, etc.
    } else {
      // Usuário fechou antes de completar
      console.log('❌ Vídeo não foi completado');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Relatório Completo</Text>

      <Pressable
        style={[
          styles.button,
          (!canShowAd || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleUnlockReport}
        disabled={!canShowAd || isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '⏳ Carregando...' : '🎬 Gerar Relatório'}
        </Text>
      </Pressable>

      {!canShowAd && (
        <Text style={styles.errorText}>
          Anúncio não disponível (sem consentimento ou feature flag)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#047857',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },

  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
  },
});
```

---

## 🎯 Padrão Recomendado

### ✅ FAÇA:
```tsx
// Banner em TODA tela que tem ScrollView
<View style={{ flex: 1 }}>
  <ScrollView>{/* conteúdo */}</ScrollView>
  <AdBanner /> {/* Rodapé */}
</View>
```

### ✅ Reward Ad para Features Premium:
```tsx
const [showReward, setShowReward] = useState(false);

// Botão
<Pressable onPress={() => setShowReward(true)}>
  <Text>Desbloquear Feature</Text>
</Pressable>

// Modal
<RewardedAdModal
  visible={showReward}
  onDismiss={() => setShowReward(false)}
  onReward={() => unlockFeatureFor24h()}
/>
```

### ❌ EVITE:
```tsx
// Não use intersticiais (intrusivos)
// Não use múltiplos banners
// Não use anúncios com som
// Não interrompa o fluxo do usuário
```

---

## 🧪 Testes Práticos

### Teste 1: Banner Visibility
```
1. Abra Home Screen
2. Scroll down
3. ❌ Banner NOT visible (isAdEnabled = false)
4. Depois mude isAdEnabled = true
5. ✅ Banner visible
```

### Teste 2: Reward Ad Flow
```
1. Vá para Simulador Screen
2. Clique "Desbloquear"
3. Modal aparece
4. Clique "Assista"
5. ✅ Anúncio mostra (test ad)
6. Clique X para fechar
7. ✅ Feature desbloqueada por 24h
8. Reload → timer continua contando
```

### Teste 3: Sem Consentimento
```
1. Limpe AsyncStorage
2. Aceite APENAS "Necessário"
3. Vá para Simulador
4. Clique "Desbloquear"
5. ✅ Modal mostra "Consentimento Necessário"
6. Não pode desbloquear
```

---

**Data**: 6 de Janeiro de 2026
**Status**: ✅ EXEMPLOS PRONTOS PARA COPIAR
