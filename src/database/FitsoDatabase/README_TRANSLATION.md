# Sistema de Traducción de Alimentos - Fitso Database

## Descripción

Este sistema permite mostrar los alimentos de la base de datos Fitso en múltiples idiomas (Español, Inglés y Portugués) y realizar búsquedas en el idioma actual del usuario.

## Características

- ✅ **Traducción automática**: Los alimentos se muestran en el idioma configurado por el usuario
- ✅ **Búsqueda inteligente**: La búsqueda funciona en el idioma actual, no busca en otros idiomas
- ✅ **Integración directa**: Las traducciones están integradas en los archivos TypeScript existentes
- ✅ **Fácil mantenimiento**: Agregar nuevas traducciones es simple y directo

## Estructura

### Archivos Modificados

1. **`src/types/food.ts`**: Interfaz `FoodItem` actualizada con campos de traducción
2. **`src/services/foodTranslationService.ts`**: Servicio principal de traducción
3. **`src/hooks/useFoodTranslation.ts`**: Hook personalizado para usar las traducciones
4. **`src/database/FitsoDatabase/index.ts`**: Funciones de búsqueda actualizadas

### Archivos de Alimentos con Traducciones

- `src/database/FitsoDatabase/frutas/frutasFrescas.ts` (ejemplo completo)
- `src/database/FitsoDatabase/carnes/aves.ts` (ejemplo parcial)

## Cómo Agregar Traducciones

### 1. Estructura de un Alimento con Traducciones

```typescript
{
  id: 'fruta_fresca_001',
  name: 'Manzana', // Nombre por defecto (español)
  nameTranslations: {
    es: 'Manzana',
    en: 'Apple',
    pt: 'Maçã'
  },
  description: 'Fruta fresca rica en fibra y antioxidantes',
  descriptionTranslations: {
    es: 'Fruta fresca rica en fibra y antioxidantes',
    en: 'Fresh fruit rich in fiber and antioxidants',
    pt: 'Fruta fresca rica em fibras e antioxidantes'
  },
  tags: ['fruta', 'saludable', 'snack', 'fibra'],
  tagsTranslations: {
    es: ['fruta', 'saludable', 'snack', 'fibra'],
    en: ['fruit', 'healthy', 'snack', 'fiber'],
    pt: ['fruta', 'saudável', 'lanche', 'fibra']
  },
  // ... resto de propiedades nutricionales
}
```

### 2. Campos de Traducción

- **`nameTranslations`**: Traducciones del nombre del alimento
- **`descriptionTranslations`**: Traducciones de la descripción
- **`tagsTranslations`**: Traducciones de las etiquetas/tags

### 3. Idiomas Soportados

- `es`: Español (idioma por defecto)
- `en`: Inglés
- `pt`: Portugués

## Uso del Sistema

### 1. Hook Personalizado

```typescript
import { useFoodTranslation } from '../hooks/useFoodTranslation';

const MyComponent = () => {
  const {
    searchFoods,
    getFoodsByCategory,
    translateFood,
    currentLanguage
  } = useFoodTranslation();

  // Buscar alimentos
  const results = searchFoods(fitsoFoodDatabase, 'manzana');
  
  // Obtener por categoría
  const frutas = getFoodsByCategory(fitsoFoodDatabase, 'frutas');
  
  // Traducir un alimento individual
  const translatedFood = translateFood(someFood);
};
```

### 2. Servicio Directo

```typescript
import { foodTranslationService } from '../services/foodTranslationService';

// Establecer idioma
foodTranslationService.setLanguage('en');

// Buscar alimentos
const results = foodTranslationService.searchFoods(
  fitsoFoodDatabase, 
  'apple', 
  'frutas'
);
```

### 3. Funciones de la Base de Datos

```typescript
import { searchFoods, getFoodsByCategory } from '../database/FitsoDatabase';

// Estas funciones ahora devuelven alimentos traducidos automáticamente
const results = searchFoods('manzana', 'frutas');
const frutas = getFoodsByCategory('frutas');
```

## Búsqueda Inteligente

El sistema de búsqueda es inteligente y solo busca en el idioma actual:

- **Español**: Busca en nombres, descripciones y tags en español
- **Inglés**: Busca en nombres, descripciones y tags en inglés  
- **Portugués**: Busca en nombres, descripciones y tags en portugués

### Ejemplo de Búsqueda

```typescript
// Si el idioma es inglés y buscas "apple"
const results = searchFoods(fitsoFoodDatabase, 'apple');
// Encuentra: "Apple", "Green Apple", "Red Apple"

// Si el idioma es español y buscas "manzana"  
const results = searchFoods(fitsoFoodDatabase, 'manzana');
// Encuentra: "Manzana", "Manzana Verde", "Manzana Roja"
```

## Migración de Alimentos Existentes

Para migrar alimentos existentes a este sistema:

1. **Agregar campos de traducción** a cada alimento
2. **Mantener el campo original** como fallback
3. **Probar la búsqueda** en diferentes idiomas

### Script de Migración (Ejemplo)

```typescript
// Función helper para agregar traducciones a alimentos existentes
const addTranslationsToFood = (food: FoodItem, translations: {
  nameTranslations: { es: string; en: string; pt: string };
  descriptionTranslations?: { es: string; en: string; pt: string };
  tagsTranslations?: { es: string[]; en: string[]; pt: string[] };
}) => {
  return {
    ...food,
    ...translations
  };
};
```

## Ventajas del Sistema

1. **Rendimiento**: No hay archivos JSON separados, todo está en TypeScript
2. **Type Safety**: TypeScript valida las traducciones en tiempo de compilación
3. **Mantenibilidad**: Fácil de mantener y actualizar
4. **Flexibilidad**: Fácil agregar nuevos idiomas
5. **Integración**: Se integra perfectamente con el sistema de idiomas existente

## Próximos Pasos

1. **Migrar todos los alimentos** a este sistema de traducción
2. **Agregar más idiomas** si es necesario
3. **Optimizar la búsqueda** para mejor rendimiento
4. **Agregar traducciones de categorías** y subcategorías

## Ejemplo Completo

Ver `src/examples/FoodTranslationExample.tsx` para un ejemplo completo de implementación.
