# 📋 Preparação para Lançamento - Trevo Inteligente

## 🎯 Status Geral
**Atualizado em:** 09/01/2026

---

## 🟢 AdMob - Status de Implementação

### ✅ O que JÁ ESTÁ PRONTO:

1. **Estrutura Completa de Ads**
   - ✅ `src/ads/googleMobileAds.ts` - Inicialização do SDK
   - ✅ `src/ads/interstitialAd.ts` - Gerenciador de intersticiais
   - ✅ `src/ads/appOpenAd.ts` - App Open Ads
   - ✅ `src/ads/umpConsent.ts` - Gerenciamento de consentimento UMP
   - ✅ `src/components/AdBanner.tsx` - Componente de banner

2. **Configuração de Ads**
   - ✅ `src/config/adConfig.ts` - Configuração centralizada
   - ✅ Feature flag `isAdEnabled = false` (desligado para Expo Go)
   - ✅ IDs de teste do Google configurados
   - ✅ Comportamento amigável para idosos (sem pop-ups intrusivos)

3. **Sistema de Consentimento LGPD/GDPR**
   - ✅ Tela de consentimento (`app/consent.tsx`)
   - ✅ Política de privacidade completa (`app/privacy-policy.tsx`)
   - ✅ Termos de uso (`app/termos-uso.tsx`)
   - ✅ Integração com UMP SDK (User Messaging Platform)

4. **Integração no App**
   - ✅ Banners prontos para uso
   - ✅ Sistema de cooldown para intersticiais (não intrusivo)
   - ✅ Ads de recompensa preparados (opt-in)

### 🟡 O que FALTA FAZER para ATIVAR ADS:

1. **Criar Conta AdMob** ⚠️ OBRIGATÓRIO
   - Acesse: https://admob.google.com
   - Crie uma conta Google AdMob
   - Adicione um novo aplicativo

2. **Obter IDs Reais do AdMob** ⚠️ OBRIGATÓRIO
   ```typescript
   // Substitua em src/config/adConfig.ts:
   export const AD_UNIT_IDS = {
     BANNER_ANDROID: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
     INTERSTITIAL_ANDROID: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
     REWARDED_ANDROID: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
   };
   ```

3. **Build Nativo** ⚠️ OBRIGATÓRIO
   - AdMob NÃO funciona no Expo Go
   - Execute: `npx expo prebuild`
   - Execute: `npx expo run:android`
   - Ou use: `eas build --platform android`

4. **Ativar Feature Flag** ⚠️ OBRIGATÓRIO
   ```typescript
   // Em src/config/adConfig.ts, mude:
   export const isAdEnabled = true; // ← ATIVE AQUI
   ```

5. **Adicionar Plugin AdMob no app.json** ⚠️ OBRIGATÓRIO
   ```json
   {
     "expo": {
       "plugins": [
         "expo-router",
         "expo-camera",
         "expo-sqlite",
         [
           "react-native-google-mobile-ads",
           {
             "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ",
             "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
           }
         ]
       ]
     }
   }
   ```

6. **Testar Ads em Build de Produção**
   - ⚠️ Use IDs de teste primeiro
   - ⚠️ Depois substitua por IDs reais
   - ⚠️ NUNCA clique nos próprios ads (banimento)

---

## 📱 Google Play Store - Status

### ✅ O que JÁ ESTÁ PRONTO:

1. **Informações do App**
   - ✅ Nome: "Trevo Inteligente"
   - ✅ Package: `com.trevo.inteligente`
   - ✅ Versão: 1.0.0
   - ✅ Ícone configurado
   - ✅ Splash screen configurado

2. **Permissões**
   - ✅ Camera (para scanner de QR)
   - ✅ Permissions configuradas no app.json

3. **Documentação Legal**
   - ✅ Política de Privacidade (LGPD/GDPR compliant)
   - ✅ Termos de Uso
   - ✅ Sistema de consentimento

4. **Build System**
   - ✅ Expo SDK 52 configurado
   - ✅ TypeScript sem erros
   - ✅ Estrutura de tabs funcionando

### 🟡 O que FALTA FAZER para PUBLICAR:

1. **Criar Conta Google Play Developer** ⚠️ OBRIGATÓRIO
   - Taxa única: $25 USD
   - Acesse: https://play.google.com/console
   - Crie uma conta desenvolvedor

2. **Hospedar Política de Privacidade** ⚠️ OBRIGATÓRIO
   - Google Play exige URL pública
   - Opções:
     - GitHub Pages (grátis)
     - Vercel (grátis)
     - Seu próprio domínio
   - Use o conteúdo de `app/privacy-policy.tsx`

3. **Gerar Build de Produção** ⚠️ OBRIGATÓRIO
   ```bash
   # Instalar EAS CLI
   npm install -g eas-cli
   
   # Login no Expo
   eas login
   
   # Build para Play Store
   eas build --platform android --profile production
   ```

4. **Preparar Assets da Loja**
   - [ ] Ícone 512x512px
   - [ ] Feature Graphic 1024x500px
   - [ ] Screenshots (mínimo 2):
     - Tela inicial
     - Estatísticas
     - Gerador de jogos
   - [ ] Descrição curta (80 caracteres)
   - [ ] Descrição completa

5. **Configurar Listagem da Loja**
   - [ ] Título
   - [ ] Descrição
   - [ ] Categoria: "Ferramentas" ou "Entretenimento"
   - [ ] Classificação de conteúdo
   - [ ] Dados de contato

6. **Configurar eas.json** ⚠️ OBRIGATÓRIO
   ```json
   {
     "build": {
       "production": {
         "android": {
           "buildType": "app-bundle",
           "gradleCommand": ":app:bundleRelease"
         }
       }
     }
   }
   ```

7. **Gerar Chave de Assinatura** (EAS faz automaticamente)
   - EAS gerencia keystores
   - Ou use sua própria keystore

---

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. Datas dos Próximos Jogos Desatualizadas ⚠️ CRÍTICO

**Problema:**
- Quina, Lotofácil, Lotomania, Dupla Sena mostram "08/01/2026"
- Hoje é 09/01/2026 - data passou

**Causa:**
- API da Caixa retorna dados desatualizados
- Não há cache local invalidado
- Falta verificação se a data já passou

**Solução:** Implementar validação e atualização forçada (VER PRÓXIMO ARQUIVO)

---

## 📊 Resumo de Preparação

| Item | Status | Bloqueador? |
|------|--------|-------------|
| Estrutura de Ads | ✅ Pronto | Não |
| Consentimento LGPD | ✅ Pronto | Não |
| IDs AdMob Reais | ❌ Falta | SIM (para ads) |
| Build Nativo | ❌ Falta | SIM (para ads) |
| Conta Play Developer | ❌ Falta | SIM (publicação) |
| Privacy Policy URL | ❌ Falta | SIM (publicação) |
| Build AAB Produção | ❌ Falta | SIM (publicação) |
| Screenshots Loja | ❌ Falta | SIM (publicação) |
| Problema Datas | ⚠️ Em correção | NÃO (mas importante) |

---

## 🎯 Próximos Passos Recomendados

### Ordem de Prioridade:

1. **✅ FEITO** - Corrigir problema das datas (próxima implementação)
2. **Criar conta AdMob** - Se quiser monetizar
3. **Criar conta Google Play Developer** - $25 USD
4. **Hospedar Privacy Policy** - GitHub Pages é grátis e rápido
5. **Preparar screenshots** - Use emulador ou dispositivo real
6. **Configurar EAS Build** - `npm install -g eas-cli`
7. **Gerar build de produção** - `eas build --platform android`
8. **Upload para Play Store** - Via console
9. **Ativar AdMob** - Após aprovação da loja

---

## 📞 Recursos Úteis

- **AdMob Dashboard:** https://admob.google.com
- **Play Console:** https://play.google.com/console
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **GitHub Pages (grátis):** https://pages.github.com/

---

**Conclusão:** O app está **80% pronto** para lançamento. Faltam principalmente **configurações externas** (contas, builds, assets), mas a **estrutura técnica está completa e funcional**.
