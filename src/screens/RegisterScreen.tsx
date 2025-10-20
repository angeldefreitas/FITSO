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

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      // TODO: Implementar registro con Google usando backend propio
      console.log('Google registro pendiente');
      Alert.alert(t('alerts.info'), t('auth.featureNotAvailable'));
    } catch (error: any) {
      Alert.alert(t('alerts.error'), t('auth.signUpError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleRegister = async () => {
    setLoading(true);
    try {
      // TODO: Implementar registro con Apple usando backend propio
      console.log('Apple registro pendiente');
      Alert.alert(t('alerts.info'), t('auth.featureNotAvailable'));
    } catch (error: any) {
      Alert.alert(t('alerts.error'), t('auth.signUpError'));
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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleRegister}
              disabled={loading}
            >
              <Text style={styles.socialButtonText}>{t('auth.continueWithGoogle')}</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleRegister}
                disabled={loading}
              >
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                  {t('auth.continueWithGoogle')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            {t('auth.agreeToTerms')}{' '}
            <Text style={styles.termsLink}>{t('auth.termsOfService')}</Text>
            {' '}{t('auth.and')}{' '}
            <Text style={styles.termsLink}>{t('auth.privacyPolicy')}</Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: Colors.surface,
  },
  socialButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  appleButton: {
    backgroundColor: '#8B0000',
  },
  appleButtonText: {
    color: 'white',
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
});

export default RegisterScreen;
