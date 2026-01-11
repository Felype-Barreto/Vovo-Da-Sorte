# Guia de Monetização - Site Jogos

## Estratégias de Monetização Recomendadas

### 1. **Freemium com In-App Purchase** ⭐ (Recomendado)
Ofereça recursos gratuitos básicos + análises premium pagos.

#### Exemplos:
- **Gratuito**: Números frequentes + histórico básico + scanner
- **Premium (R$ 9,90/mês)**:
  - Análise avançada de cobertura (sem limite)
  - Relatórios PDF exportáveis
  - Prognósticos com IA (futuro)
  - Sem anúncios

#### Implementação no código:
```typescript
// Adicionar futura versão em: src/megasena/in-app-purchase.ts
import * as InAppPurchases from 'expo-in-app-purchases';

type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_yearly';

async function unlockPremiumAnalysis() {
  try {
    const purchase = await InAppPurchases.purchaseAsync('premium_monthly');
    // Armazenar no AsyncStorage + validar recibo com backend
  } catch (e) {
    console.error('Purchase error:', e);
  }
}
```

---

### 2. **Anúncios (AdMob)** 📢
Integrar Google Mobile Ads SDK para anúncios em banner/intersticiais.

#### Instalação:
```bash
npm install react-native-google-mobile-ads
npx expo install react-native-google-mobile-ads
```

#### Exemplo de implementação:
```typescript
// src/components/AdBanner.tsx
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

export function AdBanner() {
  return (
    <BannerAd
      unitId="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy"
      size={BannerAdSize.BANNER}
      onAdFailedToLoad={(error) => console.log('Ad failed:', error)}
    />
  );
}
```

**Receita estimada**: R$ 0.50 - R$ 2.00 por 1000 impressões (CPM)

---

### 3. **Sponsorship & Affiliate** 🤝
Parcerias com sites de loteria (Caixa, Loterias Online, etc.)

- Comissão por clique (R$ 0.10 - R$ 1.00 por lead)
- Integração de banner de "Jogar Agora" no fim do app

---

### 4. **Cursos/E-books Upsell** 📚
Vender conteúdo complementar dentro do app

- "Guia Completo de Estratégias de Loteria" (R$ 29,90)
- "Análise Estatística Avançada" (R$ 49,90)

---

## Roadmap Recomendado

### **Fase 1 (Agora)**: Lançar versão Freemium sem anúncios
- ✅ App limpo + acessível (foco elderly-friendly)
- ✅ Coletar feedback no Google Play

### **Fase 2 (1-2 meses)**: Adicionar In-App Purchases
- ⏳ "Premium Analysis" + "PDF Export"
- ⏳ Receita esperada: 2-5% de conversão × 1000 instalações = 20-50 vendas/mês × R$ 9,90 = R$ ~500/mês

### **Fase 3 (3-4 meses)**: Integrar AdMob
- ⏳ Banner ads abaixo de cada seção
- ⏳ Intersticiais ao sair da app (soft, não intrusivo)
- ⏳ Receita esperada: 5000 MAU × 10 impressões/dia × R$ 0.80 CPM = R$ ~400/mês

### **Fase 4 (6+ meses)**: Affiliate + Sponsorship
- ⏳ Parcerias estratégicas com operadores de loteria online

---

## Considerações Legais

### ⚠️ Importante
O app é **informacional apenas** e não faz apostas reais. Mas em termos de monetização:

1. **Conformidade com App Store/Google Play**: 
   - Não violar políticas de jogos de azar
   - Disclaimer claro: "Este app é informacional. Não fazemos apostas."
   - Verificar se In-App Purchases relacionadas a "análise de loteria" são permitidas

2. **LGPD (Lei Geral de Proteção de Dados)**:
   - ✅ Política de Privacidade já criada
   - ✅ Nenhum dado pessoal coletado
   - ⏳ Se adicionar conta de usuário: validar consentimento LGPD

3. **Regulação de Jogos de Azar**:
   - 🔔 Atividade de loteria é regulada pela CAIXA
   - Verificar se "análises/previsões" podem ter restrições

---

## Plano Financeiro Estimado

| Cenário | MAU | Ad CPM | Conversão Premium | Receita Mensal |
|---------|-----|--------|------------------|-----------------|
| Conservador (1000 MAU) | 1,000 | R$ 0.80 | 2% | R$ 200 (ads) + R$ 200 (iap) |
| Moderado (10k MAU) | 10,000 | R$ 0.80 | 3% | R$ 2,400 (ads) + R$ 2,970 (iap) |
| Agressivo (50k MAU) | 50,000 | R$ 0.80 | 4% | R$ 12,000 (ads) + R$ 19,800 (iap) |

**Break-even**: ~2,000 MAU com ads + In-App Purchases

---

## Próximos Passos

1. **Registrar no Google AdMob**: https://admob.google.com
2. **Criar conta Google Play Console**: https://play.google.com/console
3. **Implementar Revenuecat** (opcional): simplifica IAP + analytics
   ```bash
   npm install react-native-revenuecat
   ```

4. **Analytics**: Adicionar Firebase para medir conversão
   ```bash
   npm install @react-native-firebase/analytics
   ```

---

## Disclaimer

Este app fornece **análise informacional apenas**. Não incentivamos apostas reais. Qualquer receita gerada é meramente pela prestação de serviço analítico, sem garantias de sucesso em jogo de azar.
