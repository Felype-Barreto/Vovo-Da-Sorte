# 🚀 COMANDOS PRONTOS - COPIE E COLE

**Execute estes comandos na ordem! Tudo já está configurado.**

---

## ⚡ PASSO 1: INSTALAR EAS CLI

```powershell
npm install -g eas-cli
```

Aguarde instalar... ⏳

---

## 🔐 PASSO 2: LOGIN NO EAS

```powershell
eas login
```

Quando pedir:
- **Email**: codeflowbr1@gmail.com
- **Password**: (sua senha do Expo)

💡 **Não tem conta Expo?** 
1. Crie em: https://expo.dev/signup
2. Use email: codeflowbr1@gmail.com

---

## 🔑 PASSO 3: CRIAR KEYSTORE

```powershell
eas credentials
```

Navegue com as setas:
1. Selecione: **Android**
2. Selecione: **production**
3. Selecione: **Keystore: Set up a new keystore**
4. Selecione: **Generate new keystore**

✅ Pronto! Keystore criada e salva automaticamente.

---

## 🏗️ PASSO 4: BUILD DE PRODUÇÃO

```powershell
eas build --platform android --profile production
```

**O que vai acontecer:**
- ⏳ Build na nuvem (15-20 minutos)
- 📦 Gera arquivo `.aab` pronto para Play Store
- 🔐 Assinado automaticamente com sua keystore

**Quando terminar:**
- Link para download aparecerá no terminal
- **BAIXE O ARQUIVO .AAB** ⬇️

---

## 📱 OPCIONAL: BUILD DE TESTE (APK)

Se quiser testar no celular antes:

```powershell
eas build --platform android --profile preview
```

Gera APK que você pode instalar direto no Android.

---

## ✅ DEPOIS DO BUILD

1. ✅ Download do `.aab` concluído
2. ✅ Ícones e screenshots prontos
3. ✅ Política de privacidade online

**AGORA SIM**: Upload na Play Store! 🎉

Link: https://play.google.com/console

---

## 🆘 PROBLEMAS?

**Erro: "Not logged in"**
```powershell
eas login
```

**Erro: "Project not configured"**
- Já está configurado! Tente novamente.

**Erro: "Keystore already exists"**
- Perfeito! Pule a etapa da keystore.

**Build falhou?**
- Leia a mensagem de erro
- Geralmente é problema com `google-services.json`
- Ou IDs do AdMob incorretos

---

## 💡 DICAS

✅ Rode `npx tsc --noEmit` antes do build (verificar erros)
✅ Certifique-se que está na pasta do projeto
✅ Aguarde o build terminar (não feche o terminal)
✅ Anote o link do `.aab` quando aparecer

**Pronto! Agora é só executar os comandos!** 🍀
