import React, { createContext, useCallback, useContext, useState } from 'react';

interface AdDisplayContextProps {
  tabSwitchCount: number;
  incrementTabSwitch: () => void;
  resetTabSwitch: () => void;
  interstitialShownThisSession: boolean;
  setInterstitialShown: () => void;
  lastInterstitialTimestamp: number | null;
  setLastInterstitialTimestamp: (ts: number) => void;
}

const AdDisplayContext = createContext<AdDisplayContextProps | undefined>(undefined);

export const AdDisplayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [interstitialShownThisSession, setInterstitialShownThisSession] = useState(false);
  const [lastInterstitialTimestamp, setLastInterstitialTimestamp] = useState<number | null>(null);

  const incrementTabSwitch = useCallback(() => setTabSwitchCount((c) => c + 1), []);
  const resetTabSwitch = useCallback(() => setTabSwitchCount(0), []);
  const setInterstitialShown = useCallback(() => setInterstitialShownThisSession(true), []);

  return (
    <AdDisplayContext.Provider
      value={{
        tabSwitchCount,
        incrementTabSwitch,
        resetTabSwitch,
        interstitialShownThisSession,
        setInterstitialShown,
        lastInterstitialTimestamp,
        setLastInterstitialTimestamp,
      }}
    >
      {children}
    </AdDisplayContext.Provider>
  );
};

export function useAdDisplay() {
  const ctx = useContext(AdDisplayContext);
  if (!ctx) throw new Error('useAdDisplay must be used within AdDisplayProvider');
  return ctx;
}
