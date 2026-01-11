# 🎨 GDPR/LGPD - Diagrama Visual Completo

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     APP (_layout.tsx)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ConsentProvider (outermost wrapper)                         │
│  ├─ Gerencia estado global de consentimento                 │
│  ├─ Carrega dados de AsyncStorage                           │
│  ├─ Fornece useConsent() hook                               │
│  │                                                          │
│  └─► OnboardingProvider                                     │
│      ├─ Gerencia first-time setup                           │
│      │                                                      │
│      └─► SettingsProvider                                   │
│          ├─ Gerencia user settings                          │
│          │                                                  │
│          └─► LotteryProvider                                │
│              ├─ Gerencia dados de loterias                  │
│              │                                              │
│              └─► RootLayoutNav (componente principal)       │
│                  ├─ Navigation tabs                         │
│                  ├─ App content                             │
│                  └─ Usa useConsent() para dados             │
│                                                              │
│  ConsentBanner (renderizado acima)                           │
│  ├─ Mostra na primeira abertura                             │
│  ├─ Banner principal (bottom sheet)                         │
│  ├─ Modal detalhado (personalizações)                       │
│  └─ Manipula consentimento do usuário                       │
│                                                              │
│  useConsentWithAds() (hook de monitoramento)                │
│  ├─ Monitora mudanças de consentimento                      │
│  ├─ Log de status para debugging                            │
│  └─ Pronto para futuras integrações                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

```
PRIMEIRA ABERTURA
        ↓
ConsentProvider inicia
        ↓
Carrega de AsyncStorage
        ↓
Verifica: hasSeenBanner?
        ├─ SIM → Usa consentimento salvo
        └─ NÃO → mostra ConsentBanner
                ↓
                Usuário escolhe:
                ├─ ❌ Rejeitar Tudo
                │   └─ consentGiven = false
                │   └─ Salva em AsyncStorage
                │
                ├─ ⚙️ Personalizar
                │   └─ Abre Modal
                │   └─ Usuário alterna toggles
                │   └─ Clica "Salvar Preferências"
                │   └─ Salva em AsyncStorage
                │
                └─ ✅ Aceitar Tudo
                    └─ consentGiven = true
                    └─ Salva em AsyncStorage
                ↓
                Banner desaparece
                ↓
                App funciona normalmente
                ↓
PRÓXIMAS ABERTURAS
        ↓
ConsentProvider carrega AsyncStorage
        ↓
hasSeenBanner = true
        ↓
ConsentBanner NÃO aparece
        ↓
App funciona com consentimento prévio
```

---

## 📱 UI Hierarchy

```
┌─────────────────────────────────────────┐
│  App Screen                              │
│                                         │
│  [Navigation / Content]                 │
│                                         │
│  [Botões / Inputs]                      │
│                                         │
└─────────────────────────────────────────┘
                    ↑
      ┌─────────────┴──────────────┐
      │                            │
┌─────────────────────┐   ┌──────────────────────┐
│  ConsentBanner      │   │  ConsentBanner Modal │
│  (Bottom Sheet)     │   │  (Detalhado)         │
├─────────────────────┤   ├──────────────────────┤
│ 🔒 Privacidade...  │   │ Gerenciar...     [X] │
│ [Descrição texto]  │   │                      │
│ 📊 Como usamos:    │   │ 🔐 Necessário   [✓] │
│ • Necessário       │   │ 📊 Analytics   [◯→] │
│ • Analytics        │   │ 📢 Anúncios    [◯→] │
│ • Anúncios        │   │                      │
│ [❌][⚙️][✅]      │   │ ⚠️ Importante       │
│ [Política]        │   │ [Voltar][Salvar]    │
└─────────────────────┘   └──────────────────────┘
      ↓                         ↑
      └────── Modal abre com ───┘
              clique em "⚙️"
```

---

## 💾 AsyncStorage Structure

```
App Installation
       ↓
Primeira Abertura
       ↓
ConsentProvider procura:
  - 'consent_banner_seen'?
  - 'consent_given'?
  ├─ Não encontrou → Mostra banner
  └─ Encontrou → Usa dados salvos
       ↓
Usuário clica num botão
       ↓
      STATE CHANGED
       ↓
┌─────────────────────────────────────┐
│  AsyncStorage atualizado            │
├─────────────────────────────────────┤
│ Key                    │ Value       │
├────────────────────────┼─────────────┤
│ consent_banner_seen    │ "true"      │
│ consent_given          │ "true"      │
│ consent_analytics      │ "true"      │
│ consent_ads            │ "false"     │
└─────────────────────────────────────┘
       ↓
Próximas aberturas
       ↓
ConsentProvider carrega dados
       ↓
App funciona com consentimento prévio
```

---

## 🎯 Decisão Tree (Fluxo de Decisão)

```
                    App Inicia
                        │
                        ↓
            Carregar ConsentContext
                        │
                        ↓
           Ler AsyncStorage (4 chaves)
                        │
                ┌───────┴───────┐
                │               │
            SIM │           NÃO │
          (viu) │         (novo)│
                ↓               ↓
          Usar dados        MOSTRAR
          salvos           BANNER
                │               │
                │               ├─┬─┬─┐
                │               │ │ │ │
                │          ❌  ⚙️ ✅
                │          │   │  │
                │          │   │  └─ Aceita Tudo
                │          │   │    setAll(true)
                │          │   │
                │          │   └─ Personalizar
                │          │      Abre Modal
                │          │      Alterna toggles
                │          │      "Salvar Prefs"
                │          │
                │          └─ Rejeita Tudo
                │             setAll(false)
                │
                └─────────┬─────────┘
                          │
                          ↓
                  Salvar em AsyncStorage
                  (4 chaves)
                          │
                          ↓
                    Banner Fecha
                          │
                          ↓
                  App Funciona Normal
                          │
                          ↓
                  Próxima Abertura:
                  Usa dados salvos
```

---

## 🔐 Segurança & Privacidade

```
Consentimento do Usuário
        ↓
┌───────────────────────────────────┐
│  ConsentContext                   │
│  (Gerencia estado local)           │
├───────────────────────────────────┤
│ • hasSeenBanner                   │
│ • consentGiven                    │
│ • analyticsConsent                │
│ • adsConsent                      │
└───────────────────────────────────┘
        ↓
AsyncStorage
(Persistência local, protegido pelo SO)
        ↓
App Components
(Usam useConsent() para ler dados)
        ↓
┌───────────────────────────────────┐
│  USO DE DADOS                     │
├───────────────────────────────────┤
│ ✓ Analytics         (se consentiu)│
│ ✓ Ads Personalizados(se consentiu)│
│ ✓ Dados Necessários (sempre)      │
│ ✗ Nunca compartilha               │
│ ✗ Sem tracking ID                 │
│ ✗ Sem envio para servidor         │
└───────────────────────────────────┘
```

---

## 📊 Estado Possíveis

```
┌─────────────────────────────────────────────────┐
│  Estado 1: Novo Usuário                         │
├─────────────────────────────────────────────────┤
│ hasSeenBanner:     false                        │
│ consentGiven:      null (aguardando)            │
│ analyticsConsent:  false (padrão)               │
│ adsConsent:        false (padrão)               │
│ ACTION: Mostrar banner                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Estado 2: Aceita Tudo                          │
├─────────────────────────────────────────────────┤
│ hasSeenBanner:     true                         │
│ consentGiven:      true                         │
│ analyticsConsent:  true                         │
│ adsConsent:        true                         │
│ ACTION: App normal, ads personalizados          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Estado 3: Rejeita Tudo                         │
├─────────────────────────────────────────────────┤
│ hasSeenBanner:     true                         │
│ consentGiven:      false                        │
│ analyticsConsent:  false                        │
│ adsConsent:        false                        │
│ ACTION: App normal, sem dados pessoais          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Estado 4: Customizado                          │
├─────────────────────────────────────────────────┤
│ hasSeenBanner:     true                         │
│ consentGiven:      true                         │
│ analyticsConsent:  true (escolheu)              │
│ adsConsent:        false (rejeitou)             │
│ ACTION: Analytics sim, ads genéricos            │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Cores & Design

```
┌─────────────────────────────────────────┐
│  PALETA DE CORES                        │
├─────────────────────────────────────────┤
│  Primária:      #047857 (Verde Trevo)   │
│  Secundária:    #FFFFFF (Branco)        │
│  Fundo:         #F3F4F6 (Cinza Claro)   │
│                                         │
│  BOTÕES:                                │
│  ❌ Rejeitar:    #DC2626 (Vermelho)     │
│  ⚙️ Personalizar: #2563EB (Azul)       │
│  ✅ Aceitar:     #047857 (Verde)        │
│                                         │
│  TOGGLES (ON):  #047857 (Verde)         │
│  TOGGLES (OFF): #D1D5DB (Cinza)         │
└─────────────────────────────────────────┘
```

---

## 📐 Layout Responsivo

```
iPhone 12 (390x844)
┌──────────────────┐
│ App Content      │
│                  │
│                  │
│ ┌──────────────┐ │
│ │  ConsentBann │ │ ← 80% height max
│ │  • Título    │ │ ← Center
│ │  • Desc      │ │ ← Padding 16px
│ │  • Buttons   │ │ ← Stacked
│ └──────────────┘ │
└──────────────────┘

iPad Pro (1024x1366)
┌────────────────────────────────────┐
│ App Content                         │
│                                    │
│                                    │
│ ┌──────────────────────────────┐  │
│ │  ConsentBanner (centered)    │  │
│ │  Max-width: 500px            │  │
│ │  • Título                    │  │
│ │  • Desc                      │  │
│ │  • Buttons (row)             │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida

```
┌─ ConsentProvider monta ─────────────────────┐
│                                             │
│ 1. useEffect roda on mount                  │
│    └─ Carrega 4 chaves de AsyncStorage      │
│                                             │
│ 2. Estado definido com dados carregados     │
│    └─ setConsentBannerSeen(value)           │
│    └─ setConsentGiven(value)                │
│    └─ setAnalyticsConsent(value)            │
│    └─ setAdsConsent(value)                  │
│                                             │
│ 3. ConsentBanner renderizado                │
│    ├─ Se !hasSeenBanner && !consentGiven    │
│    │  └─ Mostra banner                      │
│    └─ Senão                                 │
│       └─ Retorna null                       │
│                                             │
│ 4. Usuário interage                         │
│    ├─ Clica botão                           │
│    └─ handleAccept/Reject/Save()            │
│       └─ Atualiza estado                    │
│       └─ Salva em AsyncStorage              │
│       └─ Close banner                       │
│                                             │
│ 5. useConsentWithAds monitora               │
│    ├─ useEffect com dependências            │
│    └─ Log status no console                 │
│                                             │
└─ Próximo reload: repete a partir do 1.  ───┘
```

---

## ✅ Checklist Arquitetura

```
┌──────────────────────────────────────┐
│  COMPONENTES                          │
├──────────────────────────────────────┤
│ ✅ ConsentContext.tsx                │
│   ├─ ConsentContextType interface    │
│   ├─ ConsentProvider component       │
│   └─ useConsent() hook               │
│                                      │
│ ✅ ConsentBanner.tsx                 │
│   ├─ Banner principal (bottom sheet) │
│   ├─ Modal detalhado                 │
│   └─ Handlers (accept/reject/save)   │
│                                      │
│ ✅ useConsentWithAds.ts              │
│   ├─ Monitor hook                    │
│   └─ Console logging                 │
│                                      │
│ ✅ app/_layout.tsx (modificado)      │
│   ├─ ConsentProvider wrapper         │
│   ├─ useConsent() hook               │
│   ├─ useConsentWithAds() hook        │
│   └─ ConsentBanner render            │
└──────────────────────────────────────┘
```

---

## 🚀 Deploy Pipeline

```
LOCAL (Expo Go)
    ↓
Test no simulator
    ├─ Banner aparece
    ├─ Buttons funcionam
    ├─ Modal abre
    ├─ Toggles funcionam
    └─ AsyncStorage persiste
    ↓
Test em device real
    ├─ iOS device
    ├─ Android device
    └─ Verificar responsividade
    ↓
APP STORE / PLAY STORE
    ├─ Build para produção
    ├─ Verificar Privacy Policy
    ├─ Submeter para review
    └─ Publicar ✅
```

---

## 📚 Referências Visuais

```
LGPD Compliance
├─ ✅ Consentimento Explícito
├─ ✅ Informação Clara
├─ ✅ Opção de Rejeitar
├─ ✅ Preferências Granulares
└─ ✅ Dados Locais (sem envio)

GDPR Compliance
├─ ✅ Consent Given (afirmativo)
├─ ✅ Transparent Communication
├─ ✅ Easy Rejection
├─ ✅ No Coercion
└─ ✅ Documented Consent
```

---

**Diagrama**: Arquitetura Visual Completa
**Data**: 6 de Janeiro de 2026
**Status**: ✅ FINAL
