import { getGoogleMobileAds, TEST_AD_UNIT_IDS } from '@/src/ads/googleMobileAds';
import { isAdTypeEnabled } from '@/src/config/adConfig';
import { useConsent } from '@/src/context/ConsentContext';
import { useEffect, useState } from 'react';
import type { RewardedAd } from 'react-native-google-mobile-ads';

/**
 * Hook para Anúncio de Recompensa (Reward Video)
 * 
 * IDEAL PARA:
 * - Desbloquear "Análise Avançada" por 24h
 * - Aumentar número de consultas/dia
 * - Acessar relatórios premium
 * 
 * IMPORTANTE:
 * - Respeita feature flag global (isAdEnabled)
 * - Respeita consentimento LGPD/GDPR
 * - Só funciona se usuário quiser (opt-in)
 * 
 * EXEMPLO:
 * const { showRewardedAd, isLoading } = useRewardedAd('ca-app-pub-xxx/yyy');
 * 
 * // No clique de "Desbloquear por 24h":
 * await showRewardedAd().then((earned) => {
 *   if (earned) {
 *     setFeatureUnlockedFor24h();
 *   }
 * });
 */

interface RewardEarned {
  type: string;
  amount: number;
}

export const useRewardedAd = (unitId?: string) => {
  const { consentGiven, adsConsent, adsPersonalizedConsent } = useConsent();
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEarnedReward, setUserEarnedReward] = useState(false);

  const adUnitId = unitId || TEST_AD_UNIT_IDS.rewarded;

  /**
   * Verificar se pode carregar reward ads
   */
  const canLoadRewardAd = (): boolean => {
    const allowed = 
      isAdTypeEnabled('rewarded') &&
      consentGiven === true &&
      adsConsent === true;

    if (!allowed) {
      console.log('[useRewardedAd] Não pode carregar:', {
        adTypeEnabled: isAdTypeEnabled('rewarded'),
        consentGiven,
        adsConsent,
      });
    }

    return allowed;
  };

  const createAd = () => {
    if (!canLoadRewardAd()) {
      console.log('[useRewardedAd] Criação de ad bloqueada (sem consentimento ou feature flag)');
      return;
    }

    const gma = getGoogleMobileAds();
    const RewardedAdFactory = gma?.RewardedAd as any;
    const RewardedAdEventType = gma?.RewardedAdEventType as any;
    if (!RewardedAdFactory || !RewardedAdEventType) {
      console.log('[useRewardedAd] SDK indisponível (provável Expo Go).');
      return;
    }

    const ad = RewardedAdFactory.createForAdRequest(adUnitId, {
      keywords: ['premium', 'análise', 'dados', 'lottery'],
      requestNonPersonalizedAdsOnly: adsPersonalizedConsent !== true,
    });

    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('[useRewardedAd] Reward ad carregado');
        setIsLoading(false);
      }
    );

    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward: RewardEarned) => {
        console.log('[useRewardedAd] Recompensa ganha:', reward);
        setUserEarnedReward(true);
      }
    );

    const unsubscribeError = ad.addAdEventListener(
      'error' as any,
      (error: unknown) => {
        console.log('[useRewardedAd] Erro ao carregar:', error);
        setIsLoading(false);
      }
    );

    // Carregar o anúncio
    ad.load();
    setIsLoading(true);
    setRewarded(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeError();
    };
  };

  // Criar anúncio ao montar (se consentimento permite)
  useEffect(() => {
    if (canLoadRewardAd()) {
      const cleanup = createAd();
      return cleanup;
    } else {
      console.log('[useRewardedAd] Não carregando ad na montagem (sem consentimento/feature flag)');
    }
  }, [consentGiven, adsConsent]);

  // Recarregar anúncio após fechar
  useEffect(() => {
    if (!rewarded) return;

    const unsubscribeClosed = rewarded.addAdEventListener(
      'closed' as any,
      () => {
        console.log('[useRewardedAd] Anúncio fechado');
        setRewarded(null);
        setUserEarnedReward(false);
        // Criar novo para próxima vez
        if (canLoadRewardAd()) {
          createAd();
        }
      }
    );

    return unsubscribeClosed;
  }, [rewarded]);

  /**
   * Mostrar anúncio de recompensa
   * 
   * @returns true se usuário completou o vídeo, false caso contrário
   */
  const showRewardedAd = async (): Promise<boolean> => {
    if (!canLoadRewardAd()) {
      console.log('[useRewardedAd] Não pode mostrar: sem consentimento ou feature flag');
      return false;
    }

    return new Promise((resolve) => {
      if (!rewarded || isLoading) {
        console.log('[useRewardedAd] Não pode mostrar: ads não carregado');
        resolve(false);
        return;
      }

      // Reset reward flag
      setUserEarnedReward(false);

      try {
        // Mostrar anúncio
        rewarded.show();
        console.log('[useRewardedAd] Anúncio mostrado');

        // Esperar resposta do usuário
        setTimeout(() => {
          const earned = userEarnedReward;
          console.log('[useRewardedAd] Resultado:', earned ? 'RECOMPENSA GANHA' : 'CANCELADO');
          resolve(earned);
        }, 2000);
      } catch (error) {
        console.error('[useRewardedAd] Erro ao mostrar:', error);
        resolve(false);
      }
    });
  };

  return {
    showRewardedAd,
    isLoading,
    userEarnedReward,
    canShowAd: canLoadRewardAd(),
  };
};
