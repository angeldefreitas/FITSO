import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface BannerAdComponentProps {
  style?: any;
  size?: BannerAdSize;
}

// ID de banner de prueba para desarrollo
const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : Platform.OS === 'ios' 
    ? 'ca-app-pub-2507387956943605/9708467694' // Tu ID real para iOS
    : 'ca-app-pub-2507387956943605/9708467694'; // Tu ID real para Android

export default function BannerAdComponent({ style, size = BannerAdSize.BANNER }: BannerAdComponentProps) {
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

  // No mostrar nada si no se carga el anuncio
  if (!adLoaded && adError) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
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
});