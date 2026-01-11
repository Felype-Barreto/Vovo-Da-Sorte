# 📱 AdMob SDK - Implementação Completa com Feature Flag

## ✅ O que foi implementado

### 1️⃣ Configuração Global (adConfig.ts)
**Arquivo**: `src/config/adConfig.ts`

```typescript
// 🔴 FEATURE FLAG - CONTROLE GLOBAL
export const isAdEnabled = false; // ← Mude para true quando pronto
```

**Características:**
- ✅ Feature flag global `isAdEnabled = false`
- ✅ Unit IDs para iOS e Android
- ✅ Configuração de comportamento (banner, interstitial, reward)
- ✅ Helper functions: `isAdTypeEnabled()`, `areAdsEnabled()`
- ✅ Integração com LGPD/GDPR consent

### 2️⃣ Banner Ad Melhorado (AdBanner.tsx)
**Arquivo**: `src/components/AdBanner.tsx`

**Características:**
- ✅ Respeita feature flag `isAdEnabled`
- ✅ Respeita consentimento LGPD/GDPR (ConsentContext)
- ✅ Fixo no rodapé (não cobre botões de navegação)
- ✅ Sem som automático
- ✅ Responsivo para idosos (visual claro)

**Quando aparece:**
```
isAdEnabled = true AND
consentGiven = true AND
adsConsent = true
```

**USO:**
```tsx
// Em uma tela qualquer
import { AdBanner } from '@/src/components/AdBanner';

export default function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Conteúdo da tela */}
      <Text>Conteúdo aqui...</Text>
      
      {/* Banner no rodapé */}
      <AdBanner />
    </View>
  );
}
```

### 3️⃣ Reward Ad Modal (RewardedAdModal.tsx)
**Arquivo**: `src/components/RewardedAdModal.tsx`

**Características:**
- ✅ Modal com apresentação clara
- ✅ Respeita feature flag + consent
- ✅ Animação smooth
- ✅ Mensagem de recompensa clara
- ✅ Sem coerção (usuário escolhe ver)
- ✅ Loading state enquanto carrega anúncio

**USO:**
```tsx
import { RewardedAdModal } from '@/src/components/RewardedAdModal';
import { useState } from 'react';

export default function MyScreen() {
  const [showReward, setShowReward] = useState(false);

  return (
    <>
      <Pressable onPress={() => setShowReward(true)}>
        <Text>Desbloquear Feature Premium</Text>
      </Pressable>

      <RewardedAdModal
        visible={showReward}
        title="🎬 Assista um Vídeo Curto"
        description="Ganhe acesso por 24 horas"
        rewardText="Acesso Premium por 24h"
        onDismiss={() => setShowReward(false)}
        onReward={() => {
          // Salvar desbloqueio em AsyncStorage
          unlockFeatureFor24h();
        }}
      />
    </>
  );
}
```

### 4️⃣ Hook para Reward Ads (useRewardedAd.tsx)
**Arquivo**: `src/components/useRewardedAd.tsx`

**Melhorado com:**
- ✅ Feature flag + consent check
- ✅ Logging detalhado
- ✅ Melhor error handling
- ✅ Estado `canShowAd` para verificação local

**USO:**
```tsx
import { useRewardedAd } from '@/src/components/useRewardedAd';

export default function MyScreen() {
  const { showRewardedAd, isLoading, canShowAd } = useRewardedAd();

  const handleUnlock = async () => {
    if (!canShowAd) {
      console.log('Anúncio não disponível');
      return;
    }

    const earned = await showRewardedAd();
    if (earned) {
      // Usuário completou o vídeo!
      unlockFeature();
    }
  };

  return (
    <Pressable onPress={handleUnlock} disabled={!canShowAd || isLoading}>
      <Text>
        {isLoading ? 'Carregando...' : 'Desbloquear com Vídeo'}
      </Text>
    </Pressable>
  );
}
```

### 5️⃣ Exemplo Completo (AdvancedAnalysisExample.tsx)
**Arquivo**: `src/components/AdvancedAnalysisExample.tsx`

**Mostra:**
- ✅ Feature com status bloqueado/desbloqueado
- ✅ Timer de 24h de acesso
- ✅ Integração com RewardedAdModal
- ✅ Persistência em AsyncStorage
- ✅ UI otimizada para idosos

---

## 🎯 Fluxo de Decisão

```
Usuario clica "Ver Análise Avançada"
        ↓
┌──────────────────────────────┐
│ Verificar Desbloqueio        │
├──────────────────────────────┤
│ AsyncStorage tem unlock key?  │
│ Ainda está válido (24h)?      │
└──────────────────────────────┘
        ↓
    ┌───┴────┐
    │         │
  SIM       NÃO
    │         │
    ↓         ↓
  MOSTRA   MOSTRA
  CONTEÚDO MODAL
    │         │
    │         └─────────────┐
    │                       ↓
    │         ┌──────────────────────┐
    │         │ Reward Ad Modal      │
    │         ├──────────────────────┤
    │         │ 1. Carregar anúncio  │
    │         │ 2. Usuário vê vídeo  │
    │         │ 3. Ganhou recompensa │
    │         │ 4. Salva unlock 24h  │
    │         │ 5. Mostra conteúdo   │
    │         └──────────────────────┘
    │
    └────────────┬───────────────┘
                 ↓
            CONTEÚDO VISÍVEL
```

---

## 🚀 Como Usar

### Passo 1: Verificar Feature Flag
```typescript
// src/config/adConfig.ts
export const isAdEnabled = false; // ← Mude para true QUANDO PRONTO
```

### Passo 2: Adicionar Unit IDs do AdMob
```typescript
// src/config/adConfig.ts
export const AD_UNIT_IDS = {
  BANNER_iOS: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy', // ← Seu Unit ID
  REWARDED_iOS: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy',
  // ... Android também
};
```

### Passo 3: Usar em Telas

**Para Banner (rodapé):**
```tsx
import { AdBanner } from '@/src/components/AdBanner';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Conteúdo */}
      </ScrollView>
      <AdBanner />
    </View>
  );
}
```

**Para Reward Ad (feature premium):**
```tsx
import { RewardedAdModal } from '@/src/components/RewardedAdModal';
import { useState } from 'react';

export default function AdvancedAnalysisScreen() {
  const [showReward, setShowReward] = useState(false);

  return (
    <>
      <Pressable onPress={() => setShowReward(true)}>
        <Text>🔒 Desbloquear Análise Avançada</Text>
      </Pressable>

      <RewardedAdModal
        visible={showReward}
        title="🎬 Análise Avançada"
        description="Assista um vídeo para ganhar 24h de acesso"
        rewardText="Acesso por 24h"
        onDismiss={() => setShowReward(false)}
        onReward={() => {
          // Salve em AsyncStorage que foi desbloqueado
          AsyncStorage.setItem('advancedAnalysis_unlockedUntil', 
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
        }}
      />
    </>
  );
}
```

---

## 🔒 Conformidade LGPD/GDPR

**Banner Ad:**
```
Mostra APENAS se:
✅ isAdEnabled = true
✅ consentGiven = true (ConsentContext)
✅ adsConsent = true (ConsentContext)
```

**Reward Ad:**
```
Mostra APENAS se:
✅ isAdEnabled = true
✅ consentGiven = true (ConsentContext)
✅ adsConsent = true (ConsentContext)
✅ Usuário clica para ver (opt-in)
```

---

## 📊 Configuração de Comportamento

```typescript
// src/config/adConfig.ts
export const adBehavior = {
  // Banners (sempre seguro)
  showBannerAds: true,        // Fixo no rodapé
  bannerHeight: 50,            // Altura padrão
  
  // Intersticiais (DESATIVADO - intrusivo)
  showInterstitials: false,    // ← Desativado para idosos
  interstitialFrequency: 0,    // Nunca mostrar
  
  // Anúncios de Recompensa (MELHOR)
  showRewardedAds: true,       // ← Ativado (opt-in)
  rewardValue: 'Acesso por 24h',
  
  // Sem Som
  muteAdsAudio: true,          // ← Sem som automático
};
```

---

## 🧪 Como Testar

### Teste 1: Feature Flag Desativada
```typescript
// Em adConfig.ts
export const isAdEnabled = false; // ← Deixe assim
```

**Esperado:**
- ❌ Nenhum anúncio aparece
- ❌ ConsentBanner funciona normalmente
- ✅ App funciona 100%

### Teste 2: Ativar Feature Flag
```typescript
// Em adConfig.ts
export const isAdEnabled = true; // ← Mude temporariamente
```

**Esperado:**
- Usando Test IDs do React Native AdMob:
  - ✅ Banner Test ID aparece no rodapé
  - ✅ Reward Ad Test ID pode ser aberto

### Teste 3: Sem Consentimento
1. Limpe AsyncStorage
2. Aceite apenas "Necessário" (rejeite ads)
3. Esperado:
   - ❌ Banner não aparece
   - ❌ Reward Ad modal mostra "Consentimento Necessário"

### Teste 4: Com Consentimento
1. Limpe AsyncStorage
2. Aceite "Anúncios Personalizados"
3. Esperado:
   - ✅ Banner aparece
   - ✅ Reward Ad funciona

---

## 📝 Checklist Pré-Produção

```
□ Crie conta em https://admob.google.com
□ Registre seu app (Bundle: com.trevoInteligente)
□ Crie Ad Units (Banner, Interstitial, Rewarded)
□ Copie Unit IDs para AD_UNIT_IDS
□ Mude isAdEnabled = false → true
□ Teste em iOS Simulator com test ID
□ Teste em Android Emulator com test ID
□ Teste com consentimento ativado
□ Teste com consentimento rejeitado
□ Verifique que banner não cobre botões
□ Verifique que sem som automático
□ Teste Reward Ad (usuário vê vídeo, ganha acesso 24h)
□ Teste persistência (AsyncStorage salva desbloqueio)
□ Verifique logs [AdBanner], [RewardedAd], [AdMob]
□ Publique na App Store / Play Store
```

---

## 🔍 Logs para Debugging

```typescript
// Banner
[AdBanner] Anúncio não será mostrado (feature flag desativada)
[AdBanner] Anúncio não será mostrado (sem consentimento geral)
[AdBanner] Anúncio não será mostrado (sem consentimento de ads)
[AdBanner] Anúncio carregado com sucesso

// Reward Ad
[useRewardedAd] Não pode carregar: sem consentimento ou feature flag
[useRewardedAd] Reward ad carregado
[useRewardedAd] Recompensa ganha: {amount, type}
[useRewardedAd] Anúncio fechado
[useRewardedAd] RESULTADO: RECOMPENSA GANHA
```

---

## 💡 Estratégia de Monetização para Idosos

### ❌ NÃO FAÇA:
- ❌ Intersticiais que interrompem o fluxo
- ❌ Pop-ups com som alto
- ❌ Anúncios que abrem sozinhos
- ❌ Múltiplos banners na mesma tela
- ❌ Anúncios que fingem ser botões

### ✅ FAÇA:
- ✅ Banners fixos no rodapé
- ✅ Anúncios de recompensa (opt-in)
- ✅ Recompensa clara ("Acesso por 24h")
- ✅ Sem som automático
- ✅ Deixar usuário em controle (consentimento)

### 🎁 Melhor Modelo: Reward Ads
```
Usuário quer: Feature Premium
         ↓
Sistema oferece: "Assista vídeo para ganhar"
         ↓
Usuário escolhe: "Vejo o vídeo"
         ↓
Resultado: "Você ganhou acesso por 24h!"
         ↓
SUCESSO: Monetização + User Happiness!
```

**Por que funciona:**
- Usuário não gasta dinheiro
- RPM (Revenue Per Mille) é MUITO alto
- Usuário sente que "ganhou" algo
- Sem fricção no user experience

---

## 🚨 Erros Comuns

### Erro 1: Anúncio não aparece
```
Causa: isAdEnabled ainda é false
Solução: Mude para true (quando pronto)
```

### Erro 2: Anúncio aparece mas usuário rejeitou ads
```
Causa: Não verifica ConsentContext
Solução: Já feito no AdBanner.tsx ✅
```

### Erro 3: Banner cobre botões de navegação
```
Causa: Altura do banner mal configurada
Solução: Ajuste adBehavior.bannerHeight
```

### Erro 4: Som automático do anúncio
```
Causa: muteAdsAudio = false
Solução: Mude para true ✅ (já está)
```

---

## 📈 Estatísticas Esperadas

Com strategy correta para idosos:

```
Banner CTR:        2-3% (bom para rodapé)
Reward Ad Rate:    15-25% (opt-in é ouro)
RPM Banner:        $0.50-$1.50 / 1000 views
RPM Reward:        $2.00-$5.00 / video completado

Exemplo: 1000 usuários/dia
- 50 veem banner (5%) = $0.50-1.50/dia
- 200 clicam reward (20%) = $400-1000/dia (muito melhor!)
```

---

## 🎯 Próximos Passos

1. **Configurar AdMob:**
   - Vá a https://admob.google.com
   - Registre seu app
   - Crie ad units (Banner, Rewarded)
   - Copie Unit IDs

2. **Substituir Test IDs:**
   - Atualize `AD_UNIT_IDS` com seus reais

3. **Ativar Anúncios:**
   - Mude `isAdEnabled = true`
   - Apenas quando 100% pronto!

4. **Testar em Produção:**
   - iOS real device
   - Android real device
   - Verificar comportamento com rede

5. **Publicar:**
   - App Store (iOS)
   - Play Store (Android)

---

**Implementação**: 6 de Janeiro de 2026
**Status**: ✅ COMPLETO
**Feature Flag**: isAdEnabled = false (PRONTO PARA ATIVAR)
