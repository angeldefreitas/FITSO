/**
 * Utilidades para cálculos nutricionales
 */

export const calculateMealGoals = (mealType: string, nutritionGoals: any) => {
  const calorieGoal = nutritionGoals?.calories || 2000;
  const proteinGoal = nutritionGoals?.protein || 150;
  const carbsGoal = nutritionGoals?.carbs || 250;
  const fatGoal = nutritionGoals?.fat || 67;

  switch (mealType) {
    case 'Desayuno':
      return { 
        calories: Math.round(calorieGoal * 0.25), 
        protein: Math.round(proteinGoal * 0.25), 
        carbs: Math.round(carbsGoal * 0.25), 
        fat: Math.round(fatGoal * 0.25) 
      };
    case 'Almuerzo':
      return { 
        calories: Math.round(calorieGoal * 0.35), 
        protein: Math.round(proteinGoal * 0.35), 
        carbs: Math.round(carbsGoal * 0.35), 
        fat: Math.round(fatGoal * 0.35) 
      };
    case 'Snacks':
      return { 
        calories: Math.round(calorieGoal * 0.15), 
        protein: Math.round(proteinGoal * 0.15), 
        carbs: Math.round(carbsGoal * 0.15), 
        fat: Math.round(fatGoal * 0.15) 
      };
    case 'Cena':
      return { 
        calories: Math.round(calorieGoal * 0.25), 
        protein: Math.round(proteinGoal * 0.25), 
        carbs: Math.round(carbsGoal * 0.25), 
        fat: Math.round(fatGoal * 0.25) 
      };
    default:
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
};

export const calculateTotalNutrients = (meals: any[]) => {
  return {
    calories: Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0)),
    protein: Math.round(meals.reduce((sum, meal) => sum + meal.protein, 0)),
    carbs: Math.round(meals.reduce((sum, meal) => sum + meal.carbs, 0)),
    fat: Math.round(meals.reduce((sum, meal) => sum + meal.fat, 0)),
  };
};

export const calculateProgressPercentage = (consumed: number, goal: number) => {
  return Math.min((consumed / goal) * 100, 100);
};

export const calculateRemainingCalories = (consumed: number, goal: number) => {
  return Math.round(goal - consumed);
};

export const getNutritionDefaults = () => {
  return {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
  };
};
