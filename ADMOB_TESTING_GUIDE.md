# 📱 Guia de Teste do AdMob - Trevo Inteligente

## ⚠️ IMPORTANTE: AdMob não funciona no Expo Go

O Google Mobile Ads SDK é um módulo **nativo** que requer compilação do app. Expo Go não inclui este módulo.

---

## 🚀 Como Testar os Anúncios

### Opção 1: Build de Desenvolvimento (Recomendado)

```bash
# 1. Instalar dependências nativas
npx expo install react-native-google-mobile-ads

# 2. Fazer prebuild (gera pastas android/ e ios/)
npx expo prebuild

# 3. Rodar no Android
npx expo run:android

# 4. Rodar no iOS (Mac apenas)
npx expo run:ios
```

### Opção 2: EAS Build (Cloud)

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Build de desenvolvimento
eas build --profile development --platform android

# 4. Instalar o APK gerado no celular
```

---

## 🔧 Configuração AdMob (Quando Tiver IDs Reais)

### 1. Criar Conta no AdMob
- Acesse: https://admob.google.com
- Crie uma conta (vinculada ao Google)

### 2. Criar App no AdMob
- Nome: **Trevo Inteligente**
- Plataforma: Android e/ou iOS
- Bundle ID: `com.trevoInteligente` (ou o que definir no app.json)

### 3. Criar Ad Units
Crie 3 unidades de anúncio:

#### a) Banner
- Nome: "Banner Principal"
- Formato: Banner
- Copie o Unit ID (ex: `ca-app-pub-1234567890/0987654321`)

#### b) Interstitial
- Nome: "Interstitial Principal"
- Formato: Intersticial
- Copie o Unit ID

#### c) Rewarded (Opcional)
- Nome: "Recompensa Premium"
- Formato: Com recompensa
- Copie o Unit ID

### 4. Atualizar Configurações

Edite o arquivo: `src/config/adConfig.ts`

```typescript
// Substitua os IDs de teste pelos reais:
export const AD_UNIT_IDS = {
  // iOS
  BANNER_iOS: 'ca-app-pub-1234567890/0987654321',
  INTERSTITIAL_iOS: 'ca-app-pub-1234567890/1122334455',
  REWARDED_iOS: 'ca-app-pub-1234567890/6677889900',

  // Android
  BANNER_ANDROID: 'ca-app-pub-1234567890/0987654321',
  INTERSTITIAL_ANDROID: 'ca-app-pub-1234567890/1122334455',
  REWARDED_ANDROID: 'ca-app-pub-1234567890/6677889900',
};

// Ativar anúncios
export const isAdEnabled = true;
```

### 5. Atualizar app.json

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-1234567890~0987654321",
          "iosAppId": "ca-app-pub-1234567890~0987654321"
        }
      ]
    ]
  }
}
```

---

## 📊 Fluxo de Consentimento (LGPD/GDPR)

### Como Funciona:

1. **Primeira abertura:** Usuário vê tela Welcome
2. **Clica "Começar Agora":** Redireciona para tela de Consentimento
3. **Tela de Consentimento:** Explica claramente sobre dados e publicidade
4. **Usuário escolhe:**
   - **Aceitar:** Marca consentimento + abre formulário UMP do Google
   - **Recusar:** Marca recusa + volta para Welcome
5. **UMP (Google):** Pergunta sobre anúncios personalizados
6. **App abre:** Com configurações salvas

### Testar Consentimento:

```bash
# Limpar dados salvos (AsyncStorage)
# Android
adb shell pm clear com.trevoInteligente

# Ou reinstalar o app
npm run android -- --device
```

---

## 🧪 IDs de Teste do Google

**Atualmente configurados (não geram receita):**

```typescript
// Android
BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111'
INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712'
REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917'

// iOS
BANNER_iOS: 'ca-app-pub-3940256099942544/2934735716'
INTERSTITIAL_iOS: 'ca-app-pub-3940256099942544/4411468910'
REWARDED_iOS: 'ca-app-pub-3940256099942544/1712485313'
```

---

## 🎯 Onde os Anúncios Aparecem

### Banner (Quando Ativado)
- Tela Home/Dashboard: Rodapé fixo
- **Para ativar:** Descomente `<AdBanner />` em `app/(tabs)/index.tsx`

### Interstitial (Implementado, mas desativado)
- Cooldown de 5 minutos entre exibições
- **Para usar:** Chame `showInterstitialIfAllowed()` após ações importantes

```typescript
import { showInterstitialIfAllowed } from '@/src/ads/interstitialAd';

// Exemplo: após gerar 10 jogos
if (gamesGenerated % 10 === 0) {
  await showInterstitialIfAllowed();
}
```

### App Open Ad (Placeholder)
- Apareceria ao retornar ao app do background
- **Aguardando suporte:** Módulo ainda não implementado no react-native-google-mobile-ads v14

---

## 📝 Checklist Pré-Produção

- [ ] Conta AdMob criada
- [ ] App registrado no AdMob
- [ ] 3 Ad Units criadas (Banner, Interstitial, Rewarded)
- [ ] Unit IDs copiados e colados em `adConfig.ts`
- [ ] `isAdEnabled = true` configurado
- [ ] App IDs adicionados no `app.json`
- [ ] Build nativo gerado (`npx expo prebuild`)
- [ ] Testado em dispositivo real Android
- [ ] Testado em dispositivo real iOS (se aplicável)
- [ ] Consentimento testado (aceitar e recusar)
- [ ] Banner aparecendo corretamente
- [ ] Política de Privacidade revisada
- [ ] Termos de Uso revisados
- [ ] Publicado na Play Store / App Store

---

## 🐛 Troubleshooting

### Erro: "TurboModuleRegistry.getEnforcing(...): 'RNGoogleMobileAdsModule' could not be found"

**Solução:** Você está usando Expo Go. Precisa fazer build nativo:
```bash
npx expo prebuild
npx expo run:android
```

### Erro: "AdBanner doesn't exist"

**Solução:** Descomente o import e uso do AdBanner após fazer build nativo:
```typescript
// app/(tabs)/index.tsx
import { AdBanner } from '@/src/components/AdBanner';

// No final do JSX:
<AdBanner />
```

### Anúncios não aparecem

**Verificar:**
1. `isAdEnabled = true` em `adConfig.ts`
2. Usuário aceitou consentimento
3. Build nativo (não Expo Go)
4. Unit IDs corretos (teste ou produção)
5. Internet conectada

### UMP não aparece

**Verificar:**
1. Região configurada corretamente (EU/EEA para testar)
2. Device ID de teste adicionado (em desenvolvimento)
3. Consentimento não foi dado anteriormente (limpar AsyncStorage)

---

## 📚 Documentação Oficial

- **Google AdMob:** https://admob.google.com/home/
- **React Native Google Mobile Ads:** https://docs.page/invertase/react-native-google-mobile-ads
- **UMP SDK:** https://developers.google.com/admob/ump/android/quick-start
- **Expo Prebuild:** https://docs.expo.dev/workflow/prebuild/

---

## 💡 Dicas Finais

1. **Teste com IDs de teste primeiro:** Garanta que tudo funciona antes de usar IDs reais
2. **Monitore no AdMob:** Acompanhe impressões, cliques e receita no dashboard
3. **Respeite o usuário:** Nunca force anúncios demais (cooldowns implementados)
4. **LGPD/GDPR:** Sempre peça consentimento antes de mostrar anúncios
5. **Performance:** Banners consomem dados, respeite o modo "apenas Wi-Fi"

---

**Status Atual:**
- ✅ Estrutura completa implementada
- ✅ Consentimento LGPD/GDPR funcional
- ✅ IDs de teste configurados
- ⏸️ Anúncios desativados (aguardando build nativo)
- ⏸️ Aguardando IDs reais do AdMob

**Quando tudo estiver pronto, é só ativar `isAdEnabled = true` e publicar!** 🚀
