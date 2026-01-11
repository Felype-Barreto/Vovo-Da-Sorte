import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { ConsentBanner } from '@/src/components/ConsentBanner';
import { ConsentProvider, useConsent } from '@/src/context/ConsentContext';
import { LotteryProvider } from '@/src/context/LotteryContext';
import { OnboardingProvider, useOnboarding } from '@/src/context/OnboardingContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { initBetsDb } from '@/src/megasena/bets-db';
import { performSyncIfNeeded } from '@/src/megasena/sync-manager';

import { AdDisplayProvider } from '@/src/ads/AdDisplayContext';
import { getGoogleMobileAds, initGoogleMobileAdsIfAvailable } from '@/src/ads/googleMobileAds';
import { useConsentWithAds } from '@/src/components/useConsentWithAds';
import { isAdEnabled } from '@/src/config/adConfig';

// AdMob init is gated and best-effort (no crash on Expo Go).

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore (some environments/dev clients may not register native splash)
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {
        // ignore (some environments/dev clients may not register native splash)
      });
    }
  }, [loaded]);

  useEffect(() => {
    // Inicializar banco de dados de apostas
    initBetsDb().catch((err: any) => {
      console.error('[BetsDB] Erro ao inicializar:', err);
    });

    // Fire-and-forget: check and update DB on app startup (throttled by 1 hour).
    // This ensures the database stays up-to-date with Caixa's latest draws.
    performSyncIfNeeded()
      .then(({ status, synced, checkResult }) => {
        const action = synced ? '[SYNC PERFORMED]' : '[SYNC SKIPPED - Recently updated]';
        console.log(`[MegaSena] ${action} ${checkResult.reason}`);

        if (synced && status.success) {
          const msg =
            status.newDrawsCount > 0
              ? `${status.newDrawsCount} novo(s) concurso(s) sincronizado(s). Banco: Concurso ${status.localLatestContest} | Caixa: Concurso ${status.caixaLatestContest}`
              : `Banco de dados já está em dia (Concurso ${status.localLatestContest})`;
          console.log('[MegaSena] ' + msg);
        } else if (synced && !status.success) {
          console.warn('[MegaSena] Erro na sincronização:', status.error);
        }
      })
      .catch((err) => {
        console.error('[MegaSena] Falha crítica na rotina de atualização:', err);
      });

    // Sincronizar multi-loteria também
    try {
      // Não usar performMultiSyncIfNeeded se não existir
      console.log('[MultiLottery] Multi-sync logic can be implemented when needed');
    } catch (e) {
      // Não critical
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ConsentProvider>
      <OnboardingProvider>
        <SettingsProvider>
          <AdDisplayProvider>
            <RootLayoutNav />
          </AdDisplayProvider>
        </SettingsProvider>
      </OnboardingProvider>
    </ConsentProvider>
  );
}

function RootLayoutNav() {
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { isLoading: consentLoading } = useConsent();
  
  // Sincronizar consentimento com anúncios
  useConsentWithAds();

  useEffect(() => {
    if (!isAdEnabled) return;
    if (!getGoogleMobileAds()) return;

    initGoogleMobileAdsIfAvailable().catch((err) => {
      console.log('AdMob init error:', err);
    });
  }, []);

  if (onboardingLoading || consentLoading) {
    return null;
  }

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
      card: 'transparent',
    },
  };

  return (
    <LotteryProvider>
      <ThemeProvider value={navTheme}>
        <View style={{ flex: 1, backgroundColor: '#181c24' }}>
          {/* PremiumBackground removido para fundo escuro uniforme */}

          <Stack
            initialRouteName={hasCompletedOnboarding ? '(tabs)' : 'welcome'}
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#181c24' } }}
          >
            <Stack.Screen name="consent" options={{ title: 'Consentimento' }} />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="e-se" options={{ title: 'E se?' }} />
            <Stack.Screen name="termos-uso" options={{ title: 'Termos de Uso' }} />
            <Stack.Screen name="privacy-policy" options={{ title: 'Política de Privacidade' }} />
          </Stack>
          {/* Banner de Consentimento GDPR/LGPD */}
          <ConsentBanner />
        </View>
      </ThemeProvider>
    </LotteryProvider>
  );
}
