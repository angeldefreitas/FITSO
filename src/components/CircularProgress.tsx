import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Colors } from '../constants/colors';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-100
  color: string;
  backgroundColor?: string;
  icon?: string;
  label: string;
  value: number;
  goal: number;
  showIcon?: boolean;
  showPercentage?: boolean;
  backgroundStrokeWidth?: number;
  compactText?: boolean;
}

export default function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor = Colors.border,
  icon,
  label,
  value,
  goal,
  showIcon = false,
  showPercentage = true,
  backgroundStrokeWidth,
  compactText = false,
}: CircularProgressProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000, // 1 segundo de animación
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  // Usar stroke más fino para el fondo si no se especifica
  const bgStrokeWidth = backgroundStrokeWidth || Math.max(2, strokeWidth * 0.4);
  const radius = (size - strokeWidth) / 2;
  const bgRadius = (size - bgStrokeWidth) / 2;
  
  // Crear múltiples segmentos para simular el progreso circular del fondo
  const segments = [];
  const segmentCount = 72; // 5 grados por segmento para mayor suavidad
  const segmentAngle = 360 / segmentCount;
  
  for (let i = 0; i < segmentCount; i++) {
    const angle = i * segmentAngle;
    const segmentColor = backgroundColor;
    
    segments.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          width: bgStrokeWidth,
          height: bgRadius,
          backgroundColor: segmentColor,
          transformOrigin: 'bottom',
          transform: [
            { translateX: size / 2 - bgStrokeWidth / 2 },
            { translateY: bgStrokeWidth / 2 },
            { rotate: `${angle}deg` },
          ],
        }}
      />
    );
  }
  
  // Crear segmentos animados para el progreso
  const animatedSegments = [];
  for (let i = 0; i < segmentCount; i++) {
    const angle = i * segmentAngle;
    const segmentProgress = (i / segmentCount) * 100;
    
    animatedSegments.push(
      <Animated.View
        key={`animated-${i}`}
        style={{
          position: 'absolute',
          width: strokeWidth,
          height: radius,
          backgroundColor: color,
          transformOrigin: 'bottom',
          transform: [
            { translateX: size / 2 - strokeWidth / 2 },
            { translateY: strokeWidth / 2 },
            { rotate: `${angle}deg` },
          ],
          opacity: animatedProgress.interpolate({
            inputRange: [Math.max(0, segmentProgress - 5), segmentProgress + 5],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
        }}
      />
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'relative', width: size, height: size }}>
        {/* Círculo de fondo */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: bgStrokeWidth,
            borderColor: backgroundColor,
            backgroundColor: 'transparent',
          }}
        />
        
        {/* Segmentos de fondo */}
        {segments}
        
        {/* Segmentos animados de progreso */}
        {animatedSegments}
        
        {/* Círculo interior para ocultar el centro de los segmentos */}
        <View
          style={{
            position: 'absolute',
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: Colors.background,
            top: strokeWidth,
            left: strokeWidth,
          }}
        />

        {/* Contenido del centro */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {showIcon && icon && (
            <Text style={{
              fontSize: size * 0.25,
              marginBottom: 4,
            }}>
              {icon}
            </Text>
          )}
          {!showIcon && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: size * 0.18,
                fontWeight: '700',
                color: Colors.textPrimary,
                textAlign: 'center',
                marginBottom: 2,
              }}>
                {value}
              </Text>
              {compactText && (
                <Text style={{
                  fontSize: size * 0.08,
                  color: Colors.textSecondary,
                  textAlign: 'center',
                }}>
                  restantes
                </Text>
              )}
            </View>
          )}
          {showPercentage && (
            <Animated.Text style={{
              fontSize: size * 0.15,
              fontWeight: '800',
              color: Colors.textPrimary,
              textAlign: 'center',
            }}>
              {animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              })}
            </Animated.Text>
          )}
        </View>
      </View>

      {/* Etiqueta debajo del círculo */}
      <Text style={{
        fontSize: compactText ? size * 0.08 : size * 0.16,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginTop: 6,
        textAlign: 'center',
      }}>
        {label}
      </Text>

      {/* Valor consumido - solo si no es compacto */}
      {!compactText && (
        <Text style={{
          fontSize: size * 0.09,
          fontWeight: '500',
          color: Colors.textSecondary,
          marginTop: 2,
          textAlign: 'center',
        }}>
          {value} / {goal}
        </Text>
      )}
    </View>
  );
}
