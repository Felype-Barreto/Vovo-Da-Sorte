import { Tabs } from 'expo-router';
import { Archive, BarChart2, Home, Scan, Settings, Star } from 'lucide-react-native';


export default function TabLayout() {
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Estatística',
          tabBarIcon: ({ color }) => <BarChart2 color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color }) => <Star color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <Archive color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => <Scan color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => <Settings color={color} size={26} />,
        }}
      />
      {/* Ocultar todas as outras tabs extras do menu */}
      <Tabs.Screen name="bolao" options={{ href: null }} />
      <Tabs.Screen name="investidor" options={{ href: null }} />
      <Tabs.Screen name="privacidade" options={{ href: null }} />
      <Tabs.Screen name="resgate" options={{ href: null }} />
      <Tabs.Screen name="simulador" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
