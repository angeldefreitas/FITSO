import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Colors } from '../constants/colors';
import { usePremium } from '../contexts/PremiumContext';

const { width, height } = Dimensions.get('window');

interface PremiumScreenProps {
  onClose: () => void;
}

export default function PremiumScreen({ onClose }: PremiumScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const { purchaseSubscription, restorePurchases, loading } = usePremium();

  const handleSubscribe = async () => {
    try {
      const productId = selectedPlan === 'monthly' ? 'fitso_premium_monthly' : 'fitso_premium_yearly';
      await purchaseSubscription(productId);
      // Cerrar la pantalla después de la compra exitosa
      onClose();
    } catch (error) {
      console.error('Error en suscripción:', error);
      Alert.alert(
        'Error',
        'No se pudo procesar la compra. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert(
        'Compras Restauradas',
        'Se han restaurado tus compras anteriores.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error restaurando compras:', error);
      Alert.alert(
        'Error',
        'No se pudieron restaurar las compras. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2c2c2c', '#1a1a1a']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Icon Animation */}
        <View style={styles.iconContainer}>
          <LottieView
            source={require('../../assets/premiumicon.json')}
            autoPlay
            loop
            style={styles.premiumIcon}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Suscríbete a Premium</Text>
        <Text style={styles.subtitle}>
          Desbloquea el poder completo de Fitso
        </Text>

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Mensual</Text>
              {selectedPlan === 'monthly' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>$2.99</Text>
            <Text style={styles.planBilling}>Facturado mensualmente</Text>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Anual</Text>
              {selectedPlan === 'yearly' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>$19.99</Text>
            <Text style={styles.planBilling}>Facturado anualmente</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>AHORRA 44%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Premium Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>Uso ILIMITADO de la IA</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚫</Text>
            <Text style={styles.featureText}>Sin anuncios</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Análisis nutricional avanzado</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>☁️</Text>
            <Text style={styles.featureText}>Sincronización en la nube</Text>
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity 
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]} 
          onPress={handleSubscribe}
          disabled={loading}
        >
          <Text style={styles.subscribeButtonText}>
            {loading ? 'Procesando...' : 'Suscribirse Ahora'}
          </Text>
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restaurar Compras</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          Al suscribirte, aceptas nuestros Términos de Servicio y Política de Privacidad.
          La suscripción se renueva automáticamente.
        </Text>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  premiumIcon: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#DC143C',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  planBilling: {
    fontSize: 16,
    color: '#ccc',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#DC143C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#DC143C',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  restoreButton: {
    marginHorizontal: 20,
    paddingVertical: 12,
  },
  restoreButtonText: {
    color: '#DC143C',
    fontSize: 16,
    textAlign: 'center',
  },
  termsText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    lineHeight: 16,
  },
});
