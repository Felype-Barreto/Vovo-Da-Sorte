#!/bin/bash

# 🚀 Comandos Úteis para Desenvolvimento do App

## ⚡ INICIAR DESENVOLVIMENTO

# Terminal 1 - Servidor Expo
npm start

# iOS (se tiver Mac)
npm run ios

# Android
npm run android

# Web (para testes rápidos)
npm run web

---

## 🔍 VALIDAÇÃO & LINTING

# Verificar TypeScript
npx tsc --noEmit

# Verificar erros sem compilar
npx tsc --noEmit --pretty

# Lint (se houver eslint)
npm run lint

# Format código (prettier)
npx prettier --write .

---

## 📦 GERENCIAMENTO

# Instalar dependências
npm install

# Instalar com deps antigos
npm install --legacy-peer-deps

# Limpar cache
npm cache clean --force

# Reinstalar tudo
rm -r node_modules
npm install

---

## 🧪 TESTES

# Testes TypeScript
npx tsc --noEmit

# Detectar problemas de performance
npm start -- --inspect

# Verificar bundle size
npm run web

---

## 📱 EXPO ESPECÍFICO

# Iniciar com device específico
eas device:create

# Build local
eas build --platform ios --local
eas build --platform android --local

# Build na nuvem
eas build --platform all

# Submeter para stores
eas submit --platform all

# Preview build
eas build --platform android --profile preview

---

## 🔧 DEPURAÇÃO

# Acessar menu do Expo Go
# Android/iOS: Shake device
# iOS: Press Cmd+D (simulator)
# Android: Press Cmd+M (emulator)

# Opções:
# - Reload (r)
# - Dev menu (d)
# - Performance monitor (p)
# - Inspector (i)

---

## 📊 MONITORAMENTO

# Ver logs em tempo real
npm start -- --local

# Conectar debugger
# Android: adb logcat
# iOS: Xcode console

# Performance monitor
# Shake device → Performance Monitor

---

## 🗄️ DATABASE

# Acessar SQLite
# Android: adb shell
# iOS: Usar expo-sqlite viewer

# Resetar database
# Delete app → Reinstall

---

## 🌐 REDE

# Ver IP local
ipconfig getifaddr en0  # macOS
ipconfig              # Windows

# Testar conexão
curl https://www1.caixa.gov.br/

---

## 📝 DESENVOLVIMENTO RÁPIDO

# Salvar arquivo = hot reload automático
# Pressionar 'r' no terminal = reload rápido
# Pressionar 's' = reiniciar bundle

---

## 🚀 DEPLOY FINAL

# 1. Verificar se tudo está correto
npx tsc --noEmit

# 2. Atualizar versão
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# 3. Build para produção
eas build --platform all --profile production

# 4. Submeter
eas submit --platform all

# 5. Monitorar (App Store/Play Store)

---

## 🎯 CHECKLIST ANTES DE DEPLOY

- [ ] `npm run test` passa (se houver)
- [ ] `npx tsc --noEmit` sem erros
- [ ] Não há console.log em produção
- [ ] Versão atualizada em package.json
- [ ] README.md atualizado
- [ ] CHANGELOG.md atualizado
- [ ] Testes manuais em device real
- [ ] Performance OK (60fps)
- [ ] Não há sensitive data no código

---

## 📞 TROUBLESHOOTING

# App trava
npm start
# Pressionar 'r' para reload

# Módulo não encontrado
rm -rf node_modules
npm install

# Cache corrompido
npm cache clean --force
npm install

# Port 8081 em uso
lsof -i :8081
kill -9 <PID>

# Device não reconhecido
adb devices
adb reverse tcp:8081 tcp:8081

---

## 💾 COMANDOS ÚTEIS GIT

# Ver status
git status

# Commit
git add .
git commit -m "feat: descrição das mudanças"

# Push
git push origin main

# Ver logs
git log --oneline

# Reset hard
git reset --hard HEAD

---

## 📈 PERFORMANCE

# Medir tempo de inicialização
time npm start

# Profile bundle
npx metro-config-builder

# Analyze dependencies
npm ls

# Check size
du -sh node_modules

---

## 🔐 SEGURANÇA

# Verificar dependências vulneráveis
npm audit

# Corrigir automaticamente
npm audit fix

# Report detalhado
npm audit --json

---

**Dica**: Guarde este arquivo para referência rápida! 📌
