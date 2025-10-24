import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Colors } from '../../constants/colors';

const colors = Colors;

interface AffiliateButtonProps {
  onPress: () => void;
  visible?: boolean;
  affiliateCode?: string;
}

export const AffiliateButton: React.FC<AffiliateButtonProps> = ({ 
  onPress, 
  visible = true,
  affiliateCode 
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.affiliateButton} onPress={onPress}>
      <Text style={styles.affiliateButtonText}>
        📊 Mi Dashboard {affiliateCode && `(${affiliateCode})`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  affiliateButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: colors.green,
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
  affiliateButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
