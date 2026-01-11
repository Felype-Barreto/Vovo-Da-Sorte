import { getGoogleMobileAds, TEST_AD_UNIT_IDS } from '@/src/ads/googleMobileAds';
import { isAdTypeEnabled } from '@/src/config/adConfig';
import { useConsent } from '@/src/context/ConsentContext';
import { useEffect, useMemo, useState } from 'react';
import type { InterstitialAd } from 'react-native-google-mobile-ads';

/**
 * Hook para gerenciar Anúncio Intersticial
 * 
 * Mostrado em tela cheia após ações específicas (ex: "Gerar Jogo")
 * 
 * Exemplo:
 * const { showInterstitial } = useInterstitialAd('ca-app-pub-xxx/yyy');
 * 
 * // No clique do botão "Gerar Jogo":
 * await showInterstitial();
 * // ... continuar com a ação
 */

export const useInterstitialAd = (unitId?: string) => {
  const { consentGiven, adsConsent, adsPersonalizedConsent } = useConsent();
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const gma = useMemo(() => getGoogleMobileAds(), []);
  const adUnitId = unitId || TEST_AD_UNIT_IDS.interstitial;

  const canUseInterstitials =
    isAdTypeEnabled('interstitial') && consentGiven === true && adsConsent === true && !!gma;

  const createAd = () => {
    if (!canUseInterstitials) return;
    const InterstitialAdFactory = gma?.InterstitialAd as any;
    const AdEventType = gma?.AdEventType as any;
    if (!InterstitialAdFactory || !AdEventType) return;

    const ad = InterstitialAdFactory.createForAdRequest(adUnitId, {
      keywords: ['lottery', 'jogos', 'números'],
      requestNonPersonalizedAdsOnly: adsPersonalizedConsent !== true,
    });

    setInterstitial(ad);

    // Listener para quando o anúncio fecha (ex-slot vazio)
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoading(false);
    });

    const unsubscribeFailedToLoad = ad.addAdEventListener(
      AdEventType.ERROR,
      (error: unknown) => {
        console.log('Intersticial error:', error);
        setIsLoading(false);
      }
    );

    // Carregar o anúncio na criação
    ad.load();
    setIsLoading(true);

    return () => {
      unsubscribeLoaded();
      unsubscribeFailedToLoad();
    };
  };

  // Criar anúncio ao montar
  useEffect(() => {
    const cleanup = createAd();
    return cleanup;
  }, [canUseInterstitials, adUnitId]);

  // Recarregar anúncio após fechar
  useEffect(() => {
    if (!interstitial) return;

    const AdEventType = (gma?.AdEventType as any) ?? null;
    if (!AdEventType) return;

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitial(null);
      // Criar novo anúncio para próxima vez
      createAd();
    });

    return unsubscribeClosed;
  }, [interstitial]);

  const showInterstitial = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (!canUseInterstitials) {
        resolve();
        return;
      }

      if (!interstitial || isLoading) {
        // Anúncio não está pronto; resolver imediatamente
        resolve();
        return;
      }

      // Mostrar o anúncio
      interstitial.show();

      // Resolver após um pequeno delay (anúncio foi disparado)
      setTimeout(resolve, 100);
    });
  };

  return { showInterstitial, isLoading };
};
