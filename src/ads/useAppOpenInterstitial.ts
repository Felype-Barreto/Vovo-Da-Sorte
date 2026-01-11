import { useEffect } from 'react';
import { useAdDisplay } from './AdDisplayContext';
import { showInterstitialIfAllowed } from './interstitialAd';

const DELAY_MS = 7000; // 7 segundos após abrir o app

export function useAppOpenInterstitial() {
  const { interstitialShownThisSession, setInterstitialShown } = useAdDisplay();

  useEffect(() => {
    if (interstitialShownThisSession) return;
    const timer = setTimeout(() => {
      showInterstitialIfAllowed();
      setInterstitialShown();
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [interstitialShownThisSession, setInterstitialShown]);
}
