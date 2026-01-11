import { getGoogleMobileAds, TEST_AD_UNIT_IDS } from '@/src/ads/googleMobileAds';
import { adBehavior, isAdTypeEnabled } from '@/src/config/adConfig';
import { useConsent } from '@/src/context/ConsentContext';
import React, { useEffect, useState } from 'react';
import { View, ViewProps } from 'react-native';

/**
 * 🎨 Componente de Banner de Anúncio (Otimizado para Idosos)
 * 
 * CARACTERÍSTICAS:
 * - Respeita feature flag global (isAdEnabled)
 * - Respeita consentimento LGPD/GDPR
 * - Fixo no rodapé sem cobrir botões
 * - Sem som automático
 * - Sem popup intrusivo
 * 
 * 📍 USO:
 * <AdBanner />  // Usa padrões (rodapé, teste)
 * <AdBanner unitId="seu-unit-id" />  // Produção
 */

interface AdBannerProps extends ViewProps {
  unitId?: string;
  /** Se false, nunca mostra anúncio (override local) */
  enabled?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  unitId = TEST_AD_UNIT_IDS.banner,
  enabled = true,
  style,
  ...rest
}) => {
  const { consentGiven, adsConsent, adsPersonalizedConsent } = useConsent();
  const [loaded, setLoaded] = useState(false);
  const [shouldShowAd, setShouldShowAd] = useState(false);

  /**
   * Verificar se deve mostrar anúncio
   * 
   * Condições TODAS devem ser true:
   * 1. Feature flag global (isAdTypeEnabled)
   * 2. Consentimento LGPD dado (consentGiven)
   * 3. Consentimento de ads dado (adsConsent)
   * 4. Componente não desativado (enabled prop)
   */
  useEffect(() => {
    const canShow = 
      isAdTypeEnabled('banner') &&           // Feature flag
      consentGiven === true &&               // Consentimento geral
      adsConsent === true &&                 // Consentimento de ads
      enabled === true;                      // Prop local

    setShouldShowAd(canShow);

    if (!canShow) {
      const reason = !isAdTypeEnabled('banner') ? 'feature flag desativada' :
                     consentGiven !== true ? 'sem consentimento geral' :
                     adsConsent !== true ? 'sem consentimento de ads' :
                     'prop enabled=false';
      console.log(`[AdBanner] Anúncio não será mostrado (${reason})`);
    }
  }, [consentGiven, adsConsent, enabled]);

  // ✋ Não renderizar se não deve mostrar
  if (!shouldShowAd) {
    // Renderizar View vazia para manter layout
    return <View style={[{ height: 0 }, style]} {...rest} />;
  }

  const gma = getGoogleMobileAds();
  if (!gma?.BannerAd || !gma?.BannerAdSize) {
    // Native module not available (e.g. Expo Go). Keep layout stable and avoid crashing.
    return <View style={[{ height: 0 }, style]} {...rest} />;
  }

  const BannerAd = gma.BannerAd as any;
  const BannerAdSize = gma.BannerAdSize as any;

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: adBehavior.bannerHeight,
        },
        style,
      ]}
      {...rest}
    >
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: adsPersonalizedConsent !== true,
          keywords: ['lottery', 'jogos', 'números', 'megasena', 'quina'],
        }}
        onAdLoaded={() => {
          setLoaded(true);
          console.log('[AdBanner] Anúncio carregado com sucesso');
        }}
        onAdFailedToLoad={(error: unknown) => {
          console.log('[AdBanner] Falha ao carregar anúncio:', error);
        }}
      />
    </View>
  );
};
