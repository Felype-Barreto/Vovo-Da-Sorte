import { generateVoiceScript, narrateDraw, stopNarration } from '@/src/megasena/voice-narrator';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

interface DrawNarratorProps {
  drawnNumbers: number[];
  config: { hexColor: string };
  enabled?: boolean;
}

export default function DrawNarrator({
  drawnNumbers,
  config,
  enabled = true,
}: DrawNarratorProps) {
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup: parar narração ao desmontar
      if (isNarrating) {
        stopNarration();
      }
    };
  }, [isNarrating]);

  const handleStartNarration = async () => {
    try {
      setIsNarrating(true);
      setIsPaused(false);

      await narrateDraw(drawnNumbers, {
        speed: 0.9,
        pauseTime: 1200,
        language: 'pt-BR',
        beforeNumbers: 'Os números sorteados são: ',
        afterNumbers: 'Fim do sorteio!',
      });

      setIsNarrating(false);
    } catch (error) {
      console.error('Erro ao narrar:', error);
      Alert.alert('Erro', 'Não foi possível narrar os números');
      setIsNarrating(false);
    }
  };

  const handleStopNarration = async () => {
    try {
      await stopNarration();
      setIsNarrating(false);
      setIsPaused(false);
    } catch (error) {
      console.error('Erro ao parar narração:', error);
    }
  };

  const handleTogglePause = async () => {
    if (isPaused) {
      // Retomar
      try {
        await narrateDraw(drawnNumbers, {
          speed: 0.9,
          pauseTime: 1200,
        });
        setIsPaused(false);
      } catch (error) {
        console.error('Erro ao retomar:', error);
      }
    } else {
      // Pausar
      await handleStopNarration();
      setIsPaused(true);
    }
  };

  const voiceScript = generateVoiceScript(drawnNumbers);
  const durationSeconds = Math.round(voiceScript.totalDuration / 1000);

  if (!enabled) return null;

  return (
    <View className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="mb-1 text-lg font-bold text-blue-900 dark:text-blue-100">
            🔊 Narrador de Sorteio
          </Text>
          <Text className="text-sm text-blue-700 dark:text-blue-300">
            {isNarrating ? 'Lendo números em voz alta...' : `Duração: ${durationSeconds}s`}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {!isNarrating ? (
          <Pressable
            onPress={handleStartNarration}
            className="flex-1 flex-row items-center justify-center rounded-lg py-2"
            style={{ backgroundColor: config.hexColor }}
          >
            <FontAwesome name="play" size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Ler Números</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={handleTogglePause}
              className="flex-1 flex-row items-center justify-center rounded-lg border-2 py-2"
              style={{ borderColor: config.hexColor }}
            >
              <FontAwesome name="pause" size={16} color={config.hexColor} />
              <Text className="ml-2 font-semibold" style={{ color: config.hexColor }}>
                Pausar
              </Text>
            </Pressable>

            <Pressable
              onPress={handleStopNarration}
              className="flex-1 flex-row items-center justify-center rounded-lg bg-red-500 py-2"
            >
              <FontAwesome name="stop" size={16} color="white" />
              <Text className="ml-2 font-semibold text-white">Parar</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Informações da leitura */}
      <View className="mt-3 border-t border-blue-200 pt-3 dark:border-blue-700">
        <Text className="text-xs text-blue-600 dark:text-blue-400">
          Dica: Use esta função para conferir os números enquanto está na lotérica
        </Text>
      </View>
    </View>
  );
}
