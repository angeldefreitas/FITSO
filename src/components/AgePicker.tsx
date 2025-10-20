import React from 'react';
import NumberPicker from './NumberPicker';
import { useTranslation } from 'react-i18next';

interface AgePickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function AgePicker({ value, onValueChange }: AgePickerProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const unit = lang === 'pt' ? ' anos' : lang === 'en' ? ' yrs' : ' años';
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={13}
      max={99}
      step={1}
      unit={unit}
      placeholder={t('auth.age')}
      label={t('auth.age')}
      allowDirectInput={true}
      keyboardType="numeric"
    />
  );
}
