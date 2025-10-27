import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { affiliateApiService } from '../services/affiliateApiService';

const colors = Colors;

interface ReferralCodeScreenV2Props {
  navigation?: any;
  route?: any;
  onCodeSubmitted?: (code: string) => void;
  onSkip?: () => void;
}

export const ReferralCodeScreenV2: React.FC<ReferralCodeScreenV2Props> = ({
  navigation,
  route,
  onCodeSubmitted,
  onSkip
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { userData } = route?.params || {};

  const handleValidateCode = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de referencia');
      return;
    }

    const codeToValidate = referralCode.trim().toUpperCase();
    setIsValidating(true);
    
    try {
      console.log('🔍 [REFERRAL] Validando código:', codeToValidate);
      
      // Validar el código primero (endpoint público)
      const validationResponse = await affiliateApiService.validateAffiliateCode(codeToValidate);
      
      if (validationResponse && validationResponse.success) {
        console.log('✅ [REFERRAL] Código válido:', validationResponse.data);
        
        // Ahora registrar el código para el usuario autenticado
        console.log('🔄 [REFERRAL] Registrando código en la base de datos...');
        
        try {
          await affiliateApiService.registerReferralCode(codeToValidate);
          console.log('✅ [REFERRAL] Código registrado exitosamente');
          
          Alert.alert(
            '¡Código registrado!',
            `Tu código de referencia "${codeToValidate}" ha sido registrado. ${validationResponse.data.affiliate_name} recibirá una comisión cuando te conviertas a premium.`,
            [
              {
                text: 'Continuar',
                onPress: () => {
                  if (onCodeSubmitted) {
                    onCodeSubmitted(codeToValidate);
                  } else if (navigation) {
                    navigation.navigate('BiometricData', { 
                      userData,
                      referralCode: codeToValidate 
                    });
                  }
                }
              }
            ]
          );
        } catch (registerError) {
          console.error('❌ [REFERRAL] Error registrando código:', registerError);
          Alert.alert(
            'Error',
            'El código es válido pero no se pudo registrar. ¿Quieres continuar sin él?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Continuar sin código', 
                onPress: handleSkip
              }
            ]
          );
        }
      } else {
        throw new Error('Código no válido');
      }
    } catch (error) {
      console.error('❌ [REFERRAL] Error validando código:', error);
      Alert.alert(
        'Código inválido',
        'El código de referencia no existe o está inactivo. ¿Quieres continuar sin él?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar sin código', 
            onPress: handleSkip
          }
        ]
      );
    } finally {
      setIsValidating(false);
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
          onPress: () => {
            console.log('ℹ️ [REFERRAL] Usuario continuó sin código');
            if (onSkip) {
              onSkip();
            } else if (onCodeSubmitted) {
              onCodeSubmitted('');
            } else if (navigation) {
              navigation.navigate('BiometricData', { 
                userData,
                referralCode: null 
              });
            }
          }
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
          onPress={() => navigation?.goBack()}
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

        <View style={styles.inputCard}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                isLoading && styles.inputDisabled
              ]}
              placeholder="Ingresa el código (ej: ANGELUCHI)"
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading && !isValidating}
              maxLength={20}
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!referralCode.trim() || isLoading || isValidating) && styles.submitButtonDisabled
              ]}
              onPress={handleValidateCode}
              disabled={!referralCode.trim() || isLoading || isValidating}
            >
              {isValidating ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Validar</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isLoading || isValidating}
          >
            <Text style={styles.skipButtonText}>No tengo código, continuar</Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Los códigos de referencia son proporcionados por influencers y entrenadores que recomiendan Fitso
            </Text>
          </View>
        </View>

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
            ¿No tienes código de referencia? No te preocupes, puedes continuar sin él.
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
    paddingTop: 20,
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
  inputCard: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    marginRight: 12,
  },
  inputDisabled: {
    backgroundColor: colors.grayLight,
    borderColor: colors.gray,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.blueLight,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.blue,
    textAlign: 'center',
    lineHeight: 16,
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

