import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../../constants/colors';

const colors = Colors;

interface ReferralCodeInputProps {
  onCodeSubmitted: (code: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({
  onCodeSubmitted,
  isLoading = false,
  disabled = false
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateAndSubmitCode = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de referencia');
      return;
    }

    setIsValidating(true);
    try {
      // Aquí harías la llamada a la API para validar el código
      // const response = await apiService.validateReferralCode(referralCode.trim());
      
      // Por ahora simulamos la validación
      setTimeout(() => {
        setIsValidating(false);
        onCodeSubmitted(referralCode.trim().toUpperCase());
      }, 1000);
      
    } catch (error) {
      setIsValidating(false);
      Alert.alert('Error', 'Código de referencia inválido');
    }
  };

  const skipReferralCode = () => {
    Alert.alert(
      'Saltar código de referencia',
      '¿Estás seguro de que quieres continuar sin un código de referencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => onCodeSubmitted('') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Tienes un código de referencia?</Text>
      <Text style={styles.subtitle}>
        Si un influencer te recomendó Fitso, ingresa su código para que reciba una comisión
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            disabled && styles.inputDisabled
          ]}
          placeholder="Ingresa el código (ej: FITNESS_GURU)"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!disabled && !isLoading}
          maxLength={20}
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!referralCode.trim() || isLoading || isValidating) && styles.submitButtonDisabled
          ]}
          onPress={validateAndSubmitCode}
          disabled={!referralCode.trim() || isLoading || isValidating || disabled}
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
        onPress={skipReferralCode}
        disabled={isLoading || disabled}
      >
        <Text style={styles.skipButtonText}>No tengo código, continuar</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 Los códigos de referencia son proporcionados por influencers y entrenadores que recomiendan Fitso
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 16,
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
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
});
