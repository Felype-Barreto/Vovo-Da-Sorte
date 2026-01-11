import { gatherUmpConsentIfAvailable } from '@/src/ads/umpConsent';
import { isAdEnabled } from '@/src/config/adConfig';
import { useConsent } from '@/src/context/ConsentContext';
import { useEffect, useRef } from 'react';

/**
 * Hook para sincronizar consentimento com Google Mobile Ads
 * Define se anúncios devem ser personalizados ou não
 * 
 * Nota: A configuração de ads não-personalizados é feita via MobileAds.initialize()
 * Este hook monitora o consentimento do usuário para futuras extensões
 */
export const useConsentWithAds = () => {
  const {
    adsConsent,
    adsPersonalizedConsent,
    consentGiven,
    setAdsConsent,
    setAdsPersonalizedConsent,
  } = useConsent();

  const didSyncOnce = useRef(false);

  useEffect(() => {
    if (!isAdEnabled) return;
    if (didSyncOnce.current) return;
    didSyncOnce.current = true;

    (async () => {
      const result = await gatherUmpConsentIfAvailable();
      if (!result) {
        console.log('[UMP] SDK indisponível (provável Expo Go).');
        return;
      }

      await setAdsConsent(result.adsAllowed);
      await setAdsPersonalizedConsent(result.personalisedAdsAllowed);

      console.log('[UMP] Consent atualizado:', {
        adsAllowed: result.adsAllowed,
        personalisedAdsAllowed: result.personalisedAdsAllowed,
        status: result.status,
        isConsentFormAvailable: result.isConsentFormAvailable,
      });
    })().catch((err) => {
      console.log('[UMP] Erro ao coletar consentimento:', err);
    });
  }, [setAdsConsent, setAdsPersonalizedConsent]);

  useEffect(() => {
    // Log do status de consentimento para debugging
    if (consentGiven === null) {
      console.log('[Consent] Aguardando decisão do usuário');
    } else if (consentGiven) {
      console.log('[Consent] Usuário consentiu com coleta de dados');
      console.log('[Ads] Ads permitidos:', adsConsent ? 'sim' : 'não');
      console.log('[Ads] Ads personalizados:', adsPersonalizedConsent ? 'sim' : 'não');
    } else {
      console.log('[Consent] Usuário rejeitou coleta de dados');
      console.log('[Ads] Anúncios genéricos (não personalizados)');
    }
  }, [adsConsent, adsPersonalizedConsent, consentGiven]);
};
