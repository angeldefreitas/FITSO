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

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword, loading: authLoading } = useAuth();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t('alerts.error'), t('auth.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('alerts.error'), t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      setEmailSent(true);
      Alert.alert(
        t('auth.emailSent'),
        t('auth.emailSentMessage'),
      );
    } catch (error: any) {
      console.error('Error en forgot password:', error);
      Alert.alert(t('alerts.error'), error.message || t('auth.forgotPasswordError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await forgotPassword({ email });
      Alert.alert(t('alerts.success'), t('auth.emailResent'));
    } catch (error: any) {
      Alert.alert(t('alerts.error'), t('auth.resendError'));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>📧</Text>
            </View>
            
            <Text style={styles.title}>{t('auth.emailSent')}!</Text>
            <Text style={styles.subtitle}>
              {t('auth.emailSentTo')}:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            
            <Text style={styles.instructions}>
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </Text>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.resendButtonText}>Reenviar email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backButtonText}>{t('auth.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
          <Text style={styles.subtitle}>
            No te preocupes, te enviaremos un enlace para restablecer tu contraseña.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.resetButton, (loading || authLoading) && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.resetButtonText}>{t('auth.sendRecoveryLink')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backButtonText}>{t('auth.backToLogin')}</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
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
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
