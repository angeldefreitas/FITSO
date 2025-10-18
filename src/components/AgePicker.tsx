import React from 'react';
import NumberPicker from './NumberPicker';

interface AgePickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function AgePicker({ value, onValueChange }: AgePickerProps) {
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={13}
      max={99}
      step={1}
      unit=" años"
      placeholder="Seleccionar edad"
      label="Edad"
      allowDirectInput={true}
      keyboardType="numeric"
    />
  );
}
