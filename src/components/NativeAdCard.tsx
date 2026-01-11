import { getGoogleMobileAds } from '@/src/ads/googleMobileAds';
import { getAdUnitId, isAdTypeEnabled } from '@/src/config/adConfig';
import { useConsent } from '@/src/context/ConsentContext';
import React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Componente para Native Ad (AdMob)
 *
 * Exemplo de uso:
 * <NativeAdCard />
 */

interface NativeAdCardProps extends ViewProps {
  unitId?: string;
  enabled?: boolean;
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({
  unitId = getAdUnitId('native'),
  enabled = true,
  style,
  ...rest
}) => {
  const { consentGiven, adsConsent } = useConsent();

  // Só mostra se tudo estiver ok
  if (!isAdTypeEnabled('banner') || !consentGiven || !adsConsent || !enabled) {
    return null;
  }

  const gma = getGoogleMobileAds();
  if (!gma?.NativeAdView) {
    // Native module não disponível
    return null;
  }

  const NativeAdView = gma.NativeAdView as any;

  return (
    <View style={[{ marginVertical: 12 }, style]} {...rest}>
      <NativeAdView
        adUnitID={unitId}
        style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', minHeight: 120 }}
        // Aqui você pode customizar o layout do anúncio nativo
      />
    </View>
  );
};
