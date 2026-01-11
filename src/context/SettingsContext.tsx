import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface SettingsContextType {
  dataMode: 'always' | 'wifi-only';
  setDataMode: (mode: 'always' | 'wifi-only') => Promise<void>;
  fontScale: number;
  setFontScale: (scale: number) => Promise<void>;
  newResultAlertsEnabled: boolean;
  setNewResultAlertsEnabled: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DATA_MODE_KEY = 'dataMode';
const FONT_SCALE_KEY = 'ui.fontScale.v1';
const NEW_RESULT_ALERTS_KEY = 'alerts.newResult.enabled.v1';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataMode, setDataModeState] = useState<'always' | 'wifi-only'>('always');
  const [fontScale, setFontScaleState] = useState<number>(1);
  const [newResultAlertsEnabled, setNewResultAlertsEnabledState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do AsyncStorage na inicialização
  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem(DATA_MODE_KEY);
        if (savedMode === 'wifi-only' || savedMode === 'always') {
          setDataModeState(savedMode);
        }

        const savedFont = await AsyncStorage.getItem(FONT_SCALE_KEY);
        if (savedFont) {
          const n = Number(savedFont);
          if (Number.isFinite(n) && n >= 1 && n <= 2) {
            setFontScaleState(n);
          }
        }

        const savedAlerts = await AsyncStorage.getItem(NEW_RESULT_ALERTS_KEY);
        setNewResultAlertsEnabledState(savedAlerts === '1');
      } catch (err) {
        console.warn('Erro ao carregar configurações:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setDataMode = async (mode: 'always' | 'wifi-only') => {
    try {
      setDataModeState(mode);
      await AsyncStorage.setItem(DATA_MODE_KEY, mode);
    } catch (err) {
      console.error('Erro ao salvar modo de dados:', err);
    }
  };

  const setFontScale = async (scale: number) => {
    const safe = Number.isFinite(scale) ? Math.max(1, Math.min(2, scale)) : 1;
    try {
      setFontScaleState(safe);
      await AsyncStorage.setItem(FONT_SCALE_KEY, String(safe));
    } catch (err) {
      console.error('Erro ao salvar tamanho da fonte:', err);
    }
  };

  const setNewResultAlertsEnabled = async (enabled: boolean) => {
    try {
      setNewResultAlertsEnabledState(enabled);
      await AsyncStorage.setItem(NEW_RESULT_ALERTS_KEY, enabled ? '1' : '0');
    } catch (err) {
      console.error('Erro ao salvar notificações:', err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        dataMode,
        setDataMode,
        fontScale,
        setFontScale,
        newResultAlertsEnabled,
        setNewResultAlertsEnabled,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de SettingsProvider');
  }
  return context;
};

export const useOptionalSettings = () => {
  return useContext(SettingsContext);
};
