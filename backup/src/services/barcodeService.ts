import { FoodItem, FoodCategory, FoodSubcategory } from '../types/food';

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  image?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  servingSize: string;
  ingredients?: string[];
  allergens?: string[];
}

class BarcodeService {
  private readonly OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2/product';

  async getProductByBarcode(barcode: string): Promise<BarcodeProduct | null> {
    try {
      console.log('🔍 Buscando producto con código:', barcode);
      
      const response = await fetch(`${this.OPEN_FOOD_FACTS_API}/${barcode}.json`);
      
      if (!response.ok) {
        console.log('❌ Producto no encontrado en Open Food Facts');
        return null;
      }
      
      const data = await response.json();
      
      if (data.status === 0 || !data.product) {
        console.log('❌ Producto no encontrado');
        return null;
      }
      
      const product = data.product;
      
      // Extraer información nutricional
      const nutrition = this.extractNutritionInfo(product);
      
      const barcodeProduct: BarcodeProduct = {
        barcode: barcode,
        name: product.product_name || product.product_name_en || 'Producto desconocido',
        brand: product.brands || product.brand,
        category: product.categories || product.categories_en,
        image: product.image_url || product.image_front_url,
        nutrition: nutrition,
        servingSize: product.serving_size || '100g',
        ingredients: product.ingredients_text ? 
          product.ingredients_text.split(',').map((ing: string) => ing.trim()) : 
          undefined,
        allergens: product.allergens_tags ? 
          product.allergens_tags.map((tag: string) => tag.replace('en:', '')) : 
          undefined,
      };
      
      console.log('✅ Producto encontrado:', barcodeProduct.name);
      return barcodeProduct;
      
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      return null;
    }
  }

  private extractNutritionInfo(product: any) {
    // Valores por defecto
    let nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    try {
      // Extraer valores nutricionales por 100g
      const nutriments = product.nutriments || {};
      
      // Calorías (pueden estar en diferentes unidades)
      nutrition.calories = this.parseNutritionValue(
        nutriments['energy-kcal_100g'] || 
        nutriments['energy-kcal'] || 
        nutriments['energy_100g'] || 
        nutriments['energy'] ||
        0
      );
      
      // Proteína
      nutrition.protein = this.parseNutritionValue(
        nutriments['proteins_100g'] || 
        nutriments['proteins'] ||
        0
      );
      
      // Carbohidratos
      nutrition.carbs = this.parseNutritionValue(
        nutriments['carbohydrates_100g'] || 
        nutriments['carbohydrates'] ||
        0
      );
      
      // Grasas
      nutrition.fat = this.parseNutritionValue(
        nutriments['fat_100g'] || 
        nutriments['fat'] ||
        0
      );
      
      // Fibra
      nutrition.fiber = this.parseNutritionValue(
        nutriments['fiber_100g'] || 
        nutriments['fiber'] ||
        0
      );
      
      // Azúcar
      nutrition.sugar = this.parseNutritionValue(
        nutriments['sugars_100g'] || 
        nutriments['sugars'] ||
        0
      );
      
      // Sodio
      nutrition.sodium = this.parseNutritionValue(
        nutriments['sodium_100g'] || 
        nutriments['sodium'] ||
        0
      );
      
    } catch (error) {
      console.error('Error extracting nutrition info:', error);
    }
    
    return nutrition;
  }

  private parseNutritionValue(value: any): number {
    if (typeof value === 'number') {
      return Math.round(value); // Redondear a números enteros
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : Math.round(parsed);
    }
    
    return 0;
  }

  // Método para crear un FoodItem compatible con el sistema existente
  createFoodItemFromBarcode(product: BarcodeProduct, quantity: number): FoodItem {
    const multiplier = quantity / 100; // Los valores están por 100g
    
    return {
      id: `barcode_${product.barcode}_${Date.now()}`,
      name: product.name,
      category: this.mapToValidCategory(product.category),
      subcategory: this.mapToValidSubcategory(product.category),
      description: product.brand ? `Marca: ${product.brand}` : undefined,
      calories: Math.round(product.nutrition.calories * multiplier),
      protein: Math.round(product.nutrition.protein * multiplier),
      carbs: Math.round(product.nutrition.carbs * multiplier),
      fat: Math.round(product.nutrition.fat * multiplier),
      servingSize: `${quantity}g`,
      tags: ['escaneado', 'código-barras'],
    };
  }

  // Mapear categorías de Open Food Facts a categorías válidas
  private mapToValidCategory(category?: string): FoodCategory {
    if (!category) return 'snacks';
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('meat') || categoryLower.includes('carne')) return 'carnes';
    if (categoryLower.includes('dairy') || categoryLower.includes('lácteo')) return 'lacteos';
    if (categoryLower.includes('fruit') || categoryLower.includes('fruta')) return 'frutas';
    if (categoryLower.includes('vegetable') || categoryLower.includes('verdura')) return 'verduras';
    if (categoryLower.includes('cereal') || categoryLower.includes('grain')) return 'cereales';
    if (categoryLower.includes('beverage') || categoryLower.includes('bebida')) return 'bebidas';
    if (categoryLower.includes('snack') || categoryLower.includes('aperitivo')) return 'snacks';
    if (categoryLower.includes('fish') || categoryLower.includes('pescado')) return 'pescados';
    if (categoryLower.includes('seafood') || categoryLower.includes('marisco')) return 'mariscos';
    
    return 'snacks'; // Default fallback
  }

  // Mapear a subcategorías válidas
  private mapToValidSubcategory(category?: string): FoodSubcategory {
    if (!category) return 'salados';
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('meat') || categoryLower.includes('carne')) return 'res';
    if (categoryLower.includes('dairy') || categoryLower.includes('lácteo')) return 'leche';
    if (categoryLower.includes('fruit') || categoryLower.includes('fruta')) return 'citricos';
    if (categoryLower.includes('vegetable') || categoryLower.includes('verdura')) return 'hojas-verdes';
    if (categoryLower.includes('cereal') || categoryLower.includes('grain')) return 'arroz';
    if (categoryLower.includes('beverage') || categoryLower.includes('bebida')) return 'agua';
    if (categoryLower.includes('snack') || categoryLower.includes('aperitivo')) return 'salados';
    if (categoryLower.includes('fish') || categoryLower.includes('pescado')) return 'pescado-blanco';
    if (categoryLower.includes('seafood') || categoryLower.includes('marisco')) return 'camarones';
    
    return 'salados'; // Default fallback
  }

  // Método para validar si un código de barras es válido
  isValidBarcode(barcode: string): boolean {
    // Validar que sea numérico y tenga longitud apropiada
    const numericBarcode = barcode.replace(/\D/g, '');
    return numericBarcode.length >= 8 && numericBarcode.length <= 14;
  }
}

export const barcodeService = new BarcodeService();
