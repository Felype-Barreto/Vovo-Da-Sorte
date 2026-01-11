# 🚀 GUIA COMPLETO: PUBLICAR NO GOOGLE PLAY STORE

**Trevo Inteligente - Versão 1.0.0**  
**Data:** 9 de Janeiro de 2026  
**Status:** Pronto para Build de Produção

---

## 📋 CHECKLIST PRÉ-PUBLICAÇÃO

### ✅ Já Configurado (Feito Automaticamente)

- [x] `app.json` configurado com todas as permissões
- [x] Plugin AdMob adicionado e configurado
- [x] `google-services.json` criado (template)
- [x] Política de Privacidade atualizada com AdMob/LGPD
- [x] Permissões: CAMERA, INTERNET, ACCESS_NETWORK_STATE, VIBRATE
- [x] Versioning: versionCode 1, version "1.0.0"
- [x] Package name: `com.trevo.inteligente`

### ⚠️ AÇÕES NECESSÁRIAS (Você Precisa Fazer)

- [ ] Criar conta no Google Play Console
- [ ] Criar projeto no Firebase e AdMob
- [ ] Substituir IDs de teste por IDs reais
- [ ] Gerar ícones e splash screen finais
- [ ] Criar screenshots e materiais de marketing
- [ ] Fazer build de produção (AAB)
- [ ] Assinar o APK com keystore
- [ ] Upload na Play Store

---

## 🎯 PASSO 1: CRIAR CONTA GOOGLE PLAY CONSOLE

### 1.1 Registrar Conta de Desenvolvedor

1. Acesse: https://play.google.com/console/signup
2. **Custo**: USD $25 (pagamento único, vitalício)
3. Preencha:
   - Tipo de conta: **Individual** ou **Organização**
   - Nome do desenvolvedor: `Seu Nome` ou `Nome da Empresa`
   - Email de contato
   - Website (opcional mas recomendado)

### 1.2 Criar Aplicativo

1. No Play Console, clique **"Criar app"**
2. Preencha:
   ```
   Nome do app: Trevo Inteligente
   Idioma padrão: Português (Brasil)
   Tipo: App (não é jogo)
   Grátis ou Pago: Grátis
   ```

3. Aceite as Políticas:
   - [ ] Declara que o app está em conformidade com as políticas
   - [ ] Declara conformidade com leis dos EUA sobre exportação

---

## 🎯 PASSO 2: CONFIGURAR FIREBASE E ADMOB

### 2.1 Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com
2. Clique **"Adicionar projeto"**
3. Nome: `a` (ou outro de sua escolha)
4. **Ativar Google Analytics**: SIM
5. Selecione conta do Analytics (ou crie nova)

### 2.2 Adicionar App Android ao Firebase

1. No console do Firebase, clique no ícone **Android**
2. Preencha:
   ```
   Package name: com.trevo.inteligente
   App nickname: Trevo Inteligente
   SHA-1: (deixe vazio por enquanto)
   ```
3. Clique **"Registrar app"**
4. **BAIXE O ARQUIVO `google-services.json`** ⬇️
5. **SUBSTITUA** o arquivo `google-services.json` na raiz do projeto pelo arquivo baixado

### 2.3 Criar Conta no AdMob

1. Acesse: https://admob.google.com
2. Clique **"Começar"** e faça login com a mesma conta do Google
3. Aceite os termos de serviço
4. **Vincule ao Firebase**: Quando solicitado, vincule ao projeto Firebase criado

### 2.4 Criar App no AdMob

1. No AdMob, vá em **Apps > Adicionar app**
2. Escolha **"Sim"**, o app está publicado (ou "Não" se for primeiro envio)
3. Plataforma: **Android**
4. Nome do app: `Trevo Inteligente`
5. Clique **"Adicionar"**

### 2.5 Criar Unidades de Anúncios

**IMPORTANTE**: Você precisa criar 3 tipos de anúncios:

#### Banner Ad (ID: ca-app-pub-XXXXX/BANNER)
1. No app do AdMob, clique **"Unidades de anúncios" > "Adicionar unidade de anúncio"**
2. Tipo: **Banner**
3. Nome: `Banner Principal`
4. Clique **"Criar unidade de anúncio"**
5. **COPIE O ID** (ex: `ca-app-pub-3940256099942544/6300978111`)

#### Interstitial Ad (ID: ca-app-pub-XXXXX/INTERSTITIAL)
1. Tipo: **Intersticial**
2. Nome: `Tela Cheia Entre Ações`
3. **COPIE O ID** (ex: `ca-app-pub-3940256099942544/1033173712`)

#### App Open Ad (ID: ca-app-pub-XXXXX/APPOPEN)
1. Tipo: **App open**
2. Nome: `Abertura do App`
3. **COPIE O ID** (ex: `ca-app-pub-3940256099942544/3419835294`)

### 2.6 Obter App ID do AdMob

1. No AdMob, vá em **Configurações do app**
2. Encontre o **"ID do app"** (ex: `ca-app-pub-3940256099942544~3347511713`)
3. **COPIE ESTE ID**

---

## 🎯 PASSO 3: SUBSTITUIR IDs DE TESTE POR IDs REAIS

### 3.1 Atualizar `app.json`

Abra `app.json` e substitua os IDs de teste:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-SEU_PUBLISHER_ID~SEU_APP_ID"
      }
    },
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-SEU_PUBLISHER_ID~SEU_APP_ID",
          "iosAppId": "ca-app-pub-SEU_PUBLISHER_ID~SEU_APP_ID_IOS"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "SEU_PROJECT_ID_DO_EAS"
      }
    }
  }
}
```

### 3.2 Atualizar Códigos dos Anúncios

Abra `src/config/adConfig.ts` e atualize:

```typescript
export const AD_UNITS = {
  banner: Platform.select({
    android: 'ca-app-pub-XXXXX/BANNER',  // Seu ID real
    ios: 'ca-app-pub-XXXXX/BANNER_IOS',
  }) || '',
  interstitial: Platform.select({
    android: 'ca-app-pub-XXXXX/INTERSTITIAL',  // Seu ID real
    ios: 'ca-app-pub-XXXXX/INTERSTITIAL_IOS',
  }) || '',
  appOpen: Platform.select({
    android: 'ca-app-pub-XXXXX/APPOPEN',  // Seu ID real
    ios: 'ca-app-pub-XXXXX/APPOPEN_IOS',
  }) || '',
};
```

---

## 🎯 PASSO 4: PREPARAR RECURSOS VISUAIS

### 4.1 Ícone do App (Obrigatório)

**Especificações:**
- Formato: PNG
- Tamanho: 512x512 px
- Sem cantos arredondados
- Sem transparência (fundo sólido)

**Ferramentas:**
- Canva: https://www.canva.com/
- Icon Kitchen: https://icon.kitchen/
- Figma: https://www.figma.com/

**Salvar como:** `assets/images/icon.png`

### 4.2 Ícone Adaptativo (Android)

Mesmo ícone mas com área de segurança:
- Centro 108x108 px é a "zona segura"
- Fundo pode ser extraído

**Salvar como:** `assets/images/adaptive-icon.png`

### 4.3 Splash Screen

**Especificações:**
- Formato: PNG
- Tamanho: 1284x2778 px (ou 2732x2732 px quadrado)
- Logotipo centralizado
- Fundo: `#1a1a1a` (já configurado)

**Salvar como:** `assets/images/splash-icon.png`

### 4.4 Screenshots para Play Store (Obrigatório)

Você precisa de **NO MÍNIMO 2 screenshots**:

**Especificações:**
- Formato: PNG ou JPEG
- Dimensões: 
  - Mínimo: 320px (lado menor)
  - Máximo: 3840px (lado maior)
  - Proporção 16:9 ou 9:16
- **Recomendado**: 1080x1920 px (portrait)

**Quais telas capturar:**
1. Tela inicial (Próximos Sorteios)
2. Estatísticas com gráficos
3. Scanner conferindo bilhete
4. Gerador de jogos
5. Meus Jogos salvos

**Como capturar:**
- Use emulador Android Studio
- Ou dispositivo físico
- Ou ferramenta: https://www.mockuphone.com/

### 4.5 Feature Graphic (Obrigatório)

Banner promocional que aparece no topo da listagem:

**Especificações:**
- Tamanho: **1024x500 px**
- Formato: PNG ou JPEG
- Sem transparência

**Conteúdo sugerido:**
```
🍀 TREVO INTELIGENTE
Analise Loterias • Gere Jogos • Confira Bilhetes
```

---

## 🎯 PASSO 5: INSTALAR EAS CLI E FAZER BUILD

### 5.1 Instalar Expo Application Services (EAS)

```powershell
npm install -g eas-cli
```

### 5.2 Login no EAS

```powershell
eas login
```

Digite suas credenciais do Expo.

### 5.3 Configurar Projeto EAS

```powershell
eas build:configure
```

Isso criará `eas.json` automaticamente.

### 5.4 Criar Keystore para Assinatura

```powershell
eas credentials
```

Escolha:
1. **Android**
2. **Set up a new keystore**
3. **Generate new keystore**

O EAS gerará e armazenará automaticamente suas credenciais.

### 5.5 Fazer Build de Produção (AAB)

```powershell
eas build --platform android --profile production
```

**O que acontece:**
- EAS constrói o app na nuvem
- Gera arquivo `.aab` (Android App Bundle)
- Assinado com sua keystore
- **Tempo**: 10-20 minutos

**Quando terminar:**
- EAS mostra link para download
- **Baixe o arquivo `.aab`**

---

## 🎯 PASSO 6: PREENCHER FICHA DO APP NA PLAY STORE

### 6.1 Informações do App

No Play Console, vá em **"Configuração do app"**:

```
Nome do app: Trevo Inteligente

Descrição curta (80 caracteres):
Analise loterias, gere jogos inteligentes e confira bilhetes instantaneamente

Descrição completa (4000 caracteres):
🍀 TREVO INTELIGENTE - Seu assistente pessoal de loterias brasileiras!

O Trevo Inteligente é o app definitivo para quem joga Mega-Sena, Lotofácil, Quina e outras loterias da Caixa. Analise estatísticas, gere jogos otimizados e confira seus bilhetes com facilidade.

🎯 RECURSOS PRINCIPAIS:

📊 ESTATÍSTICAS COMPLETAS
• Veja resultados de mais de 2.700 sorteios da Mega-Sena
• Gráficos de números mais e menos sorteados
• Análise de padrões e tendências
• Dados atualizados automaticamente

🎲 GERADOR INTELIGENTE
• Gere jogos baseados em estatísticas reais
• Diferentes estratégias: números quentes, frios, equilibrados
• Suporte para fechamentos e desdobramentos
• Simule seus jogos antes de apostar

🔍 SCANNER DE BILHETES
• Escaneie o QR code dos seus bilhetes
• Confira automaticamente se você ganhou
• Veja exatamente quais números acertou
• Informações oficiais de prêmios por concurso

💾 SALVE SEUS JOGOS
• Guarde seus jogos favoritos
• Confira automaticamente em novos sorteios
• Histórico completo de apostas
• Nunca perca um bilhete premiado

🔔 PRÓXIMOS SORTEIOS
• Veja datas e estimativas de prêmios
• Contagem regressiva para o próximo sorteio
• Dados oficiais da Caixa Econômica Federal

🎰 SUPORTE A MÚLTIPLAS LOTERIAS:
• Mega-Sena
• Lotofácil
• Quina
• Lotomania
• Dupla Sena
• E mais!

🛡️ PRIVACIDADE E SEGURANÇA:
• Seus dados ficam no seu dispositivo
• Não coletamos informações pessoais
• Conformidade total com LGPD
• App 100% gratuito

⚠️ AVISO LEGAL:
Este app é informativo e não é afiliado à Caixa Econômica Federal. Os dados são obtidos de APIs públicas oficiais. Para validação final de prêmios, consulte uma casa lotérica ou o site oficial da Caixa.

💚 Baixe agora e aumente suas chances!

Categoria: Ferramentas
Tags: loteria, mega-sena, loterias, caixa, sorteio, estatística
```

### 6.2 Detalhes da Listagem

```
Email de contato: codeflowbr1@gmail.com

Website: (opcional - deixe em branco se não tiver)

Telefone: (opcional)

Categoria: Ferramentas

Tags (até 5):
- loteria
- mega-sena
- estatística
- scanner
- sorteio
```

### 6.3 Classificação de Conteúdo

No Play Console, vá em **"Classificação de conteúdo"**:

1. Clique **"Iniciar questionário"**
2. Preencha:
   ```
   Categoria do app: Utilidades e Produtividade
   Email: felypexelepe@hotmail.com
   ```

3. Responda o questionário (exemplo):
   ```
   - O app contém violência? NÃO
   - Contém conteúdo sexual? NÃO
   - Linguagem ofensiva? NÃO
   - Drogas/álcool? NÃO
   - Temas sensíveis? NÃO
   - Permite comunicação entre usuários? NÃO
   - Permite compartilhamento de localização? NÃO
   - Permite compras? NÃO
   ```

4. Salve e aplique as classificações

### 6.4 Público-Alvo e Conteúdo

```
Público-alvo: 18+ (loterias são para maiores de 18 anos)

Apelo infantil: Não é destinado a crianças

COPPA (crianças nos EUA): Não direcionado a crianças
```

### 6.5 Anúncios e Monetização

```
Este app contém anúncios? SIM

Tipos de anúncios:
- Banner ads
- Interstitial ads
- App open ads

O app oferece compras dentro do app? NÃO
```

---

## 🎯 PASSO 7: PREPARAR COMPLIANCE E SEGURANÇA

### 7.1 Política de Privacidade (Obrigatório)

Você **DEVE** hospedar sua Política de Privacidade online:

**Opções:**
1. **GitHub Pages** (Grátis):
   ```
   - Crie repositório: trevo-privacy
   - Faça upload do PRIVACY_POLICY.md
   - Ative GitHub Pages
   - URL: https://seu-usuario.github.io/trevo-privacy/
   ```

2. **Google Sites** (Grátis):
   - https://sites.google.com
   - Crie novo site
   - Cole o conteúdo da política
   - Publique

3. **Medium/Blogger** (Grátis):
   - Publique como artigo público

**Na Play Console:**
- Vá em **"Configuração do app" > "Política de Privacidade"**
- Cole a URL da política hospedada

### 7.2 Segurança de Dados (Data Safety)

No Play Console, vá em **"Segurança de dados"**:

**Coleta de dados:**
```
O app coleta dados de usuários? SIM (através do AdMob)

Dados coletados:
✅ Identificadores de dispositivo (ID de publicidade)
✅ Informações de diagnóstico (interações com anúncios)
✅ Localização aproximada (IP)

Finalidade:
- Publicidade/Marketing
- Análise de performance
- Prevenção de fraude

Os dados são compartilhados com terceiros? SIM
- Google AdMob (para exibição de anúncios)

Os dados são criptografados em trânsito? SIM

Os usuários podem solicitar exclusão de dados? SIM

Dados opcionais: Todos (usuário pode negar consentimento)
```

### 7.3 Declaração de Permissões

```
Permissões usadas:

CAMERA: Para escanear QR codes de bilhetes de loteria
INTERNET: Para buscar dados de sorteios da API Caixa e exibir anúncios
ACCESS_NETWORK_STATE: Para verificar conexão antes de buscar dados
VIBRATE: Para feedback tátil (opcional)
```

---

## 🎯 PASSO 8: UPLOAD E PUBLICAÇÃO

### 8.1 Criar Nova Versão

No Play Console:

1. Vá em **"Produção" > "Criar nova versão"**
2. Clique **"Upload"** e selecione o arquivo `.aab` baixado do EAS
3. Nome da versão: `1 (1.0.0)`

### 8.2 Notas da Versão

```
Versão 1.0.0 - Lançamento Inicial

✨ Novidades:
• Estatísticas completas de loterias brasileiras
• Gerador inteligente de jogos
• Scanner de bilhetes com conferência automática
• Salve e confira seus jogos
• Próximos sorteios e estimativas de prêmios
• Suporte a Mega-Sena, Lotofácil, Quina e mais
• Interface moderna e intuitiva

💚 Pronto para te ajudar a ganhar na loteria!
```

### 8.3 Revisar e Publicar

1. Clique **"Revisar versão"**
2. Verifique que todos os itens estão completos:
   - ✅ AAB enviado
   - ✅ Ícone e recursos visuais
   - ✅ Screenshots
   - ✅ Feature graphic
   - ✅ Descrição
   - ✅ Classificação de conteúdo
   - ✅ Segurança de dados
   - ✅ Política de privacidade
   - ✅ Público-alvo

3. Clique **"Iniciar lançamento na produção"**

### 8.4 Aguardar Revisão

- ⏱️ **Tempo de análise**: 1-7 dias
- 📧 Você receberá email quando for aprovado ou se houver problemas
- 🔍 Google Play analisa:
  - Conformidade com políticas
  - Segurança do app
  - Funcionalidade

---

## 🎯 PASSO 9: PÓS-PUBLICAÇÃO

### 9.1 Testar App na Play Store

Quando aprovado:
1. Baixe seu próprio app da Play Store
2. Teste todas as funcionalidades
3. Verifique se anúncios estão funcionando
4. Confirme política de privacidade está acessível

### 9.2 Monitorar AdMob

1. Acesse: https://admob.google.com
2. Vá em **"Painel" > "Seu app"**
3. Monitore:
   - Impressões de anúncios
   - Receita estimada
   - Taxa de cliques (CTR)
   - eCPM (ganho por mil impressões)

**IMPORTANTE**: Leva 1-2 dias para dados aparecerem no AdMob.

### 9.3 Responder Avaliações

- Acesse Play Console regularmente
- Responda avaliações de usuários
- Corrija bugs reportados

### 9.4 Atualizar App

Para lançar versão 1.0.1:

1. Incremente `versionCode` no `app.json`:
   ```json
   "versionCode": 2,
   "version": "1.0.1"
   ```

2. Faça novo build:
   ```powershell
   eas build --platform android --profile production
   ```

3. Upload nova versão no Play Console

---

## 📞 SUPORTE E AJUDA

### Problemas Comuns:

**1. Build falhou no EAS**
- Verifique se `google-services.json` está correto
- Confira se todos os IDs do AdMob foram substituídos
- Leia os logs de erro no EAS

**2. App rejeitado pela Play Store**
- Leia email de rejeição cuidadosamente
- Geralmente é por: política de privacidade incorreta, screenshots inadequados, ou descrição enganosa
- Corrija e reenvie

**3. Anúncios não aparecem**
- Verifique se usou IDs REAIS (não os de teste)
- Aguarde 1-2 dias após publicação
- Certifique-se de que consentimento foi dado

**4. Conta AdMob suspensa**
- Não clique em seus próprios anúncios
- Não peça para amigos clicarem
- Isso viola políticas do Google

### Links Úteis:

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Play Console: https://play.google.com/console
- AdMob Help: https://support.google.com/admob
- Firebase Console: https://console.firebase.google.com

---

## ✅ CHECKLIST FINAL

Antes de enviar para Play Store, confirme:

- [ ] `google-services.json` substituído pelo arquivo real do Firebase
- [ ] IDs do AdMob substituídos por IDs reais em `app.json` e `src/config/adConfig.ts`
- [ ] Ícone 512x512 px criado (`assets/images/icon.png`)
- [ ] Splash screen criado (`assets/images/splash-icon.png`)
- [ ] No mínimo 2 screenshots capturados (recomendado 4-8)
- [ ] Feature graphic 1024x500 px criado
- [ ] Política de privacidade hospedada online
- [ ] Build de produção (.aab) gerado via EAS
- [ ] Descrição completa escrita
- [ ] Classificação de conteúdo preenchida
- [ ] Segurança de dados (Data Safety) declarada
- [ ] Email de contato definido
- [ ] Notas da versão escritas

**Quando tudo estiver ✅ pronto: PUBLICAR!**

---

## 💰 EXPECTATIVA DE RECEITA

Com AdMob, sua receita depende de:
- **Downloads**: Quantos usuários baixam
- **DAU** (Daily Active Users): Usuários ativos por dia
- **Impressões**: Quantos anúncios são exibidos
- **CTR** (Click-Through Rate): Taxa de cliques (tipicamente 1-3%)

**Estimativa conservadora:**
```
100 usuários ativos/dia
x 10 anúncios por usuário/dia
= 1.000 impressões/dia
x eCPM de $1-3 (BRL 5-15)
= R$ 5-15/dia
= R$ 150-450/mês
```

**Com 1.000 usuários ativos**: R$ 1.500-4.500/mês  
**Com 10.000 usuários ativos**: R$ 15.000-45.000/mês

**Dica**: Foque em crescer organicamente, promova no Facebook, Instagram, grupos de WhatsApp de loteria!

---

🍀 **Boa sorte com o lançamento do Trevo Inteligente!**
