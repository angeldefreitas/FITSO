import apiService, { ApiResponse } from './apiService';
import { Food } from './foodService';

export interface Meal {
  id: string;
  user_id: string;
  food_id: string;
  quantity: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  entry_date: string;
  created_at: string;
  food?: Food;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export interface MealsByDateResponse {
  date: string;
  meals: Meal[];
  grouped_meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snack: Meal[];
  };
  nutrition_totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export interface MealsByDateRangeResponse {
  start_date: string;
  end_date: string;
  meals: Meal[];
}

export interface MealHistoryResponse {
  history: Array<{
    date: string;
    meal_count: number;
  }>;
  count: number;
}

export interface MealStatsResponse {
  start_date: string;
  end_date: string;
  stats: Array<{
    meal_type: string;
    count: number;
    total_quantity: number;
    avg_quantity: number;
  }>;
}

export interface CreateMealData {
  food_id: string;
  quantity: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  entry_date: string;
}

export interface UpdateMealData {
  food_id?: string;
  quantity?: number;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  entry_date?: string;
}

class MealService {
  // Obtener comidas de una fecha específica
  async getMealsByDate(date: string): Promise<MealsByDateResponse> {
    const response = await apiService.get<MealsByDateResponse>(`/meals/date/${date}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo comidas por fecha');
  }

  // Obtener comidas en un rango de fechas
  async getMealsByDateRange(startDate: string, endDate: string): Promise<MealsByDateRangeResponse> {
    const response = await apiService.get<MealsByDateRangeResponse>(`/meals/range?startDate=${startDate}&endDate=${endDate}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo comidas por rango de fechas');
  }

  // Obtener historial de fechas con comidas
  async getMealHistory(limit: number = 30): Promise<MealHistoryResponse> {
    const response = await apiService.get<MealHistoryResponse>(`/meals/history?limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo historial de comidas');
  }

  // Obtener estadísticas de comidas
  async getMealStats(startDate: string, endDate: string): Promise<MealStatsResponse> {
    const response = await apiService.get<MealStatsResponse>(`/meals/stats?startDate=${startDate}&endDate=${endDate}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo estadísticas de comidas');
  }

  // Obtener entrada de comida específica
  async getMealById(id: string): Promise<Meal> {
    const response = await apiService.get<Meal>(`/meals/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo entrada de comida');
  }

  // Agregar nueva entrada de comida
  async addMeal(mealData: CreateMealData): Promise<Meal> {
    const response = await apiService.post<Meal>('/meals', mealData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error agregando comida');
  }

  // Actualizar entrada de comida
  async updateMeal(id: string, updateData: UpdateMealData): Promise<Meal> {
    const response = await apiService.put<Meal>(`/meals/${id}`, updateData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error actualizando comida');
  }

  // Eliminar entrada de comida
  async deleteMeal(id: string): Promise<void> {
    const response = await apiService.delete(`/meals/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Error eliminando comida');
    }
  }

  // Obtener comidas del día actual
  async getTodayMeals(): Promise<MealsByDateResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMealsByDate(today);
  }

  // Obtener comidas de ayer
  async getYesterdayMeals(): Promise<MealsByDateResponse> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    return this.getMealsByDate(dateString);
  }

  // Obtener comidas de la semana actual
  async getThisWeekMeals(): Promise<Meal[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    const response = await this.getMealsByDateRange(startDate, endDate);
    return response.meals;
  }

  // Obtener comidas del mes actual
  async getThisMonthMeals(): Promise<Meal[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    const response = await this.getMealsByDateRange(startDate, endDate);
    return response.meals;
  }

  // Calcular totales nutricionales de un array de comidas
  calculateNutritionTotals(meals: Meal[]): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  } {
    return meals.reduce((totals, meal) => {
      if (meal.nutrition) {
        totals.calories += meal.nutrition.calories;
        totals.protein += meal.nutrition.protein;
        totals.carbs += meal.nutrition.carbs;
        totals.fat += meal.nutrition.fat;
        totals.fiber += meal.nutrition.fiber;
        totals.sugar += meal.nutrition.sugar;
        totals.sodium += meal.nutrition.sodium;
      }
      return totals;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });
  }

  // Agrupar comidas por tipo
  groupMealsByType(meals: Meal[]): {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snack: Meal[];
  } {
    return meals.reduce((grouped, meal) => {
      if (grouped[meal.meal_type]) {
        grouped[meal.meal_type].push(meal);
      }
      return grouped;
    }, {
      breakfast: [] as Meal[],
      lunch: [] as Meal[],
      dinner: [] as Meal[],
      snack: [] as Meal[]
    });
  }

  // Formatear fecha para la API (YYYY-MM-DD)
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Obtener fecha de hoy formateada
  getTodayFormatted(): string {
    return this.formatDateForAPI(new Date());
  }

  // Obtener fecha de ayer formateada
  getYesterdayFormatted(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDateForAPI(yesterday);
  }
}

const mealService = new MealService();
export default mealService;
