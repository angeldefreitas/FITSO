import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Colors } from '../../constants/colors';

const colors = Colors;

interface AdminButtonProps {
  onPress: () => void;
  visible?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({ 
  onPress, 
  visible = true 
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.adminButton} onPress={onPress}>
      <Text style={styles.adminButtonText}>⚙️ Admin Panel</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adminButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  adminButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
