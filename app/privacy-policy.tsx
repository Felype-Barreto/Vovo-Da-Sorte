import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

/**
 * 🔒 Política de Privacidade Profissional
 * 
 * Documento legal completo e em conformidade com:
 * - LGPD (Lei Geral de Proteção de Dados - Brasil)
 * - GDPR (General Data Protection Regulation - Europa)
 */

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255,255,255,0.1)', 
        backgroundColor: 'rgba(0,0,0,0.3)', 
        paddingHorizontal: 16, 
        paddingVertical: 16 
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
          Política de Privacidade
        </Text>
        <Pressable 
          onPress={() => router.back()}
          android_ripple={{ color: '#e5e7eb' }}
          style={({ pressed }) => [
            { borderRadius: 16, padding: 4 },
            pressed && { opacity: 0.7 }
          ]}
        >
          <FontAwesome name="close" size={24} color="#20d361" />
        </Pressable>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Última atualização */}
        <View style={{ backgroundColor: 'rgba(32, 211, 97, 0.1)', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(32, 211, 97, 0.2)' }}>
          <Text style={{ fontSize: 14, color: '#20d361', fontWeight: '600' }}>
            📅 Última atualização: 7 de janeiro de 2026
          </Text>
        </View>

        {/* Introdução */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
            Introdução
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22, marginBottom: 12 }}>
            O aplicativo <Text style={{ fontWeight: 'bold', color: '#20d361' }}>Trevo Inteligente</Text> respeita a sua privacidade e está comprometido em proteger seus dados pessoais.
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22 }}>
            Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações, em conformidade com a <Text style={{ fontWeight: 'bold' }}>LGPD</Text> (Lei nº 13.709/2018) e o <Text style={{ fontWeight: 'bold' }}>GDPR</Text> (Regulamento Geral sobre a Proteção de Dados).
          </Text>
        </View>

        {/* 1. Dados Coletados */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            1. Dados que Coletamos
          </Text>
          
          <Text style={{ fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
            1.1 Dados Armazenados Localmente (no seu dispositivo)
          </Text>
          <View style={{ paddingLeft: 16, marginBottom: 12, gap: 6 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Jogos salvos (números, datas, anotações)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Preferências de configuração (modo de dados, tamanho de fonte)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Histórico de resultados baixados da Caixa Econômica Federal
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Consentimento de privacidade e publicidade
            </Text>
          </View>

          <Text style={{ fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
            1.2 Dados Coletados por Terceiros (com seu consentimento)
          </Text>
          <View style={{ paddingLeft: 16, marginBottom: 12, gap: 6 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Google AdMob:</Text> ID de publicidade, tipo de dispositivo, versão do sistema operacional, interações com anúncios
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Google Analytics (se ativado):</Text> Eventos de uso, tempo de sessão, telas visualizadas (anônimo)
            </Text>
          </View>
        </View>

        {/* 2. Como Usamos seus Dados */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            2. Como Usamos seus Dados
          </Text>
          <View style={{ paddingLeft: 16, gap: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Funcionalidade do app:</Text> Salvar seus jogos, gerar análises estatísticas, exibir resultados
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Publicidade:</Text> Exibir anúncios relevantes (com consentimento) para manter o app gratuito
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Melhorias:</Text> Entender como você usa o app para melhorar recursos (dados anônimos)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Segurança:</Text> Detectar e prevenir uso indevido ou bugs
            </Text>
          </View>
        </View>

        {/* 3. Compartilhamento de Dados */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            3. Compartilhamento de Dados
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22, marginBottom: 12 }}>
            Nós <Text style={{ fontWeight: 'bold' }}>NÃO vendemos</Text> seus dados pessoais. Compartilhamos apenas com:
          </Text>
          <View style={{ paddingLeft: 16, gap: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Google AdMob:</Text> Para exibir anúncios (somente com consentimento)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Autoridades legais:</Text> Se exigido por lei ou ordem judicial
            </Text>
          </View>
        </View>

        {/* 4. Seus Direitos (LGPD/GDPR) */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            4. Seus Direitos (LGPD/GDPR)
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22, marginBottom: 12 }}>
            Você tem os seguintes direitos sobre seus dados:
          </Text>
          <View style={{ paddingLeft: 16, gap: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              ✓ <Text style={{ fontWeight: 'bold' }}>Acesso:</Text> Saber quais dados temos sobre você
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              ✓ <Text style={{ fontWeight: 'bold' }}>Correção:</Text> Corrigir dados incorretos
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              ✓ <Text style={{ fontWeight: 'bold' }}>Exclusão:</Text> Deletar todos os seus dados (botão "Limpar dados" nas configurações)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              ✓ <Text style={{ fontWeight: 'bold' }}>Portabilidade:</Text> Exportar seus dados salvos
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              ✓ <Text style={{ fontWeight: 'bold' }}>Revogação:</Text> Retirar consentimento a qualquer momento (nas configurações)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              ✓ <Text style={{ fontWeight: 'bold' }}>Oposição:</Text> Se opor ao uso de dados para publicidade
            </Text>
          </View>
        </View>

        {/* 5. Armazenamento e Segurança */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            5. Armazenamento e Segurança
          </Text>
          <View style={{ paddingLeft: 16, gap: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Dados salvos localmente no seu dispositivo (não enviamos para servidores)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Comunicação com servidores da Caixa via HTTPS (criptografado)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Uso de AsyncStorage seguro do React Native
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Sem armazenamento de senhas ou dados bancários
            </Text>
          </View>
        </View>

        {/* 6. Cookies e Tecnologias de Rastreamento */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            6. Cookies e Rastreamento
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22, marginBottom: 12 }}>
            Usamos tecnologias similares a cookies para:
          </Text>
          <View style={{ paddingLeft: 16, gap: 8 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Lembrar suas preferências (modo escuro, tamanho de fonte)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Manter você logado (se implementarmos login no futuro)
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              • Google AdMob pode usar cookies de publicidade (com consentimento)
            </Text>
          </View>
        </View>

        {/* 7. Menores de Idade */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            7. Menores de Idade
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22 }}>
            Este aplicativo é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Se você é responsável legal e acredita que seu filho forneceu dados, entre em contato conosco.
          </Text>
        </View>

        {/* 8. Mudanças nesta Política */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            8. Alterações nesta Política
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22 }}>
            Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas dentro do app. A data da última atualização está sempre no topo deste documento.
          </Text>
        </View>

        {/* 9. Contato */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            9. Contato e Encarregado de Dados
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22, marginBottom: 12 }}>
            Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos (LGPD/GDPR), entre em contato:
          </Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 }}>
              📧 Email: suporte@trevointeligente.com.br
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginTop: 4 }}>
              📱 App: Seção "Configurações" → "Privacidade"
            </Text>
          </View>
        </View>

        {/* Disclaimer Legal */}
        <View style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 12, padding: 16, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255, 193, 7, 0.3)' }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#ffc107', marginBottom: 8 }}>
            ⚖️ Conformidade Legal
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 }}>
            Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) do Brasil e o Regulamento Geral sobre a Proteção de Dados (GDPR - Regulation EU 2016/679) da União Europeia.
          </Text>
        </View>
      </ScrollView>

      {/* Botão Fechar */}
      <View style={{ 
        borderTopWidth: 1, 
        borderTopColor: 'rgba(255,255,255,0.1)', 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        paddingHorizontal: 20, 
        paddingVertical: 12
      }}>
        <Pressable
          onPress={() => router.back()}
          android_ripple={{ color: '#e5e7eb' }}
          style={({ pressed }) => [
            { 
              backgroundColor: '#20d361', 
              borderRadius: 12, 
              paddingVertical: 14, 
              alignItems: 'center' 
            },
            pressed && { opacity: 0.85 }
          ]}
        >
          <Text style={{ fontWeight: 'bold', color: '#001a17', fontSize: 16 }}>
            Fechar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
