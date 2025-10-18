import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CircularProgressBarProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export default function CircularProgressBarV2({
  progress,
  size = 120,
  strokeWidth = 4,
  color = '#FFFFFF',
  backgroundColor = 'rgba(255, 255, 255, 0.15)',
  children
}: CircularProgressBarProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Calcular el ángulo de progreso (0-360 grados)
  const progressAngle = (progress / 100) * 360;
  
  // Crear el gradiente del progreso usando un enfoque de arco
  const renderProgressArc = () => {
    const segments = 120; // Muchos segmentos para un efecto muy suave
    const segmentAngle = 360 / segments;
    
    return Array.from({ length: segments }, (_, i) => {
      const angle = i * segmentAngle;
      const isActive = angle <= progressAngle;
      
      // Calcular posición del segmento
      const radius = (size - strokeWidth) / 2;
      const x = size / 2 + radius * Math.cos((angle - 90) * Math.PI / 180);
      const y = size / 2 + radius * Math.sin((angle - 90) * Math.PI / 180);
      
      // Crear gradiente de opacidad para transición suave
      const opacity = isActive ? 1 : 0.1;
      
      return (
        <View
          key={i}
          style={[
            styles.progressSegment,
            {
              position: 'absolute',
              left: x - strokeWidth / 2,
              top: y - strokeWidth / 2,
              width: strokeWidth,
              height: strokeWidth,
              borderRadius: strokeWidth / 2,
              backgroundColor: color,
              opacity: opacity,
            }
          ]}
        />
      );
    });
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Círculo de fondo */}
      <View
        style={[
          styles.backgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            opacity: 0.2,
          }
        ]}
      />
      
      {/* Arco de progreso con gradiente */}
      {renderProgressArc()}
      
      {/* Contenido del círculo */}
      <View style={[styles.content, { backgroundColor, width: size, height: size, borderRadius: size / 2 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
  },
  progressSegment: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
