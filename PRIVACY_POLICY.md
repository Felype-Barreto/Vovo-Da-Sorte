# Política de Privacidade - Trevo Inteligente

**Última atualização:** 9 de janeiro de 2026

## 1. Introdução

O app **Trevo Inteligente** ("Aplicativo") é um serviço informacional gratuito para análise de loterias brasileiras (Mega-Sena, Lotofácil, Quina, etc.). O aplicativo é monetizado através de anúncios fornecidos pelo Google AdMob.

## 2. Informações que Coletamos

### 2.1 Dados Locais (Armazenados no Seu Dispositivo)
- **Histórico de sorteios**: armazenado localmente no banco de dados SQLite do seu dispositivo
- **Suas apostas salvas**: números que você salvou para conferir (armazenados localmente)
- **Preferências do app**: loteria selecionada, configurações, etc. (AsyncStorage)
- **Consentimento de anúncios**: sua escolha de consentimento para anúncios personalizados (armazenado localmente)

### 2.2 Dados Coletados pelo Google AdMob

Para exibir anúncios e monetizar o aplicativo, utilizamos o **Google AdMob**, que pode coletar:

- **Identificadores de dispositivo**: ID de publicidade do Android (GAID/AAID)
- **Dados de uso do app**: interações com anúncios, tempo de visualização
- **Informações técnicas**: modelo do dispositivo, versão do Android, operadora, idioma, fuso horário
- **Localização aproximada**: baseada no endereço IP (não usamos GPS)
- **Dados de rede**: endereço IP, tipo de conexão (Wi-Fi/4G)

**Finalidade**: Exibir anúncios relevantes, medir performance, prevenir fraude, e melhorar a experiência publicitária.

**Base Legal**: Seu consentimento explícito, conforme LGPD/GDPR.

Para mais informações sobre como o Google usa dados:
- [Política de Privacidade do Google](https://policies.google.com/privacy)
- [Como o Google usa dados de apps que usam nossos serviços](https://policies.google.com/technologies/partner-sites)

### 2.3 Dados de Terceiros (APIs Públicas)
- **API Caixa Econômica Federal**: o app consulta o servidor público `servicebus2.caixa.gov.br` para obter informações de sorteios atuais
  - Informação pública (não autenticada)
  - Nenhuma credencial pessoal enviada
  - Sujeito à política de privacidade da Caixa

### 2.4 O que NÃO Coletamos Diretamente
- Identidade pessoal (nome, CPF, email, telefone)
- Localização GPS precisa
- Fotos, vídeos ou galeria
- Contatos ou calendário
- Histórico de navegação fora do app

## 3. Uso de Câmera

O app solicita permissão para acessar a câmera apenas na funcionalidade **Scanner**, para ler código QR de bilhetes de loteria. A câmera é usada somente enquanto você está ativamente usando esse recurso. Nenhuma foto é armazenada, analisada ou enviada para servidores.

## 4. Consentimento de Anúncios (LGPD/GDPR)

Na primeira vez que você abre o aplicativo, exibimos uma **tela de consentimento** onde você pode escolher:

- ✅ **Aceitar anúncios personalizados**: Permite que o Google AdMob use dados para exibir anúncios mais relevantes
- ❌ **Aceitar apenas anúncios não personalizados**: Anúncios genéricos sem rastreamento personalizado

**Você pode mudar sua escolha a qualquer momento** acessando: **Configurações > Privacidade e Anúncios**

Se você estiver na **União Europeia (UE) ou Califórnia**, aplicamos proteções adicionais conforme GDPR/CCPA.

## 5. Tipos de Anúncios Exibidos

O aplicativo exibe os seguintes formatos de anúncios através do Google AdMob:

- **Banner Ads**: Pequenos anúncios no topo ou rodapé da tela
- **Interstitial Ads**: Anúncios em tela cheia exibidos entre transições (ex: ao salvar um jogo)
- **App Open Ads**: Anúncios exibidos quando você abre o aplicativo

**Frequência**: Os anúncios são exibidos com intervalos razoáveis para não prejudicar sua experiência.

## 6. Dados de Segurança

- **Criptografia em trânsito**: HTTPS para todas as conexões com APIs externas
- **Armazenamento local seguro**: SQLite para dados de sorteios e apostas
- **Sem compartilhamento direto**: Seus dados de apostas e preferências permanecem no dispositivo
- **Proteção Google**: O AdMob segue as práticas de segurança do Google

## 7. Retenção de Dados

- **Dados locais**: Permanecem no dispositivo até que você limpe o cache ou desinstale o app
- **Dados do AdMob**: Retidos pelo Google conforme [políticas do AdMob](https://support.google.com/admob/answer/6128543)
- **Você pode limpar**: Configurações do Android > Apps > Trevo Inteligente > Limpar dados

## 8. Direitos do Usuário (LGPD/GDPR)

Você tem direito a:

- ✅ **Acessar seus dados**: Dados locais estão no seu dispositivo; dados do AdMob podem ser acessados via Google
- ✅ **Corrigir dados**: Edite ou exclua apostas salvas dentro do app
- ✅ **Excluir dados**: Desinstale o app ou limpe dados; solicite exclusão de dados do Google via [Minha Atividade](https://myactivity.google.com/)
- ✅ **Revogar consentimento**: Mude suas preferências de anúncios em Configurações
- ✅ **Portabilidade**: Exporte seus dados locais (disponível em Configurações)
- ✅ **Oposição**: Desative anúncios personalizados a qualquer momento

**Para exercer seus direitos ou tirar dúvidas**, entre em contato: felypexelepe@hotmail.com

## 9. Compartilhamento com Terceiros

- **Google AdMob**: Único parceiro terceiro que recebe dados para fins publicitários
- **Nenhum outro compartilhamento**: Não vendemos, alugamos ou compartilhamos seus dados com outras empresas
- **Parceiros do Google**: O AdMob pode compartilhar dados com parceiros de anúncios (lista disponível em [Parceiros do Google](https://support.google.com/admob/answer/9012903))

## 10. Crianças (Menores de 13 anos)

O aplicativo **não é destinado a menores de 13 anos**. Não coletamos intencionalmente dados de crianças. Se você é responsável por uma criança e acredita que ela forneceu dados, entre em contato para exclusão imediata.

## 7. Alterações na Política

Atualizações futuras desta política serão publicadas aqui. Uso contínuo do app significa concordância com versão atual.

## 8. Contato

Para dúvidas sobre privacidade:
- **Email**: felypexelepe@hotmail.com
- **Termos de Uso**: veja [Termos de Uso](app/termos-uso.tsx) no app

---

**Este aplicativo é apenas informacional. Não fazemos apostas reais e não temos responsabilidade pelas decisões de aposta do usuário.**
