# Analytics System Integration Guide

This guide explains how to integrate the new analytics components into your app.

## New Components Created

### 1. **TrendVisualization.tsx**
Location: `src/components/TrendVisualization.tsx`

**Purpose**: Display metric evolution over time with custom bar chart visualization

**Props**:
```typescript
interface TrendVisualizationProps {
  draws: MegaSenaDraw[];
  metric: 'frequency' | 'appearance_gap' | 'sum';
  title: string;
  description?: string;
}
```

**Metrics**:
- `frequency`: Rolling 20-draw window average frequency per number
- `sum`: Total sum of numbers in each draw
- `appearance_gap`: Average gap between number appearances

**Usage Example**:
```tsx
import { TrendVisualization } from '@/src/components/TrendVisualization';

<TrendVisualization
  draws={allDraws}
  metric="frequency"
  title="Frequência de Números"
  description="Evolução da frequência média dos números nos últimos sorteios"
/>
```

---

### 2. **EducationSection.tsx**
Location: `src/components/EducationSection.tsx`

**Purpose**: Educational content about lottery data analysis for end-users

**Features**:
- 9 expandable education tips covering:
  - Statistical concepts (average vs median, standard deviation)
  - Visualization techniques (line charts, bar charts)
  - Data interpretation and patterns
  - Sample size importance
  - Bias detection

- 4 categories: statistics, visualization, interpretation, data_cleaning
- Category filtering buttons
- "Dica Ouro" (gold tip) motivational section

**Usage Example**:
```tsx
import { EducationSection } from '@/src/components/EducationSection';

<EducationSection />
```

---

### 3. **AnomalyDetector.tsx**
Location: `src/components/AnomalyDetector.tsx`

**Purpose**: Real-time anomaly detection and alerting system

**Props**:
```typescript
interface AnomalyDetectorProps {
  draws: MegaSenaDraw[];
}
```

**Anomaly Types Detected**:
1. **high_frequency** (Severity: HIGH)
   - Numbers appearing >3 standard deviations above average
   - Color: Red (#fef2f2)

2. **unusual_sum** (Severity: MEDIUM)
   - Draw sum >2 standard deviations from mean
   - Color: Yellow (#fffbeb)

3. **gap_pattern** (Severity: LOW)
   - Unusual gaps between number appearances (>3x average)
   - Color: Blue (#eff6ff)

4. **repeated_sequence** (Severity: MEDIUM)
   - ≥4 numbers repeat in consecutive draws
   - Color: Yellow (#fffbeb)

**Features**:
- Dismissible anomaly cards
- AsyncStorage persistence of last 50 anomalies
- Color-coded severity indicators
- Statistical calculations for detection

**Usage Example**:
```tsx
import { AnomalyDetector } from '@/src/components/AnomalyDetector';

<AnomalyDetector draws={allDraws} />
```

---

### 4. **DataComparison.tsx**
Location: `src/components/DataComparison.tsx`

**Purpose**: Side-by-side comparison of data subsets with interactive filtering

**Props**:
```typescript
interface DataComparisonProps {
  draws: MegaSenaDraw[];
}
```

**Filter Modes**:
1. **Time-based**: Last 30, 60, 90 draws (compares two time windows)
2. **Pattern-based**: High/low sums, high/low numbers (>40 vs ≤40)

**Comparison Metrics**:
- Total draws count
- Average sum
- Average frequency per number
- Most common number

**Insights**:
- Automatic calculation of differences between comparison sets
- Percentage change indicators
- Most significant variations highlighted

**Usage Example**:
```tsx
import { DataComparison } from '@/src/components/DataComparison';

<DataComparison draws={allDraws} />
```

---

## Integration Recommendations

### Option 1: Create New "Analytics" Tab
Add a new tab in your `(tabs)` folder with all four components:

```tsx
// app/(tabs)/analytics.tsx
import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TrendVisualization } from '@/src/components/TrendVisualization';
import { EducationSection } from '@/src/components/EducationSection';
import { AnomalyDetector } from '@/src/components/AnomalyDetector';
import { DataComparison } from '@/src/components/DataComparison';
import { useMegaSenaContext } from '@/src/context/MegaSenaContext';

export default function AnalyticsScreen() {
  const { draws } = useMegaSenaContext();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ padding: 16, gap: 16 }}>
        <TrendVisualization
          draws={draws}
          metric="frequency"
          title="Frequência de Números"
        />
        <TrendVisualization
          draws={draws}
          metric="sum"
          title="Soma dos Sorteios"
        />
        <DataComparison draws={draws} />
        <AnomalyDetector draws={draws} />
        <EducationSection />
      </View>
    </ScrollView>
  );
}
```

Then add to `app/(tabs)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="analytics"
  options={{
    title: 'Análises',
    headerShown: true,
    tabBarIcon: ({ color }) => <BarChart3 color={color} />,
  }}
/>
```

### Option 2: Extend AnalysisModal
Add components to your existing `AnalysisModal.tsx`:

```tsx
<TrendVisualization
  draws={selectedDrawData}
  metric="frequency"
  title="Análise de Tendências"
/>
<AnomalyDetector draws={selectedDrawData} />
<DataComparison draws={selectedDrawData} />
```

### Option 3: Add to Scanner Screen
Add education and anomaly detection to `app/(tabs)/scanner.tsx`:

```tsx
<AnomalyDetector draws={allDraws} />
<EducationSection />
```

---

## Data Flow

All components expect:
- `draws`: Array of `MegaSenaDraw` objects with at minimum:
  - `numbers`: number[] (6-60 values)
  - `dateISO`: ISO date string
  - Any other fields in your `MegaSenaDraw` interface

Get draws from your context or database:
```tsx
import { useMegaSenaContext } from '@/src/context/MegaSenaContext';

const { draws } = useMegaSenaContext();
// or
const { data: draws } = await db.query('SELECT * FROM megasena');
```

---

## Styling

All components use a consistent design system:
- **Primary Green**: `#20d361` (sorte/luck)
- **Dark Petróleo**: `#004a44` (background)
- **Light Gray**: `#f3f4f6` (cards)
- **Borders**: `#e5e7eb`, `#e2e8f0`

Customize by editing the `styles` objects in each component file.

---

## Performance Considerations

- **TrendVisualization**: O(n) complexity, optimized with `useMemo`
- **AnomalyDetector**: O(n²) for gap calculations, acceptable for <300 draws
- **DataComparison**: O(n) with sorting, efficient filtering
- **EducationSection**: Static content, no performance impact

For datasets > 1000 draws, consider implementing:
- Data windowing (show only recent draws)
- Lazy loading with pagination
- Background processing with Worker threads

---

## Future Enhancements

- [ ] Lottie animations for smooth transitions
- [ ] Export/share analysis reports
- [ ] Custom threshold configuration for anomalies
- [ ] Social sharing integration
- [ ] Advanced statistical models (regression, clustering)
- [ ] Real-time notification system
- [ ] Analytics dashboard with multiple metrics
- [ ] Predictive analysis based on historical patterns
