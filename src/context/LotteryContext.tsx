import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import { getAllLotteryIds } from '@/src/megasena/lotteryConfigs';
import type { LotteryType } from '@/src/megasena/types';

type LotteryContextType = {
  selectedLottery: LotteryType;
  setSelectedLottery: (lottery: LotteryType) => Promise<void>;
  availableLotteries: LotteryType[];
};

const LotteryContext = createContext<LotteryContextType | undefined>(undefined);

const LOTTERY_PREF_KEY = '@selected_lottery';
const DEFAULT_LOTTERY: LotteryType = 'megasena';

export function LotteryProvider({ children }: { children: React.ReactNode }) {
  const [selectedLottery, setSelectedLotteryState] = useState<LotteryType>(DEFAULT_LOTTERY);
  const [isLoading, setIsLoading] = useState(true);

  // Load preference on mount
  useEffect(() => {
    async function load() {
      try {
        const saved = await AsyncStorage.getItem(LOTTERY_PREF_KEY);
        if (saved && getAllLotteryIds().includes(saved)) {
          setSelectedLotteryState(saved as LotteryType);
        }
      } catch (err) {
        console.warn('[LotteryContext] Error loading preference:', err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const setSelectedLottery = async (lottery: LotteryType) => {
    try {
      setSelectedLotteryState(lottery);
      AsyncStorage.setItem(LOTTERY_PREF_KEY, lottery).catch((err) => {
        console.warn('[LotteryContext] Error saving preference:', err);
      });
    } catch (err) {
      console.warn('[LotteryContext] Error saving preference:', err);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <LotteryContext.Provider
      value={{
        selectedLottery,
        setSelectedLottery,
        availableLotteries: getAllLotteryIds() as LotteryType[],
      }}>
      {children}
    </LotteryContext.Provider>
  );
}

export function useLottery(): LotteryContextType {
  const context = useContext(LotteryContext);
  if (!context) {
    throw new Error('useLottery must be used within LotteryProvider');
  }
  return context;
}
