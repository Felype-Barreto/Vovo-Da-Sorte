/**
 * Exemplo de Uso: Componente com Reward Ad
 * 
 * Este arquivo mostra como integrar RewardedAdModal em um componente real
 * 
 * USE CASE: Usuário quer acessar "Análise Avançada"
 * 1. Clica no botão "Análise Avançada"
 * 2. Modal aparece: "Assista um vídeo para desbloquear"
 * 3. Usuário assiste o vídeo
 * 4. Ganha 24h de acesso
 * 5. Feature desbloqueada
 */

import { RewardedAdModal } from '@/src/components/RewardedAdModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface AdvancedAnalysisProps {
  /**
   * Chave do AsyncStorage para rastrear desbloqueio
   * Exemplo: 'advancedAnalysis_unlockedUntil'
   */
  unlockKey?: string;
}

/**
 * Componente de Análise Avançada
 * 
 * Mostra:
 * - Se está desbloqueado
 * - Tempo restante de desbloqueio
 * - Botão para desbloquear com Reward Ad
 */
export const AdvancedAnalysisComponent: React.FC<AdvancedAnalysisProps> = ({
  unlockKey = 'advancedAnalysis_unlockedUntil',
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockedUntil, setUnlockedUntil] = useState<Date | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  /**
   * Carregar status de desbloqueio do AsyncStorage
   */
  const checkUnlockStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(unlockKey);
      if (stored) {
        const unlockedDate = new Date(stored);
        const now = new Date();

        if (unlockedDate > now) {
          setIsUnlocked(true);
          setUnlockedUntil(unlockedDate);
        } else {
          // Expirou
          setIsUnlocked(false);
          setUnlockedUntil(null);
          await AsyncStorage.removeItem(unlockKey);
        }
      }
    } catch (error) {
      console.error('[AdvancedAnalysis] Erro ao carregar status:', error);
    }
  };

  /**
   * Calcular tempo restante de desbloqueio
   */
  useEffect(() => {
    if (!isUnlocked || !unlockedUntil) {
      setTimeRemaining('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = unlockedUntil.getTime() - now.getTime();

      if (diff <= 0) {
        setIsUnlocked(false);
        setUnlockedUntil(null);
        setTimeRemaining('');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked, unlockedUntil]);

  /**
   * Carregar status ao montar
   */
  useEffect(() => {
    checkUnlockStatus();
  }, []);

  /**
   * Quando usuário ganha recompensa
   */
  const handleRewardEarned = async () => {
    try {
      // Desbloquear por 24 horas
      const unlockedUntilTime = new Date();
      unlockedUntilTime.setHours(unlockedUntilTime.getHours() + 24);

      await AsyncStorage.setItem(
        unlockKey,
        unlockedUntilTime.toISOString()
      );

      setIsUnlocked(true);
      setUnlockedUntil(unlockedUntilTime);

      console.log('[AdvancedAnalysis] Desbloqueado por 24h');
    } catch (error) {
      console.error('[AdvancedAnalysis] Erro ao desbloquear:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Status de Desbloqueio */}
      <View
        style={[
          styles.statusBox,
          isUnlocked ? styles.unlockedStatus : styles.lockedStatus,
        ]}
      >
        {isUnlocked ? (
          <>
            <Text style={styles.statusIcon}>🔓</Text>
            <Text style={styles.statusTitle}>Análise Avançada Desbloqueada</Text>
            <Text style={styles.statusTime}>
              Acesso até: {timeRemaining}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.statusIcon}>Bloqueado</Text>
            <Text style={styles.statusTitle}>Análise Avançada</Text>
            <Text style={styles.statusSubtitle}>
              Desbloqueie com um anúncio curto
            </Text>
          </>
        )}
      </View>

      {/* Conteúdo da Análise */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Relatório de Análise</Text>

        {isUnlocked ? (
          <>
            <View style={styles.analysisCard}>
              <Text style={styles.cardLabel}>Números Mais Quentes</Text>
              <Text style={styles.cardValue}>15, 23, 42, 56, 61</Text>
              <Text style={styles.cardDetail}>Frequência: 15.2%</Text>
            </View>

            <View style={styles.analysisCard}>
              <Text style={styles.cardLabel}>Números Mais Frios</Text>
              <Text style={styles.cardValue}>01, 08, 19, 31, 47</Text>
              <Text style={styles.cardDetail}>Frequência: 5.8%</Text>
            </View>

            <View style={styles.analysisCard}>
              <Text style={styles.cardLabel}>Padrão Detectado</Text>
              <Text style={styles.cardValue}>Tendência Ascendente</Text>
              <Text style={styles.cardDetail}>
                Números pares aparecem 12% mais frequentemente
              </Text>
            </View>

            <View style={styles.analysisCard}>
              <Text style={styles.cardLabel}>Recomendação</Text>
              <Text style={styles.cardValue}>
                Números: 15, 23, 42, 56, 61, 02
              </Text>
              <Text style={styles.cardDetail}>
                Baseado na análise dos últimos 100 sorteios
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.lockedContent}>
            <Text style={styles.lockedIcon}>👁️</Text>
            <Text style={styles.lockedText}>
              Conteúdo bloqueado. Desbloqueie com um anúncio!
            </Text>
          </View>
        )}
      </View>

      {/* Botão de Desbloqueio */}
      {!isUnlocked && (
        <Pressable
          style={styles.unlockButton}
          onPress={() => setShowRewardModal(true)}
        >
          <Text style={styles.unlockButtonText}>
            🎬 Desbloquear por 24h com Vídeo
          </Text>
        </Pressable>
      )}

      {/* Modal de Reward Ad */}
      <RewardedAdModal
        visible={showRewardModal}
        title="🎬 Assista um Vídeo Curto"
        description="Desbloqueie análises avançadas por 24 horas"
        rewardText="Acesso à Análise Avançada por 24h"
        onDismiss={() => setShowRewardModal(false)}
        onReward={handleRewardEarned}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },

  statusBox: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  unlockedStatus: {
    backgroundColor: '#F0FDF4', // Verde claro
    borderLeftWidth: 4,
    borderLeftColor: '#047857',
  },

  lockedStatus: {
    backgroundColor: '#FEF2F2', // Vermelho claro
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },

  statusIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  statusTime: {
    fontSize: 14,
    color: '#047857',
    marginTop: 4,
    fontWeight: '500',
  },

  analysisSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },

  analysisCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#047857',
  },

  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },

  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },

  cardDetail: {
    fontSize: 12,
    color: '#6B7280',
  },

  lockedContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  lockedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  lockedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 250,
  },

  unlockButton: {
    backgroundColor: '#047857',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },

  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdvancedAnalysisComponent;
