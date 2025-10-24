import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text
} from 'react-native';
import { AffiliateDashboard } from '../components/affiliates/AffiliateDashboard';
import { Colors } from '../constants/colors';

const colors = Colors;

interface AffiliateDashboardScreenProps {
  navigation: any;
  route: any;
}

export const AffiliateDashboardScreen: React.FC<AffiliateDashboardScreenProps> = ({
  navigation,
  route
}) => {
  const { affiliateCode } = route.params || { affiliateCode: 'FITNESS_GURU' };

  const handleRefresh = () => {
    // Aquí podrías actualizar datos o refrescar la pantalla
    console.log('Refrescando dashboard...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mi Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      <AffiliateDashboard 
        affiliateCode={affiliateCode}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 60,
  },
});
