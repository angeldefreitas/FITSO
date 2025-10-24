import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Colors } from '../constants/colors';
import { UserAccessButtonsReal } from '../components/affiliates/UserAccessButtonsReal';

const colors = Colors;

interface User {
  id: string;
  email: string;
  name: string;
}

interface HomeScreenWithAdminProps {
  navigation: any;
  user: User | null; // Esto vendría de tu AuthContext
}

export const HomeScreenWithAdmin: React.FC<HomeScreenWithAdminProps> = ({
  navigation,
  user
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Botones de acceso para admin/afiliados */}
      <UserAccessButtonsReal navigation={navigation} user={user} />
      
      <View style={styles.content}>
        <Text style={styles.title}>¡Bienvenido a Fitso!</Text>
        <Text style={styles.subtitle}>
          Hola {user?.name || 'Usuario'}, esta es tu pantalla principal.
        </Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.infoTitle}>👤 Información del Usuario:</Text>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <Text style={styles.infoText}>ID: {user.id}</Text>
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ Sistema de Acceso:</Text>
          <Text style={styles.infoText}>
            • Si eres admin (angelfritas@gmail.com), verás el botón "⚙️ Admin Panel"
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
  userInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: colors.blueLight,
    borderRadius: 12,
    padding: 20,
  },
});
