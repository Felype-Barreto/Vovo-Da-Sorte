import { useEffect, useState } from 'react';

/**
 * Hook para verificar tipo de conexão de rede
 * Retorna: wifi, cellular, none, unknown
 */
export const useNetworkType = () => {
  const [networkType, setNetworkType] = useState<
    'wifi' | 'cellular' | 'none' | 'unknown'
  >('unknown');

  useEffect(() => {
    let alive = true;
    let interval: ReturnType<typeof setInterval> | null = null;
    let unsubscribe: (() => void) | null = null;

    const applyState = (state: any) => {
      if (!alive) return;
      if (state?.type === 'wifi') {
        setNetworkType('wifi');
      } else if (state?.type === 'cellular') {
        setNetworkType('cellular');
      } else if (state?.isConnected === false) {
        setNetworkType('none');
      } else {
        setNetworkType('unknown');
      }
    };

    const readOnce = async () => {
      try {
        // Prefer Expo module (works on Expo Go)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ExpoNetwork = require('expo-network');
        if (ExpoNetwork?.getNetworkStateAsync) {
          const s = await ExpoNetwork.getNetworkStateAsync();
          // expo-network uses numeric `type`; keep it compatible
          const mapped = {
            // expo-network: UNKNOWN=0, NONE=1, WIFI=2, CELLULAR=3
            type:
              s?.type === 2
                ? 'wifi'
                : s?.type === 3
                  ? 'cellular'
                  : s?.type === 1
                    ? 'unknown'
                    : 'unknown',
            isConnected: s?.isConnected,
          };
          applyState(mapped);
          return;
        }
      } catch {
        // ignore
      }

      try {
        // Fallback to NetInfo if available
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NetInfo = require('@react-native-community/netinfo').default;
        if (NetInfo?.fetch) {
          const s = await NetInfo.fetch();
          applyState(s);
        }
      } catch {
        applyState({ type: 'unknown' });
      }
    };

    const setup = async () => {
      await readOnce();

      // Subscribe when NetInfo exists; otherwise poll occasionally.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NetInfo = require('@react-native-community/netinfo').default;
        if (NetInfo?.addEventListener) {
          unsubscribe = NetInfo.addEventListener(applyState);
          return;
        }
      } catch {
        // ignore
      }

      interval = setInterval(() => {
        readOnce().catch(() => {
          // ignore
        });
      }, 8000);
    };

    setup().catch(() => {
      // ignore
    });

    return () => {
      alive = false;
      if (unsubscribe) unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);

  return networkType;
};

/**
 * Hook para verificar se deve baixar dados baseado nas configurações
 * Se dataMode === 'wifi-only', só baixa em WiFi
 * Se dataMode === 'always', baixa sempre
 */
export const useShouldDownloadData = (dataMode: 'always' | 'wifi-only') => {
  const networkType = useNetworkType();

  if (dataMode === 'always') {
    return networkType !== 'none';
  }

  return networkType === 'wifi';
};
