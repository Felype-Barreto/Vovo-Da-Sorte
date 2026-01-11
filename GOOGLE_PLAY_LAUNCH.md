# Guia: Publicar no Google Play Store

## Pré-requisitos

1. **Conta Google Play Developer** (R$ 25, pagto único)
   - Criar em: https://play.google.com/console

2. **Expo EAS Account** (gratuita)
   ```bash
   npx eas login
   ```

3. **Chave de assinatura Android** (gerada automaticamente por EAS)

---

## Passo 1: Preparar o Projeto

### 1.1 Revisar `app.json`
```json
{
  "expo": {
    "name": "Site Jogos",
    "slug": "site_jogos",
    "version": "1.0.0",
    "android": {
      "package": "com.sitejogos.app",
      "versionCode": 1,
      "minSdkVersion": 24
    }
  }
}
```

### 1.2 Validar assets
- ✅ `assets/images/icon.png` (192x192 + 512x512)
- ✅ `assets/images/splash-icon.png` (1080x1920)
- [ ] Screenshots (mínimo 2, máximo 8): Início, Estatísticas, Scanner, Bolão

---

## Passo 2: Gerar Build Android via EAS

### 2.1 Instalar EAS CLI
```bash
npm install -g eas-cli
npx eas login
```

### 2.2 Configurar `eas.json` na raiz do projeto
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "env": {
          "EXPO_USE_EAS_BUILD": "true"
        }
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 2.3 Gerar build
```bash
# Preview APK (para testar)
npx eas build --platform android --profile preview

# Production AAB (para Google Play - recomendado)
npx eas build --platform android --profile production
```

**Tempo**: ~10-15 minutos. EAS enviará link de download do `.aab` (Android App Bundle)

---

## Passo 3: Criar App no Google Play Console

### 3.1 Login e novo app
1. https://play.google.com/console
2. Clique em **"Create App"**
3. Preenchimento:
   - **Nome**: "Site Jogos"
   - **Categoria**: "Utilities" ou "Lifestyle"
   - **Público**: "Não, é informacional"

### 3.2 Preencher informações obrigatórias

#### Na aba **Store Listing**:
- **Título curto** (50 caracteres): "Site Jogos - Análise de Loterias"
- **Descrição curta** (80 caracteres): "Análise estatística para Mega-Sena, Lotofácil e mais"
- **Descrição completa** (4000 caracteres):
```
Site Jogos é um app informacional para análise estatística de loterias brasileiras.

FUNCIONALIDADES:
• Números mais frequentes e análise estatística
• Scanner para ler QR de bilhetes
• Calculador de bolões com divisão proporcional
• Histórico completo de sorteios

IMPORTANTE: Este app é apenas informacional. Não realizamos apostas reais e não oferecemos garantias de acerto. Jogue responsavelmente.

PRIVACIDADE:
Seus dados permanecem no seu dispositivo. Nenhum dado pessoal é coletado ou compartilhado.
```

#### Na aba **Graphics Assets** (Imagens):
- **App Icon**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: 5+ (1080x1920 cada)
  - Tela inicial
  - Estatísticas
  - Scanner
  - Bolão
  - Exemplo de análise

#### Na aba **Content Rating**:
- Clique **"Start Questionnaire"**
- Responder IARC (International App Rating Coalition)
- Categoria esperada: "13+" (ou "3+" dependendo das respostas)

#### Na aba **Pricing & Distribution**:
- **Tipo**: Free
- **Países**: Selecionear Brasil + mundo
- **Conteúdo**:
  - ✅ Contém links externos (Caixa API)
  - ✅ App é informacional sobre jogos de azar
  - ✅ Seguir regulações de privacidade

---

## Passo 4: Upload do APK/AAB

### 4.1 Preparar release
1. Ir para **Release** → **Create New Release**
2. Selecionar **Production** ou **Beta** (recomendado começar em Beta)
3. Clique **Upload** → selecione o `.aab` gerado pelo EAS

### 4.2 Review notes
```
Site Jogos é um app informacional para análise estatística de loterias.

Testado em: Android 8, 10, 12, 13
Funcionalidades principais:
- Análise de números frequentes
- Scanner QR (usando expo-camera)
- Divisor de bolões
- Histórico de sorteios

Sem dependências de publicidade ou rastreamento.
Política de Privacidade: [incluir URL ou arquivo]
Termos de Uso: [incluir URL ou arquivo]
```

---

## Passo 5: Aguardar Review

- **Tempo típico**: 24-48 horas
- **Taxa de rejeição**: <5% para apps informativos simples
- **Motivos comuns de rejeição**:
  - Falta de Política de Privacidade → ✅ Criada
  - Conteúdo enganoso → ✅ Disclaimer claro
  - Anúncios intrusivos → ✅ Sem anúncios por enquanto

---

## Passo 6: Pós-Lançamento

### 6.1 Monitorar
- Google Play Console → **Estatísticas**:
  - Instalações
  - Taxa de desinstalação
  - Crashes
  - Reviews (média de 1-5 ⭐)

### 6.2 Responder reviews
- Resposta positiva reduz desinstalação

### 6.3 Atualizações
```bash
# Incrementar versão
"version": "1.0.1"
"versionCode": 2

# Rebuild
npx eas build --platform android

# Upload novo .aab (versão minor < 48h review)
```

---

## ✅ Checklist Final

- [ ] `app.json` completo com `versionCode` e `minSdkVersion`
- [ ] ✅ Assets: icon.png (512x512) + splash.png
- [ ] [ ] Screenshots 5+ em 1080x1920
- [ ] ✅ Política de Privacidade (PRIVACY_POLICY.md)
- [ ] ✅ Termos de Uso (app/termos-uso.tsx)
- [ ] ✅ TypeScript `tsc --noEmit` OK
- [ ] ✅ iOS bundle export OK
- [ ] Android bundle via EAS OK
- [ ] Conta Google Play Developer criada
- [ ] Conta EAS criada + login
- [ ] `eas.json` configurado
- [ ] Build Android gerado (.aab)
- [ ] App criado no Play Console
- [ ] Informações preenchidas (título, descrição, imagens)
- [ ] IARC questionnaire respondido
- [ ] .aab uploadado em beta
- [ ] Aguardando review (24-48h)
- [ ] Movido para Production após aprovação

---

## Dicas Extras

### 1. Versioning Semântico
- `1.0.0-beta.1` → Beta público
- `1.0.0` → Lançamento oficial
- `1.0.1` → Bug fixes
- `1.1.0` → Novas features

### 2. Analytics
```bash
npm install @react-native-firebase/analytics
```

### 3. Crash Reporting
EAS já integra automaticamente Sentry; monitore em https://sentry.io

### 4. A/B Testing
Usar Play Console **In-App Reviews** para feedback contínuo

---

## Suporte

- **Fórum Expo**: https://forums.expo.dev
- **Google Play Support**: https://support.google.com/googleplay/android-developer
- **Twitter**: @expo, @Play

**Boa sorte no lançamento! 🚀**
