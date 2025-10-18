import apiService, { ApiResponse } from './apiService';

export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  sugar_per_100g: number;
  sodium_per_100g: number;
  created_at: string;
  updated_at: string;
}

export interface FoodSearchResponse {
  foods: Food[];
  query: string;
  count: number;
}

export interface FoodPaginationResponse {
  foods: Food[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface NutritionCalculation {
  food: Food;
  quantity: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

class FoodService {
  // Obtener todos los alimentos con paginación
  async getAllFoods(page: number = 1, limit: number = 20): Promise<FoodPaginationResponse> {
    const response = await apiService.get<FoodPaginationResponse>(`/foods?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo alimentos');
  }

  // Obtener alimento por ID
  async getFoodById(id: string): Promise<Food> {
    const response = await apiService.get<Food>(`/foods/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo alimento');
  }

  // Buscar alimentos por nombre
  async searchFoods(query: string, limit: number = 20): Promise<FoodSearchResponse> {
    const response = await apiService.get<FoodSearchResponse>(`/foods/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error buscando alimentos');
  }

  // Buscar alimento por código de barras
  async getFoodByBarcode(barcode: string): Promise<Food | null> {
    try {
      const response = await apiService.get<{barcode: string; found: boolean; food: Food}>(`/barcode/search/${barcode}`);
      
      if (response.success && response.data) {
        return response.data.found ? response.data.food : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error buscando por código de barras:', error);
      return null;
    }
  }

  // Crear nuevo alimento
  async createFood(foodData: Omit<Food, 'id' | 'created_at' | 'updated_at'>): Promise<Food> {
    const response = await apiService.post<Food>('/foods', foodData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error creando alimento');
  }

  // Actualizar alimento
  async updateFood(id: string, updateData: Partial<Omit<Food, 'id' | 'created_at' | 'updated_at'>>): Promise<Food> {
    const response = await apiService.put<Food>(`/foods/${id}`, updateData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error actualizando alimento');
  }

  // Eliminar alimento
  async deleteFood(id: string): Promise<void> {
    const response = await apiService.delete(`/foods/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Error eliminando alimento');
    }
  }

  // Calcular valores nutricionales para una cantidad específica
  async calculateNutrition(id: string, quantity: number): Promise<NutritionCalculation> {
    const response = await apiService.post<NutritionCalculation>(`/foods/${id}/calculate-nutrition`, { quantity });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error calculando nutrición');
  }

  // Calcular nutrición localmente (sin llamada al servidor)
  calculateNutritionLocal(food: Food, quantity: number): NutritionCalculation['nutrition'] {
    const factor = quantity / 100;
    return {
      calories: Math.round(food.calories_per_100g * factor),
      protein: Math.round(food.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(food.fat_per_100g * factor * 10) / 10,
      fiber: Math.round(food.fiber_per_100g * factor * 10) / 10,
      sugar: Math.round(food.sugar_per_100g * factor * 10) / 10,
      sodium: Math.round(food.sodium_per_100g * factor * 10) / 10
    };
  }
}

const foodService = new FoodService();
export default foodService;