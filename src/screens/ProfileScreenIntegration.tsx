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
import { ProfileAdminButtonSettings } from '../components/affiliates/ProfileAdminButtonSettings';

const colors = Colors;

interface User {
  id: string;
  email: string;
  name: string;
  // ... otros campos de perfil
}

interface ProfileScreenIntegrationProps {
  navigation: any;
  user: User | null; // Esto vendría de tu AuthContext
}

export const ProfileScreenIntegration: React.FC<ProfileScreenIntegrationProps> = ({
  navigation,
  user
}) => {
  const handleAdminPress = () => {
    navigation.navigate('AdminAffiliates');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>FITSO</Text>
          <View style={styles.languageButton}>
            <Text style={styles.languageText}>🇪🇸 Español</Text>
          </View>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Text>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Angel'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'angelfritas@gmail.com'}</Text>
          
          <View style={styles.verificationButton}>
            <Text style={styles.verificationIcon}>⚠️</Text>
            <Text style={styles.verificationText}>No verificado</Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user?.name || 'Angel'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || 'angelfritas@gmail.com'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Miembro desde:</Text>
            <Text style={styles.infoValue}>19 de octubre de 2025</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Última actualización:</Text>
            <Text style={styles.infoValue}>19 de octubre de 2025</Text>
          </View>
        </View>

        {/* Biometric Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Biométricos</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✏️</Text>
              </View>
              <Text style={styles.buttonText}>Ver/Actualizar Datos</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.biometricData}>25 años • 70.00kg, 170cm • ♂</Text>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivos</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🎯</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.buttonText}>Ver/Actualizar Metas</Text>
                <Text style={styles.buttonSubtext}>Perder peso • Perder 0.5 kg/semana 🔥</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✏️</Text>
              </View>
              <Text style={styles.buttonText}>Editar Perfil</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔒</Text>
              </View>
              <Text style={styles.buttonText}>Cambiar Contraseña</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔔</Text>
              </View>
              <Text style={styles.buttonText}>Notificaciones</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🛡️</Text>
              </View>
              <Text style={styles.buttonText}>Privacidad</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📋</Text>
              </View>
              <Text style={styles.buttonText}>Términos de Uso</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Botón de Admin - Solo para angelfritas@gmail.com */}
          <ProfileAdminButtonSettings 
            onPress={handleAdminPress}
            userEmail={user?.email}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona de Peligro</Text>
          <TouchableOpacity style={styles.dangerButton}>
            <View style={styles.buttonContent}>
              <View style={styles.dangerIconContainer}>
                <Text style={styles.icon}>🗑️</Text>
              </View>
              <Text style={styles.dangerButtonText}>Eliminar Cuenta</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  languageButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  languageText: {
    color: colors.white,
    fontSize: 12,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray,
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
    color: colors.white,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verificationIcon: {
    marginRight: 6,
  },
  verificationText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.white,
  },
  settingsButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  biometricData: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    margin: 20,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
