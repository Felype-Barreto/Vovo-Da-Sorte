# ⚡ COMANDOS RÁPIDOS - PUBLICAÇÃO PLAY STORE

## 🚀 Sequência Completa de Comandos

### 1️⃣ Instalar EAS CLI (Uma vez)
```powershell
npm install -g eas-cli
```

### 2️⃣ Login no EAS
```powershell
eas login
```

### 3️⃣ Configurar Projeto
```powershell
eas build:configure
```

### 4️⃣ Configurar Credenciais (Keystore)
```powershell
eas credentials
```
Escolha: **Android > Set up new keystore > Generate new keystore**

### 5️⃣ Build de Produção
```powershell
eas build --platform android --profile production
```

### 6️⃣ Download do AAB
Quando o build terminar, o EAS mostrará um link. Baixe o arquivo `.aab`

---

## 📱 Comandos Úteis Durante Desenvolvimento

### Rodar no Expo Go (Teste)
```powershell
npx expo start
```

### Verificar TypeScript
```powershell
npx tsc --noEmit
```

### Limpar Cache
```powershell
npx expo start --clear
```

### Build Local (Preview)
```powershell
eas build --platform android --profile preview --local
```

### Ver Status de Builds
```powershell
eas build:list
```

### Configurar Credenciais Manualmente
```powershell
eas credentials
```

---

## 🔄 Atualizar App (Versão 1.0.1+)

1. Edite `app.json`:
```json
"version": "1.0.1",
"versionCode": 2
```

2. Build:
```powershell
eas build --platform android --profile production
```

3. Upload do novo `.aab` na Play Store

---

## 🛠️ Troubleshooting

### Erro: "google-services.json not found"
**Solução:** Baixe o arquivo real do Firebase e coloque na raiz do projeto

### Erro: "Build failed - invalid keystore"
**Solução:**
```powershell
eas credentials
# Escolha: Remove credentials
# Depois: Generate new keystore
```

### Erro: "Duplicate resources"
**Solução:**
```powershell
npx expo prebuild --clean
```

### Anúncios não aparecem no app publicado
**Checklist:**
- ✅ Substituiu IDs de teste por IDs reais?
- ✅ Aguardou 24-48h após publicação?
- ✅ App foi aprovado na Play Store?
- ✅ AdMob está ativo (não em revisão)?

---

## 📋 Checklist Pré-Build

Antes de rodar `eas build`:

- [ ] `google-services.json` com dados reais do Firebase
- [ ] IDs do AdMob atualizados em `app.json`
- [ ] IDs dos anúncios atualizados em `src/config/adConfig.ts`
- [ ] Versão incrementada em `app.json`
- [ ] Ícones criados (`icon.png`, `adaptive-icon.png`, `splash-icon.png`)
- [ ] TypeScript sem erros (`npx tsc --noEmit`)

---

## 🎯 Próximos Passos Após Build

1. ✅ Baixar `.aab` do EAS
2. ✅ Acessar Play Console: https://play.google.com/console
3. ✅ Criar nova versão em **Produção**
4. ✅ Upload do `.aab`
5. ✅ Adicionar screenshots (mínimo 2)
6. ✅ Adicionar feature graphic (1024x500 px)
7. ✅ Preencher descrição
8. ✅ Configurar classificação de conteúdo
9. ✅ Declarar segurança de dados
10. ✅ Adicionar URL da política de privacidade
11. ✅ Publicar e aguardar revisão (1-7 dias)

---

## 💡 Dica Final

**Teste TUDO antes de publicar!**

```powershell
# Build de preview para testar localmente
eas build --platform android --profile preview
```

Instale o APK gerado no seu celular e teste:
- ✅ Todas as telas funcionam
- ✅ Scanner funciona
- ✅ Dados carregam
- ✅ Anúncios aparecem (use IDs de teste primeiro)
- ✅ Consentimento aparece na primeira vez
- ✅ App não crasha

Quando tudo estiver OK, faça o build de produção! 🚀
