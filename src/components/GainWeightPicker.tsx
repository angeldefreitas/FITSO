import React from 'react';
import NumberPicker from './NumberPicker';
import { useTranslation } from 'react-i18next';

interface GainWeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function GainWeightPicker({ value, onValueChange }: GainWeightPickerProps) {
  const { t, i18n } = useTranslation();
  // Opciones específicas para ganar peso
  const gainWeightOptions = [0.2, 0.5];
  
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={0.2}
      max={0.5}
      step={0.1}
      unit={i18n.language === 'pt' ? ' kg/semana' : i18n.language === 'en' ? ' kg/week' : ' kg/semana'}
      placeholder={t('modals.select') || 'Select'}
      label={t('profile.gainWeightPerWeek', { amount: '' }).replace(' {{amount}}', '')}
      modalTitle={t('profile.gainWeightPerWeek', { amount: '' }).replace(' {{amount}}', '')}
      customOptions={gainWeightOptions}
    />
  );
}
