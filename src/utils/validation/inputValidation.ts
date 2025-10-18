/**
 * Utilidades para validación de inputs
 */

export const handleNumericInput = (text: string, setter: (value: string) => void) => {
  // Solo permitir números, un punto decimal y máximo 2 decimales
  const numericRegex = /^\d*\.?\d{0,2}$/;
  if (numericRegex.test(text) || text === '') {
    setter(text);
  }
};

export const validateMealForm = (name: string, calories: string, selectedMealType: string) => {
  if (!name.trim() || !calories.trim()) {
    return {
      isValid: false,
      message: 'Ingresa al menos el nombre y las calorías'
    };
  }

  if (!selectedMealType) {
    return {
      isValid: false,
      message: 'Por favor selecciona el tipo de comida primero'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

export const validateProfileForm = (
  name: string,
  age: number,
  weight: number,
  height: number,
  gender: string,
  activityLevel: string,
  goal: string,
  weightGoalAmount: number
) => {
  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: 'El nombre debe tener al menos 2 caracteres'
    };
  }

  if (age < 10 || age > 90) {
    return {
      isValid: false,
      message: 'La edad debe estar entre 10 y 90 años'
    };
  }

  if (weight < 30 || weight > 200) {
    return {
      isValid: false,
      message: 'El peso debe estar entre 30 y 200 kg'
    };
  }

  if (height < 100 || height > 250) {
    return {
      isValid: false,
      message: 'La altura debe estar entre 100 y 250 cm'
    };
  }

  if (!gender) {
    return {
      isValid: false,
      message: 'Por favor selecciona tu sexo biológico'
    };
  }

  if (!activityLevel) {
    return {
      isValid: false,
      message: 'Por favor selecciona tu nivel de actividad física'
    };
  }

  if (goal !== 'maintain_weight' && (weightGoalAmount < 0.1 || weightGoalAmount > 2.0)) {
    return {
      isValid: false,
      message: 'La cantidad de peso objetivo debe estar entre 0.1 y 2.0 kg/semana'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

export const validateWaterGoal = (goal: number) => {
  if (goal <= 0 || goal > 20) {
    return {
      isValid: false,
      message: 'El objetivo de agua debe estar entre 1 y 20 vasos'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};
