import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loading: authLoading } = useAuth();

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(t('alerts.validationError'), t('auth.fullName'));
      return false;
    }
    if (!email.trim()) {
      Alert.alert(t('alerts.validationError'), t('auth.email'));
      return false;
    }
    if (!password) {
      Alert.alert(t('alerts.validationError'), t('auth.password'));
      return false;
    }
    if (password.length < 6) {
      Alert.alert(t('alerts.validationError'), t('auth.passwordTooShort'));
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('alerts.validationError'), t('auth.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({ name, email, password });
      
      // Si hay código de referencia, registrarlo después del registro exitoso
      if (referralCode.trim()) {
        try {
          const { affiliateApiService } = await import('../services/affiliateApiService');
          await affiliateApiService.registerReferralCode(referralCode.trim().toUpperCase());
          console.log('✅ Código de referencia registrado:', referralCode);
        } catch (referralError) {
          console.error('❌ Error registrando código de referencia:', referralError);
          // No fallar el registro por error de código de referencia
        }
      }
      
      Alert.alert(
        t('auth.signUpSuccess'),
        t('auth.signUpSuccess'),
        [{ text: t('modals.ok'), onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert(t('alerts.error'), error.message || t('auth.signUpError'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.welcome')}</Text>
          <Text style={styles.subtitle}>{t('auth.signUpTitle')}</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('auth.fullName')}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('auth.fullName')}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('auth.password')}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.password')}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('auth.confirmPassword')}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código de Referencia (Opcional)</Text>
              <TextInput
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                placeholder="Ej: FITNESS_GURU"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <Text style={styles.helpText}>
                Si un influencer te recomendó Fitso, ingresa su código para que reciba una comisión
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, (loading || authLoading) && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>{t('auth.signUpButton')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            {t('auth.agreeToTerms')}{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
            >
              {t('auth.termsOfService')}
            </Text>
            {' '}{t('auth.and')}{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://www.fitso.fitness/privacy.html')}
            >
              {t('auth.privacyPolicy')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  registerButton: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default RegisterScreen;
