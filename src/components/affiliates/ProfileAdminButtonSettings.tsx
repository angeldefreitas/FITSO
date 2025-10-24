import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View
} from 'react-native';
import { Colors } from '../../constants/colors';

const colors = Colors;

interface ProfileAdminButtonSettingsProps {
  onPress: () => void;
  userEmail?: string;
}

export const ProfileAdminButtonSettings: React.FC<ProfileAdminButtonSettingsProps> = ({ 
  onPress, 
  userEmail 
}) => {
  // Solo mostrar el botón si el email es angelfritas@gmail.com
  if (userEmail !== 'angelfritas@gmail.com') {
    return null;
  }

  return (
    <TouchableOpacity style={styles.adminButton} onPress={onPress}>
      <View style={styles.buttonContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚙️</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.buttonText}>Panel de Administración</Text>
          <Text style={styles.buttonSubtext}>Gestionar afiliados y comisiones</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adminButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  chevron: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '300',
  },
});
