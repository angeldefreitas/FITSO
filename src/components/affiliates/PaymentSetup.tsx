import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { affiliateApiService } from './services/affiliateApiService';

const colors = Colors;

interface PaymentSetupProps {
  onSetupComplete?: () => void;
}

export const PaymentSetup: React.FC<PaymentSetupProps> = ({ onSetupComplete }) => {
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await affiliateApiService.getStripeAccountStatus();
      setAccountStatus(response.data);
    } catch (error) {
      console.error('Error verificando estado de cuenta:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const createStripeAccount = async () => {
    try {
      setLoading(true);
      
      const response = await affiliateApiService.createStripeAccount({
        country: 'US',
        type: 'express'
      });

      if (response.success && response.data.onboarding_url) {
        // Abrir enlace de onboarding en el navegador
        const supported = await Linking.canOpenURL(response.data.onboarding_url);
        
        if (supported) {
          await Linking.openURL(response.data.onboarding_url);
          
          Alert.alert(
            'Configuración de Pagos',
            'Se abrió el enlace de configuración. Una vez que completes el proceso, regresa a la app y toca "Verificar Estado" para confirmar que todo esté listo.',
            [
              { text: 'Entendido', onPress: () => checkAccountStatus() }
            ]
          );
        } else {
          Alert.alert('Error', 'No se puede abrir el enlace de configuración');
        }
      }
    } catch (error) {
      console.error('Error creando cuenta Stripe:', error);
      Alert.alert('Error', 'No se pudo crear la cuenta de pagos');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = () => {
    checkAccountStatus();
  };

  if (checkingStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Verificando estado de cuenta...</Text>
        </View>
      </View>
    );
  }

  if (!accountStatus?.has_account) {
    return (
      <View style={styles.container}>
        <View style={styles.setupCard}>
          <Text style={styles.title}>Configurar Pagos</Text>
          <Text style={styles.description}>
            Para recibir tus comisiones, necesitas configurar una cuenta de Stripe. 
            Es rápido y seguro.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={createStripeAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Configurar Cuenta de Pagos</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isAccountReady = accountStatus?.payoutsEnabled && accountStatus?.detailsSubmitted;

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={styles.title}>Estado de Cuenta de Pagos</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Cuenta creada:</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.green }]}>
            <Text style={styles.statusBadgeText}>✓ Sí</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Detalles completados:</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: accountStatus?.detailsSubmitted ? colors.green : colors.orange }
          ]}>
            <Text style={styles.statusBadgeText}>
              {accountStatus?.detailsSubmitted ? '✓ Sí' : '⚠ Pendiente'}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pagos habilitados:</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: accountStatus?.payoutsEnabled ? colors.green : colors.red }
          ]}>
            <Text style={styles.statusBadgeText}>
              {accountStatus?.payoutsEnabled ? '✓ Sí' : '❌ No'}
            </Text>
          </View>
        </View>

        {!isAccountReady && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Tu cuenta necesita configuración adicional. Toca "Configurar" para completar el proceso.
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={refreshStatus}
          >
            <Text style={styles.secondaryButtonText}>Verificar Estado</Text>
          </TouchableOpacity>

          {!isAccountReady && (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={createStripeAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Configurar</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {isAccountReady && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✅ ¡Tu cuenta está lista! Ahora puedes recibir pagos de comisiones.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  setupCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  warningBox: {
    backgroundColor: colors.orange + '20',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
  },
  warningText: {
    fontSize: 14,
    color: colors.orange,
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: colors.green + '20',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
  },
  successText: {
    fontSize: 14,
    color: colors.green,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
