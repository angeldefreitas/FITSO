import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

interface CircularLoadingWheelProps {
  size?: number;
  strokeWidth?: number;
  duration?: number;
  onAnimationComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

export default function CircularLoadingWheel({ 
  size = 120, 
  strokeWidth = 6, 
  duration = 2000,
  onAnimationComplete 
}: CircularLoadingWheelProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación del progreso del círculo (0 a 1)
    const progressAnimation = Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    });

    // Animación de rotación continua
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );

    // Iniciar ambas animaciones
    progressAnimation.start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
    rotationAnimation.start();

    return () => {
      progressAnimation.stop();
      rotationAnimation.stop();
    };
  }, [duration, onAnimationComplete]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Círculo de fondo */}
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.backgroundCircle, { 
          width: size - strokeWidth * 2, 
          height: size - strokeWidth * 2, 
          borderRadius: (size - strokeWidth * 2) / 2 
        }]} />
      </View>

      {/* Círculo de progreso animado */}
      <Animated.View 
        style={[
          styles.progressContainer,
          { 
            width: size, 
            height: size,
            transform: [{ rotate: rotation }]
          }
        ]}
      >
        <Animated.View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: Colors.white,
              borderRightColor: Colors.white,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </Animated.View>

      {/* Círculo de progreso con stroke-dasharray effect */}
      <View style={[styles.dashContainer, { width: size, height: size }]}>
        <Animated.View
          style={[
            styles.dashCircle,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: Colors.white,
              borderRightColor: Colors.white,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>

      {/* Icono en el centro */}
      <View style={[styles.iconContainer, { width: size * 0.4, height: size * 0.4 }]}>
        <Image
          source={require('../../assets/fitsoicon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  circle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  backgroundCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'absolute',
    top: 6,
    left: 6,
  },
  
  progressContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  progressCircle: {
    position: 'absolute',
  },
  
  dashContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dashCircle: {
    position: 'absolute',
    borderStyle: 'dashed',
  },
  
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  icon: {
    width: '100%',
    height: '100%',
  },
});
