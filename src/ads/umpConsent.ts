import { getGoogleMobileAds } from '@/src/ads/googleMobileAds';

export type UmpConsentResult = {
  /** True when the SDK says ad requests are allowed (canRequestAds + status OK) */
  adsAllowed: boolean;
  /** True when user choices allow personalised ads/content (best-effort) */
  personalisedAdsAllowed: boolean;
  /** Raw UMP status, if available */
  status: unknown;
  /** Whether a consent form is available */
  isConsentFormAvailable: boolean;
};

function isTruthyBoolean(value: unknown): value is true {
  return value === true;
}

export async function gatherUmpConsentIfAvailable(options?: any): Promise<UmpConsentResult | null> {
  const gma = getGoogleMobileAds();
  if (!gma?.AdsConsent || !gma?.AdsConsentStatus) return null;

  const AdsConsent = gma.AdsConsent as any;
  const AdsConsentStatus = gma.AdsConsentStatus as any;

  // Step 1: request latest info, so we can decide whether a form will be shown.
  let consentInfo = await AdsConsent.requestInfoUpdate(options);

  const needsForm =
    consentInfo?.isConsentFormAvailable === true &&
    (consentInfo?.status === AdsConsentStatus.UNKNOWN ||
      consentInfo?.status === AdsConsentStatus.REQUIRED);

  // Step 2: If a form is required, show a short, professional pre-prompt first.
  if (needsForm) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Alert } = require('react-native');

    const shouldContinue: boolean = await new Promise((resolve) => {
      if (!Alert?.alert) {
        resolve(true);
        return;
      }

      Alert.alert(
        'Preferências de publicidade',
        'Utilizamos publicidade para apoiar a manutenção e a melhoria contínua do aplicativo. Você pode escolher permitir anúncios personalizados (mais relevantes) ou optar por anúncios não personalizados.\n\nVocê poderá revisar essa escolha depois nas opções de privacidade.',
        [
          { text: 'Agora não', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Continuar', onPress: () => resolve(true) },
        ]
      );
    });

    if (shouldContinue) {
      // This method will show the Google-rendered consent form if required.
      consentInfo = await AdsConsent.loadAndShowConsentFormIfRequired();
    } else {
      // User skipped the consent flow right now. Keep ads blocked.
      return {
        adsAllowed: false,
        personalisedAdsAllowed: false,
        status: consentInfo?.status,
        isConsentFormAvailable: consentInfo?.isConsentFormAvailable === true,
      };
    }
  } else {
    // If form is not required, still gather consent to keep UMP state fresh.
    consentInfo = await AdsConsent.gatherConsent(options);
  }

  const status = consentInfo?.status;
  const canRequestAds = isTruthyBoolean(consentInfo?.canRequestAds);
  const isConsentFormAvailable = isTruthyBoolean(consentInfo?.isConsentFormAvailable);

  const statusAllowsAds =
    status === AdsConsentStatus.OBTAINED || status === AdsConsentStatus.NOT_REQUIRED;

  const adsAllowed = canRequestAds && statusAllowsAds;

  // Personalisation: best-effort from user choices (when available).
  // If NOT_REQUIRED, treat as allowed.
  let personalisedAdsAllowed = status === AdsConsentStatus.NOT_REQUIRED;
  if (!personalisedAdsAllowed) {
    try {
      const choices = await AdsConsent.getUserChoices();
      personalisedAdsAllowed =
        isTruthyBoolean(choices?.storeAndAccessInformationOnDevice) &&
        isTruthyBoolean(choices?.selectPersonalisedAds) &&
        isTruthyBoolean(choices?.selectPersonalisedContent);
    } catch {
      personalisedAdsAllowed = false;
    }
  }

  return {
    adsAllowed,
    personalisedAdsAllowed,
    status,
    isConsentFormAvailable,
  };
}
