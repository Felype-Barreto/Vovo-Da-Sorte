# ⚡ Quick Start - Testar no Expo Go

## 🚀 Um Comando Para Começar

```bash
cd c:\Users\Al-inglity\Documents\site_jogos && npx expo start
```

Depois:
- **iOS**: Press `i`
- **Android**: Press `a`
- **Web**: Press `w`

---

## 🎯 Cenários de Teste Rápido

### 1. Teste Básico (2 min)
```
1. Abra app (primeira vez)
2. Veja banner aparecer
3. Clique "✅ Aceitar Tudo"
4. Press R (reload)
5. ✅ Banner gone
```

### 2. Teste Personalizar (3 min)
```
1. Limpe storage (veja abaixo)
2. Reload
3. Clique "⚙️ Personalizar"
4. Modal abre
5. Alterne toggles
6. Clique "Salvar"
7. ✅ Funciona
```

### 3. Teste Persistência (2 min)
```
1. Aceite consentimento
2. Press R
3. ✅ Sem banner
4. Force close app
5. Reabra
6. ✅ Ainda sem banner
```

---

## 🗑️ Limpar AsyncStorage

**Opção 1: Via Código**
```tsx
// Adicione em qualquer componente e execute
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
  AsyncStorage.clear().then(() => {
    console.log('✅ AsyncStorage limpo');
    // Reload do app
  });
}, []);
```

**Opção 2: Via Expo Go**
- iOS: Settings > Expo Go > Reset App Data
- Android: Settings > Apps > Expo > Storage > Clear Data

**Opção 3: Via Terminal (próximo reload)**
```
Ctrl + C (pause dev server)
npm run dev  (reinicia)
```

---

## 🔍 Debugar Consentimento

### Ver AsyncStorage
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
  AsyncStorage.getAllKeys().then(keys => {
    AsyncStorage.multiGet(keys).then(items => {
      console.log('📱 AsyncStorage:', Object.fromEntries(items));
    });
  });
}, []);
```

### Ver Logs de Consentimento
```
No terminal do Expo, procure por:
[Consent] ...
[Ads] ...
```

---

## ✅ Checklist Rápido

```
□ Banner aparece primeira abertura
□ "Aceitar Tudo" funciona
□ "Rejeitar Tudo" funciona
□ "Personalizar" abre modal
□ Toggles mudam visualmente
□ "Salvar Preferências" funciona
□ Reload mantém estado
□ Force close mantém estado
□ AsyncStorage salvo corretamente
```

---

## 📊 Esperado vs. Real

### Primeira Abertura
```
ESPERADO:
  Bottom sheet com:
  - Título "🔒 Privacidade & Dados"
  - 3 botões coloridos
  - Descrição sobre dados

REAL:
  ✅ Deve aparecer assim
```

### Após Clicar Botão
```
ESPERADO:
  - Banner desaparece
  - AsyncStorage atualizado
  - Console log: [Consent] ...

REAL:
  ✅ Deve funcionar assim
```

### Após Reload
```
ESPERADO:
  - Banner NÃO aparece
  - AsyncStorage intacto
  - App normal

REAL:
  ✅ Deve funcionar assim
```

---

## 🎨 Visual References

### ✅ CORRETO (Primeira Abertura)
```
App Title
--------

[Algum conteúdo]

┌─────────────────────┐
│ 🔒 Privacidade...   │
│ [Texto descritivo] │
│ [❌][⚙️][✅]       │
└─────────────────────┘
```

### ❌ ERRO (Não deve aparecer)
```
- Banner aparece toda abertura
- AsyncStorage vazio após reload
- Toggles não mudam
- Modal não abre
```

---

## 📱 Diferentes Devices

### iPhone
```
✅ Teste no iOS Simulator
   - Veja se padding está correto
   - Sem overlap com notch
   - Botões acessíveis
```

### Android
```
✅ Teste no Android Emulator
   - Veja se está acima nav bar
   - Backdrop funciona
   - Sem lag
```

### Web
```
✅ Press W para testar web
   - Deve funcionar no navegador
   - Responsivo em diferentes tamanhos
```

---

## 🔄 Workflow Sugerido

```
1. npm expo start
2. Press i (iOS) ou a (Android)
3. Espere carregar
4. Veja banner aparecer
5. Teste cada botão (em resets diferentes)
6. Check console logs
7. Check AsyncStorage
8. ✅ Pronto para produção
```

---

## 🎯 Se Alguma Coisa Não Funcionar

### Banner não aparece
```bash
# Limpe tudo e reinicie
npm run dev
# ou
npx expo start --clear
```

### AsyncStorage não funciona
```bash
# Reinicie o app completamente
# iOS: Kill Simulator → npx expo start → Press i
# Android: npx expo start → Press a
```

### Modal não abre
```bash
# Check console para erros
# Press x para abrir app developer menu
# Veja se há warnings
```

### Toggles não mudam
```bash
# Force reload: Press R
# Se não funcionar, clear AsyncStorage + reload
```

---

## ✨ Resultado Final

Depois de testar tudo:

```
┌──────────────────────────────┐
│  ✅ GDPR/LGPD TESTADO       │
│                              │
│  ✅ Banner funciona          │
│  ✅ Toggles funcionam        │
│  ✅ Persistência ok          │
│  ✅ Reload ok                │
│  ✅ AsyncStorage ok          │
│  ✅ Sem erros TypeScript     │
│                              │
│  🚀 PRONTO PARA APP STORE!  │
└──────────────────────────────┘
```

---

**Última Atualização**: 6 de Janeiro de 2026
**Status**: ✅ PRONTO PARA TESTE
