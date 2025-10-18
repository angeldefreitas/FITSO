import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Colors } from '../constants/colors';

interface HorizontalProgressBarProps {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  icon?: string;
  width?: number;
}

export default function HorizontalProgressBar({
  label,
  consumed,
  goal,
  color,
  icon,
  width = 200,
}: HorizontalProgressBarProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((consumed / goal) * 100, 100);
  
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.container}>
      {/* Label and values */}
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.values}>{consumed}/{goal}</Text>
      </View>
      
      {/* Progress bar */}
      <View style={[styles.progressBarContainer, { width }]}>
        <View style={[styles.progressBarBackground, { backgroundColor: Colors.border }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: color,
                width: animatedProgress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = {
  container: {
    marginBottom: 16,
  },
  
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  
  labelContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  
  values: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  
  progressBarContainer: {
    height: 8,
  },
  
  progressBarBackground: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
};
