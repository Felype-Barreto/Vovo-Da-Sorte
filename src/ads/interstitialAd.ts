import { getGoogleMobileAds } from '@/src/ads/googleMobileAds';
import { getAdUnitId, isAdTypeEnabled } from '@/src/config/adConfig';

let interstitialAd: any | null = null;
let isLoading = false;
let isLoaded = false;
let lastShownTimestamp = 0;

/**
 * 🎯 Interstitial Ad Manager
 * 
 * Gerencia anúncios intersticiais de forma respeitosa:
 * - Não mostra se usuário não consentiu
 * - Respeita cooldown entre exibições
 * - Pré-carrega em momentos apropriados
 * - Não interrompe fluxos críticos
 */

export interface InterstitialAdConfig {
  /** Tempo mínimo entre interstitials (ms). Padrão: 5 minutos */
  cooldownMs?: number;
  /** Se true, força exibição mesmo com cooldown (use com cuidado) */
  forcedShow?: boolean;
}

const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Pré-carregar interstitial
 * Chame durante loading screens ou momentos não-críticos
 */
export async function preloadInterstitial(): Promise<boolean> {
  if (!isAdTypeEnabled('interstitial')) {
    return false;
  }

  if (isLoading || isLoaded) {
    return true;
  }

  const gma = getGoogleMobileAds();
  if (!gma?.InterstitialAd || !gma?.AdEventType) {
    return false;
  }

  const unitId = getAdUnitId('interstitial');
  if (!unitId) {
    return false;
  }

  try {
    isLoading = true;
    const InterstitialAd = gma.InterstitialAd as any;
    const AdEventType = gma.AdEventType as any;

    interstitialAd = await InterstitialAd.createForAdRequest(unitId);

    // Listeners para tracking
    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
      isLoading = false;
      console.log('[Interstitial] Carregado');
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      isLoaded = false;
      interstitialAd = null;
      console.log('[Interstitial] Fechado pelo usuário');
      // Pré-carregar próximo
      setTimeout(() => preloadInterstitial(), 2000);
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
      isLoaded = false;
      isLoading = false;
      interstitialAd = null;
      console.error('[Interstitial] Erro ao carregar:', error);
    });

    await interstitialAd.load();
    return true;
  } catch (error) {
    console.error('[Interstitial] Erro ao pré-carregar:', error);
    isLoading = false;
    isLoaded = false;
    interstitialAd = null;
    return false;
  }
}

/**
 * Mostrar interstitial se permitido
 * 
 * @returns true se mostrou, false se não pôde mostrar
 */
export async function showInterstitialIfAllowed(config?: InterstitialAdConfig): Promise<boolean> {
  const cooldown = config?.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const forced = config?.forcedShow ?? false;

  // Feature flag
  if (!isAdTypeEnabled('interstitial')) {
    return false;
  }

  // Cooldown check
  if (!forced) {
    const timeSinceLastAd = Date.now() - lastShownTimestamp;
    if (timeSinceLastAd < cooldown) {
      console.log(`[Interstitial] Cooldown ativo (${Math.round((cooldown - timeSinceLastAd) / 1000)}s restantes)`);
      return false;
    }
  }

  // Não carregado
  if (!isLoaded || !interstitialAd) {
    console.log('[Interstitial] Não carregado. Pré-carregando...');
    await preloadInterstitial();
    return false;
  }

  try {
    await interstitialAd.show();
    lastShownTimestamp = Date.now();
    console.log('[Interstitial] Mostrado com sucesso');
    return true;
  } catch (error) {
    console.error('[Interstitial] Erro ao mostrar:', error);
    isLoaded = false;
    interstitialAd = null;
    return false;
  }
}

/**
 * Verificar se interstitial está carregado e pronto
 */
export function isInterstitialReady(): boolean {
  return isLoaded && interstitialAd !== null;
}

/**
 * Resetar estado (útil em logout ou mudança de consentimento)
 */
export function resetInterstitial(): void {
  interstitialAd = null;
  isLoading = false;
  isLoaded = false;
  lastShownTimestamp = 0;
}
