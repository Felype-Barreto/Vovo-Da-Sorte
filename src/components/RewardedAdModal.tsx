import { getGoogleMobileAds, TEST_AD_UNIT_IDS } from '@/src/ads/googleMobileAds';
import { isAdTypeEnabled } from '@/src/config/adConfig';
import { useConsent } from '@/src/context/ConsentContext';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { RewardedAd } from 'react-native-google-mobile-ads';

/**
 * Modal de Anúncio de Recompensa (Otimizado para Idosos)
 * 
 * IDEAL PARA:
 * - Liberar feature premium (ex: Análise Avançada)
 * - Aumentar limite diário
 * - Desbloquear jogos especiais
 * - Tudo com o usuário escolhendo ver o anúncio
 * 
 * VANTAGENS:
 * - Usuário QUER ver (para ganhar algo)
 * - Monetização muito melhor que banners
 * - Sem interrupção (opt-in)
 * - Usuário sente que "ganhou"
 */

export interface RewardedAdModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  rewardText?: string;
  unitId?: string;
  onDismiss: () => void;
  onReward: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  visible,
  title = '🎬 Assista um Vídeo Curto',
  description = 'Ganhe acesso a análises avançadas por 24 horas',
  rewardText = 'Acesso Liberado por 24h',
  unitId = TEST_AD_UNIT_IDS.rewarded,
  onDismiss,
  onReward,
}) => {
  const { consentGiven, adsConsent, adsPersonalizedConsent } = useConsent();
  const [loading, setLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const rewardedAdRef = useRef<RewardedAd | null>(null);

  /**
   * Verificar se pode mostrar reward ad
   */
  const canShowAd =
    isAdTypeEnabled('rewarded') &&
    consentGiven === true &&
    adsConsent === true &&
    visible;

  /**
   * Carregar anúncio de recompensa
   */
  const loadRewardedAd = async () => {
    if (!canShowAd) {
      console.log('[RewardedAd] Não pode carregar: consentimento ou feature flag');
      return;
    }

    const gma = getGoogleMobileAds();
    const RewardedAdFactory = gma?.RewardedAd as any;
    const RewardedAdEventType = gma?.RewardedAdEventType as any;
    if (!RewardedAdFactory || !RewardedAdEventType) {
      console.log('[RewardedAd] SDK indisponível (provável Expo Go).');
      return;
    }

    try {
      setLoading(true);
      
      const rewardedAd = RewardedAdFactory.createForAdRequest(unitId, {
        keywords: ['premium', 'análise', 'dados'],
        requestNonPersonalizedAdsOnly: adsPersonalizedConsent !== true,
      });

      // Event listeners
      const unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setAdLoaded(true);
          setLoading(false);
          console.log('[RewardedAd] Anúncio carregado');
        }
      );

      const unsubscribeFailed = rewardedAd.addAdEventListener(
        'error' as any,
        (error: unknown) => {
          setLoading(false);
          console.log('[RewardedAd] Falha ao carregar:', error);
          onDismiss();
        }
      );

      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: any) => {
          console.log(`[RewardedAd] Recompensa ganha: ${reward.amount} ${reward.type}`);
          onReward();
          handleDismiss();
        }
      );

      rewardedAdRef.current = rewardedAd;

      // Carregar o anúncio
      await rewardedAd.load();

      // Cleanup (será removido quando modal fechar)
      return () => {
        unsubscribeLoaded();
        unsubscribeFailed();
        unsubscribeEarned();
      };
    } catch (error) {
      console.error('[RewardedAd] Erro ao carregar:', error);
      setLoading(false);
      onDismiss();
    }
  };

  /**
   * Mostrar anúncio
   */
  const handleShowAd = async () => {
    try {
      if (adLoaded && rewardedAdRef.current) {
        setLoading(true);
        await rewardedAdRef.current.show();
      }
    } catch (error) {
      console.error('[RewardedAd] Erro ao mostrar:', error);
      setLoading(false);
    }
  };

  /**
   * Fechar modal
   */
  const handleDismiss = () => {
    setAdLoaded(false);
    rewardedAdRef.current = null;
    onDismiss();
  };

  /**
   * Efeito: Carregar anúncio quando modal fica visível
   */
  React.useEffect(() => {
    if (visible && canShowAd) {
      const cleanup = loadRewardedAd();
      return () => {
        cleanup?.then((fn) => fn?.());
      };
    } else if (visible && !canShowAd) {
      console.log('[RewardedAd] Modal visível mas não pode mostrar anúncio');
      console.log('  - isAdTypeEnabled:', isAdTypeEnabled('rewarded'));
      console.log('  - consentGiven:', consentGiven);
      console.log('  - adsConsent:', adsConsent);
    }
  }, [visible, canShowAd]);

  /**
   * Se não tem consentimento, mostrar mensagem alternativa
   */
  if (visible && !canShowAd) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.container}>
            <Text style={styles.title}>Consentimento Necessário</Text>
            <Text style={styles.description}>
              Para acessar esta feature, você precisa aceitar anúncios nas suas configurações de privacidade.
            </Text>
            <Pressable
              style={styles.buttonClose}
              onPress={handleDismiss}
            >
              <Text style={styles.buttonText}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible && canShowAd} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>{description}</Text>

          <View style={styles.rewardBox}>
            <Text style={styles.rewardIcon}>Recompensa</Text>
            <Text style={styles.rewardText}>Você ganhará:</Text>
            <Text style={styles.rewardValue}>{rewardText}</Text>
          </View>

          <View style={styles.buttonGroup}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#047857" />
                <Text style={styles.loadingText}>Carregando anúncio...</Text>
              </View>
            ) : (
              <>
                {adLoaded ? (
                  <Pressable
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleShowAd}
                  >
                    <Text style={styles.buttonText}>
                      Assista e Desbloqueie
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.button, styles.buttonDisabled]}
                    disabled
                  >
                    <Text style={styles.buttonText}>Preparando anúncio...</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={handleDismiss}
                >
                  <Text style={styles.buttonTextSecondary}>Agora Não</Text>
                </Pressable>
              </>
            )}
          </View>

          <Text style={styles.footer}>
            Vídeo dura cerca de 30 segundos. Sem custo!
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 12,
    textAlign: 'center',
  },

  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },

  rewardBox: {
    backgroundColor: '#F0FDF4', // Verde claro
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#047857',
  },

  rewardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  rewardText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },

  rewardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#047857',
  },

  buttonGroup: {
    width: '100%',
    gap: 12,
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonPrimary: {
    backgroundColor: '#047857',
  },

  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
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

  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },

  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },

  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  buttonClose: {
    backgroundColor: '#047857',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
  },
});

export default RewardedAdModal;
