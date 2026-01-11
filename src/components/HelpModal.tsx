import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

/**
 * Componente de Modal de Ajuda
 * Explica o que cada função faz com linguagem simples (sem jargão técnico)
 */

interface HelpModalProps {
  title: string;
  content: string;
  visible: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ title, content, visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay escuro */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* Modal card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 20,
            maxWidth: '90%',
            maxHeight: '80%',
            elevation: 5,
          }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 }}>
            {title}
          </Text>

          <ScrollView contentContainerStyle={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', lineHeight: 24 }}>
              {content}
            </Text>
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: '#10b981',
              borderRadius: 12,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>Entendi</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

/**
 * Hook para facilitar abertura de múltiplos modais de ajuda
 */
export const useHelpModals = () => {
  const [visible, setVisible] = useState<string | null>(null);

  const helpContent: Record<string, { title: string; content: string }> = {
    statistics: {
      title: 'Estatísticas',
      content:
        'Mostra quais números saem mais vezes nos sorteios passados. Você pode filtrar por data para ver números "quentes" (que saem mais) ou "frios" (que saem menos). Use para ter uma ideia de quais números escolher no seu jogo.',
    },
    scanner: {
      title: 'Scanner de Bilhete',
      content:
        'Aponte a câmera para o código QR de um bilhete de Mega-Sena. O app lerá automaticamente os números e mostrará quantos números você acertou no último sorteio.',
    },
    simulator: {
      title: 'Simulador / Gerar Jogo',
      content:
        'Clique aqui para o app sugerir 6 números para você jogar. A sugestão é feita analisando números que saem com frequência. É como ter um "consultor automático" ajudando na escolha.',
    },
    bolao: {
      title: 'Bolão - Jogar com Amigos',
      content:
        'Um bolão é quando você e seus amigos juntam dinheiro para comprar um bilhete de loteria juntos. O app calcula automaticamente: se vocês ganharem, como dividir o prêmio de forma justa entre os participantes, baseado em quanto cada um contribuiu.',
    },
    generateBet: {
      title: 'Gerar Jogo',
      content:
        'Clique no botão "Gerar Jogo" para o app criar uma sugestão de 6 números. A sugestão usa números que saem com frequência. Use quando estiver em dúvida sobre quais números escolher.',
    },
  };

  const showHelp = (key: string) => {
    setVisible(key);
  };

  const closeHelp = () => {
    setVisible(null);
  };

  const currentHelp = visible ? helpContent[visible] : null;

  return {
    showHelp,
    closeHelp,
    HelpUI: currentHelp && (
      <HelpModal
        title={currentHelp.title}
        content={currentHelp.content}
        visible={!!visible}
        onClose={closeHelp}
      />
    ),
  };
};
