import React from 'react';
import NumberPicker from './NumberPicker';

interface LoseWeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function LoseWeightPicker({ value, onValueChange }: LoseWeightPickerProps) {
  // Opciones específicas para perder peso
  const loseWeightOptions = [1.0, 0.8, 0.5, 0.2];
  
  return (
    <NumberPicker
      value={value}
      onValueChange={onValueChange}
      min={0.2}
      max={1.0}
      step={0.1}
      unit=" kg/semana"
      placeholder="Seleccionar cantidad"
      label="¿Cuánto peso quieres perder por semana?"
      modalTitle="¿Cuánto peso deseas perder?"
      customOptions={loseWeightOptions}
    />
  );
}
