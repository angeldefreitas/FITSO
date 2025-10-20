import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';

interface ChangePasswordScreenProps {
  navigation: any;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { changePassword, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!currentPassword.trim()) {
      Alert.alert(t('alerts.error'), t('auth.currentPasswordRequired'));
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert(t('alerts.error'), t('auth.newPasswordRequired'));
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('alerts.error'), t('auth.passwordTooShort'));
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('alerts.error'), t('auth.passwordsDoNotMatch'));
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert(t('alerts.error'), t('auth.newPasswordMustBeDifferent'));
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
      });
      
      Alert.alert(
        t('auth.passwordUpdated'),
        'Tu contraseña ha sido cambiada exitosamente',
        [{ text: t('modals.ok'), onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      Alert.alert(t('alerts.error'), error.message || t('auth.changePasswordError'));
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
          <Text style={styles.title}>{t('auth.changePassword')}</Text>
          <Text style={styles.subtitle}>
            Ingresa tu contraseña actual y la nueva contraseña
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.currentPassword')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.newPassword')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.confirmNewPassword')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
            <Text style={styles.requirement}>• Mínimo 6 caracteres</Text>
            <Text style={styles.requirement}>• Debe ser diferente a la actual</Text>
            <Text style={styles.requirement}>• Las contraseñas deben coincidir</Text>
          </View>

          <TouchableOpacity
            style={[styles.changeButton, (loading || authLoading) && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={loading || authLoading}
          >
            {(loading || authLoading) ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.changeButtonText}>{t('auth.changePassword')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
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
    marginBottom: 32,
    lineHeight: 24,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  eyeButton: {
    padding: 16,
  },
  eyeButtonText: {
    fontSize: 18,
  },
  passwordRequirements: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  changeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ChangePasswordScreen;
