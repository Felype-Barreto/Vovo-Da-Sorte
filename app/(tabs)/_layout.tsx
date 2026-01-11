import { useAdDisplay } from '@/src/ads/AdDisplayContext';
import { showInterstitialIfAllowed } from '@/src/ads/interstitialAd';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Archive, BarChart2, Home, Scan, Settings, Star } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';



const INTERSTITIAL_TAB_SWITCHES = 3; // Exibe após 3 trocas de aba

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const { tabSwitchCount, incrementTabSwitch, resetTabSwitch, interstitialShownThisSession, setInterstitialShown } = useAdDisplay();

  useEffect(() => {
    if (prevPath.current !== pathname) {
      // Troca de aba detectada
      incrementTabSwitch();
      prevPath.current = pathname;
    }
  }, [pathname, incrementTabSwitch]);

  useEffect(() => {
    if (
      tabSwitchCount >= INTERSTITIAL_TAB_SWITCHES &&
      !interstitialShownThisSession
    ) {
      showInterstitialIfAllowed();
      setInterstitialShown();
      resetTabSwitch();
    }
  }, [tabSwitchCount, interstitialShownThisSession, setInterstitialShown, resetTabSwitch]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#20d361',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.70)',
        tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
        tabBarStyle: {
          height: 74,
        },
      }}>
      {/* ...existing code... */}
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color }) => <Home color={color} size={26} /> }} />
      <Tabs.Screen name="eventos" options={{ title: 'Eventos', tabBarIcon: ({ color }) => <Star color={color} size={26} /> }} />
      {/* <Tabs.Screen name="three" ... /> removido, rota não existe */}
        <Tabs.Screen name="estatistica" options={{ title: 'Estatística', tabBarIcon: ({ color }) => <BarChart2 color={color} size={26} /> }} />
        <Tabs.Screen name="historico" options={{ title: 'Histórico', tabBarIcon: ({ color }) => <Archive color={color} size={26} /> }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scanner', tabBarIcon: ({ color }) => <Scan color={color} size={26} /> }} />
      <Tabs.Screen name="config" options={{ title: 'Config', tabBarIcon: ({ color }) => <Settings color={color} size={26} /> }} />
      {/* Ocultar todas as outras tabs extras do menu */}
      {/* Abas ocultas removidas para otimizar o app */}
    </Tabs>
  );
}
