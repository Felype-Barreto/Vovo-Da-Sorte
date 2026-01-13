import { Text as ThemedText } from '@/components/Themed';
import { GlassCard } from '@/src/components/GlassCard';
import { useNetworkType } from '@/src/components/useNetworkType';
import { useSettings } from '@/src/context/SettingsContext';
import { ensureNotificationsPermission } from '@/src/megasena/alerts';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ConfigScreen() {
  const {
    dataMode,
    setDataMode,
    fontScale,
    setFontScale,
    newResultAlertsEnabled,
    setNewResultAlertsEnabled,
    isLoading,
  } = useSettings();
  const networkType = useNetworkType();
  const router = useRouter();

  const networkLabel = useMemo(() => {
    if (networkType === 'wifi') return '📶 Wi‑Fi';
    if (networkType === 'cellular') return '📱 Dados móveis';
    if (networkType === 'none') return '❌ Sem conexão';
    return '❓ Desconhecida';
  }, [networkType]);

  const dataModeLabel = useMemo(() => {
    if (isLoading) return 'Carregando...';
    return dataMode === 'wifi-only' ? 'Apenas Wi‑Fi (recomendado)' : 'Sempre (Wi‑Fi e dados)';
  }, [dataMode, isLoading]);

  const dataModeHint = useMemo(() => {
    if (isLoading) return '';
    if (dataMode === 'wifi-only') {
      return networkType === 'wifi'
        ? '💡 Você está no Wi‑Fi. Ótimo para baixar atualizações.'
        : '💡 Conecte ao Wi‑Fi para baixar atualizações.';
    }

    return networkType === 'cellular'
      ? '⚠️ Em dados móveis, isso pode consumir seu pacote.'
      : '📥 Você pode baixar em qualquer conexão.';
  }, [dataMode, isLoading, networkType]);

  const appVersion =
    Constants.expoConfig?.version ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants as any)?.manifest2?.extra?.expoClient?.version ??
    '1.0.0';

  const fontOptions = useMemo(
    () => [
      { label: 'Normal', value: 1 },
      { label: 'Grande', value: 1.25 },
      { label: 'Muito grande', value: 1.5 },
      { label: 'Enorme', value: 1.75 },
    ],
    []
  );

  async function toggleNewResultAlerts() {
    const next = !newResultAlertsEnabled;
    if (next) {
      const allowed = await ensureNotificationsPermission();
      if (!allowed) {
        Alert.alert(
          'Permissão necessária',
          'Para avisar quando sair resultado novo, permita notificações nas configurações do celular.'
        );
        return;
      }
    }
    await setNewResultAlertsEnabled(next);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Image source={require('../../assets/images/mascote-vovo.png')} style={{ width: 36, height: 36, borderRadius: 18 }} />
            <ThemedText style={styles.title}>Configurações do Vovô</ThemedText>
          </View>
          <ThemedText style={styles.subtitle}>Controle de conexão, privacidade e dados.</ThemedText>
        </View>

        <GlassCard>
          <ThemedText style={styles.sectionTitle}>🌐 Sua conexão atual</ThemedText>
          <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>Status</ThemedText>
            <ThemedText style={styles.rowValue}>{networkLabel}</ThemedText>
          </View>
        </GlassCard>

        <GlassCard>
          <ThemedText style={styles.sectionTitle}>💾 Economia de dados</ThemedText>
          <ThemedText style={styles.note}>
            Quando ativado, o app só baixa atualizações no Wi‑Fi (melhor para economizar internet).
          </ThemedText>

          <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>Modo</ThemedText>
            <ThemedText style={styles.rowValue}>{dataModeLabel}</ThemedText>
          </View>

          <Pressable
            disabled={isLoading}
            onPress={() => setDataMode(dataMode === 'wifi-only' ? 'always' : 'wifi-only')}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !isLoading ? { opacity: 0.85 } : null,
              isLoading ? { opacity: 0.55 } : null,
              pressed && { opacity: 0.85 }
            ]}
          >
            <ThemedText style={styles.primaryButtonText}>
              {dataMode === 'wifi-only' ? 'Usar também dados móveis' : 'Usar apenas Wi‑Fi'}
            </ThemedText>
          </Pressable>

          {!!dataModeHint && <ThemedText style={styles.hint}>{dataModeHint}</ThemedText>}
        </GlassCard>

        <GlassCard>
          <ThemedText style={styles.sectionTitle}>🔔 Notificações</ThemedText>
          <ThemedText style={styles.note}>
            Quando ativado, o app avisa quando detectar um resultado novo (ao abrir/atualizar).
          </ThemedText>

          <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>Novo resultado</ThemedText>
            <ThemedText style={styles.rowValue}>{newResultAlertsEnabled ? 'Ativado' : 'Desativado'}</ThemedText>
          </View>

          <Pressable
            onPress={toggleNewResultAlerts}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [styles.primaryButton, pressed ? { opacity: 0.85 } : null, pressed && { opacity: 0.85 }]}
          >
            <ThemedText style={styles.primaryButtonText}>
              {newResultAlertsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
            </ThemedText>
          </Pressable>
        </GlassCard>

        <GlassCard>
          <ThemedText style={styles.sectionTitle}>🔤 Tamanho da fonte</ThemedText>
          <ThemedText style={styles.note}>Aumenta o tamanho do texto em todo o app (bom para leitura).</ThemedText>

          <View style={styles.pillsRow}>
            {fontOptions.map((opt) => {
              const selected = Math.abs(fontScale - opt.value) < 0.01;
              return (
                <Pressable
                  key={opt.label}
                  accessibilityRole="button"
                  onPress={() => setFontScale(opt.value)}
                  android_ripple={{ color: '#e5e7eb' }}
                  style={({ pressed }) => [
                    styles.pill,
                    selected ? styles.pillSelected : null,
                    pressed ? { opacity: 0.85 } : null,
                    pressed && { opacity: 0.85 }
                  ]}
                >
                  <ThemedText style={[styles.pillText, selected ? styles.pillTextSelected : null]}>{opt.label}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard>
          <ThemedText style={styles.sectionTitle}>🔐 Privacidade</ThemedText>
          <ThemedText style={styles.note}>Leia os termos e informações de uso.</ThemedText>
          <Pressable
            onPress={() => router.push('/termos-uso')}
            android_ripple={{ color: '#e5e7eb' }}
            style={({ pressed }) => [styles.secondaryButton, pressed ? { opacity: 0.85 } : null, pressed && { opacity: 0.85 }]}
          >
            <ThemedText style={styles.secondaryButtonText}>Abrir Termos de Uso</ThemedText>
          </Pressable>
        </GlassCard>

        <GlassCard>
          <ThemedText style={styles.sectionTitle}>ℹ️ Sobre</ThemedText>
          <ThemedText style={styles.note}>Versão do app: {appVersion}</ThemedText>
          <ThemedText style={styles.note}>
            Este app mostra resultados e ajuda em análises de loterias.
          </ThemedText>
          <ThemedText style={styles.disclaimer}>
            Aviso: ferramenta independente e não possui vínculo oficial com a Caixa.
          </ThemedText>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  header: {
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.78)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.80)',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'right',
    flex: 1,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.70)',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pillText: {
    fontSize: 15,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.88)',
  },
  pillTextSelected: {
    color: '#ffffff',
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.72)',
  },
});
