import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ 
  onAnimationComplete, 
  duration = 3500 
}: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-completar después del tiempo especificado
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, textAnim, duration, onAnimationComplete]);

  return (
    <LinearGradient
      colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icono de la llama real */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/fitsoicon.png')}
            style={styles.flameIcon}
            resizeMode="contain"
            onError={(error) => {
              console.log('Error loading fitsoicon:', error);
              // Fallback al icono principal si fitsoicon no existe
            }}
            onLoad={() => {
              console.log('Fitsoicon loaded successfully');
            }}
          />
        </View>

        {/* Texto FITSO */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textAnim,
              transform: [
                {
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.appName}>FITSO</Text>
          <Text style={styles.slogan}>Se obsesionado con lo que quieres</Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flameIcon: {
    width: 150,
    height: 150,
  },
  
  textContainer: {
    alignItems: 'center',
  },
  
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  
  slogan: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
