import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Colors } from '../../constants/colors';

const colors = Colors;

interface ProfileAdminButtonProps {
  onPress: () => void;
  userEmail?: string;
}

export const ProfileAdminButton: React.FC<ProfileAdminButtonProps> = ({ 
  onPress, 
  userEmail 
}) => {
  // Solo mostrar el botón si el email es angelfritas@gmail.com
  if (userEmail !== 'angelfritas@gmail.com') {
    return null;
  }

  return (
    <TouchableOpacity style={styles.adminButton} onPress={onPress}>
      <Text style={styles.adminButtonText}>⚙️ Panel de Administración</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adminButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
