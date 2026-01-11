# Sistema Multi-Loteria: Guia de Implementação

## Visão Geral

O sistema foi refatorado para suportar **5 tipos de loterias**:

- **Mega-Sena**: 60 números, 6 por sorteio (✅ Completo)
- **Lotofácil**: 25 números, 15 por sorteio  
- **Quina**: 80 números, 5 por sorteio
- **Lotomania**: 100 números, 20 por sorteio
- **Dupla Sena**: 50 números, 6 por sorteio (2 sorteios por concurso)

---

## Arquitetura Implementada

### 1. **Tipos Genéricos** (`types.ts`)

```typescript
export type LotteryConfig = {
  id: LotteryType;
  name: string;
  totalNumbers: number;      // ex: 60 para Mega, 25 para Lotofácil
  numbersPerDraw: number;    // ex: 6 para Mega, 15 para Lotofácil
  acumulatesWithoutWinner: boolean;
  apiId: string;             // ID usado na API da Caixa
  hexColor: string;          // Cor primária (ex: #10b981 para Mega)
  secondaryHexColor?: string;
};

export type LotteryDraw<T extends LotteryType = LotteryType> = {
  type: T;
  contest: number;
  dateISO: string;
  numbers: number[];
  accumulatedAmount?: number;
};
```

### 2. **Configurações por Jogo** (`lotteryConfigs.ts`)

Cada jogo tem suas próprias cores e regras:

```typescript
const CONFIGS = {
  megasena: {
    hexColor: '#10b981',      // Emerald
    totalNumbers: 60,
    numbersPerDraw: 6,
  },
  lotofacil: {
    hexColor: '#8b5cf6',      // Violet
    totalNumbers: 25,
    numbersPerDraw: 15,
  },
  quina: {
    hexColor: '#0ea5e9',      // Cyan
    totalNumbers: 80,
    numbersPerDraw: 5,
  },
  lutomania: {
    hexColor: '#f97316',      // Orange
    totalNumbers: 100,
    numbersPerDraw: 20,
  },
  duplasena: {
    hexColor: '#ec4899',      // Pink
    totalNumbers: 50,
    numbersPerDraw: 6,
  },
};
```

### 3. **Engine de Análise Universal** (`weighted.ts`)

Refatorado para aceitar qualquer loteria:

```typescript
// Antes (apenas Mega-Sena)
function generateHotColdBalancedBet(draws: MegaSenaDraw[]): number[]

// Depois (qualquer jogo)
function generateHotColdBalancedBet(
  draws: LotteryDraw[],
  lotteryId: LotteryType = 'megasena',
  options?: {...}
): number[]
```

**Funcionalidades**:
- ✅ Análise de números "quentes" (frequentes)
- ✅ Análise de números "frios" (raros)
- ✅ Balanceamento automático par/ímpar
- ✅ Ponderação adaptativa à quantidade de números do jogo

### 4. **Banco de Dados Multi-Jogo** (`lottery-sqlite.ts`)

Cada jogo possui sua própria tabela com schema dinâmico:

```typescript
// Tabela para Mega-Sena (6 números)
megasena_draws(contest, dateISO, n1, n2, n3, n4, n5, n6, numbersJson)

// Tabela para Lotofácil (15 números)
lotofacil_draws(contest, dateISO, n1, n2, ..., n15, numbersJson)

// Tabela para Lotomania (20 números)
lutomania_draws(contest, dateISO, n1, n2, ..., n20, numbersJson)
```

**API**:

```typescript
// Inserir/atualizar sorteio
await upsertLotteryDraw(draw);

// Buscar por data
const draw = await getLotteryDrawByDateISO('megasena', '2025-01-05');

// Obter máximo concurso
const maxContest = await getMaxContest('lotofacil');

// Listar com filtros
const draws = await listLotteryDraws('quina', {
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  limit: 50,
});
```

### 5. **Sincronização Multi-Jogo** (`lottery-caixa.ts`)

Adapta-se automaticamente a cada loteria:

```typescript
// Buscar qualquer jogo da Caixa
const draw = await fetchCaixaLotteryDraw('lotofacil', contestNumber);

// Carregar histórico completo
const history = await loadCaixaLotteryHistory('quina', { lastN: 300 });

// Obter concurso mais recente
const latest = await fetchCaixaLotteryLatestContestNumber('lutomania');
```

### 6. **Contexto de Seleção de Jogo** (`LotteryContext.tsx`)

Gerencia a loteria atualmente selecionada:

```typescript
// Provider em _layout.tsx
<LotteryProvider>
  {/* App aqui */}
</LotteryProvider>

// Usar em qualquer componente
const { selectedLottery, setSelectedLottery, availableLotteries } = useLottery();

// Mudar de jogo
await setSelectedLottery('lotofacil');
```

### 7. **UI Dinâmica**

#### Seletor de Jogo (`LotterySelector.tsx`)

```tsx
<LotterySelector
  selected={selectedLottery}
  onSelect={setSelectedLottery}
  availableLotteries={availableLotteries}
/>
```

**Resultado**: Pills coloridas (uma por jogo) que refletem a cor primária do jogo.

#### Card de Estatísticas (`LotteryStatsCard.tsx`)

```tsx
<LotteryStatsCard
  lotteryId="lotofacil"
  draws={lotofacilDraws}
  topCount={10}
/>
```

**Resultado**: Card com background colorido mostrando números quentes.

---

## Filtros Específicos por Jogo (`lotteryFilters.ts`)

### Lotofácil: Repetição do Sorteio Anterior

**Insight Estatístico**: 8-10 números tipicamente repetem do sorteio anterior.

```typescript
const repeatCandidates = getLotofacilRepeatCandidates(draws, count: 10);
// Retorna: [{ number: 15, repeatChance: 0.78 }, ...]
```

**Implementação**: Analisa os últimos 50 sorteios e calcula a frequência de repetição por número.

### Lotomania: Jogo Espelho

**Conceito**: Para cada número `n`, gera seu complemento `100 - n`.

```typescript
const baseGame = [5, 12, 23, 45, 67, 89];
const mirrorGame = getLotomaniaeMirrorGame(baseGame);
// Retorna: [11, 33, 44, 55, 78, 95]
```

**Propriedade Matemática**: Manter a mesma distribuição de frequências e acertos.

---

## Exemplo de Uso Completo

### Passo 1: Importar e Configurar Provider

```tsx
// app/_layout.tsx
import { LotteryProvider } from '@/src/context/LotteryContext';

export default function RootLayout() {
  return (
    <LotteryProvider>
      <Stack>
        {/* rotas */}
      </Stack>
    </LotteryProvider>
  );
}
```

### Passo 2: Usar em um Componente

```tsx
// app/(tabs)/index.tsx
import { useLottery } from '@/src/context/LotteryContext';
import { LotterySelector } from '@/src/components/LotterySelector';
import { LotteryStatsCard } from '@/src/components/LotteryStatsCard';
import { loadCaixaLotteryHistory } from '@/src/megasena/lottery-caixa';

export default function Dashboard() {
  const { selectedLottery, setSelectedLottery, availableLotteries } = useLottery();
  const [draws, setDraws] = useState<LotteryDraw[]>([]);

  useEffect(() => {
    // Carregar dados do jogo selecionado
    loadCaixaLotteryHistory(selectedLottery, { lastN: 100 })
      .then(setDraws)
      .catch(console.error);
  }, [selectedLottery]);

  return (
    <View>
      <LotterySelector
        selected={selectedLottery}
        onSelect={setSelectedLottery}
        availableLotteries={availableLotteries}
      />
      <LotteryStatsCard
        lotteryId={selectedLottery}
        draws={draws}
        topCount={10}
      />
    </View>
  );
}
```

### Passo 3: Gerar Bet para Qualquer Jogo

```tsx
import { generateHotColdBalancedBet } from '@/src/megasena/weighted';

// Para Mega-Sena
const betMega = generateHotColdBalancedBet(draws, 'megasena');

// Para Lotofácil
const betLotofacil = generateHotColdBalancedBet(draws, 'lotofacil');

// Para Quina
const betQuina = generateHotColdBalancedBet(draws, 'quina');
```

---

## Próximas Etapas Recomendadas

1. **Atualizar Dashboard Principal**: Integrar `LotteryProvider` e `LotterySelector` no `index.tsx`
2. **Adicionar Tab Multi-Jogo**: Permitir análise simultânea de múltiplas loterias
3. **Implementar Filtros na UI**: Adicionar toggles para Lotofácil (repetição) e Lotomania (espelho)
4. **Estender Dupla Sena**: Modificar `LotteryDraw` para suportar múltiplos sorteios por concurso
5. **Sincronização Inteligente**: Estender `sync-manager.ts` para gerenciar múltiplas loterias em paralelo
6. **Exportação de Análises**: Gerar relatórios comparativos entre loterias

---

## Compatibilidade Regressiva

Todos os módulos originais de **Mega-Sena** continuam funcionando:

- ✅ `fetchCaixaMegaSenaDraw()` → wrapper de `fetchCaixaLotteryDraw()`
- ✅ `generateWeightedBet()` → aceita ambos FrequencyTable e LotteryFrequencyTable
- ✅ Tabelas SQLite existentes não são afetadas

---

## Testes Recomendados

```bash
# Verificar tipos
npx tsc --noEmit

# Validar sincronização multi-jogo
npx ts-node src/megasena/lottery-caixa.ts

# Testar engine de análise
npx ts-node src/megasena/weighted.ts
```
