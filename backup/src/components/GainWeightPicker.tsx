import React from 'react';
import NumberPicker from './NumberPicker';

interface GainWeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function GainWeightPicker({ value, onValueChange }: GainWeightPickerProps) {
  // Opciones específicas para ganar peso
  const gainWeightOptions = [0.2, 0.5];
  
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={0.2}
      max={0.5}
      step={0.1}
      unit=" kg/semana"
      placeholder="Seleccionar cantidad"
      label="¿Cuánto peso quieres ganar por semana?"
      modalTitle="¿Cuánto peso deseas ganar?"
      customOptions={gainWeightOptions}
    />
  );
}
