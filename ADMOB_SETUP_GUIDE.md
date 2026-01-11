# 🎯 Guia: Configuração Real do AdMob

## 1️⃣ Registrar no Google AdMob

### Passo 1: Criar Conta Google AdMob
1. Acesse: https://admob.google.com
2. Clique em "COMEÇAR" (Sign In com sua conta Google)
3. Preencha formulário:
   - Nome da conta: "Site Jogos"
   - Timezone: America/Sao_Paulo
   - Moeda: BRL (Real Brasileiro)
4. Aceite os termos
5. Clique em "Criar conta AdMob"

### Passo 2: Adicionar App
1. No painel AdMob, clique: **Aplicativos** → **Adicionar aplicativo**
2. Selecione: **Android** (para Google Play)
3. Preencha:
   - Nome do app: "Site Jogos"
   - Google Play ID: `com.site_jogos` (será usado no build)
4. Clique em **Criar**

---

## 2️⃣ Gerar Ad Unit IDs

### Para Banner
1. Clique no seu app → **Unidades de publicidade**
2. Clique em **Novo**
3. Formato: **Banner**
4. Nome: "Homepage Banner"
5. Gere o ID (será algo como: `ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy`)

### Para Intersticial
1. Clique em **Novo**
2. Formato: **Intersticial**
3. Nome: "Game Generator Intersticial"
4. Gere o ID

### Para Vídeo Premiado (Opcional)
1. Clique em **Novo**
2. Formato: **Vídeo Premiado**
3. Nome: "Premium Feature Reward"
4. Gere o ID

---

## 3️⃣ Adicionar IDs ao Projeto

### Editar [app/_layout.tsx](app/_layout.tsx)
```tsx
// Não altere a inicialização do AdMob, apenas substitua os TestIds nos componentes:
```

### Editar [src/components/AdBanner.tsx](src/components/AdBanner.tsx)
```tsx
interface AdBannerProps extends ViewProps {
  unitId?: string; // ← Substitua o valor padrão aqui
}

export const AdBanner: React.FC<AdBannerProps> = ({
  unitId = "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYYYYYY", // ← Seu real ID do Banner
  // ...
```

### Editar [src/components/useInterstitialAd.tsx](src/components/useInterstitialAd.tsx)
```tsx
export const useInterstitialAd = (unitId?: string) => {
  const adUnitId = unitId || "ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZZZZZZZ"; // ← Seu real ID Intersticial
```

### Editar [src/components/useRewardedAd.tsx](src/components/useRewardedAd.tsx)
```tsx
export const useRewardedAd = (unitId?: string) => {
  const adUnitId = unitId || "ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWWWWWWWW"; // ← Seu real ID Reward
```

---

## 4️⃣ Configurar Identificador de App (app.json)

### Editar [app.json](app.json)
```json
{
  "expo": {
    "name": "Site Jogos",
    "slug": "site_jogos",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "plugins": [
      "expo-router",
      "expo-camera",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "com.site_jogos",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~WWWWWWWWWW"
        }
      ]
    ],
    "android": {
      "package": "com.site_jogos",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "ios": {
      "bundleIdentifier": "com.site_jogos",
      "supportsTabletMode": true
    }
  }
}
```

> **Nota**: Substitua `XXXXXXXXXXXXXXXX~WWWWWWWWWW` pelo seu real ID do App iOS do AdMob

---

## 5️⃣ Build para Produção

### Comando EAS Build (Android)
```bash
npx eas build --platform android --release
```

### Processo:
1. Será solicitado login no EAS
2. Enviará código para build na nuvem
3. Gera arquivo `.aab` (Android App Bundle)
4. Download automático para Releases

### Testar Localmente (APK)
```bash
npx eas build --platform android --profile preview
```

Isso gera um APK que pode instalar no seu telefone para testar antes de publicar.

---

## 6️⃣ Publicar no Google Play

### Pré-requisitos:
- [ ] Conta Google Play Developer ($25)
- [ ] Arquivo `.aab` do EAS Build
- [ ] Privacidade Policy ([veja aqui](PRIVACY_POLICY.md))
- [ ] Termos de Uso ([veja aqui](app/termos-uso.tsx))
- [ ] 2 screenshots (mínimo)
- [ ] Descrição do app

### Passos:
1. Acesse: https://play.google.com/console
2. **Criar aplicativo** → "Site Jogos"
3. Preencha questões obrigatórias:
   - Categoria: **Lifestyle** ou **Utility**
   - Conteúdo adequado para maiores de idade: Sim/Não
   - COPPA (menores de 13): Não
4. Na seção **Produção**:
   - Upload do `.aab`
   - Versão: 1
   - Changelog: "Lançamento inicial com análise de números da Mega-Sena"
5. **Listing da loja**:
   - Título: "Site Jogos - Análise de Loterias"
   - Descrição curta: "Acompanhe resultados, analise padrões e crie seus jogos"
   - Descrição completa: [Use a do MONETIZATION_GUIDE.md](MONETIZATION_GUIDE.md)
   - Screenshots: Mínimo 2 (Início, Estatísticas)
   - Imagem de feature: 1024x500 (pede no console)
   - Icon: 512x512
6. **Classificação de conteúdo**:
   - IARC (agora integrado ao console)
   - Responda o questionário
7. **Precificação e distribuição**:
   - Gratuito
   - Países: Global (ou customize)
8. **Clique em "Enviar para análise"**

---

## 7️⃣ Monitoramento

### No AdMob Console:
- **Relatórios** → Ver impressões, cliques, receita
- **Configurações** → Pagar via AdSense (Google Adsense)
- **Mediar** → Configurar mediação de redes (opcional)

### Ganhos Esperados:
Veja estimativas em [MONETIZATION_GUIDE.md#financial-projections](MONETIZATION_GUIDE.md)

---

## ⚠️ Dicas Importantes

1. **TestIds em Desenvolvimento**:
   - Use TestIds nos emuladores (para não usar cota de impressões reais)
   - Mude para IDs reais apenas no `.aab` final

2. **Rejeição Comum**:
   - Google rejeita apps que cobram por acessar info pública
   - Site Jogos é informacional apenas → ✅ Aceito
   - Não simule apostas reais → ✅ Não faz isso

3. **Recebimento de Ganhos**:
   - Mínimo: R$ 100 por mês
   - Pagamento: Mensal (AdSense) → Sua conta bancária
   - Demora: 21-26 dias após fechamento do mês

4. **Política de Privacidade**:
   - Acesse [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
   - Cole como link em Play Store
   - AdMob já respeita LGPD (não-personalizado)

---

## 🔐 Credenciais Seguras

**NUNCA comite seus Ad Unit IDs em repositório público!**

Use variáveis de ambiente:
```bash
# .env (adicione ao .gitignore)
EXPO_PUBLIC_BANNER_AD_UNIT_ID=ca-app-pub-xxx/yyy
EXPO_PUBLIC_INTERSTITIAL_AD_UNIT_ID=ca-app-pub-xxx/zzz
```

Acesse no código:
```tsx
const bannerAdUnitId = process.env.EXPO_PUBLIC_BANNER_AD_UNIT_ID;
```

---

## 📞 Suporte

- **Google AdMob**: https://admob.google.com/home
- **Google Play Console**: https://play.google.com/console
- **React Native Google Mobile Ads**: https://github.com/invertase/react-native-google-mobile-ads

---

**Configuração concluída! Você agora pode ganhar dinheiro com o Site Jogos 💰**
