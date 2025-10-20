import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

interface ActivityLevelPickerProps {
  value: 'sedentario' | 'ligero' | 'moderado' | 'intenso' | '';
  onValueChange: (value: 'sedentario' | 'ligero' | 'moderado' | 'intenso') => void;
}

export default function ActivityLevelPicker({ value, onValueChange }: ActivityLevelPickerProps) {
  const { t } = useTranslation();
  const activityLevels = [
    { key: 'sedentario', label: t('auth.sedentary'), emoji: '🛋️', description: t('auth.sedentaryDescription') },
    { key: 'ligero', label: t('auth.light'), emoji: '🚶‍♂️', description: t('auth.lightDescription') },
    { key: 'moderado', label: t('auth.moderate'), emoji: '🏃‍♂️', description: t('auth.moderateDescription') },
    { key: 'intenso', label: t('auth.active'), emoji: '💪', description: t('auth.activeDescription') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('auth.activityLevel')}</Text>
      <View style={styles.levelsContainer}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.key}
            style={[
              styles.levelButton,
              value === level.key && styles.levelButtonActive
            ]}
            onPress={() => onValueChange(level.key as 'sedentario' | 'ligero' | 'moderado' | 'intenso')}
          >
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <Text style={[
              styles.levelText,
              value === level.key && styles.levelTextActive
            ]}>
              {level.label}
            </Text>
            <Text style={[
              styles.levelDescription,
              value === level.key && styles.levelDescriptionActive
            ]}>
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  levelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  levelButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  levelButtonActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  levelEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  
  levelTextActive: {
    color: Colors.primary,
  },
  
  levelDescription: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  
  levelDescriptionActive: {
    color: Colors.textSecondary,
  },
});
