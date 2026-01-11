# 🚀 Guia de Teste com Expo Go

## 📱 O que é Expo Go?

Expo Go é um aplicativo que permite testar seu app React Native sem precisar compilar. Perfeito para desenvolvimento rápido!

**Download**:
- **iOS**: [App Store](https://apps.apple.com/br/app/expo-go/id982107779)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🎯 Começando Rápido (3 passos)

### 1️⃣ **Iniciar o Servidor Expo**

```bash
# Terminal na pasta do projeto
cd c:\Users\Al-inglity\Documents\site_jogos
npm start
```

**Você verá algo assim**:
```
@site_jogos/app@1.0.0 start
expo start

Starting packager...
✓ Listening on all network addresses on port 8081
...
› Web UI: http://localhost:19000
› Press i for iOS | a for Android | w for web
› Press q to quit
```

### 2️⃣ **Abrir no seu dispositivo**

#### 📱 Android com Expo Go:
```
1. Abra o aplicativo Expo Go
2. Pressione "Scan QR Code"
3. Aponte para o QR code que aparece no terminal
4. Aguarde carregamento (pode levar 30-60 segundos na primeira vez)
```

#### 📱 iPhone com Expo Go:
```
1. Use a câmera do iPhone (Controle + Centro de Controle)
2. Aponte para o QR code
3. Toque na notificação "Open in Expo Go"
4. O app abrirá automaticamente
```

### 3️⃣ **Enjoy!** 🎉

O app está rodando! Faça testes enquanto edita o código (hot reload automático).

---

## 🧪 Plano de Testes Completo

### ✅ Teste 1: **Inicialização e Tema**
- [ ] App abre sem erros
- [ ] Tema claro/escuro muda automaticamente
- [ ] Todas as 5 abas aparecem
- [ ] Ícones carregam sem problemas

**Como testar**:
```
1. Inicie npm start
2. Abra no Expo Go
3. Espere 30s para carregar
4. Verifique se há erros de vermelho
```

### ✅ Teste 2: **Seleção de Loteria**
- [ ] Pode clicar em cada loteria
- [ ] Cores mudam para cada loteria
- [ ] Tela atualiza corretamente

**Como testar**:
```
1. Na aba "Início", clique em cada loteria
2. Verifique se a cor da barra muda
3. Verifique se as análises correspondem à loteria selecionada
```

### ✅ Teste 3: **Sincronização de Dados** (IMPORTANTE)
- [ ] App sincroniza sorteios da Caixa na primeira inicialização
- [ ] Spinner de carregamento aparece
- [ ] Dados aparecem na tela depois

**Como testar**:
```
1. Primeira vez: espere 60s para sincronizar
2. Você verá: "Concurso XXXX" com dados
3. A partir da 2ª vez, carrega do cache (<1s)
4. Feche e reabra o app - não sincroniza novamente (cache funciona)
```

### ✅ Teste 4: **Analisador de Cobertura**
- [ ] Clique na aba "Simulador"
- [ ] Clique em "📊 Análise"
- [ ] Selecione 10 números

**Como testar**:
```
1. Aba Simulador → Botão "📊 Análise"
2. Clique em 10 números na grade
3. Escolha "Foco de Acertos" (3-6)
4. Defina custo por jogo
5. Clique "Gerar Análise"
6. Você verá as combinações geradas
7. Clique "Salvar em Meus Jogos"
```

### ✅ Teste 5: **Meus Jogos (Saved Bets)**
- [ ] Bets salvos aparecem
- [ ] Pode marcar como "Apostado"
- [ ] Pode deletar
- [ ] Filtra por status

**Como testar**:
```
1. Aba "Meus Jogos"
2. Você verá as apostas que salvou em "Simulador"
3. Clique para expandir e ver números
4. Teste botões: Marcar como apostado, Deletar
```

### ✅ Teste 6: **Histórico de Sorteios**
- [ ] Lista de sorteios aparece
- [ ] Pode clicar em um sorteio
- [ ] Mostra números e prêmios

**Como testar**:
```
1. Aba "Histórico"
2. Vê lista de concursos (mais novos no topo)
3. Clique em um concurso
4. Vê números sorteados + prêmios
```

### ✅ Teste 7: **Conferência de Números (Scanner)**
- [ ] Aba "Simulador" → botão 🔍 "Scanner"
- [ ] Pode tirar foto da aposta

**Como testar**:
```
1. Aba "Simulador" → botão "🔍 Scanner"
2. Clique em "Permitir câmera"
3. Tire foto de uma aposta ou número
4. Verifique se reconhece (OCR pode ser lento)
```

### ✅ Teste 8: **Novo: Calculador de Bolões** ⭐
- [ ] Aba "Simulador" → botão "💰 Calculador de Bolões"
- [ ] Adiciona participantes
- [ ] Calcula divisão de prêmios

**Como testar**:
```
1. Clique em "💰 Calculador de Bolões"
2. Insira 3 participantes:
   - João: R$ 100 (2 cotas)
   - Maria: R$ 100 (1 cota)
   - Pedro: R$ 100 (1 cota)
3. Defina prêmio: R$ 10.000
4. Clique "Calcular Divisão"
5. Resultado:
   - João: 50% = R$ 5.000
   - Maria: 25% = R$ 2.500
   - Pedro: 25% = R$ 2.500
6. Clique "📋 Copiar para WhatsApp"
7. Cole em uma conversa WhatsApp
```

### ✅ Teste 9: **Novo: Narrador de Sorteio** ⭐
- [ ] Na aba "Histórico", clique em um sorteio
- [ ] Botão "🔊 Narrador de Sorteio" aparece
- [ ] Clique "Ler Números"
- [ ] Dispositivo lê números em voz alta

**Como testar**:
```
1. Aba "Histórico"
2. Clique em um sorteio (exemplo: Concurso 2500)
3. Role para baixo
4. Veja widget azul "🔊 Narrador de Sorteio"
5. Clique "Ler Números"
6. Dispositivo lê números pausadamente
7. Clique "Pausar" ou "Parar" para controlar
```

**Nota**: Dispositivo deve ter som ativado e volume alto.

### ✅ Teste 10: **Novo: Concursos Especiais** ⭐
- [ ] Na tela inicial, procure por "🎆 Mega da Virada" (próximo)
- [ ] Mostrar datas especiais destacadas

**Como testar**:
```
1. Aba "Início"
2. Role para baixo na lista de análises
3. Procure por seção "Concursos Especiais"
4. Veja próximos: Mega da Virada, Quina de São João, etc
5. Cada um mostra emoji e datas
```

### ✅ Teste 11: **Termos de Uso**
- [ ] Menu/Configurações → "Termos de Uso"
- [ ] Página exibe aviso legal completo

**Como testar**:
```
1. Procure por link "Termos de Uso" (provavelmente no rodapé ou menu)
2. Verifique se aviso vermelho aparece no topo
3. Leia as 9 seções
4. Teste modo escuro - cores devem ser legíveis
```

### ✅ Teste 12: **E se? (Simulator)**
- [ ] Aba "Simulador" → botão "E se?"
- [ ] Simula resultados de uma aposta

**Como testar**:
```
1. Aba "Simulador" → botão "🎲 E se?"
2. Selecione seus números de aposta
3. Selecione os números do sorteio (ou recentes)
4. Vê resultado: acertos, prêmio estimado
```

### ✅ Teste 13: **Investidor (ROI)**
- [ ] Aba "Investidor"
- [ ] Mostra análise de rentabilidade

**Como testar**:
```
1. Aba "Investidor"
2. Vê dados de apostar durante 30/90/180 dias
3. Vê ROI calculado
4. Recomendações de números
```

### ✅ Teste 14: **Acessibilidade - Modo Escuro**
- [ ] Altere dispositivo para modo escuro
- [ ] App segue tema
- [ ] Texto legível em ambos

**Como testar**:
```
Android: Configurações → Exibição → Modo Escuro
iOS: Configurações → Tela e Brilho → Modo Escuro
Volta para app - deve mudar cores automaticamente
```

### ✅ Teste 15: **Performance**
- [ ] App não trava ao sincronizar
- [ ] Listas rolam suavemente
- [ ] Sem memory leaks (abre/fecha várias vezes)

**Como testar**:
```
1. Abra/feche o app 5 vezes
2. Não deve ficar mais lento
3. Simule análise com 10.000 sorteios
4. Interface continua responsiva
```

---

## 🔧 Debug & Troubleshooting

### ❌ "QR code não funciona"
```bash
# Reinicie o servidor
npm start

# Se ainda não funcionar:
1. Certifique-se de estar na mesma Wi-Fi (telefone + computador)
2. Tente escanear novamente
3. Ou abra em http://localhost:19000 no navegador do telefone
```

### ❌ "App trava ao sincronizar"
```
Problema: Sync pesado na primeira vez
Solução:
1. Deixe sincronizar completo (1-2 minutos)
2. Não feche o app
3. Próximas aberturas serão rápidas (usa cache)
```

### ❌ "Narrador de Sorteio não funciona"
```
Problema: Speech API não disponível
Solução:
1. Certifique-se de ter som ativado
2. Tente em outro dispositivo
3. Verifique se expo-speech instalou corretamente
```

### ❌ "Câmera do scanner não abre"
```
Problema: Permissão não concedida
Solução:
1. Vá para Configurações do dispositivo
2. Procure por permissões do app
3. Ative câmera para "Site de Jogos"
4. Retorne ao app
```

### ❌ "Hot reload não funciona"
```
Se editar arquivo e não atualizar:
1. Aperte 'r' no terminal (reload)
2. Ou 's' para reiniciar tudo
3. Ou feche e reabra o app
```

---

## 📊 Checklist Final antes de Produção

### 🔍 Verificação de Funcionalidades
- [ ] **Inicialização**: App abre sem erros
- [ ] **Sync**: Dados sincronizam em <3 segundos (após cache)
- [ ] **Calculador**: Calcula bolões corretamente
- [ ] **Narrador**: Lê números em voz alta
- [ ] **Concursos Especiais**: Mostram datas corretas de 2026
- [ ] **Termos de Uso**: Aviso legal completo
- [ ] **Performance**: Sem travamentos

### 🌐 Teste em Múltiplos Dispositivos
- [ ] iPhone 12+ (iOS 16+)
- [ ] Android 11+ (Samsung/Pixel)
- [ ] Tablet (iPad/Android)
- [ ] Dispositivo antigo (3GB RAM) - opcional

### ♿ Acessibilidade
- [ ] Cores legíveis para daltônicos
- [ ] Tamanho de fonte mínimo 12px
- [ ] Contraste WCAG AA
- [ ] Dark mode funciona
- [ ] Narrador TTS funciona

### 🔐 Segurança Final
- [ ] Nenhuma chave/senha no código
- [ ] Dados pessoais não enviados
- [ ] HTTPS/SSL em produção
- [ ] Cache limpo quando necessário

---

## 🚀 Preparando para App Stores

### iOS (Apple App Store)
```
1. Crie conta Apple Developer ($99/ano)
2. Crie Provisioning Profile
3. eas build --platform ios
4. Submeta no App Store Connect
```

### Android (Google Play)
```
1. Crie conta Google Play Developer ($25 única vez)
2. Gere keystore de assinatura
3. eas build --platform android
4. Submeta no Google Play Console
```

### Usando Expo EAS
```bash
# Instalar CLI
npm install -g eas-cli

# Fazer login
eas login

# Build para ambas plataformas
eas build --platform all

# Distribuir
eas submit --platform all
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Erro na sincronização**: Verifique conexão Wi-Fi
2. **App trava**: Verifique memória disponível
3. **Câmera não abre**: Conceda permissões
4. **Narrador não fala**: Ative som do dispositivo
5. **TypeScript erros**: Execute `npx tsc --noEmit`

---

## ✅ Sucesso!

Parabéns! Você testou:
✅ 7 features principais
✅ 3 features novas (Bolão, Narrador, Concursos Especiais)
✅ Segurança e performance
✅ Acessibilidade

**App está pronto para produção!** 🚀🎰
