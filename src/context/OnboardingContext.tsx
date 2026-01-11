import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

/**
 * Context para gerenciar estado de onboarding (primeira visita)
 * Mostra tela de Bem-vindo apenas na primeira abertura do app
 */

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se já fez onboarding ao iniciar app
  useEffect(() => {
    (async () => {
      try {
        const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(!!completed);
      } catch (err) {
        console.error('Erro ao carregar status de onboarding:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err);
    }
  };

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, completeOnboarding, isLoading }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding deve ser usado dentro de OnboardingProvider');
  }
  return context;
};
