import { UserProfile } from './userProfile';

// Tipos para objetivos nutricionales
export interface NutritionGoals {
  calories: number;
  protein: number; // en gramos
  carbs: number;   // en gramos
  fat: number;     // en gramos
  isCustom: boolean; // si el usuario configuró objetivos manuales
}

// Factores de actividad física (Multiplicador de TMB)
const ACTIVITY_FACTORS = {
  sedentario: 1.2,   // Poco o ningún ejercicio
  ligero: 1.375,     // Ejercicio ligero 1-3 días/semana
  moderado: 1.55,    // Ejercicio moderado 3-5 días/semana
  intenso: 1.725,    // Ejercicio intenso 6-7 días/semana
};

// Distribución de macronutrientes por objetivo
const MACRO_DISTRIBUTIONS = {
  lose_weight: {
    protein: 0.30,  // 30% proteína
    carbs: 0.40,    // 40% carbohidratos
    fat: 0.30,      // 30% grasas
  },
  gain_weight: {
    protein: 0.25,  // 25% proteína
    carbs: 0.50,    // 50% carbohidratos
    fat: 0.25,      // 25% grasas
  },
  maintain_weight: {
    protein: 0.25,  // 25% proteína
    carbs: 0.45,    // 45% carbohidratos
    fat: 0.30,      // 30% grasas
  },
};

// Calorías por gramo de macronutriente
const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

/**
 * Calcula la Tasa Metabólica Basal (TMB) usando la fórmula de Mifflin-St Jeor
 * Esta es la fórmula más precisa para calcular calorías de mantenimiento
 */
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  
  // Fórmula de Mifflin-St Jeor
  if (gender === 'masculino') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calcula el Total de Energía Diaria (TED) basado en la actividad física
 */
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const activityFactor = ACTIVITY_FACTORS[profile.activityLevel];
  return Math.round(bmr * activityFactor);
}

/**
 * Calcula las calorías objetivo basadas en el objetivo del usuario
 */
export function calculateCalorieGoal(profile: UserProfile): number {
  const tdee = calculateTDEE(profile);
  const { goal, weightGoalAmount = 0.5 } = profile;
  
  // Calorías por kg de peso a ganar/perder por semana
  const caloriesPerKgPerWeek = 7700; // 1 kg = 7700 calorías
  const weeklyCalorieDeficit = weightGoalAmount * caloriesPerKgPerWeek;
  const dailyCalorieAdjustment = weeklyCalorieDeficit / 7;
  
  switch (goal) {
    case 'lose_weight':
      return Math.round(tdee - dailyCalorieAdjustment);
    case 'gain_weight':
      return Math.round(tdee + dailyCalorieAdjustment);
    case 'maintain_weight':
    default:
      return Math.round(tdee);
  }
}

/**
 * Calcula la distribución de macronutrientes basada en el objetivo
 */
export function calculateMacroDistribution(profile: UserProfile, calorieGoal: number): { protein: number; carbs: number; fat: number } {
  const distribution = MACRO_DISTRIBUTIONS[profile.goal];
  
  const proteinCalories = calorieGoal * distribution.protein;
  const carbsCalories = calorieGoal * distribution.carbs;
  const fatCalories = calorieGoal * distribution.fat;
  
  return {
    protein: Math.round(proteinCalories / CALORIES_PER_GRAM.protein),
    carbs: Math.round(carbsCalories / CALORIES_PER_GRAM.carbs),
    fat: Math.round(fatCalories / CALORIES_PER_GRAM.fat),
  };
}

/**
 * Calcula los objetivos nutricionales completos basados en el perfil del usuario
 */
export function calculateNutritionGoals(profile: UserProfile): NutritionGoals {
  const calories = calculateCalorieGoal(profile);
  const macros = calculateMacroDistribution(profile, calories);
  
  return {
    calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    isCustom: false,
  };
}

/**
 * Valida objetivos nutricionales personalizados
 */
export function validateCustomGoals(goals: Partial<NutritionGoals>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (goals.calories !== undefined) {
    if (goals.calories < 800) {
      errors.push('Las calorías no pueden ser menores a 800 por día');
    }
    if (goals.calories > 5000) {
      errors.push('Las calorías no pueden ser mayores a 5000 por día');
    }
  }
  
  if (goals.protein !== undefined) {
    if (goals.protein < 20) {
      errors.push('La proteína no puede ser menor a 20g por día');
    }
    if (goals.protein > 500) {
      errors.push('La proteína no puede ser mayor a 500g por día');
    }
  }
  
  if (goals.carbs !== undefined) {
    if (goals.carbs < 20) {
      errors.push('Los carbohidratos no pueden ser menores a 20g por día');
    }
    if (goals.carbs > 800) {
      errors.push('Los carbohidratos no pueden ser mayores a 800g por día');
    }
  }
  
  if (goals.fat !== undefined) {
    if (goals.fat < 15) {
      errors.push('Las grasas no pueden ser menores a 15g por día');
    }
    if (goals.fat > 300) {
      errors.push('Las grasas no pueden ser mayores a 300g por día');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Obtiene recomendaciones de calorías basadas en el perfil
 */
export function getCalorieRecommendations(profile: UserProfile): {
  maintenance: number;
  current: number;
  weeklyChange: number;
  recommendation: string;
} {
  const tdee = calculateTDEE(profile);
  const currentGoal = calculateCalorieGoal(profile);
  const weeklyChange = profile.weightGoalAmount || 0;
  
  let recommendation = '';
  if (profile.goal === 'lose_weight') {
    recommendation = `Para perder ${weeklyChange}kg por semana, necesitas un déficit de ${Math.round(weeklyChange * 7700 / 7)} calorías diarias.`;
  } else if (profile.goal === 'gain_weight') {
    recommendation = `Para ganar ${weeklyChange}kg por semana, necesitas un superávit de ${Math.round(weeklyChange * 7700 / 7)} calorías diarias.`;
  } else {
    recommendation = 'Para mantener tu peso actual, consume las calorías de mantenimiento.';
  }
  
  return {
    maintenance: tdee,
    current: currentGoal,
    weeklyChange,
    recommendation,
  };
}

/**
 * Función auxiliar para redondear números a un decimal
 */
function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Calcula el progreso hacia los objetivos nutricionales
 */
export function calculateNutritionProgress(
  goals: NutritionGoals,
  consumed: { calories: number; protein: number; carbs: number; fat: number }
): {
  calories: { consumed: number; goal: number; percentage: number; remaining: number };
  protein: { consumed: number; goal: number; percentage: number; remaining: number };
  carbs: { consumed: number; goal: number; percentage: number; remaining: number };
  fat: { consumed: number; goal: number; percentage: number; remaining: number };
} {
  return {
    calories: {
      consumed: consumed.calories,
      goal: goals.calories,
      percentage: roundToOneDecimal(Math.min((consumed.calories / goals.calories) * 100, 100)),
      remaining: Math.round(Math.max(goals.calories - consumed.calories, 0)),
    },
    protein: {
      consumed: consumed.protein,
      goal: goals.protein,
      percentage: roundToOneDecimal(Math.min((consumed.protein / goals.protein) * 100, 100)),
      remaining: roundToOneDecimal(Math.max(goals.protein - consumed.protein, 0)),
    },
    carbs: {
      consumed: consumed.carbs,
      goal: goals.carbs,
      percentage: roundToOneDecimal(Math.min((consumed.carbs / goals.carbs) * 100, 100)),
      remaining: roundToOneDecimal(Math.max(goals.carbs - consumed.carbs, 0)),
    },
    fat: {
      consumed: consumed.fat,
      goal: goals.fat,
      percentage: roundToOneDecimal(Math.min((consumed.fat / goals.fat) * 100, 100)),
      remaining: roundToOneDecimal(Math.max(goals.fat - consumed.fat, 0)),
    },
  };
}
