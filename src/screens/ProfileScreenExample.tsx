import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Colors } from '../constants/colors';
import { ProfileAdminButton } from '../components/affiliates/ProfileAdminButton';

const colors = Colors;

interface User {
  id: string;
  email: string;
  name: string;
  // ... otros campos de perfil
}

interface ProfileScreenExampleProps {
  navigation: any;
  user: User | null; // Esto vendría de tu AuthContext
}

export const ProfileScreenExample: React.FC<ProfileScreenExampleProps> = ({
  navigation,
  user
}) => {
  const handleAdminPress = () => {
    navigation.navigate('AdminAffiliates');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>

        {/* Información del Usuario */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@ejemplo.com'}</Text>
        </View>

        {/* Botón de Admin - Solo para angelfritas@gmail.com */}
        <ProfileAdminButton 
          onPress={handleAdminPress}
          userEmail={user?.email}
        />

        {/* Secciones del Perfil */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionButton}>
            <Text style={styles.sectionButtonText}>📊 Mis Estadísticas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sectionButton}>
            <Text style={styles.sectionButtonText}>⚙️ Configuración</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sectionButton}>
            <Text style={styles.sectionButtonText}>💳 Suscripción</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sectionButton}>
            <Text style={styles.sectionButtonText}>📱 Notificaciones</Text>
          </TouchableOpacity>
        </View>

        {/* Información de Debug */}
        {user?.email === 'angelfritas@gmail.com' && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>🔧 Información de Debug:</Text>
            <Text style={styles.debugText}>✅ Eres administrador</Text>
            <Text style={styles.debugText}>📧 Email: {user.email}</Text>
            <Text style={styles.debugText}>🆔 ID: {user.id}</Text>
          </View>
        )}
      </ScrollView>
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
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileSection: {
    backgroundColor: colors.white,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  sectionButton: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  debugInfo: {
    backgroundColor: colors.blueLight,
    margin: 20,
    padding: 16,
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: colors.blue,
    marginBottom: 4,
  },
});
