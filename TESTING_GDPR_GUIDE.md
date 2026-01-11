# 🧪 Guia de Teste - Consentimento GDPR/LGPD no Expo Go

## 🚀 Iniciar Testes em 3 Passos

### 1️⃣ Abrir Terminal
```bash
# Navegue até a pasta do projeto
cd c:\Users\Al-inglity\Documents\site_jogos

# Inicie o Expo Dev Server
npx expo start
```

Verá:
```
┌─────────────────────────────────────┐
│  Expo  DevTools                 v49  │
│                                     │
│  Press ? to show all commands       │
│  Press s to switch development...   │
└─────────────────────────────────────┘
```

### 2️⃣ Abrir no Simulator/Device

**Para iOS:**
```
Press i
```

**Para Android:**
```
Press a
```

**Para Web (teste rápido):**
```
Press w
```

### 3️⃣ Testa o Banner
- ✅ Primeira abertura: Banner aparece
- ✅ Clique em um dos 3 botões
- ✅ Reload (R no terminal): Banner desaparece

---

## ✅ Teste 1: Aceitar Tudo

**Objetivo**: Verificar que consentimento é salvo

**Passos**:
1. Abra o app (primeira vez)
2. Espere o banner aparecer no bottom
3. Clique em **✅ Aceitar Tudo** (botão verde)
4. ✅ Banner desaparece imediatamente
5. Press **R** no terminal para reload
6. ✅ Banner NÃO aparece (foi salvo)

**Esperado**:
```
AsyncStorage:
  consent_banner_seen: "true"
  consent_given: "true"
  consent_analytics: "true"
  consent_ads: "true"
```

---

## ❌ Teste 2: Rejeitar Tudo

**Objetivo**: Verificar que rejeição é respeitada

**Passos**:
1. Limpe AsyncStorage (veja seção "Limpar AsyncStorage")
2. Reload do app (R)
3. Banner aparece
4. Clique em **❌ Rejeitar Tudo** (botão vermelho)
5. ✅ Banner desaparece
6. Reload (R)
7. ✅ Banner NÃO aparece

**Esperado**:
```
AsyncStorage:
  consent_banner_seen: "true"
  consent_given: "false"
  consent_analytics: "false"
  consent_ads: "false"
```

---

## ⚙️ Teste 3: Personalizar Preferências

**Objetivo**: Verificar modal e toggles

**Passos**:
1. Limpe AsyncStorage
2. Reload (R)
3. Banner aparece
4. Clique em **⚙️ Personalizar**
5. ✅ Modal abre (slide up)
6. Verifique:
   - 🔐 Necessário: Toggle DESATIVADO (verde)
   - 📊 Analytics: Toggle ATIVÁVEL
   - 📢 Anúncios: Toggle ATIVÁVEL
7. Ative Analytics (toggle para ON)
8. Desative Anúncios (toggle para OFF)
9. Clique **Salvar Preferências**
10. ✅ Modal fecha, banner desaparece
11. Reload (R)
12. ✅ Banner NÃO aparece

**Esperado**:
```
AsyncStorage:
  consent_banner_seen: "true"
  consent_given: "true"
  consent_analytics: "true"    ← Ativado
  consent_ads: "false"          ← Desativado
```

---

## 🔄 Teste 4: Toggle Controls

**Objetivo**: Verificar que toggles funcionam independentemente

**Passos**:
1. Limpe AsyncStorage
2. Reload (R)
3. Banner → Personalizar
4. Modal abre
5. Teste cada toggle:
   - Clique Analytics uma vez → OFF
   - Clique Analytics novamente → ON
   - Clique Anúncios uma vez → OFF
   - Clique Anúncios novamente → ON
6. Verifique que mudam visualmente
7. Clique **Salvar Preferências**

**Esperado**:
- Toggles mudam de visual (on/off)
- Não há lag
- Estado final é salvo corretamente

---

## 🎯 Teste 5: Reload & Persistência

**Objetivo**: Verificar que AsyncStorage persiste

**Passos**:
1. Aceite o banner (qualquer opção)
2. Pressione **R** no terminal para reload
3. ✅ App recarrega, banner NÃO aparece
4. Pressione **R** novamente
5. ✅ Ainda sem banner
6. Force close do app
7. Reabra do Expo Go
8. ✅ Ainda sem banner (persistiu)

**Esperado**:
- AsyncStorage persiste através de reloads
- Dados sobrevivem a force close

---

## 🗑️ Teste 6: Limpar AsyncStorage

**Objetivo**: Verificar que limpar storage reseta consentimento

**Método 1: No Código**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Em um componente qualquer
await AsyncStorage.clear();
// Reload do app (R) → Banner reaparece
```

**Método 2: No Expo Go**
- iOS: Settings > Expo Go > Reset App
- Android: Settings > Apps > Expo > Storage > Clear Data

**Esperado**:
- AsyncStorage vazio
- Banner reaparece na próxima abertura

---

## 📱 Teste 7: Diferentes Devices

### iPhone
- [ ] Banner aparece corretamente
- [ ] Sem overlap com notch
- [ ] Modal scroll suave
- [ ] Buttons acessíveis

### Android
- [ ] Banner acima do navigation bar
- [ ] Backdrop semitransparente
- [ ] Slide up animation suave
- [ ] Sem overlap com sistema

### Tablet
- [ ] Responsive layout
- [ ] Modal centered opcionalmente
- [ ] Texto legível

---

## 🐛 Teste 8: Debugging

### Ver Logs de Consentimento
```
No terminal do Expo, procure por:
[Consent] ...
[Ads] ...
```

### Ver AsyncStorage em Real-Time
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Adicione isso em qualquer componente
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await AsyncStorage.multiGet([
      'consent_banner_seen',
      'consent_given',
      'consent_analytics',
      'consent_ads'
    ]);
    console.log('📊 Consentimento:', Object.fromEntries(data));
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 📋 Checklist de Testes

```
TESTE 1: Aceitar Tudo
  [ ] Banner aparece primeira vez
  [ ] Clique "Aceitar Tudo" funciona
  [ ] Banner desaparece
  [ ] Reload: não reaparece
  [ ] AsyncStorage salvo corretamente

TESTE 2: Rejeitar Tudo
  [ ] Limpar storage reseta banner
  [ ] Clique "Rejeitar Tudo" funciona
  [ ] Banner desaparece
  [ ] Reload: não reaparece
  [ ] AsyncStorage mostra false

TESTE 3: Personalizar
  [ ] Modal abre ao clicar
  [ ] 3 itens visíveis (Necessário, Analytics, Anúncios)
  [ ] Toggles funcionam
  [ ] "Salvar Preferências" funciona
  [ ] Banner desaparece após salvar

TESTE 4: Toggles
  [ ] Analytics toggle muda
  [ ] Anúncios toggle muda
  [ ] Sem lag visual
  [ ] Cada um salva independentemente

TESTE 5: Persistência
  [ ] Reload (R) mantém estado
  [ ] Force close mantém estado
  [ ] App restart mantém estado

TESTE 6: Limpar Storage
  [ ] Clear AsyncStorage reseta banner
  [ ] Banner reaparece
  [ ] Novo consentimento é pedido

TESTE 7: Devices
  [ ] iOS: responsivo e sem overlaps
  [ ] Android: responsivo e sem overlaps
  [ ] Web: funcional

TESTE 8: Debugging
  [ ] Logs aparecem no console
  [ ] AsyncStorage pode ser inspecionado
```

---

## 🚨 Problemas Comuns & Soluções

### Problema: Banner não aparece
**Solução**:
```bash
# Limpe AsyncStorage
await AsyncStorage.clear();

# Reload
# Press R no terminal
```

### Problema: Reload não mostra mudanças
**Solução**:
```bash
# Restart do Expo dev server
# Ctrl + C no terminal
# npx expo start
```

### Problema: Modal não abre ao clicar "Personalizar"
**Solução**:
```bash
# Verifique logs
# Check if there are errors in terminal
# Se houver erro, reporte o log completo
```

### Problema: AsyncStorage não persiste
**Solução**:
```bash
# Reinicie Expo Go app
# Force close completamente
# Reabra
```

---

## 📊 O que Esperar

### Primeira Abertura
```
┌─────────────────────────────────┐
│ 🔒 Privacidade & Dados          │
│                                 │
│ Nós valorizamos sua privacidade!│
│ Este app utiliza cookies...     │
│                                 │
│ [❌] [⚙️] [✅ ACEITAR]           │
│                                 │
└─────────────────────────────────┘
```

### Modal ao Clicar "Personalizar"
```
┌──────────────────────────────┐
│ Gerenciar Consentimento   [X]│
│                              │
│ 🔐 Necessário        [✓ ✓]   │
│ 📊 Analytics        [○ ← →]  │
│ 📢 Anúncios         [○ ← →]  │
│                              │
│ ⚠️ Importante               │
│ Este app funciona com...     │
│                              │
│ [Voltar] [Salvar]           │
└──────────────────────────────┘
```

---

## ✅ Teste Completo

**Tempo estimado**: 10-15 minutos

1. **Setup** (1 min)
   - Abra terminal
   - `npx expo start`
   - Press `i` ou `a`

2. **Teste 1-6** (10 min)
   - Cada teste leva ~1-2 min
   - Siga o checklist

3. **Validação** (2 min)
   - Verifique AsyncStorage
   - Verifique logs
   - Confirme tudo funciona

**Status Final**: ✅ PRONTO PARA PRODUÇÃO

---

## 🎯 Próximas Etapas

Após testar no Expo Go:

1. ✅ Testar em device real (iOS/Android)
2. ✅ Adicionar button de reset em Config screen
3. ✅ Validar com lawyers (LGPD compliance)
4. ✅ Publicar na App Store/Play Store
5. ✅ Integrar com analytics real (Mixpanel, etc)

---

**Guia Criado**: 6 de Janeiro de 2026  
**Status**: ✅ PRONTO PARA TESTE  
**Duração**: ~15 minutos para teste completo
