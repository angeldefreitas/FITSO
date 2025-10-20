import React from 'react';
import NumberPicker from './NumberPicker';
import { useTranslation } from 'react-i18next';

interface WeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function WeightPicker({ value, onValueChange }: WeightPickerProps) {
  const { t } = useTranslation();
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={30}
      max={300}
      step={0.1}
      unit=" kg"
      placeholder={t('auth.weight')}
      label={t('auth.weight')}
    />
  );
}
