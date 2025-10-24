import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Colors } from '../constants/colors';
import { UserAccessButtons } from '../components/affiliates/UserAccessButtons';

const colors = Colors;

interface HomeScreenExampleProps {
  navigation: any;
}

export const HomeScreenExample: React.FC<HomeScreenExampleProps> = ({
  navigation
}) => {
  // En tu implementación real, obtendrías el userId de tu AuthContext
  const userId = 'user123'; // Esto vendría de tu contexto de autenticación

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Botones de acceso para admin/afiliados */}
      <UserAccessButtons navigation={navigation} userId={userId} />
      
      <View style={styles.content}>
        <Text style={styles.title}>¡Bienvenido a Fitso!</Text>
        <Text style={styles.subtitle}>
          Esta es tu pantalla principal. Los botones de acceso aparecerán automáticamente según tu tipo de usuario.
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ Información:</Text>
          <Text style={styles.infoText}>
            • Si eres admin, verás el botón "⚙️ Admin Panel"
          </Text>
          <Text style={styles.infoText}>
            • Si eres afiliado, verás el botón "📊 Mi Dashboard"
          </Text>
          <Text style={styles.infoText}>
            • Si eres usuario normal, no verás ningún botón especial
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    marginBottom: 40,
  },
  infoContainer: {
    backgroundColor: colors.blueLight,
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.blue,
    marginBottom: 8,
    lineHeight: 20,
  },
});
