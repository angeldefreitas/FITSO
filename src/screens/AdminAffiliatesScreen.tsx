import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text
} from 'react-native';
import { AdminPanel } from '../components/affiliates/AdminPanel';
import { Colors } from '../constants/colors';

const colors = Colors;

interface AdminAffiliatesScreenProps {
  navigation: any;
}

export const AdminAffiliatesScreen: React.FC<AdminAffiliatesScreenProps> = ({
  navigation
}) => {
  const [showAdminPanel, setShowAdminPanel] = useState(true);

  const handleCloseAdminPanel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {showAdminPanel && (
        <AdminPanel onClose={handleCloseAdminPanel} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
