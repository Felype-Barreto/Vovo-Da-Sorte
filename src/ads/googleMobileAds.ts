let cachedModule: any | null | undefined;

export type GoogleMobileAdsModule = {
  BannerAd?: any;
  BannerAdSize?: any;
  InterstitialAd?: any;
  RewardedAd?: any;
  AdEventType?: any;
  RewardedAdEventType?: any;
  AdsConsent?: any;
  AdsConsentStatus?: any;
  AdsConsentDebugGeography?: any;
  AdsConsentPrivacyOptionsRequirementStatus?: any;
  TestIds?: any;
  mobileAds?: any;
  MobileAds?: any;
};

export function getGoogleMobileAds(): GoogleMobileAdsModule | null {
  if (cachedModule !== undefined) return cachedModule;

  try {
    // Using require() so the bundle doesn't hard-crash in environments
    // where the native module isn't available (e.g. Expo Go).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cachedModule = require('react-native-google-mobile-ads');
    return cachedModule;
  } catch {
    cachedModule = null;
    return null;
  }
}

export async function initGoogleMobileAdsIfAvailable(): Promise<boolean> {
  const mod = getGoogleMobileAds();
  if (!mod) return false;

  const factory = mod.mobileAds ?? mod.MobileAds;
  if (typeof factory !== 'function') return false;

  try {
    const instance = factory();
    if (instance?.initialize) {
      await instance.initialize();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const TEST_AD_UNIT_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
} as const;
