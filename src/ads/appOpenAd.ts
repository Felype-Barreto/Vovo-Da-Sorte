import { isAdTypeEnabled } from '@/src/config/adConfig';
import { AppState, AppStateStatus } from 'react-native';

let appOpenAd: any | null = null;
let isLoading = false;
let isLoaded = false;
let lastShownTimestamp = 0;
let appStateSubscription: any = null;

/**
 * 🚪 App Open Ad Manager
 * 
 * Mostra anúncio quando o app retorna ao foreground
 * - Respeitoso: não mostra se usuário não consentiu
 * - Inteligente: cooldown entre exibições
 * - Suave: não interrompe fluxos críticos
 */

export interface AppOpenAdConfig {
  /** Tempo mínimo entre app open ads (ms). Padrão: 4 horas */
  cooldownMs?: number;
  /** Se true, ativa listener de AppState automático */
  autoShow?: boolean;
}

const DEFAULT_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 horas

/**
 * Pré-carregar App Open Ad
 */
export async function preloadAppOpenAd(): Promise<boolean> {
  // App Open Ads não são suportados nativamente no react-native-google-mobile-ads v14+
  // Esta implementação serve como placeholder para quando estiver disponível
  // ou para usar com módulo customizado
  
  console.log('[AppOpenAd] Pré-carregamento não implementado (aguardando suporte nativo)');
  return false;

  /* 
  // Implementação futura quando disponível:
  
  if (!isAdTypeEnabled('interstitial')) {
    return false;
  }

  if (isLoading || isLoaded) {
    return true;
  }

  const gma = getGoogleMobileAds();
  if (!gma?.AppOpenAd) {
    return false;
  }

  const unitId = getAdUnitId('interstitial'); // App Open usa mesmo unitId que interstitial
  if (!unitId) {
    return false;
  }

  try {
    isLoading = true;
    const AppOpenAd = gma.AppOpenAd as any;

    appOpenAd = await AppOpenAd.createForAdRequest(unitId);
    
    appOpenAd.addAdEventListener('loaded', () => {
      isLoaded = true;
      isLoading = false;
      console.log('[AppOpenAd] Carregado');
    });

    appOpenAd.addAdEventListener('closed', () => {
      isLoaded = false;
      appOpenAd = null;
      setTimeout(() => preloadAppOpenAd(), 2000);
    });

    appOpenAd.addAdEventListener('error', (error: any) => {
      isLoaded = false;
      isLoading = false;
      appOpenAd = null;
      console.error('[AppOpenAd] Erro:', error);
    });

    await appOpenAd.load();
    return true;
  } catch (error) {
    console.error('[AppOpenAd] Erro ao pré-carregar:', error);
    isLoading = false;
    isLoaded = false;
    appOpenAd = null;
    return false;
  }
  */
}

/**
 * Mostrar App Open Ad se permitido
 */
export async function showAppOpenAdIfAllowed(config?: AppOpenAdConfig): Promise<boolean> {
  const cooldown = config?.cooldownMs ?? DEFAULT_COOLDOWN_MS;

  // Feature flag
  if (!isAdTypeEnabled('interstitial')) {
    return false;
  }

  // Cooldown check
  const timeSinceLastAd = Date.now() - lastShownTimestamp;
  if (timeSinceLastAd < cooldown) {
    console.log(`[AppOpenAd] Cooldown ativo (${Math.round((cooldown - timeSinceLastAd) / 3600000)}h restantes)`);
    return false;
  }

  console.log('[AppOpenAd] Exibição não implementada (aguardando suporte nativo)');
  return false;

  /*
  // Implementação futura:
  
  if (!isLoaded || !appOpenAd) {
    await preloadAppOpenAd();
    return false;
  }

  try {
    await appOpenAd.show();
    lastShownTimestamp = Date.now();
    console.log('[AppOpenAd] Mostrado com sucesso');
    return true;
  } catch (error) {
    console.error('[AppOpenAd] Erro ao mostrar:', error);
    isLoaded = false;
    appOpenAd = null;
    return false;
  }
  */
}

/**
 * Iniciar listener automático de AppState
 * Mostra App Open Ad quando o app retorna ao foreground
 */
export function initAppOpenAdListener(config?: AppOpenAdConfig): void {
  if (appStateSubscription) {
    return; // Já inicializado
  }

  let previousAppState: AppStateStatus = AppState.currentState;

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (previousAppState.match(/inactive|background/) && nextAppState === 'active') {
      // App voltou ao foreground
      console.log('[AppOpenAd] App retornou ao foreground');
      
      if (config?.autoShow !== false) {
        await showAppOpenAdIfAllowed(config);
      }
    }
    previousAppState = nextAppState;
  };

  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  console.log('[AppOpenAd] Listener de AppState inicializado');
}

/**
 * Remover listener de AppState
 */
export function removeAppOpenAdListener(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
    console.log('[AppOpenAd] Listener de AppState removido');
  }
}

/**
 * Verificar se App Open Ad está carregado
 */
export function isAppOpenAdReady(): boolean {
  return isLoaded && appOpenAd !== null;
}

/**
 * Resetar estado
 */
export function resetAppOpenAd(): void {
  appOpenAd = null;
  isLoading = false;
  isLoaded = false;
  lastShownTimestamp = 0;
  removeAppOpenAdListener();
}
