import { useConsent } from '@/src/ads/umpConsent';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function PrivacySettingsScreen() {
  const { consentStatus, isConsentGiven, setConsent, canRequestConsent } = useConsent();
  const [adConsent, setAdConsent] = useState(isConsentGiven);

  const handleToggle = async (value: boolean) => {
    setAdConsent(value);
    await setConsent(value);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacidade e Anúncios</Text>
      <Text style={styles.description}>
        Você pode controlar se deseja ver anúncios personalizados. Isso não afeta anúncios obrigatórios para funcionamento do app.
      </Text>
      <View style={styles.row}>
        <Text style={styles.label}>Consentimento para anúncios personalizados</Text>
        <Switch
          value={adConsent}
          onValueChange={handleToggle}
          disabled={!canRequestConsent}
        />
      </View>
      <Text style={styles.status}>
        Status atual: {consentStatus === 'PERSONALIZED' ? 'Personalizados' : consentStatus === 'NON_PERSONALIZED' ? 'Não personalizados' : 'Desconhecido'}
      </Text>
      <Text style={styles.note}>
        Você pode alterar sua escolha a qualquer momento nesta tela.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#18181b',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  status: {
    fontSize: 15,
    color: '#a3e635',
    marginBottom: 10,
  },
  note: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 18,
  },
});
