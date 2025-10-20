import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';

// Crear componente animado de Path
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Crear componente animado de LottieView
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

interface WaterSectionProps {
  waterGoal: number;
  waterConsumed: number;
  onAddWater: () => void;
  onRemoveWater: () => void;
  onUpdateGoal: (goal: number) => void;
  onOpenGoalPicker: () => void;
}

const WaterSection: React.FC<WaterSectionProps> = ({
  waterGoal,
  waterConsumed,
  onAddWater,
  onRemoveWater,
  onUpdateGoal,
  onOpenGoalPicker,
}) => {
  const { t } = useTranslation();
  // Animaciones para el vaso de agua
  const waterProgressAnimation = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const arcProgressAnimation = useRef(new Animated.Value(0)).current;

  // Efecto para animación continua de ondas
  useEffect(() => {
    const startWaveAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 3000, // Más lento para mayor suavidad
            easing: Easing.bezier(0.4, 0.0, 0.6, 1.0), // Curva más suave
            useNativeDriver: false,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 3000, // Más lento para mayor suavidad
            easing: Easing.bezier(0.4, 0.0, 0.6, 1.0), // Curva más suave
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startWaveAnimation();
  }, [waveAnimation]);

  // Efecto para animar el progreso del agua cuando cambia
  useEffect(() => {
    const targetProgress = waterGoal > 0 ? waterConsumed / waterGoal : 0;
    
    Animated.timing(waterProgressAnimation, {
      toValue: targetProgress,
      duration: 1200, // Aumentado para más suavidad
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Curva más suave
      useNativeDriver: false,
    }).start();
  }, [waterConsumed, waterGoal, waterProgressAnimation]);

  // Efecto para animar el arco de forma suave
  useEffect(() => {
    const targetProgress = waterGoal > 0 ? waterConsumed / waterGoal : 0;
    
    Animated.timing(arcProgressAnimation, {
      toValue: targetProgress,
      duration: 1200, // Misma duración que el vaso para sincronización
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Misma curva que el vaso
      useNativeDriver: false,
    }).start();
  }, [waterConsumed, waterGoal, arcProgressAnimation]);

  const waterProgress = waterGoal > 0 ? (waterConsumed / waterGoal) * 100 : 0;
  const isGoalReached = waterConsumed >= waterGoal;

  // Crear animación interpolada para el movimiento de ondas
  const waveOffset = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6], // Reducido para movimiento más sutil
  });

  // Calcular la longitud correcta del arco (180 grados = medio círculo)
  // Radio = 60, circunferencia completa = 2 * π * 60 = 376.99
  // Arco de 180° = 0.5 * 376.99 = 188.5
  const arcLength = 188.5;
  
  // Crear interpolación animada para el strokeDasharray
  const animatedProgressLength = arcProgressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, arcLength],
  });

  return (
    <View style={styles.waterCard}>
      {/* Fondo animado de waves */}
      <View style={styles.waterWavesBackground}>
        <AnimatedLottieView
          source={require('../../../assets/Waves.json')}
          style={[
            styles.waterWavesAnimation,
            {
              transform: [
                {
                  translateY: waveOffset,
                },
              ],
            },
          ]}
          loop={true}
          autoPlay={true}
        />
      </View>
      
      <View style={styles.waterHeader}>
        <View style={styles.waterHeaderCenter}>
          <Text style={styles.waterTitle}>{t('daily.water')}</Text>
          <Text style={styles.waterSubtitle}>
            {waterConsumed} / {waterGoal} vasos
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.waterSettingsButton}
          onPress={onOpenGoalPicker}
        >
          <Text style={styles.waterSettingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Contenedor del arco y vaso centrado */}
      <View style={styles.waterArcGlassContainer}>
        {/* Arco 80% circular */}
        <Svg width={160} height={140} style={styles.waterArcSvg}>
          {/* Arco de fondo */}
          <Path
            d="M 20 100 A 60 60 0 0 1 140 100"
            stroke="rgba(0, 206, 209, 0.3)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arco de progreso animado */}
          <AnimatedPath
            d="M 20 100 A 60 60 0 0 1 140 100"
            stroke="#00CED1"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[
              animatedProgressLength,
              arcLength
            ]}
            opacity={waterConsumed > 0 ? 1 : 0}
          />
        </Svg>
        
        {/* Botón menos (-) en el extremo izquierdo del arco */}
        <TouchableOpacity 
          style={[styles.waterArcButton, styles.waterArcButtonLeft]}
          onPress={onRemoveWater}
          disabled={waterConsumed <= 0}
        >
          <Text style={[
            styles.waterArcButtonText,
            waterConsumed <= 0 && styles.waterArcButtonTextDisabled
          ]}>−</Text>
        </TouchableOpacity>
        
        {/* Botón más (+) en el extremo derecho del arco */}
        <TouchableOpacity 
          style={[styles.waterArcButton, styles.waterArcButtonRight]}
          onPress={onAddWater}
          disabled={waterConsumed >= waterGoal}
        >
          <Text style={[
            styles.waterArcButtonText,
            waterConsumed >= waterGoal && styles.waterArcButtonTextDisabled
          ]}>+</Text>
        </TouchableOpacity>
        
        {/* Vaso centrado debajo del arco con animación suave */}
        <View style={styles.waterGlassCenter}>
          <AnimatedLottieView
            source={require('../../../assets/glass-water2.json')}
            style={[
              styles.waterGlassAnimation,
              {
                transform: [
                  {
                    translateY: waveOffset,
                  },
                ],
              },
            ]}
            loop={false}
            progress={waterProgressAnimation}
          />
        </View>
      </View>
    </View>
  );
};

const styles = {
  // Estilos para la sección de agua
  waterCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    padding: 2,
    height: 180,
    justifyContent: 'space-between' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },

  waterWavesBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  waterWavesAnimation: {
    width: '250%' as any,
    height: '250%' as any,
    opacity: 0.7,
    position: 'absolute' as const,
    top: -75,
    left: -75,
  },

  waterHeader: {
    position: 'relative' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
    minHeight: 32,
    paddingTop: 6,
    zIndex: 1,
  },

  waterHeaderCenter: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  waterTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#2c3e50',
    marginBottom: 1,
    lineHeight: 16,
    textAlign: 'center' as const,
  },

  waterSubtitle: {
    fontSize: 10,
    color: '#6c757d',
    lineHeight: 12,
    textAlign: 'center' as const,
  },

  waterSettingsButton: {
    position: 'absolute' as const,
    top: 10,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#6c757d',
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },

  waterSettingsButtonText: {
    fontSize: 12,
    color: '#6c757d',
  },

  waterArcGlassContainer: {
    position: 'relative' as const,
    width: 160,
    height: 160,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    alignSelf: 'center' as const,
    marginTop: -5,
    zIndex: 1,
  },

  waterArcSvg: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },

  waterGlassCenter: {
    position: 'absolute' as const,
    top: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  waterGlassAnimation: {
    width: 62.5,
    height: 62.5,
  },

  waterArcButton: {
    position: 'absolute' as const,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00CED1',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#00CED1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  waterArcButtonLeft: {
    top: 25,
    left: 0,
  },

  waterArcButtonRight: {
    top: 25,
    right: 0,
  },

  waterArcButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
    textAlignVertical: 'center' as const,
    lineHeight: 18,
    includeFontPadding: false,
  },

  waterArcButtonTextDisabled: {
    color: '#cccccc',
  },
};

export default WaterSection;
