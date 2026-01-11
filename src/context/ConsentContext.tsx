import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface ConsentContextType {
  hasSeenBanner: boolean;
  consentGiven: boolean | null; // null = não respondeu, true = aceita, false = rejeita
  analyticsConsent: boolean;
  adsConsent: boolean;
  /** Se true, pode solicitar anúncios personalizados (UMP). */
  adsPersonalizedConsent: boolean;
  setConsentBannerSeen: () => Promise<void>;
  setConsentGiven: (value: boolean) => Promise<void>;
  setAnalyticsConsent: (value: boolean) => Promise<void>;
  setAdsConsent: (value: boolean) => Promise<void>;
  setAdsPersonalizedConsent: (value: boolean) => Promise<void>;
  resetConsent: () => Promise<void>;
  isLoading: boolean;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasSeenBanner, setHasSeenBannerState] = useState(false);
  const [consentGiven, setConsentGivenState] = useState<boolean | null>(null);
  const [analyticsConsent, setAnalyticsConsentState] = useState(false);
  const [adsConsent, setAdsConsentState] = useState(false);
  const [adsPersonalizedConsent, setAdsPersonalizedConsentState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar consentimento do AsyncStorage na inicialização
  useEffect(() => {
    (async () => {
      try {
        const [seenBanner, consent, analytics, ads] = await Promise.all([
          AsyncStorage.getItem('consent_banner_seen'),
          AsyncStorage.getItem('consent_given'),
          AsyncStorage.getItem('consent_analytics'),
          AsyncStorage.getItem('consent_ads'),
        ]);

        const adsPersonalized = await AsyncStorage.getItem('consent_ads_personalized');

        if (seenBanner === 'true') {
          setHasSeenBannerState(true);
        }

        if (consent === 'true') {
          setConsentGivenState(true);
        } else if (consent === 'false') {
          setConsentGivenState(false);
        }

        if (analytics === 'true') {
          setAnalyticsConsentState(true);
        }

        if (ads === 'true') {
          setAdsConsentState(true);
        }

        if (adsPersonalized === 'true') {
          setAdsPersonalizedConsentState(true);
        }
      } catch (err) {
        console.warn('Erro ao carregar consentimento:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setConsentBannerSeen = async () => {
    try {
      setHasSeenBannerState(true);
      await AsyncStorage.setItem('consent_banner_seen', 'true');
    } catch (err) {
      console.error('Erro ao salvar banner visto:', err);
    }
  };

  const setConsentGiven = async (value: boolean) => {
    try {
      setConsentGivenState(value);
      await AsyncStorage.setItem('consent_given', String(value));
      // Se aceita, ativa analytics por padrão.
      // Consentimento de anúncios/personalização é controlado pelo UMP.
      if (value) {
        setAnalyticsConsentState(true);
        await AsyncStorage.setItem('consent_analytics', 'true');
      }
    } catch (err) {
      console.error('Erro ao salvar consentimento:', err);
    }
  };

  const setAnalyticsConsent = async (value: boolean) => {
    try {
      setAnalyticsConsentState(value);
      await AsyncStorage.setItem('consent_analytics', String(value));
    } catch (err) {
      console.error('Erro ao salvar analytics consent:', err);
    }
  };

  const setAdsConsent = async (value: boolean) => {
    try {
      setAdsConsentState(value);
      await AsyncStorage.setItem('consent_ads', String(value));
    } catch (err) {
      console.error('Erro ao salvar ads consent:', err);
    }
  };

  const setAdsPersonalizedConsent = async (value: boolean) => {
    try {
      setAdsPersonalizedConsentState(value);
      await AsyncStorage.setItem('consent_ads_personalized', String(value));
    } catch (err) {
      console.error('Erro ao salvar ads personalized consent:', err);
    }
  };

  const resetConsent = async () => {
    try {
      setHasSeenBannerState(false);
      setConsentGivenState(null);
      setAnalyticsConsentState(false);
      setAdsConsentState(false);
      setAdsPersonalizedConsentState(false);
      await AsyncStorage.multiRemove([
        'consent_banner_seen',
        'consent_given',
        'consent_analytics',
        'consent_ads',
        'consent_ads_personalized',
      ]);
    } catch (err) {
      console.error('Erro ao resetar consentimento:', err);
    }
  };

  return (
    <ConsentContext.Provider
      value={{
        hasSeenBanner,
        consentGiven,
        analyticsConsent,
        adsConsent,
        adsPersonalizedConsent,
        setConsentBannerSeen,
        setConsentGiven,
        setAnalyticsConsent,
        setAdsConsent,
        setAdsPersonalizedConsent,
        resetConsent,
        isLoading,
      }}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent deve ser usado dentro de ConsentProvider');
  }
  return context;
};
