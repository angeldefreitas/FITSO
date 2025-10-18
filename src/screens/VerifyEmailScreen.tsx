import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';

interface VerifyEmailScreenProps {
  navigation: any;
  route: any;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation, route }) => {
  const { verifyEmail, loading: authLoading } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = route.params || {};

  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    }
  }, [token]);

  const handleVerifyEmail = async () => {
    if (!token) {
      setError('Token de verificación no válido');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      await verifyEmail(token);
      setVerified(true);
      Alert.alert(
        '¡Email verificado!',
        'Tu cuenta ha sido verificada exitosamente',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.error('Error verificando email:', error);
      setError(error.message || 'Error verificando el email');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    Alert.alert(
      'Reenviar verificación',
      'Esta funcionalidad estará disponible pronto. Por ahora, puedes usar tu cuenta sin verificación.',
      [{ text: 'OK' }]
    );
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  if (verifying) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.title}>Verificando email...</Text>
          <Text style={styles.subtitle}>Por favor espera un momento</Text>
        </View>
      </View>
    );
  }

  if (verified) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✅</Text>
          </View>
          <Text style={styles.title}>¡Email verificado!</Text>
          <Text style={styles.subtitle}>
            Tu cuenta ha sido verificada exitosamente
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToLogin}
          >
            <Text style={styles.primaryButtonText}>Continuar al Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>❌</Text>
          </View>
          <Text style={styles.title}>Error de verificación</Text>
          <Text style={styles.subtitle}>{error}</Text>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleResendVerification}
          >
            <Text style={styles.primaryButtonText}>Reenviar verificación</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoToLogin}
          >
            <Text style={styles.secondaryButtonText}>Volver al Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>📧</Text>
        </View>
        <Text style={styles.title}>Verifica tu email</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un enlace de verificación a tu email. 
          Haz clic en el enlace para verificar tu cuenta.
        </Text>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleResendVerification}
        >
          <Text style={styles.primaryButtonText}>Reenviar verificación</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoToLogin}
        >
          <Text style={styles.secondaryButtonText}>Ya verifiqué mi email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 200,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VerifyEmailScreen;
