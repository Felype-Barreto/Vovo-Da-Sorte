import { useConsent } from '@/src/context/ConsentContext';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Banner/Modal de Consentimento GDPR/LGPD
 * Aparece na primeira abertura do app
 * Permite usuário aceitar ou rejeitar coleta de dados e anúncios personalizados
 */

export const ConsentBanner: React.FC = () => {
  const {
    hasSeenBanner,
    consentGiven,
    analyticsConsent,
    adsConsent,
    setConsentBannerSeen,
    setConsentGiven,
    setAnalyticsConsent,
    setAdsConsent,
  } = useConsent();

  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [tempAnalytics, setTempAnalytics] = useState(analyticsConsent);
  const [tempAds, setTempAds] = useState(adsConsent);

  // Não mostrar se já viu o banner
  if (hasSeenBanner || consentGiven !== null) {
    return null;
  }

  const handleAcceptAll = async () => {
    await setConsentGiven(true);
    await setConsentBannerSeen();
  };

  const handleRejectAll = async () => {
    await setConsentGiven(false);
    await setAnalyticsConsent(false);
    await setAdsConsent(false);
    await setConsentBannerSeen();
  };

  const handleSavePreferences = async () => {
    await setAnalyticsConsent(tempAnalytics);
    await setAdsConsent(tempAds);
    await setConsentGiven(true);
    await setConsentBannerSeen();
    setShowDetailedModal(false);
  };

  return (
    <>
      {/* Banner Principal */}
      <Modal visible animationType="slide" transparent>
        <View style={styles.bannerModalOverlay}>
          <View style={styles.bannerContainer}>
            <ScrollView style={styles.bannerContent} showsVerticalScrollIndicator={false}>
              {/* Título */}
              <Text style={styles.bannerTitle}>Privacidade</Text>

              {/* Descrição Principal */}
              <Text style={styles.bannerDescription}>
                Este app utiliza cookies e tecnologias semelhantes para melhorar sua experiência e exibir anúncios,
                conforme as leis GDPR e LGPD.
              </Text>

              <Text style={styles.bannerDescription}>
                Para manter o aplicativo gratuito e em evolução, utilizamos anúncios. Ao permitir anúncios personalizados,
                você contribui para a manutenção, suporte e melhorias contínuas.
              </Text>

              {/* Elementos que coletamos */}
              <View style={styles.bannerSection}>
                <Text style={styles.sectionTitle}>Uso de dados</Text>
                <Text style={styles.sectionText}>
                  • <Text style={styles.bold}>Necessário</Text>: funcionamento básico do app (obrigatório)
                </Text>
                <Text style={styles.sectionText}>
                  • <Text style={styles.bold}>Analytics</Text>: entender como você usa o app
                </Text>
                <Text style={styles.sectionText}>
                  • <Text style={styles.bold}>Anúncios</Text>: exibir anúncios mais relevantes
                </Text>
              </View>

              {/* Botões */}
              <View style={styles.bannerActions}>
                <Pressable style={[styles.button, styles.rejectButton]} onPress={handleRejectAll}>
                  <Text style={styles.rejectButtonText}>Rejeitar tudo</Text>
                </Pressable>

                <Pressable style={[styles.button, styles.customButton]} onPress={() => setShowDetailedModal(true)}>
                  <Text style={styles.customButtonText}>Personalizar</Text>
                </Pressable>

                <Pressable style={[styles.button, styles.acceptButton]} onPress={handleAcceptAll}>
                  <Text style={styles.acceptButtonText}>Aceitar tudo</Text>
                </Pressable>
              </View>

              {/* Aviso Legal */}
              <Text style={styles.legalText}>
                Leia nossa{' '}
                <Text style={styles.link}>Política de Privacidade</Text> e <Text style={styles.link}>Termos de Serviço</Text>.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Personalização */}
      <Modal visible={showDetailedModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Preferências de privacidade</Text>
                <Pressable onPress={() => setShowDetailedModal(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>

              {/* Necessário (sempre ativado) */}
              <View style={styles.consentItem}>
                <View style={styles.consentHeader}>
                  <Text style={styles.consentTitle}>Necessário (obrigatório)</Text>
                  <View style={styles.toggleDisabled}>
                    <Text style={styles.toggleText}>✓</Text>
                  </View>
                </View>
                <Text style={styles.consentDescription}>
                  Dados essenciais para funcionamento do app (login, dados de sessão, etc).
                </Text>
              </View>

              {/* Analytics */}
              <View style={styles.consentItem}>
                <View style={styles.consentHeader}>
                  <Text style={styles.consentTitle}>Analytics e melhorias</Text>
                  <Pressable
                    style={[styles.toggle, tempAnalytics && styles.toggleActive]}
                    onPress={() => setTempAnalytics(!tempAnalytics)}>
                    <View style={[styles.toggleInner, tempAnalytics && styles.toggleInnerActive]} />
                  </Pressable>
                </View>
                <Text style={styles.consentDescription}>
                  Ajuda-nos a entender como você usa o app para melhorar a experiência.
                </Text>
              </View>

              {/* Anúncios Personalizados */}
              <View style={styles.consentItem}>
                <View style={styles.consentHeader}>
                  <Text style={styles.consentTitle}>Anúncios personalizados</Text>
                  <Pressable
                    style={[styles.toggle, tempAds && styles.toggleActive]}
                    onPress={() => setTempAds(!tempAds)}>
                    <View style={[styles.toggleInner, tempAds && styles.toggleInnerActive]} />
                  </Pressable>
                </View>
                <Text style={styles.consentDescription}>
                  Permite mostrar anúncios relevantes ao seu perfil. Você verá anúncios de qualquer forma, mas serão
                  genéricos sem personalização.
                </Text>

                <Text style={styles.consentDescription}>
                  Observação: a publicidade ajuda a manter o aplicativo gratuito. Se você optar por permitir anúncios
                  personalizados, isso aumenta o suporte à manutenção e ao desenvolvimento contínuo.
                </Text>
              </View>

              {/* Aviso Importante */}
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>Importante</Text>
                <Text style={styles.warningText}>
                  Este app funciona com anúncios para manter-se gratuito. Rejeitar anúncios personalizados não remove
                  os anúncios, apenas os torna genéricos.
                </Text>

                <Text style={styles.warningText}>
                  Se você optar por anúncios personalizados, eles tendem a ser mais relevantes e contribuem mais para o
                  suporte do aplicativo.
                </Text>
              </View>

              {/* Botões de Ação */}
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonReject]}
                  onPress={() => setShowDetailedModal(false)}>
                  <Text style={styles.modalButtonText}>Voltar</Text>
                </Pressable>

                <Pressable style={[styles.modalButton, styles.modalButtonAccept]} onPress={handleSavePreferences}>
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>Salvar Preferências</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bannerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Banner
  bannerContainer: {
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 1000,
  },
  bannerContent: {
    gap: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  bannerSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  bannerActions: {
    gap: 8,
    marginVertical: 12,
  },
  button: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
  customButton: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  customButtonText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 13,
  },
  acceptButton: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  acceptButtonText: {
    color: '#16A34A',
    fontWeight: '600',
    fontSize: 13,
  },
  legalText: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  link: {
    color: '#047857',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },

  consentItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  toggleInnerActive: {
    alignSelf: 'flex-end',
  },
  toggleDisabled: {
    width: 44,
    height: 28,
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  consentDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24',
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonReject: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonAccept: {
    backgroundColor: '#10B981',
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#6B7280',
  },
});
