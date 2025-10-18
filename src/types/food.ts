export interface FoodItem {
  id: string;
  name: string;
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
  tags?: string[]; // ej: ["sin gluten", "vegano", "orgánico"]
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
  | 'pollo'
  | 'res'
  | 'cerdo'
  | 'pavo'
  | 'cordero'
  | 'embutidos'
  // Lácteos
  | 'leche'
  | 'yogur'
  | 'queso'
  | 'mantequilla'
  | 'crema'
  // Frutos secos
  | 'almendras'
  | 'nueces'
  | 'anacardos'
  | 'pistachos'
  | 'avellanas'
  | 'pipas'
  // Frutas
  | 'citricos'
  | 'tropicales'
  | 'bayas'
  | 'manzanas'
  | 'peras'
  // Verduras
  | 'hojas-verdes'
  | 'raices'
  | 'cruciferas'
  | 'solanaceas'
  | 'legumbres-verdes'
  // Cereales
  | 'arroz'
  | 'pasta'
  | 'pan'
  | 'avena'
  | 'quinoa'
  | 'trigo'
  // Legumbres
  | 'lentejas'
  | 'garbanzos'
  | 'frijoles'
  | 'soja'
  // Bebidas
  | 'agua'
  | 'cafe'
  | 'te'
  | 'zumos'
  | 'leches-vegetales'
  | 'alcoholicas'
  // Snacks
  | 'dulces'
  | 'salados'
  | 'chips'
  | 'galletas'
  // Condimentos
  | 'especias'
  | 'hierbas'
  | 'salsas'
  | 'vinagres'
  // Aceites
  | 'aceite-oliva'
  | 'aceite-coco'
  | 'aceite-girasol'
  // Pescados
  | 'pescado-blanco'
  | 'pescado-azul'
  | 'salmón'
  // Mariscos
  | 'camarones'
  | 'langostinos'
  | 'mejillones'
  | 'ostras';

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
