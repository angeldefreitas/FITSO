import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';

// Import condicional de Google Mobile Ads
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  BannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
  TestIds = adsModule.TestIds;
} catch (error) {
  console.log('Google Mobile Ads no disponible en Expo Go');
}

interface BannerAdComponentProps {
  style?: any;
  size?: any;
}

// ID de banner de prueba para desarrollo
const adUnitId = __DEV__ 
  ? (TestIds?.BANNER || 'test-banner') 
  : Platform.OS === 'ios' 
    ? 'ca-app-pub-2507387956943605/9708467694' // Tu ID real para iOS
    : 'ca-app-pub-2507387956943605/9708467694'; // Tu ID real para Android

export default function BannerAdComponent({ style, size }: BannerAdComponentProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const handleAdLoaded = () => {
    console.log('✅ Banner ad loaded successfully');
    setAdLoaded(true);
    setAdError(null);
  };

  const handleAdFailedToLoad = (error: any) => {
    console.log('❌ Banner ad failed to load:', error);
    setAdError(error.message || 'Error loading ad');
    setAdLoaded(false);
  };

  const handleAdOpened = () => {
    console.log('🎯 Banner ad opened');
  };

  const handleAdClosed = () => {
    console.log('🔒 Banner ad closed');
  };

  // Si Google Mobile Ads no está disponible (Expo Go), mostrar placeholder
  if (!BannerAd) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>📱 Ad Space (Expo Go)</Text>
      </View>
    );
  }

  // No mostrar nada si no se carga el anuncio
  if (!adLoaded && adError) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size || BannerAdSize?.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={handleAdOpened}
        onAdClosed={handleAdClosed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 16, // Mismo margen que el componente de macros
    marginVertical: 8,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});