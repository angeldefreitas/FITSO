import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';
import { Colors } from '../../constants/colors';

const colors = Colors;

interface SimpleAdminButtonProps {
  onPress: () => void;
  userEmail?: string;
}

export const SimpleAdminButton: React.FC<SimpleAdminButtonProps> = ({ 
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  adminButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
