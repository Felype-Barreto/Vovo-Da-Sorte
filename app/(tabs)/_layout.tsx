import { useAdDisplay } from '@/src/ads/AdDisplayContext';
import { showInterstitialIfAllowed } from '@/src/ads/interstitialAd';
import { Tabs, usePathname } from 'expo-router';
import { Archive, BarChart2, Home, Settings, Star } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native'; // Adicionado Platform para ajuste fino
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const INTERSTITIAL_TAB_SWITCHES = 3;

export default function TabLayout() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const { tabSwitchCount, incrementTabSwitch, resetTabSwitch, interstitialShownThisSession, setInterstitialShown } = useAdDisplay();

  useEffect(() => {
    if (prevPath.current !== pathname) {
      incrementTabSwitch();
      prevPath.current = pathname;
    }
  }, [pathname, incrementTabSwitch]);

  useEffect(() => {
    if (tabSwitchCount >= INTERSTITIAL_TAB_SWITCHES && !interstitialShownThisSession) {
      showInterstitialIfAllowed();
      setInterstitialShown();
      resetTabSwitch();
    }
  }, [tabSwitchCount, interstitialShownThisSession, setInterstitialShown, resetTabSwitch]);

  const adUnitId = __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-1873423099734846/6810230513';

  return (
    <View style={{ flex: 1, backgroundColor: '#181c24' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#20d361',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.60)',
          // AJUSTE DE FONTE: Reduzido de 14 para 10 para caber as 5 abas
          tabBarLabelStyle: { 
            fontSize: 10, 
            fontWeight: '700',
            marginBottom: 5
          },
          tabBarStyle: {
            height: 65, // Altura ideal para mobile em 2026
            backgroundColor: '#181c24',
            borderTopWidth: 0,
            elevation: 0,
          },
          headerShown: false,
        }}>
        
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'Início', 
            tabBarIcon: ({ color }) => <Home color={color} size={22} /> 
          }} 
        />
        
        <Tabs.Screen 
          name="eventos" 
          options={{ 
            title: 'Eventos', 
            tabBarIcon: ({ color }) => <Star color={color} size={22} /> 
          }} 
        />
        
        <Tabs.Screen 
          name="estatistica" 
          options={{ 
            title: 'Análise', // Mudado de 'Estatística' para 'Análise' para não cortar
            tabBarIcon: ({ color }) => <BarChart2 color={color} size={22} /> 
          }} 
        />
        
        <Tabs.Screen 
          name="historico" 
          options={{ 
            title: 'Histórico', 
            tabBarIcon: ({ color }) => <Archive color={color} size={22} /> 
          }} 
        />
        
        <Tabs.Screen 
          name="config" 
          options={{ 
            title: 'Ajustes', // Mudado de 'Config' para 'Ajustes'
            tabBarIcon: ({ color }) => <Settings color={color} size={22} /> 
          }} 
        />
      </Tabs>

      {/* Banner centralizado no rodapé */}
      <View style={{ alignItems: 'center', backgroundColor: '#181c24', paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </View>
  );
}
