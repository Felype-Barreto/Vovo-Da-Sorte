// Example: How to Use the Analytics Components

// ============================================
// EXAMPLE 1: Create a Dedicated Analytics Tab
// ============================================

// File: app/(tabs)/analytics.tsx
import React, { useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { BarChart3, TrendingUp, AlertCircle, BookOpen } from 'lucide-react-native';
import { TrendVisualization } from '@/src/components/TrendVisualization';
import { EducationSection } from '@/src/components/EducationSection';
import { AnomalyDetector } from '@/src/components/AnomalyDetector';
import { DataComparison } from '@/src/components/DataComparison';
import { useMegaSenaContext } from '@/src/context/MegaSenaContext';

export default function AnalyticsScreen() {
  const { draws } = useMegaSenaContext();

  // Filter out invalid data
  const validDraws = useMemo(
    () => draws.filter(d => d.numbers && d.numbers.length === 6),
    [draws]
  );

  if (validDraws.length === 0) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>
            Carregando dados... Sincronize primeiro na aba Scanner.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 16, gap: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>
            Sistema de Análises
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            Explore padrões e tendências nos dados da Mega-Sena
          </Text>
        </View>

        {/* Section 1: Trend Visualization */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            📊 Tendências
          </Text>
          <TrendVisualization
            draws={validDraws}
            metric="frequency"
            title="Frequência de Números"
            description="Média de frequência dos números nos últimos sorteios"
          />
          <TrendVisualization
            draws={validDraws}
            metric="sum"
            title="Soma dos Sorteios"
            description="Evolução da soma total das dezenas"
          />
          <TrendVisualization
            draws={validDraws}
            metric="appearance_gap"
            title="Intervalo de Aparições"
            description="Espaço entre aparições dos números mais frequentes"
          />
        </View>

        {/* Section 2: Data Comparison */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            🔍 Comparação de Dados
          </Text>
          <DataComparison draws={validDraws} />
        </View>

        {/* Section 3: Anomaly Detection */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            ⚠️ Detecção de Anomalias
          </Text>
          <AnomalyDetector draws={validDraws} />
        </View>

        {/* Section 4: Education */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            📚 Educação
          </Text>
          <EducationSection />
        </View>

        {/* Footer */}
        <View style={{ paddingVertical: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>
            Total de sorteios analisados: {validDraws.length}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Don't forget to add to app/(tabs)/_layout.tsx:
/*
<Tabs.Screen
  name="analytics"
  options={{
    title: 'Análises',
    headerShown: false,
    tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
  }}
/>
*/

// ============================================
// EXAMPLE 2: Add to Existing Analysis Modal
// ============================================

// File: src/components/AnalysisModal.tsx (addition)
import { TrendVisualization } from './TrendVisualization';
import { AnomalyDetector } from './AnomalyDetector';
import { DataComparison } from './DataComparison';

export function AnalysisModal({ draw, visible, onClose }: Props) {
  // ... existing code ...

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ScrollView>
        {/* Existing analysis content */}
        {/* ... */}

        {/* Add new analytics */}
        <View style={{ padding: 16, gap: 16 }}>
          <TrendVisualization
            draws={allDraws}
            metric="frequency"
            title="Análise de Frequência"
            description="Como este sorteio se compara aos anteriores"
          />
          <AnomalyDetector draws={allDraws} />
          <DataComparison draws={allDraws} />
        </View>
      </ScrollView>
    </Modal>
  );
}

// ============================================
// EXAMPLE 3: Add to Scanner Screen
// ============================================

// File: app/(tabs)/scanner.tsx (addition)
import { AnomalyDetector } from '@/src/components/AnomalyDetector';
import { EducationSection } from '@/src/components/EducationSection';

export default function ScannerScreen() {
  const { draws } = useMegaSenaContext();

  return (
    <ScrollView>
      {/* Existing scanner content */}
      {/* ... */}

      {/* Add anomaly alerts */}
      {draws.length > 10 && (
        <>
          <Text style={{ fontSize: 16, fontWeight: '600', padding: 16 }}>
            🚨 Anomalias Detectadas
          </Text>
          <AnomalyDetector draws={draws} />

          <Text style={{ fontSize: 16, fontWeight: '600', padding: 16, marginTop: 16 }}>
            📚 Dica de Análise
          </Text>
          <EducationSection />
        </>
      )}
    </ScrollView>
  );
}

// ============================================
// EXAMPLE 4: Custom Integration
// ============================================

// File: src/screens/StatsScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { TrendVisualization } from '@/src/components/TrendVisualization';
import { useMegaSenaContext } from '@/src/context/MegaSenaContext';

interface StatsScreenProps {
  period?: 'week' | 'month' | 'all';
}

export function StatsScreen({ period = 'all' }: StatsScreenProps) {
  const { draws } = useMegaSenaContext();
  const [selectedMetric, setSelectedMetric] = useState<'frequency' | 'sum' | 'appearance_gap'>('frequency');

  // Filter draws by period
  const filteredDraws = useMemo(() => {
    if (period === 'all') return draws;

    const now = new Date();
    const cutoff = new Date(now);

    if (period === 'week') {
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (period === 'month') {
      cutoff.setMonth(cutoff.getMonth() - 1);
    }

    return draws.filter(d => new Date(d.dateISO) >= cutoff);
  }, [draws, period]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Metric selector buttons */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {(['frequency', 'sum', 'appearance_gap'] as const).map(metric => (
          <View
            key={metric}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: selectedMetric === metric ? '#20d361' : '#e5e7eb',
            }}
            onTouchEnd={() => setSelectedMetric(metric)}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: selectedMetric === metric ? '#ffffff' : '#111827',
              }}
            >
              {metric === 'frequency' && 'Frequência'}
              {metric === 'sum' && 'Soma'}
              {metric === 'appearance_gap' && 'Intervalo'}
            </Text>
          </View>
        ))}
      </View>

      {/* Visualization */}
      <View style={{ padding: 16 }}>
        <TrendVisualization
          draws={filteredDraws}
          metric={selectedMetric}
          title={`${selectedMetric === 'frequency' ? 'Frequência' : selectedMetric === 'sum' ? 'Soma' : 'Intervalo'} - ${period === 'week' ? 'Última Semana' : period === 'month' ? 'Último Mês' : 'Todos'}`}
        />
      </View>
    </ScrollView>
  );
}

// ============================================
// EXAMPLE 5: Context Integration Pattern
// ============================================

// File: src/context/AnalyticsContext.tsx (optional)
import React, { createContext, useContext } from 'react';
import { useMegaSenaContext } from './MegaSenaContext';

interface AnalyticsContextType {
  draws: MegaSenaDraw[];
  isLoading: boolean;
  error: string | null;
  anomalies: Anomaly[];
  refreshAnalytics: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { draws } = useMegaSenaContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [anomalies, setAnomalies] = React.useState<Anomaly[]>([]);

  const refreshAnalytics = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Trigger re-analysis logic here if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AnalyticsContext.Provider value={{ draws, isLoading, error, anomalies, refreshAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

// ============================================
// EXAMPLE 6: Error Handling & Loading States
// ============================================

import { ActivityIndicator } from 'react-native';

export function SafeAnalyticsScreen() {
  const { draws } = useMegaSenaContext();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#20d361" />
      </View>
    );
  }

  if (!draws || draws.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
          Nenhum dado disponível.{'\n'}Sincronize na aba Scanner primeiro.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {/* Analytics components */}
      <TrendVisualization draws={draws} metric="frequency" title="Análises" />
      <AnomalyDetector draws={draws} />
      <DataComparison draws={draws} />
      <EducationSection />
    </ScrollView>
  );
}

// ============================================
// TIPS & BEST PRACTICES
// ============================================

/*
1. PERFORMANCE
   - Use useMemo to memoize filtered data sets
   - Avoid passing all draws if only recent ones needed
   - Implement pagination for large datasets

2. DATA VALIDATION
   - Always check that draws.length > 0
   - Validate numbers array has exactly 6 items
   - Handle null/undefined gracefully

3. USER EXPERIENCE
   - Show loading indicators for heavy calculations
   - Add pull-to-refresh for data updates
   - Display "no data" messages clearly

4. MEMORY
   - Use ScrollView with appropriate content container styles
   - Avoid creating new arrays on every render
   - Clean up AsyncStorage periodically

5. TESTING
   - Test with <10 draws, ~100 draws, 300+ draws
   - Test network failures and retry logic
   - Test on low-end devices for performance

6. CUSTOMIZATION
   - Edit color constants in each component
   - Modify anomaly thresholds as needed
   - Add/remove education tips easily
*/
