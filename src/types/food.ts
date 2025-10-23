export interface FoodItem {
  id: string;
  name: string;
  nameTranslations?: {
    es: string;
    en: string;
    pt: string;
  };
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category: FoodCategory;
  subcategory: FoodSubcategory;
  brand?: string;
  servingSize: string; // ej: "100g", "1 taza", "1 unidad"
  description?: string;
  descriptionTranslations?: {
    es: string;
    en: string;
    pt: string;
  };
  tags?: string[]; // ej: ["sin gluten", "vegano", "orgánico"]
  tagsTranslations?: {
    es: string[];
    en: string[];
    pt: string[];
  };
  image?: ImageType;
  barcode?: boolean;
  dataSource?: 'local' | 'usda' | 'openFoodFacts' | 'claude';
  isCustom?: boolean;
  isIngredientBased?: boolean;
  ingredients?: Ingredient[];
  totalNutrients?: IngredientNutrients;
}

export interface ImageType {
  uri: string;
  thumbnail: string;
}

export interface IngredientNutrients {
  carbs: number;
  proteins: number;
  fats: number;
  calories: number;
  energy?: number;
}

export interface Ingredient {
  id?: string;
  name: string;
  per100g: IngredientNutrients;
  estimatedWeight: number;
  totalValues: IngredientNutrients;
  editable?: boolean;
}

export interface FoodAnalysis {
  id?: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  totalNutrients: IngredientNutrients;
  image?: ImageType;
  createdAt?: any;
  message?: string;
  isIngredientBased?: boolean;
}

export interface MediaData {
  data?: any;
  height?: number;
  width?: number;
  filename?: string;
  mime: string;
  path: string;
  image: string;
  uri?: string;
  duration?: number;
  success: boolean;
  error: boolean;
  message?: string;
}

export type FoodCategory = 
  | 'carnes'
  | 'lacteos'
  | 'frutos-secos'
  | 'frutas'
  | 'verduras'
  | 'cereales'
  | 'legumbres'
  | 'bebidas'
  | 'snacks'
  | 'condimentos'
  | 'aceites'
  | 'pescados'
  | 'mariscos';

export type FoodSubcategory = 
  // Carnes
  | 'aves'
  | 'carnes-rojas'
  | 'carnes-blancas'
  | 'embutidos'
  // Lácteos
  | 'leche'
  | 'yogur'
  | 'quesos'
  | 'huevos'
  | 'grasas-lacteas'
  // Frutos secos
  | 'nueces'
  | 'legumbres'
  | 'semillas'
  // Frutas
  | 'frutas-frescas'
  | 'frutas-tropicales'
  | 'citricos'
  | 'frutos-rojos'
  | 'frutas-temporada'
  | 'frutas-exoticas'
  | 'frutas-hueso'
  | 'frutas-secas'
  | 'cucurbitaceas'
  // Verduras
  | 'hojas-verdes'
  | 'raices'
  | 'cruciferas'
  | 'solanaceas'
  | 'bulbos'
  | 'tallos'
  | 'hierbas'
  | 'tuberculos'
  // Cereales
  | 'granos-enteros'
  | 'pseudocereales'
  | 'arroz'
  | 'pasta'
  | 'pan'
  | 'trigo'
  // Legumbres
  | 'lentejas'
  | 'garbanzos'
  | 'frijoles'
  | 'soja'
  | 'guisantes'
  // Bebidas
  | 'agua'
  | 'cafe'
  | 'tes'
  | 'zumos'
  | 'alcoholicas'
  // Snacks
  | 'snacks-salados'
  | 'dulces'
  | 'frutos-secos'
  | 'helados'
  // Condimentos
  | 'sales'
  | 'endulzantes'
  | 'especias'
  | 'hierbas'
  | 'salsas'
  | 'vinagres'
  // Aceites
  | 'aceites-vegetales'
  | 'grasas-animales'
  // Pescados
  | 'pescados-grasos'
  | 'pescados-magros'
  | 'pescados-planos'
  // Mariscos
  | 'crustaceos'
  | 'moluscos';

export interface FoodSearchFilters {
  category?: FoodCategory;
  subcategory?: FoodSubcategory;
  searchQuery?: string;
  tags?: string[];
  maxCalories?: number;
  minProtein?: number;
}

export interface FoodDatabaseStats {
  totalFoods: number;
  categories: Record<FoodCategory, number>;
  subcategories: Record<FoodSubcategory, number>;
}
