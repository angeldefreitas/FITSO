import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { ReferralCodeInput } from '../ReferralCodeInput';
import { Colors } from '../../../constants/colors';
import { affiliateApiService } from '../services/affiliateApiService';

const colors = Colors;

interface ReferralCodeScreenProps {
  navigation: any;
  route: any;
}

export const ReferralCodeScreen: React.FC<ReferralCodeScreenProps> = ({
  navigation,
  route
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = route.params || {};

  const handleCodeSubmitted = async (referralCode: string) => {
    setIsLoading(true);
    
    try {
      if (referralCode) {
        // Registrar el código de referencia
        await affiliateApiService.registerReferralCode(referralCode);
        
        Alert.alert(
          '¡Código registrado!',
          'Tu código de referencia ha sido registrado exitosamente. El influencer recibirá una comisión cuando te conviertas a premium.',
          [
            {
              text: 'Continuar',
              onPress: () => navigation.navigate('BiometricData', { 
                userData,
                referralCode 
              })
            }
          ]
        );
      } else {
        // Continuar sin código de referencia
        navigation.navigate('BiometricData', { 
          userData,
          referralCode: null 
        });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo registrar el código de referencia. ¿Quieres continuar sin él?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar sin código', 
            onPress: () => navigation.navigate('BiometricData', { 
              userData,
              referralCode: null 
            })
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Saltar código de referencia',
      '¿Estás seguro de que quieres continuar sin un código de referencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          onPress: () => navigation.navigate('BiometricData', { 
            userData,
            referralCode: null 
          })
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Código de Referencia</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎯</Text>
        </View>
        
        <Text style={styles.title}>¡Casi terminamos!</Text>
        <Text style={styles.subtitle}>
          Si un influencer o entrenador te recomendó Fitso, ingresa su código de referencia para que reciba una comisión por tu registro.
        </Text>

        <ReferralCodeInput
          onCodeSubmitted={handleCodeSubmitted}
          isLoading={isLoading}
        />

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>💡 ¿Por qué usar un código de referencia?</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• Ayudas al influencer que te recomendó</Text>
            <Text style={styles.benefitItem}>• Recibes consejos personalizados</Text>
            <Text style={styles.benefitItem}>• Formas parte de una comunidad fitness</Text>
            <Text style={styles.benefitItem}>• Acceso a contenido exclusivo</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            No tienes código de referencia? No te preocupes, puedes continuar sin él.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsContainer: {
    marginTop: 32,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
