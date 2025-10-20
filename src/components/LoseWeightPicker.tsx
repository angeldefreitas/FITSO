import React from 'react';
import NumberPicker from './NumberPicker';
import { useTranslation } from 'react-i18next';

interface LoseWeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function LoseWeightPicker({ value, onValueChange }: LoseWeightPickerProps) {
  const { t, i18n } = useTranslation();
  // Opciones específicas para perder peso
  const loseWeightOptions = [1.0, 0.8, 0.5, 0.2];
  
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={0.2}
      max={1.0}
      step={0.1}
      unit={i18n.language === 'pt' ? ' kg/semana' : i18n.language === 'en' ? ' kg/week' : ' kg/semana'}
      placeholder={t('modals.select') || 'Select'}
      label={t('profile.loseWeightPerWeek', { amount: '' }).replace(' {{amount}}', '')}
      modalTitle={t('profile.loseWeightPerWeek', { amount: '' }).replace(' {{amount}}', '')}
      customOptions={loseWeightOptions}
    />
  );
}
