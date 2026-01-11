# 🚀 Guia Rápido: Integração AdMob no Seu App

## 📋 Em 5 Minutos

### 1️⃣ Verificar Configuração Global
```typescript
// src/config/adConfig.ts
export const isAdEnabled = false; // ← DEIXE ASSIM por enquanto
```

**Status:** ✅ Feature flag desativada
**Resultado:** Nenhum anúncio aparece (app funciona 100%)

---

### 2️⃣ Adicionar Banner em uma Tela

**Arquivo:** `app/(tabs)/index.tsx` (ou qualquer tela)

```tsx
import { AdBanner } from '@/src/components/AdBanner';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Seu conteúdo */}
      </ScrollView>
      
      {/* Banner no rodapé */}
      <AdBanner />
    </View>
  );
}
```

**Resultado:**
- ✅ Se `isAdEnabled = false` → Sem anúncio (height: 0)
- ✅ Se `isAdEnabled = true` + consentimento → Banner aparece no rodapé
- ✅ Não cobre botões de navegação

---

### 3️⃣ Adicionar Reward Ad em Feature Premium

**Arquivo:** `app/(tabs)/simulador.tsx` (ou onde quiser)

```tsx
import { RewardedAdModal } from '@/src/components/RewardedAdModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

export default function SimuladorScreen() {
  const [showReward, setShowReward] = useState(false);

  const handleUnlockAdvanced = async () => {
    // Verificar se já está desbloqueado
    const unlocked = await AsyncStorage.getItem('advancedFeature_until');
    if (unlocked && new Date(unlocked) > new Date()) {
      console.log('Já está desbloqueado!');
      return;
    }

    // Mostrar modal de reward
    setShowReward(true);
  };

  const handleRewardEarned = async () => {
    // Desbloquear por 24 horas
    const unlockedUntil = new Date();
    unlockedUntil.setHours(unlockedUntil.getHours() + 24);

    await AsyncStorage.setItem(
      'advancedFeature_until',
      unlockedUntil.toISOString()
    );

    console.log('✅ Feature desbloqueada por 24h!');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Seu conteúdo */}
      </ScrollView>

      {/* Botão para feature premium */}
      <Pressable
        style={styles.unlockButton}
        onPress={handleUnlockAdvanced}
      >
        <Text>🔒 Desbloquear Simulador Avançado</Text>
      </Pressable>

      {/* Modal de reward ad */}
      <RewardedAdModal
        visible={showReward}
        title="🎬 Simulador Avançado"
        description="Veja a previsão do próximo sorteio"
        rewardText="Acesso por 24h"
        onDismiss={() => setShowReward(false)}
        onReward={handleRewardEarned}
      />
    </View>
  );
}
```

---

### 4️⃣ Verificar Funcionamento

**Com `isAdEnabled = false`:**
```
✅ App funciona 100% normal
❌ Nenhum anúncio aparece
✅ ConsentBanner funciona
✅ Reward Ad modal não mostra (retorna "Consentimento Necessário")
```

**Com `isAdEnabled = true` (depois):**
```
✅ Banner aparece se consentimento = true + adsConsent = true
✅ Reward Ad funciona se consentimento = true + adsConsent = true
❌ Se usuário rejeitou ads → Nenhum anúncio aparece
```

---

## 🎯 Quando Estiver 100% Pronto

### Passo 1: Criar Conta AdMob
```
1. Vá a: https://admob.google.com
2. Clique "Sign In"
3. Crie conta com sua Google Account
```

### Passo 2: Registrar App
```
1. Clique "Apps" → "Add App"
2. Selecione "Outras plataformas"
3. Nome: "Trevo Inteligente"
4. Android Package: com.trevoInteligente
   iOS Bundle ID: com.trevoInteligente
```

### Passo 3: Criar Ad Units
```
1. Clique "Ad Units" → "Add Ad Unit"

BANNER:
- Nome: "Home Banner"
- Tipo: Banner (320x50)
- Obtenha: ca-app-pub-xxx/yyy

REWARD:
- Nome: "Premium Reward"
- Tipo: Rewarded
- Obtenha: ca-app-pub-xxx/zzz
```

### Passo 4: Atualizar Código
```typescript
// src/config/adConfig.ts
export const AD_UNIT_IDS = {
  BANNER_iOS: 'ca-app-pub-XXXX/YYYY', // Seu Unit ID
  REWARDED_iOS: 'ca-app-pub-XXXX/ZZZZ',
  // ... Android também
};
```

### Passo 5: Ativar
```typescript
// src/config/adConfig.ts
export const isAdEnabled = true; // ← ATIVA AQUI
```

### Passo 6: Publicar
```
1. Build para iOS: `npx expo build -p ios`
2. Build para Android: `npx expo build -p android`
3. Submeta na App Store / Play Store
4. AdMob detecta automaticamente
```

---

## 🧪 Testes (sem ativar anúncios reais)

### Teste 1: Com Feature Flag OFF
```typescript
// adConfig.ts
export const isAdEnabled = false;

// Resultado esperado:
// ✅ Banner não aparece
// ✅ Reward Ad modal mostra "Consentimento Necessário"
// ✅ App funciona 100%
```

### Teste 2: Com Feature Flag ON (Test IDs)
```typescript
// adConfig.ts
export const isAdEnabled = true;

// AdBanner.tsx usa: TestIds.BANNER
// useRewardedAd.tsx usa: TestIds.REWARDED

// Resultado esperado:
// ✅ Banner com "Test Banner" aparece
// ✅ Reward Ad modal funciona (Test Ad)
```

### Teste 3: Sem Consentimento
```
1. Limpe AsyncStorage
2. Aceite APENAS "Necessário" (rejeite ads)
3. Resultado:
   ✅ Banner desaparece
   ✅ Reward Ad mostra "Consentimento Necessário"
```

### Teste 4: Com Consentimento
```
1. Limpe AsyncStorage
2. Aceite "Anúncios Personalizados"
3. Resultado:
   ✅ Banner aparece
   ✅ Reward Ad funciona
```

---

## 📊 Exemplo Completo: Análise Avançada

Veja `src/components/AdvancedAnalysisExample.tsx` para exemplo completo com:
- Status de desbloqueio
- Timer de 24h
- Integração com RewardedAdModal
- Persistência em AsyncStorage

---

## ❌ Problemas Comuns

### "Anúncio não aparece"
```
Causa 1: isAdEnabled = false
Solução: Mude para true

Causa 2: consentGiven != true
Solução: Aceite consentimento de ads

Causa 3: adsConsent != true
Solução: Ative toggle de "Anúncios" no ConsentBanner
```

### "Reward Ad não funciona"
```
Causa: Sem consentimento ou feature flag
Solução: Verifique ambos (AdConfig + ConsentContext)
```

### "Banner cobre botões"
```
Causa: Banner altura > espaço disponível
Solução: Ajuste padding ou margin do conteúdo
```

---

## 💡 Dicas Importantes

### ✅ FAÇA:
- ✅ Deixe `isAdEnabled = false` por padrão
- ✅ Ative apenas quando testar com reais Unit IDs
- ✅ Respeite consentimento LGPD/GDPR
- ✅ Use Reward Ads para features premium
- ✅ Mantém banners no rodapé (não intruso)
- ✅ Sem som automático

### ❌ NÃO FAÇA:
- ❌ Ativar anúncios sem ter Unit IDs válidos
- ❌ Ignorar consentimento de usuário
- ❌ Usar intersticiais (intrusivos)
- ❌ Multiple banners na mesma tela
- ❌ Anúncios que abrem sozinhos

---

## 🚀 Próximas Etapas

### Semana 1: Setup
- [ ] Criar conta AdMob
- [ ] Registrar app
- [ ] Criar ad units

### Semana 2: Integração
- [ ] Copiar Unit IDs
- [ ] Atualizar adConfig.ts
- [ ] Testar com Test IDs

### Semana 3: Publicação
- [ ] Ativar `isAdEnabled = true`
- [ ] Build final
- [ ] Submeter App Store / Play Store

---

## 📚 Referências

- [AdMob Console](https://admob.google.com)
- [React Native Google Mobile Ads](https://react-native-google-mobile-ads.web.app)
- [Firebase Console](https://console.firebase.google.com)

---

## ✨ Resultado Final

Seu app terá:
- ✅ Monetização com anúncios (desativável)
- ✅ Respeito à LGPD/GDPR
- ✅ Features premium via Reward Ads
- ✅ Control total (feature flag)
- ✅ Interface amigável para idosos
- ✅ Sem interrupções (opt-in)

**Tudo pronto para publicar na App Store / Play Store!** 🎉

---

**Data:** 6 de Janeiro de 2026
**Status:** ✅ PRONTO PARA USAR
**Feature Flag:** isAdEnabled = false (seguro)
