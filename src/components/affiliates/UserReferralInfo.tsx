import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Colors } from '../../constants/colors';
import { affiliateApiService } from './services/affiliateApiService';

const colors = Colors;

interface ReferralInfo {
  id: string;
  user_id: string;
  affiliate_code: string;
  referral_date: string;
  is_premium: boolean;
  premium_conversion_date?: string;
  affiliate_name?: string;
  commission_percentage?: number;
}

interface UserReferralInfoProps {
  onClose: () => void;
}

export const UserReferralInfo: React.FC<UserReferralInfoProps> = ({ onClose }) => {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReferralInfo = async () => {
    try {
      const response = await affiliateApiService.getMyReferral();
      setReferralInfo(response);
    } catch (error) {
      console.error('Error obteniendo información de referencia:', error);
      // No mostrar error si no hay referencia
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!referralInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Referencia</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.content, styles.scrollContent, styles.centeredContent]}>
          <View style={styles.noReferralContainer}>
            <Text style={styles.noReferralIcon}>🎯</Text>
            <Text style={styles.noReferralTitle}>No tienes código de referencia</Text>
            <Text style={styles.noReferralText}>
              Si un influencer te recomendó Fitso, puedes registrarlo en cualquier momento desde tu perfil.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Referencia</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Información del afiliado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu Influencer</Text>
          <View style={styles.affiliateCard}>
            <View style={styles.affiliateInfo}>
              <Text style={styles.affiliateName}>{referralInfo.affiliate_name || 'Influencer'}</Text>
              <Text style={styles.affiliateCode}>Código: {referralInfo.affiliate_code}</Text>
              {referralInfo.commission_percentage && (
                <Text style={styles.commissionText}>
                  Comisión: {referralInfo.commission_percentage}%
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Estado de tu suscripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu Estado</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Fecha de registro:</Text>
              <Text style={styles.statusValue}>{formatDate(referralInfo.referral_date)}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Estado premium:</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: referralInfo.is_premium ? colors.green : colors.orange }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {referralInfo.is_premium ? 'Premium' : 'Gratuito'}
                  </Text>
                </View>
              </View>
            </View>
            {referralInfo.is_premium && referralInfo.premium_conversion_date && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Conversión a premium:</Text>
                <Text style={styles.statusValue}>
                  {formatDate(referralInfo.premium_conversion_date)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Beneficios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficios de tu código</Text>
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitItem}>💰 Descuentos especiales en planes premium</Text>
            <Text style={styles.benefitItem}>🎁 Ofertas exclusivas de tu influencer</Text>
            <Text style={styles.benefitItem}>⭐ Contenido freemium adicional</Text>
            <Text style={styles.benefitItem}>🚀 Acceso anticipado a nuevas funciones</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  centeredContent: {
    justifyContent: 'center',
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  noReferralContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noReferralIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noReferralTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  noReferralText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  affiliateCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  affiliateInfo: {
    alignItems: 'center',
  },
  affiliateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  affiliateCode: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  commissionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  statusContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  benefitsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
});
