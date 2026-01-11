/**
 * Configuração Global de AdMob
 * 
 * IMPORTANTE: isAdEnabled = false
 * Os anúncios NÃO aparecerão até você ativar esta flag
 * 
 * Para ativar em produção:
 * - Opção 1: Mudar isAdEnabled = true aqui
 * - Opção 2: Ativar via remoteConfig (Firebase, etc)
 * - Opção 3: Ativar via AsyncStorage + settings
 */

// ========================================
// 🔴 FEATURE FLAG - CONTROLE GLOBAL
// ========================================
// NOTA: Desativado temporariamente pois requer build nativo (não funciona no Expo Go)
// Para testar, use: npx expo prebuild && npx expo run:android
export const isAdEnabled = true; // ← Ativado para exibir anúncios

// ========================================
// 🎟️ AD UNIT IDs (AdMob)
// ========================================

/**
 * IMPORTANTE: Substitua pelos seus reais AdMob Unit IDs
 * 
 * Como obter:
 * 1. Vá a: https://admob.google.com
 * 2. Crie um app (Bundle: com.trevoInteligente)
 * 3. Crie os ad units (Banner e Interstitial)
 * 4. Copie os Unit IDs abaixo
 * 
 * Formato: ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy
 */

// Banner Ads (rodapé da tela)
// IMPORTANTE: IDs REAIS de PRODUÇÃO do AdMob
export const AD_UNIT_IDS = {
  // iOS - IDs DE TESTE OFICIAIS DO ADMOB
  BANNER_iOS: 'ca-app-pub-3940256099942544/2934735716',
  INTERSTITIAL_iOS: 'ca-app-pub-3940256099942544/4411468910',
  REWARDED_iOS: 'ca-app-pub-3940256099942544/1712485313',
  NATIVE_iOS: 'ca-app-pub-3940256099942544/3986624511',

  // Android - IDs DE TESTE OFICIAIS DO ADMOB
  BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
  NATIVE_ANDROID: 'ca-app-pub-3940256099942544/2247696110',
};

// ========================================
// ⚙️ CONFIGURAÇÕES DE AD REQUEST
// ========================================

/**
 * RequestConfiguration para AdMob
 * 
 * Integrada com ConsentContext:
 * - Se consentGiven = false → Respeta rejeição
 * - Se adsConsent = false → Sem ads personalizados
 * - Se analyticsConsent = false → Sem analytics
 */
export const adRequestConfig = {
  // Baseado em LGPD/GDPR consent
  // Será atualizado em useConsentWithAds.ts
  requestNonPersonalizedAdsOnly: true, // Padrão: true (até consentimento)
};

// ========================================
// 🎨 COMPORTAMENTO DOS ANÚNCIOS
// ========================================

/**
 * Configuração de anúncios amigáveis para idosos
 * 
 * ATIVADO:
 * - Banners fixos no rodapé
 * - Anúncios de recompensa (opt-in do usuário)
 * - Sem som automático
 * - Sem pop-ups
 * 
 * ❌ DESATIVADO:
 * - Intersticiais intrusivos
 * - Anúncios com som alto
 * - Anúncios que abrem sozinhos
 * - Full-screen ads (exceto reward, com consentimento)
 */

export const adBehavior = {
  // Banners (sempre seguro)
  showBannerAds: true, // Fixo no rodapé
  bannerHeight: 50, // Altura padrão
  
  // Intersticiais (cuidado!)
  showInterstitials: false, // Desativado por padrão (intrusivo)
  interstitialFrequency: 0, // A cada X telas (0 = nunca)
  
  // Anúncios de Recompensa (melhor para idosos)
  showRewardedAds: true, // Opt-in do usuário
  rewardValue: 'Acesso por 24h', // O que o usuário "ganha"
  
  // Mute automático
  muteAdsAudio: true, // Sem som automático
};

// ========================================
// IDENTIFICADORES DO APP
// ========================================

export const APP_CONFIG = {
  appId: 'ca-app-pub-xxxxxxxxxxxxxxxx~zzzzzzzzzz', // Seu App ID do AdMob
  bundleId: 'com.trevoInteligente',
  appName: 'Trevo Inteligente',
};

// ========================================
// 🔧 HELPER FUNCTIONS
// ========================================

/**
 * Obter Unit ID apropriado (iOS/Android)
 */
export const getAdUnitId = (adType: 'banner' | 'interstitial' | 'rewarded' | 'native') => {
  // Using Platform.OS keeps this correct at runtime without affecting bundling.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Platform } = require('react-native');
  const isIOS = Platform?.OS === 'ios';

  if (adType === 'banner') {
    return isIOS ? AD_UNIT_IDS.BANNER_iOS : AD_UNIT_IDS.BANNER_ANDROID;
  } else if (adType === 'interstitial') {
    return isIOS ? AD_UNIT_IDS.INTERSTITIAL_iOS : AD_UNIT_IDS.INTERSTITIAL_ANDROID;
  } else if (adType === 'rewarded') {
    return isIOS ? AD_UNIT_IDS.REWARDED_iOS : AD_UNIT_IDS.REWARDED_ANDROID;
  } else if (adType === 'native') {
    return isIOS ? AD_UNIT_IDS.NATIVE_iOS : AD_UNIT_IDS.NATIVE_ANDROID;
  }

  return null;
};

/**
 * Verificar se anúncios estão globalmente ativados
 */
export const areAdsEnabled = (): boolean => {
  return isAdEnabled;
};

/**
 * Verificar se tipo específico de ad está ativado
 */
export const isAdTypeEnabled = (adType: 'banner' | 'interstitial' | 'rewarded'): boolean => {
  if (!isAdEnabled) return false;
  
  switch (adType) {
    case 'banner':
      return adBehavior.showBannerAds;
    case 'interstitial':
      return adBehavior.showInterstitials;
    case 'rewarded':
      return adBehavior.showRewardedAds;
    default:
      return false;
  }
};

// ========================================
// SETUP DO ADMOB
// ========================================

/**
 * Inicializar MobileAds
 * 
 * Chamada em: app/_layout.tsx
 */
export const initMobileAds = async () => {
  if (!isAdEnabled) {
    console.log('[AdMob] Anúncios desativados globalmente (isAdEnabled = false)');
    return;
  }

  try {
    // Será implementado junto com react-native-google-mobile-ads setup
    console.log('[AdMob] Inicializando MobileAds');
    // await mobileAds().initialize();
  } catch (error) {
    console.error('[AdMob] Erro ao inicializar:', error);
  }
};

// ========================================
// 🌍 NOTAS PARA PRODUÇÃO
// ========================================

/**
 * CHECKLIST PRÉ-PRODUÇÃO:
 * 
 * □ Substitua isAdEnabled = false por true
 * □ Copie seus Unit IDs reais do AdMob
 * □ Verifique se consentimento está funcionando (ConsentContext)
 * □ Teste banner em iOS simulator
 * □ Teste banner em Android emulator
 * □ Teste reward ad (clique para "desbloquear feature")
 * □ Verifique se anúncios respeitam LGPD/GDPR
 * □ Publique na App Store / Play Store
 * 
 * NOTA: Mantém isAdEnabled = false até estar 100% pronto!
 */

export default {
  isAdEnabled,
  AD_UNIT_IDS,
  adRequestConfig,
  adBehavior,
  APP_CONFIG,
  getAdUnitId,
  areAdsEnabled,
  isAdTypeEnabled,
  initMobileAds,
};
