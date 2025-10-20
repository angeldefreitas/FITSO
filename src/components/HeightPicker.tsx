import React from 'react';
import NumberPicker from './NumberPicker';
import { useTranslation } from 'react-i18next';

interface HeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function HeightPicker({ value, onValueChange }: HeightPickerProps) {
  const { t } = useTranslation();
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={100}
      max={250}
      step={1}
      unit=" cm"
      placeholder={t('auth.height')}
      label={t('auth.height')}
      allowDirectInput={true}
      keyboardType="numeric"
    />
  );
}
