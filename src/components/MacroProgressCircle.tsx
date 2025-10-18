import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

interface MacroProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  currentValue: number;
  targetValue: number;
  label: string;
  textColor?: string;
}

export default function MacroProgressCircle({
  progress,
  size = 60,
  strokeWidth = 6,
  color = '#FF6B35',
  backgroundColor = '#F5F5F5',
  currentValue,
  targetValue,
  label,
  textColor = '#000000',
}: MacroProgressCircleProps) {
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
  
  // Crear el arco de progreso usando un enfoque de arco continuo
  const renderProgressArc = () => {
    const segments = 180; // Segmentos para suavidad
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
    <View style={styles.container}>
      {/* Título del macro */}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      
      {/* Círculo de progreso */}
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        {/* Círculo de fondo */}
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            }
          ]}
        />
        
        {/* Arco de progreso animado */}
        {renderProgressArc()}
      </View>
      
      {/* Valores numéricos */}
      <View style={styles.valuesContainer}>
        <Text style={[styles.currentValue, { color: textColor }]}>{Math.round(currentValue)}</Text>
        {targetValue !== "g" && <Text style={[styles.separator, { color: textColor }]}>/</Text>}
        <Text style={[styles.targetValue, { color: textColor }]}>{targetValue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 80, // Ancho mínimo para evitar superposición
    paddingHorizontal: 8, // Espaciado interno
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    // Asegurar que el contenedor tenga el tamaño correcto
    width: 60,
    height: 60,
  },
  backgroundCircle: {
    position: 'absolute',
  },
  progressSegment: {
    position: 'absolute',
  },
  valuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  separator: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
    marginHorizontal: 2,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
  },
});
