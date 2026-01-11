import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function TermsOfUseScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Termos de Uso</Text>
        <Pressable 
          onPress={() => router.back()}
          android_ripple={{ color: '#e5e7eb' }}
          style={({ pressed }) => [
            { borderRadius: 16, padding: 4 },
            pressed && { opacity: 0.7 }
          ]}
        >
          <FontAwesome name="close" size={24} color="#10b981" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <View className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <Text className="mb-2 text-lg font-bold text-red-700 dark:text-white">
              AVISO IMPORTANTE
            </Text>
            <Text className="text-sm text-red-600 dark:text-white">
              Este aplicativo é apenas informativo e educacional. NÃO realiza apostas reais nem interage com servidores de loterias. Todas as análises, simulações e geradores são ferramentas de estudo.
            </Text>
          </View>

          <Text className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Termos de Uso
          </Text>

          {/* Seção 1 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              1. Natureza do Aplicativo
            </Text>
            <Text className="mb-3 text-sm text-slate-700 dark:text-white">
              Este aplicativo fornece:
            </Text>
            <View className="ml-4 gap-2">
              <Text className="text-sm text-slate-700 dark:text-white">
                • Análise de frequência histórica de números sorteados
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Geradores de combinações numéricas para fins educacionais
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Simuladores de investimento baseados em dados históricos
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Informações sobre regras e procedimentos de loterias
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Sistema de anotações pessoais de jogos
              </Text>
            </View>
          </View>

          {/* Seção 2 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              2. O Que Este App NÃO Faz
            </Text>
            <View className="ml-4 gap-2">
              <Text className="text-sm text-slate-700 dark:text-white">
                ❌ Não realiza apostas reais
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                ❌ Não acessa contas bancárias ou serviços de pagamento
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                ❌ Não garante resultados ou prêmios
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                ❌ Não alega capacidade de prever sorteios
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                ❌ Não substitui consulta a órgãos reguladores
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                ❌ Não oferece aconselhamento financeiro profissional
              </Text>
            </View>
          </View>

          {/* Seção 3 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              3. Responsabilidade do Usuário
            </Text>
            <Text className="mb-3 text-sm text-slate-700 dark:text-white">
              Você é responsável por:
            </Text>
            <View className="ml-4 gap-2">
              <Text className="text-sm text-slate-700 dark:text-white">
                • Usar este aplicativo apenas para fins legais e educacionais
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Não confiar exclusivamente em análises deste app para decisões financeiras
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Cumprir todas as leis e regulamentações locais e nacionais
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Manter seus dados e informações privadas seguras
              </Text>
            </View>
          </View>

          {/* Seção 4 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              4. Limitações Matemáticas e Estatísticas
            </Text>
            <Text className="text-sm text-slate-700 dark:text-white">
              Todas as "melhores combinações" ou "combinações otimizadas" são resultado de análises estatísticas de dados históricos. Elas:
            </Text>
            <View className="ml-4 mt-2 gap-2">
              <Text className="text-sm text-slate-700 dark:text-white">
                • São baseadas em frequências passadas, não futuras
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Podem não se materializar em sorteios reais
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Não constituem garantia de qualquer espécie
              </Text>
              <Text className="text-sm text-slate-700 dark:text-white">
                • Loterias são jogos de azar com probabilidades fixas
              </Text>
            </View>
          </View>

          {/* Seção 5 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              5. Dados Históricos
            </Text>
            <Text className="text-sm text-slate-700 dark:text-white">
              Os dados de sorteios inclusos neste aplicativo são:
            </Text>
            <View className="ml-4 mt-2 gap-2">
              <Text className="text-sm text-slate-700 dark:text-white">
                • Obtidos de fontes públicas (Caixa Econômica Federal)
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                • Fornecidos "como estão", sem garantia de precisão
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                • Sujeitos a atualização sem aviso prévio
              </Text>
            </View>
          </View>

          {/* Seção 6 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              6. Isenção de Responsabilidade
            </Text>
            <Text className="text-sm text-slate-700 dark:text-white">
              Este aplicativo é fornecido "como está". Os desenvolvedores não são responsáveis por:
            </Text>
            <View className="ml-4 mt-2 gap-2">
              <Text className="text-sm text-slate-700 dark:text-white">
                • Perdas financeiras decorrentes do uso do app
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                • Erros ou omissões nas análises
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                • Consequências legais de mal uso
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                • Danos diretos, indiretos ou consequenciais
              </Text>
            </View>
          </View>

          {/* Seção 7 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              7. Legalidade e Jogos de Azar
            </Text>
            <Text className="text-sm text-slate-700 dark:text-white">
              Loterias no Brasil são operadas pela Caixa Econômica Federal. Verifique a legalidade e conformidade com as leis locais antes de fazer qualquer aposta real. Este aplicativo não oferece suporte para apostas ilegais.
            </Text>
          </View>

          {/* Seção 8 */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              8. Modificações e Atualizações
            </Text>
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Reservamo-nos o direito de:
            </Text>
            <View className="ml-4 mt-2 gap-2">
              <Text className="text-sm text-slate-700 dark:text-white">
                • Modificar funcionalidades sem aviso prévio
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                • Descontinuar recursos
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                • Alterar estes termos
              </Text>
            </View>
          </View>

          {/* Seção 9 */}
          <View className="mb-8">
            <Text className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              9. Contacto
            </Text>
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Se você tiver dúvidas sobre estes termos ou o uso deste aplicativo, entre em contato através dos canais de suporte disponíveis.
            </Text>
          </View>

          <View className="mb-8 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
            <Text className="text-sm text-emerald-700 dark:text-emerald-300">
              Última atualização: janeiro de 2026
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              { flex: 1, borderRadius: 12, backgroundColor: '#059669', paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
              pressed && { opacity: 0.85 }
            ]}
          >
            <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 17 }}>Aceitar e Continuar</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/welcome')}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              { flex: 0.7, borderRadius: 12, backgroundColor: '#e5e7eb', paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
              pressed && { opacity: 0.7 }
            ]}
          >
            <Text style={{ fontWeight: 'bold', color: '#059669', fontSize: 16 }}>Recusar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
