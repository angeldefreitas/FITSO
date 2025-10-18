import React from 'react';
import NumberPicker from './NumberPicker';

interface WeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function WeightPicker({ value, onValueChange }: WeightPickerProps) {
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={30}
      max={300}
      step={0.1}
      unit=" kg"
      placeholder="Seleccionar peso"
      label="Peso"
      allowDirectInput={true}
      keyboardType="decimal-pad"
    />
  );
}
