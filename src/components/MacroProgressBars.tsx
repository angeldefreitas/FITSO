import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MacroProgressBarsProps {
  proteinProgress: number; // 0-100
  fatProgress: number; // 0-100
  carbsProgress: number; // 0-100
  proteinValue: number;
  fatValue: number;
  carbsValue: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
  textColor?: string;
}

export default function MacroProgressBars({
  proteinProgress,
  fatProgress,
  carbsProgress,
  proteinValue,
  fatValue,
  carbsValue,
  proteinGoal,
  fatGoal,
  carbsGoal,
  textColor = '#000000',
}: MacroProgressBarsProps) {
  const { t } = useTranslation();
  const proteinAnimatedValue = useRef(new Animated.Value(0)).current;
  const fatAnimatedValue = useRef(new Animated.Value(0)).current;
  const carbsAnimatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(proteinAnimatedValue, {
        toValue: proteinProgress,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fatAnimatedValue, {
        toValue: fatProgress,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(carbsAnimatedValue, {
        toValue: carbsProgress,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [proteinProgress, fatProgress, carbsProgress]);

  const renderMacroBar = (
    label: string,
    color: string,
    progress: number,
    currentValue: number,
    targetValue: number,
    animatedValue: Animated.Value
  ) => (
    <View style={styles.macroContainer}>
      <View style={styles.macroHeader}>
        <Text style={[styles.macroLabel, { color }]}>{label}</Text>
        <Text style={[styles.macroValues, { color: textColor }]}>
          {Math.round(currentValue)}/{targetValue}g
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: `${color}20` }]} />
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: color,
              width: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.macrosRow}>
        {renderMacroBar(
          t('food.protein'),
          '#FF6B35',
          proteinProgress,
          proteinValue,
          proteinGoal,
          proteinAnimatedValue
        )}
        {renderMacroBar(
          t('food.fat'),
          '#4CAF50',
          fatProgress,
          fatValue,
          fatGoal,
          fatAnimatedValue
        )}
        {renderMacroBar(
          t('food.carbs'),
          '#2196F3',
          carbsProgress,
          carbsValue,
          carbsGoal,
          carbsAnimatedValue
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  macroContainer: {
    flex: 1,
    alignItems: 'center',
  },
  macroHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  macroValues: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
