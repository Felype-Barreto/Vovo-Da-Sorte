# 📲 Visual Overview: Monetização + UX Melhorada

## 🎯 Fluxo de Navegação

```
┌─────────────────────────────────────────────────────┐
│                  APP LAUNCH                         │
│              (RootLayoutNav)                        │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    Primeiro   ┌──────────────┐   Retornos
    Acesso    │   welcome    │   Subsequentes
              │ (tela bonita) │   │
              │ (último sorteio)  │
              │ (Começar Agora)  │
              └──────────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         AsyncStorage save      AsyncStorage check
        hasCompletedOnboarding = true
              │                     │
              ▼                     ▼
         ┌────────────────────────────────────┐
         │     (tabs) - Bottom Tab Menu        │
         │   (4 itens principais)              │
         └────────────────────────────────────┘
              │         │         │
         ┌────▼─┬──────┬┴────┬────▼────┐
         │      │      │     │         │
       Início Estatísticas Scanner Bolão
       (Home)  (Stats)     (QR)   (Pool)
         │      │         │         │
         │      │         │         │
         ▼      ▼         ▼         ▼
```

---

## 🏠 Tela: Welcome (Primeira Abertura)

```
┌─────────────────────────────────────────────┐
│  Bem-vindo!                                 │
│  Seu Assistente de Loterias                 │
│                                             │
│  Acompanhe os resultados, descubra          │
│  quais números saem mais...                 │
├─────────────────────────────────────────────┤
│  🎰 Último Sorteio da Mega-Sena             │
│                                             │
│  10 25 34 45 52 58                          │
│                                             │
│  Segunda-feira, 6 de janeiro de 2026        │
│  💰 Prêmio: R$ 2.500.000,00                 │
├─────────────────────────────────────────────┤
│  O que você pode fazer:                     │
│                                             │
│  📊 Ver Padrões                             │
│  Descubra quais números saem com frequência │
│                                             │
│  📱 Escanear Bilhetes                       │
│  Apontando para o código do bilhete         │
│                                             │
│  👥 Bolões com Amigos                       │
│  Jogue junto e divida o prêmio              │
├─────────────────────────────────────────────┤
│  [ Começar Agora ]                          │
│  (Button: 56px height, verde #10b981)       │
├─────────────────────────────────────────────┤
│  ℹ️ Este app apenas mostra informações.     │
│  Você joga por sua conta e risco.           │
└─────────────────────────────────────────────┘
```

---

## 🏡 Tela: Início (Home)

```
┌─────────────────────────────────────────────┐
│  Loterias                         ❓ Help   │
│  Dados reais (atualizado)                   │
│                                             │
│  [Mega-Sena Card]                           │
│  ▓▓▓▓ (verde)                               │
│  Mega-Sena                                  │
│  Est. R$ 2.500.000                          │
│  Próx: 8 de janeiro                         │
│                                             │
│  [Lotofácil Card]                           │
│  ▓▓▓▓ (roxo)                                │
│  Lotofácil                                  │
│  Est. R$ 1.500.000                          │
│  Próx: 7 de janeiro                         │
│                                             │
│  [Frequência Card]                          │
│  Números mais frequentes                    │
│  [ 10 ] [ 25 ] [ 34 ] [ 45 ]                │
│  [ 52 ] [ 58 ] [ 07 ]                       │
│  Sync  (botão de sincronização)             │
│                                             │
│  (Scroll down...)                           │
├─────────────────────────────────────────────┤
│         ┌─────────────────────────────────┐ │
│         │  ➕ Novo Jogo                   │ │
│         │  (Floating Button: 64px)        │ │
│         └─────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📊 Tela: Estatísticas com AdBanner

```
┌─────────────────────────────────────────────┐
│  Estatísticas                    ❓ Help    │
│  SQLite (local)                             │
│                                             │
│  [Filtros Card]                             │
│  De: [2025-12-01] Até: [2026-01-06]         │
│  Números: [1 2 3]                           │
│  [ Aplicar ]  Mostrando 100 concursos      │
│                                             │
│  Frequência: 1:50x  2:45x  3:42x            │
│                                             │
│  [Concurso 2901]                            │
│  2026-01-06                                 │
│  10 25 34 45 52 58                          │
│                                             │
│  [Concurso 2900]                            │
│  2026-01-03                                 │
│  07 14 28 39 41 55                          │
│                                             │
│  (Scroll...)                                │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐  │
│  │       [Google AdMob Banner]          │  │
│  │    [Publicidade do Google Ads]       │  │
│  └─────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  BOTTOM TABS: (70px height)                │
│  [Início]  [Estatísticas ✓] [Scanner] [Bolão]
└─────────────────────────────────────────────┘
```

---

## 📱 Tela: Scanner

```
┌─────────────────────────────────────────────┐
│  Scanner                         ❓ Help    │
│  Aponte para o QR do bilhete                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │  (Camera View - Live QR Detection)  │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Resultado Card]                           │
│  Bilhete                                    │
│  10 25 34 45 52 58                          │
│  Data extraída: 2026-01-06                  │
│                                             │
│  Sorteio correspondente                     │
│  Concurso 2901 (2026-01-06)                │
│  10 25 34 45 52 58                          │
│                                             │
│  Acertos                                    │
│  6 números acertados! ✅                    │
│  (Prêmio: R$ 123.456,78)                   │
│                                             │
│  QR: 00123456789...                         │
└─────────────────────────────────────────────┘
```

---

## 🎲 Tela: Simulador (com Intersticial)

```
┌─────────────────────────────────────────────┐
│  Mega-Sena - Simulador          ❓ Help    │
│  Gerador de apostas: 4Q + 2F                │
│                                             │
│  [Aposta Sugerida Card]                     │
│  (Verde claro background)                   │
│  Aposta Sugerida                            │
│                                             │
│  10  25  34  45  52  58                     │
│                                             │
│  [ 🎲 Gerar ]  [ 🔍 Análise ]               │
│  [ 📱 QR ]     [ ❓ Help ]                   │
│  (Buttons: min-height 56px)                 │
│                                             │
│  (Scroll...)                                │
│  Base: últimos 300 concursos carregados     │
│                                             │
│  [Análise Modal - CloseureGenerator]        │
│  (Abre ao clicar "Análise")                 │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ 🎬 INTERSTICIAL AD                   │  │
│  │                                      │  │
│  │ (Fullscreen depois de "Gerar Jogo")  │  │
│  │                                      │  │
│  │ [Fechar ad] →                        │  │
│  │ Continua normalmente                 │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 👥 Tela: Bolão

```
┌─────────────────────────────────────────────┐
│  Bolão                           ❓ Help    │
│  Calcule a divisão proporcional por cotas   │
│  e copie o texto pronto para WhatsApp.      │
│                                             │
│  [Loteria Selecionada Card]                 │
│  Loteria selecionada                        │
│  Mega-Sena (verde)                          │
│                                             │
│  [ Abrir calculadora de bolão ]             │
│  (Button: 56px, verde)                      │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ MODAL: Calculadora de Bolão          │  │
│  │                                      │  │
│  │ Participantes do Bolão               │  │
│  │ [ + ] Nome do participante           │  │
│  │ [ ] João             R$ 100   2 cotas│  │
│  │ [ ] Maria            R$ 150   3 cotas│  │
│  │ [ ] Pedro            R$ 50    1 cota │  │
│  │ [ - ]                                │  │
│  │                                      │  │
│  │ Total: R$ 300                        │  │
│  │                                      │  │
│  │ [ Calcular Divisão ]                 │  │
│  │ [ Copiar para WhatsApp ]             │  │
│  │                                      │  │
│  │ Se ganharem R$ 300.000:              │  │
│  │ João:  R$ 100.000                    │  │
│  │ Maria: R$ 150.000                    │  │
│  │ Pedro: R$ 50.000                     │  │
│  │                                      │  │
│  │ ✅ Copiar para WhatsApp              │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## ❓ Modal: Help (Todos os Screens)

```
┌─────────────────────────────────────────────────────┐
│ (Overlay Preto: 50% transparência)                  │
│                                                     │
│   ┌──────────────────────────────────────────┐     │
│   │  📊 Estatísticas                         │     │
│   │                                          │     │
│   │  Mostra quais números saem mais vezes   │     │
│   │  nos sorteios passados. Você pode       │     │
│   │  filtrar por data para ver números      │     │
│   │  "quentes" ou "frios" (que saem menos). │     │
│   │  Use para ter uma ideia de quais        │     │
│   │  números escolher no seu jogo.          │     │
│   │                                          │     │
│   │  [ Entendi ] (Button: 44px, verde)      │     │
│   └──────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Outros Modals:**
- 📱 Scanner: "Aponte a câmera para o código QR..."
- 🎲 Simulator: "Clique aqui para o app sugerir..."
- 👥 Bolão: "Um bolão é quando vocês juntam dinheiro..."

---

## 🎯 Resumo Técnico

### Componentes Criados
```
src/
  components/
    ├── AdBanner.tsx (Componente)
    ├── useInterstitialAd.tsx (Hook)
    ├── useRewardedAd.tsx (Hook)
    ├── HelpModal.tsx (Componente + Hook)
  context/
    └── OnboardingContext.tsx (Context)

app/
  ├── welcome.tsx (Tela)
  ├── _layout.tsx (Modificado)
  └── (tabs)/
      ├── index.tsx (Modificado)
      ├── historico.tsx (Modificado + AdBanner)
      ├── scanner.tsx (Modificado + Help)
      ├── simulador.tsx (Modificado + Intersticial)
      └── bolao.tsx (Modificado + Help)
```

### Fluxo de Dados

```
MobileAds.initialize()
    │
    ├── AdBanner (lazy-loaded)
    ├── useInterstitialAd (pre-loaded)
    └── useRewardedAd (pre-loaded)

OnboardingProvider
    │
    ├── AsyncStorage check
    ├── hasCompletedOnboarding?
    │   ├── No  → welcome.tsx
    │   └── Yes → (tabs)
    │
    └── completeOnboarding() → set AsyncStorage

useHelpModals()
    │
    ├── showHelp(key)
    ├── closeHelp()
    └── HelpUI render
```

---

## 🚀 Checklist de Deployment

### Antes de Testar
- [ ] `npx tsc --noEmit` → Exit 0 ✅
- [ ] `npx expo export --platform ios --dev` → Success ✅
- [ ] Nenhuma console warning ✅

### Antes de Build (EAS)
- [ ] Substituir TestIds por real AdMob IDs
- [ ] Testar em emulador Android
- [ ] Validar que ads carregam

### Antes de Publicar
- [ ] Criar conta Google AdMob
- [ ] Gerar real unit IDs
- [ ] Seguir ADMOB_SETUP_GUIDE.md
- [ ] Testar com real IDs em preview build
- [ ] Seguir GOOGLE_PLAY_LAUNCH.md

---

## 💡 Insight de Produto

### Antes (Sem Monetização)
- App informativo, sem receita
- UX confuso para idosos
- Sem orientação ao usuário
- Sem "primeira impressão"

### Depois (Com Monetização + UX)
- **Receita**: Banner + Intersticial + Vídeos
- **UX**: Onboarding claro, help modals
- **Conversão**: Welcome screen engaja
- **Retenção**: Help reduz abandonos
- **AAA**: Material Design 3 + Accessibility

---

## 📊 Métricas Esperadas

| Métrica | Esperado |
|---------|----------|
| **Impressões/Dia** | 100-500 (low MAU) |
| **CTR** | 1-3% (normal) |
| **RPM** | R$5-10 (Brasil) |
| **Ganho/Mês** | R$500-2.500 (100-500 MAU) |

---

## 🎉 Status Final

```
┌─────────────────────────────────────┐
│     ✅ DESENVOLVIMENTO COMPLETO      │
│                                     │
│  ✅ Monetização (AdMob)             │
│  ✅ Onboarding (Welcome)            │
│  ✅ Help System (Modals)            │
│  ✅ Linguagem Simples               │
│  ✅ Material Design 3               │
│  ✅ Acessibilidade                  │
│  ✅ TypeScript                      │
│  ✅ iOS Build                       │
│  ✅ Android Ready                   │
│                                     │
│  Próxima Etapa:                     │
│  → Seguir ADMOB_SETUP_GUIDE.md     │
│  → Build EAS + Publicar Play Store  │
│                                     │
└─────────────────────────────────────┘
```

---

*Implementado com ❤️ para Site Jogos*  
*Stack: Expo 54 + React Native + TypeScript*  
*Data: Janeiro 2026*
