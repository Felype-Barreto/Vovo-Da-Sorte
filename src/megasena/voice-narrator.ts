/**
 * Sistema de Narração de Sorteio com Text-to-Speech
 * 
 * Permite ler os números do sorteio em voz alta de forma pausada,
 * facilitando a conferência manual durante a lotérica.
 */

import * as Speech from 'expo-speech';

export interface DrawNarrationOptions {
  speed?: number; // 0.5 a 2.0 (padrão: 1.0)
  pitch?: number; // 0.5 a 2.0 (padrão: 1.0)
  language?: string; // pt-BR, en-US, etc (padrão: pt-BR)
  pauseTime?: number; // Tempo de pausa entre números em ms (padrão: 1500)
  beforeNumbers?: string; // Texto antes dos números (padrão: "Os números sorteados são: ")
  afterNumbers?: string; // Texto depois dos números (padrão: "Fim do sorteio!")
  repeatCount?: number; // Quantas vezes repetir os números (padrão: 1)
}

/**
 * Opções padrão para narração
 */
const DEFAULT_OPTIONS: DrawNarrationOptions = {
  speed: 0.8,
  pitch: 1.0,
  language: 'pt-BR',
  pauseTime: 1500,
  beforeNumbers: 'Os números sorteados são: ',
  afterNumbers: 'Fim do sorteio!',
  repeatCount: 1,
};

/**
 * Narra os números do sorteio em voz alta
 */
export async function narrateDraw(
  drawnNumbers: number[],
  options: DrawNarrationOptions = {},
): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Verificar se o dispositivo suporta TTS
  const available = await Speech.isSpeakingAsync();
  if (available) {
    await Speech.stop();
  }

  try {
    // Preparar lista de números em português
    const numbersText = drawnNumbers.map((num) => numberToWords(num)).join(', ');

    // Mensagem inicial
    await Speech.speak(config.beforeNumbers || '', {
      language: config.language,
      rate: config.speed,
      pitch: config.pitch,
      onDone: () => {
        // Próxima fala
      },
    });

    // Aguardar e depois ler números pausadamente
    for (let repeat = 0; repeat < (config.repeatCount || 1); repeat++) {
      for (let i = 0; i < drawnNumbers.length; i++) {
        const number = drawnNumbers[i];
        const wordForm = numberToWords(number);

        // Falar o número
        await new Promise<void>((resolve) => {
          Speech.speak(wordForm, {
            language: config.language,
            rate: config.speed,
            pitch: config.pitch,
            onDone: () => {
              resolve();
            },
          });
        });

        // Pausa entre números
        if (i < drawnNumbers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, config.pauseTime || 1500));
        }
      }

      // Pausa entre repetições
      if (repeat < (config.repeatCount || 1) - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Mensagem final
    await Speech.speak(config.afterNumbers || '', {
      language: config.language,
      rate: config.speed,
      pitch: config.pitch,
    });
  } catch (error) {
    console.error('Erro ao narrar sorteio:', error);
    throw error;
  }
}

/**
 * Para a narração atual
 */
export async function stopNarration(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Erro ao parar narração:', error);
  }
}

/**
 * Converte números para suas formas em palavras em português
 */
export function numberToWords(num: number): string {
  const ones = [
    '',
    'um',
    'dois',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
  ];
  const teens = [
    'dez',
    'onze',
    'doze',
    'treze',
    'quatorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
  ];
  const tens = [
    '',
    '',
    'vinte',
    'trinta',
    'quarenta',
    'cinquenta',
    'sessenta',
    'setenta',
    'oitenta',
    'noventa',
  ];

  if (num === 0) return 'zero';

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return one === 0 ? tens[ten] : `${tens[ten]} e ${ones[one]}`;
  }

  return String(num); // Fallback para números maiores
}

/**
 * Cria mensagem personalizada para conferência de números
 */
export function createCheckMessage(
  drawnNumbers: number[],
  selectedNumbers: number[],
): {
  message: string;
  hits: number[];
  misses: number[];
} {
  const hits = selectedNumbers.filter((num) => drawnNumbers.includes(num));
  const misses = selectedNumbers.filter((num) => !drawnNumbers.includes(num));

  let message = 'CONFERÊNCIA DE NÚMEROS\n';
  message += '=' .repeat(30) + '\n';
  message += `Sorteados: ${drawnNumbers.join(', ')}\n`;
  message += `Seus números: ${selectedNumbers.join(', ')}\n\n`;
  message += `Acertos: ${hits.length} → ${hits.length > 0 ? hits.join(', ') : 'Nenhum'}\n`;
  message += `Erros: ${misses.length} → ${misses.length > 0 ? misses.join(', ') : 'Nenhum'}\n`;

  return { message, hits, misses };
}

/**
 * Gera script para leitura em voz alta (com pausas)
 */
export function generateVoiceScript(
  drawnNumbers: number[],
  options: DrawNarrationOptions = {},
): {
  parts: Array<{ text: string; pause?: number }>;
  totalDuration: number;
} {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const parts: Array<{ text: string; pause?: number }> = [];

  // Introdução
  if (config.beforeNumbers) {
    parts.push({ text: config.beforeNumbers, pause: 500 });
  }

  // Números
  for (let repeat = 0; repeat < (config.repeatCount || 1); repeat++) {
    for (let i = 0; i < drawnNumbers.length; i++) {
      const wordForm = numberToWords(drawnNumbers[i]);
      parts.push({
        text: wordForm,
        pause: i < drawnNumbers.length - 1 ? config.pauseTime || 1500 : 1000,
      });
    }

    if (repeat < (config.repeatCount || 1) - 1) {
      parts.push({ text: 'Repetindo...', pause: 1000 });
    }
  }

  // Conclusão
  if (config.afterNumbers) {
    parts.push({ text: config.afterNumbers });
  }

  const totalDuration = parts.reduce((sum, part) => sum + (part.pause || 0), 0);

  return { parts, totalDuration };
}

/**
 * Verifica se o dispositivo suporta Text-to-Speech
 */
export async function isSpeechAvailable(): Promise<boolean> {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
}

/**
 * Pausa a narração
 */
export async function pauseNarration(): Promise<void> {
  try {
    // Speech API não tem pausa nativa, então paramos
    await Speech.stop();
  } catch (error) {
    console.error('Erro ao pausar narração:', error);
  }
}
