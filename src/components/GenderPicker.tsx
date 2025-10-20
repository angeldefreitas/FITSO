import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

interface GenderPickerProps {
  value: 'masculino' | 'femenino' | '';
  onValueChange: (value: 'masculino' | 'femenino') => void;
}

export default function GenderPicker({ value, onValueChange }: GenderPickerProps) {
  const { t } = useTranslation();
  const genders = [
    { key: 'masculino', label: t('auth.male'), emoji: '♂️' },
    { key: 'femenino', label: t('auth.female'), emoji: '♀️' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('auth.gender')}</Text>
      <View style={styles.genderContainer}>
        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.key}
            style={[
              styles.genderButton,
              value === gender.key && styles.genderButtonActive
            ]}
            onPress={() => onValueChange(gender.key as 'masculino' | 'femenino')}
          >
            <Text style={[
              styles.genderEmoji,
              value === gender.key && styles.genderEmojiActive
            ]}>
              {gender.emoji}
            </Text>
            <Text style={[
              styles.genderText,
              value === gender.key && styles.genderTextActive
            ]}>
              {gender.label}
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
  
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  genderButton: {
    width: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  genderButtonActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  genderEmoji: {
    fontSize: 24,
    marginBottom: 8,
    color: Colors.textSecondary,
  },
  
  genderEmojiActive: {
    color: '#000000',
  },
  
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  
  genderTextActive: {
    color: Colors.primary,
  },
});
