import React from 'react';
import NumberPicker from './NumberPicker';

interface HeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function HeightPicker({ value, onValueChange }: HeightPickerProps) {
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={100}
      max={250}
      step={1}
      unit=" cm"
      placeholder="Seleccionar altura"
      label="Altura"
      allowDirectInput={true}
      keyboardType="numeric"
    />
  );
}
