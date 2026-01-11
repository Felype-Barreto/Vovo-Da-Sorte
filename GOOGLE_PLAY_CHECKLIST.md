# Google Play Store - Checklist de Implementação

## ✅ Requisitos de Acessibilidade Atendidos

### Material Design 3 & Elderly-Friendly UI
- [x] **Cores**: Fundo branco/cinza claro + cores vibrantes apenas em cabeçalhos e botões principais
- [x] **Tipografia**: Mínimo 18px para títulos e textos principais; 16px para suplementares
- [x] **Cards elevados**: Cada loteria exibida em card com nome, estimativa de prêmio e próximo sorteio
- [x] **Espaçamento**: Botões e touch targets ≥44-56px de altura
- [x] **Menu**: BottomTabNavigator com 4 itens (Início, Estatísticas, Scanner, Bolão) + ícones claros + legendas

### Acessibilidade Técnica
- [x] `accessibilityRole="button"` em todos os Pressables
- [x] Contraste de texto: branco em cores vibrantes, preto/cinza em fundos claros
- [x] Sem uso de `SafeAreaView` deprecated (usa `react-native-safe-area-context`)
- [x] Nomes descritivos e textos alternativos nos componentes

---

## 📋 Requisitos do Google Play

### 1. Política de Privacidade & Termos
- [x] **Termos de Uso** screen implementada em [app/termos-uso.tsx](app/termos-uso.tsx)
  - Disclaimer: app é informacional, não faz apostas reais
  - Sem garantias
  - Usuário responsável
  - Contato disponível
  
- [ ] **Política de Privacidade**: CRIAR arquivo público (requerido para Google Play)
  - Onde: criar em `PRIVACY_POLICY.md` na raiz ou vincular URL
  - Deve explicar coleta de dados (local cache, Caixa API, nada de rastreamento)

### 2. Ícones & Assets
- [ ] **App Icon** (192x192, 512x512): confirmar em `assets/images/icon.png`
- [ ] **Splash screen** (1080x1920): confirmar em `assets/images/splash-icon.png`
- [ ] **Feature graphic** (1024x500): ainda não existe → criar para Play Store
- [ ] **Screenshots** (5+): exemplos de cada tela (Início, Estatísticas, Scanner, Bolão)

### 3. App.json (app.json)
- [x] Nome: "site_jogos"
- [x] Slug: "site_jogos"
- [x] Versão: "1.0.0" (será "1.0.0-beta" antes de lançar)
- [x] Plugins: expo-router, expo-camera, expo-sqlite
- [x] Suporte a tablet (iOS)
- [ ] **Orientação**: revisar se deve bloquear em "portrait" (idosos podem achar confuso)
- [ ] **Android**: `edgeToEdgeEnabled: true` está OK, mas revisar `predictiveBackGestureEnabled`

### 4. Segurança & APIs
- [x] Integração Caixa: HTTPS + sem armazenar credenciais
- [x] SQLite local: dados offline
- [x] Async storage: cache local (sem dados sensíveis)
- [x] Nenhuma dependência com SDKs publicitários ainda

### 5. Content Rating (IARC)
- [ ] **Questionnaire IARC**: respostas obrigatórias no Google Play
  - Conteúdo: Loteria (jogo de azar) = aviso de maioridade
  - Possível restrição de faixa etária se Play Store detectar

### 6. Versionamento & Build
- [ ] Antes de submeter:
  - Incrementar `versionCode` no app.json
  - Seguir semver: 1.0.0-beta.1, depois 1.0.0
  - Incluir changelog em release notes

### 7. Performance & Testes
- [ ] Teste em dispositivo Android 8+ (minSdkVersion no app.json)
- [ ] Teste em dispositivos idosos (telas menores, fonts grandes)
- [ ] Bundles de 50MB ou menos (Expo Go < 100MB)
- [ ] Tempo de inicialização < 3s

### 8. Monetização (futuro)
- [ ] Definir estratégia:
  - Anúncios (AdMob): requer Google Mobile Ads SDK
  - In-app purchases: venda de "análises premium" ou desbloquear features
  - Freemium: versão básica grátis + premium
  - Atualmente: **nenhuma monetização configurada**

---

## 🚀 Próximos Passos antes do Google Play

1. **Criar `PRIVACY_POLICY.md`**
   ```markdown
   # Política de Privacidade
   
   **Site Jogos** é um app informacional para análise de loterias brasileiras.
   
   ## Coleta de Dados
   - Nenhum dado pessoal é coletado
   - Cache local via AsyncStorage (seu dispositivo)
   - Histórico de sorteios via Caixa API (público, sem login)
   ```

2. **Testar Expo Build (EAS Build)**
   ```bash
   npx eas build --platform android
   ```

3. **Criar conta Google Play Developer** (R$ 25 único)

4. **Upload APK/AAB** e preencher:
   - Descrição (250 caracteres)
   - Catálogo completo (até 4000 caracteres)
   - Screenshots (5+ de cada linguagem)
   - Content rating

5. **Aguardar review** (~24-48h para apps simples)

---

## 📝 Checklist Final antes de Deploy

- [ ] TypeScript `tsc --noEmit` OK
- [ ] iOS bundle export OK
- [ ] Android bundle via EAS OK
- [ ] Termos de Uso vistos por usuário (accept/decline)
- [ ] Política de Privacidade pública (URL ou arquivo)
- [ ] Nenhum warning WARN no console
- [ ] Todas as telas testadas no Expo Go
- [ ] Fontes ≥18 (títulos), ≥16 (corpo)
- [ ] Botões ≥44-56px altura
- [ ] Cores: fundo claro, cores vibrantes apenas em cabeçalhos/botões
