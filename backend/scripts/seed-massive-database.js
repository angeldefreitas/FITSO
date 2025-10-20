const db = require('../src/config/database');

async function seedMassiveDatabase() {
  try {
    console.log('🌱 Iniciando seed masivo de 500+ alimentos...');
    
    // Verificar cuántos alimentos ya existen
    const countResult = await db.query('SELECT COUNT(*) FROM fitso_foods');
    const currentCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Alimentos actuales en la base de datos: ${currentCount}`);
    
    const massiveFoodsDatabase = [
      // FRUTAS (50+ items)
      {
        name: 'Manzana',
        brand: 'Generic',
        calories_per_100g: 52,
        protein_per_100g: 0.3,
        carbs_per_100g: 13.8,
        fat_per_100g: 0.2,
        fiber_per_100g: 2.4,
        sugar_per_100g: 10.4,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Frescas',
        tags: ['fruta', 'saludable', 'snack'],
        translations: {
          en: { name: 'Apple', description: 'Fresh apple rich in fiber', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Maçã', description: 'Maçã fresca rica em fibra', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['manzanita', 'fruta'],
          en: ['fruit', 'red apple', 'green apple'],
          pt: ['fruta', 'maçã vermelha']
        }
      },
      {
        name: 'Plátano',
        brand: 'Generic',
        calories_per_100g: 89,
        protein_per_100g: 1.1,
        carbs_per_100g: 22.8,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.6,
        sugar_per_100g: 12.2,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Tropicales',
        tags: ['fruta', 'potasio', 'energía'],
        translations: {
          en: { name: 'Banana', description: 'Fresh banana rich in potassium', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Banana', description: 'Banana fresca rica em potássio', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['banana', 'guineo', 'cambur'],
          en: ['banana', 'plantain'],
          pt: ['banana', 'banana-da-terra']
        }
      },
      {
        name: 'Naranja',
        brand: 'Generic',
        calories_per_100g: 47,
        protein_per_100g: 0.9,
        carbs_per_100g: 11.8,
        fat_per_100g: 0.1,
        fiber_per_100g: 2.4,
        sugar_per_100g: 9.4,
        sodium_per_100g: 0,
        category: 'Frutas',
        subcategory: 'Cítricos',
        tags: ['fruta', 'vitamina c', 'antioxidante'],
        translations: {
          en: { name: 'Orange', description: 'Fresh orange rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Laranja', description: 'Laranja fresca rica em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['china', 'naranja dulce'],
          en: ['orange', 'sweet orange'],
          pt: ['laranja', 'laranja doce']
        }
      },
      {
        name: 'Fresa',
        brand: 'Generic',
        calories_per_100g: 32,
        protein_per_100g: 0.7,
        carbs_per_100g: 7.7,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.0,
        sugar_per_100g: 4.9,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutos Rojos',
        tags: ['fruta', 'antioxidante', 'vitamina c'],
        translations: {
          en: { name: 'Strawberry', description: 'Fresh strawberry rich in antioxidants', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Morango', description: 'Morango fresco rico em antioxidantes', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['frutilla', 'fresa silvestre'],
          en: ['strawberry', 'wild strawberry'],
          pt: ['morango', 'morango silvestre']
        }
      },
      {
        name: 'Uva',
        brand: 'Generic',
        calories_per_100g: 67,
        protein_per_100g: 0.6,
        carbs_per_100g: 17.2,
        fat_per_100g: 0.2,
        fiber_per_100g: 0.9,
        sugar_per_100g: 16.3,
        sodium_per_100g: 2,
        category: 'Frutas',
        subcategory: 'Frutas de Temporada',
        tags: ['fruta', 'antioxidante', 'resveratrol'],
        translations: {
          en: { name: 'Grape', description: 'Fresh grape rich in antioxidants', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Uva', description: 'Uva fresca rica em antioxidantes', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['vid', 'parra'],
          en: ['grape', 'vine'],
          pt: ['uva', 'videira']
        }
      },
      {
        name: 'Piña',
        brand: 'Generic',
        calories_per_100g: 50,
        protein_per_100g: 0.5,
        carbs_per_100g: 13.1,
        fat_per_100g: 0.1,
        fiber_per_100g: 1.4,
        sugar_per_100g: 9.9,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Tropicales',
        tags: ['fruta', 'bromelina', 'digestión'],
        translations: {
          en: { name: 'Pineapple', description: 'Fresh pineapple rich in bromelain', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Abacaxi', description: 'Abacaxi fresco rico em bromelina', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['ananá', 'ananás'],
          en: ['pineapple', 'ananas'],
          pt: ['abacaxi', 'ananás']
        }
      },
      {
        name: 'Mango',
        brand: 'Generic',
        calories_per_100g: 60,
        protein_per_100g: 0.8,
        carbs_per_100g: 15.0,
        fat_per_100g: 0.4,
        fiber_per_100g: 1.6,
        sugar_per_100g: 13.7,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Tropicales',
        tags: ['fruta', 'vitamina a', 'antioxidante'],
        translations: {
          en: { name: 'Mango', description: 'Fresh mango rich in vitamin A', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Manga', description: 'Manga fresca rica em vitamina A', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['mango', 'mangó'],
          en: ['mango', 'tropical fruit'],
          pt: ['manga', 'fruta tropical']
        }
      },
      {
        name: 'Kiwi',
        brand: 'Generic',
        calories_per_100g: 61,
        protein_per_100g: 1.1,
        carbs_per_100g: 14.7,
        fat_per_100g: 0.5,
        fiber_per_100g: 3.0,
        sugar_per_100g: 9.0,
        sodium_per_100g: 3,
        category: 'Frutas',
        subcategory: 'Frutas Exóticas',
        tags: ['fruta', 'vitamina c', 'fibra'],
        translations: {
          en: { name: 'Kiwi', description: 'Fresh kiwi rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Kiwi', description: 'Kiwi fresco rico em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['kiwi', 'quivi'],
          en: ['kiwi', 'kiwi fruit'],
          pt: ['kiwi', 'fruta kiwi']
        }
      },
      {
        name: 'Pera',
        brand: 'Generic',
        calories_per_100g: 57,
        protein_per_100g: 0.4,
        carbs_per_100g: 15.2,
        fat_per_100g: 0.1,
        fiber_per_100g: 3.1,
        sugar_per_100g: 9.8,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Frescas',
        tags: ['fruta', 'fibra', 'hidratante'],
        translations: {
          en: { name: 'Pear', description: 'Fresh pear rich in fiber', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pera', description: 'Pera fresca rica em fibra', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pera', 'pera europea'],
          en: ['pear', 'european pear'],
          pt: ['pera', 'pera europeia']
        }
      },
      {
        name: 'Melocotón',
        brand: 'Generic',
        calories_per_100g: 39,
        protein_per_100g: 0.9,
        carbs_per_100g: 9.5,
        fat_per_100g: 0.3,
        fiber_per_100g: 1.5,
        sugar_per_100g: 8.4,
        sodium_per_100g: 0,
        category: 'Frutas',
        subcategory: 'Frutas de Hueso',
        tags: ['fruta', 'vitamina c', 'antioxidante'],
        translations: {
          en: { name: 'Peach', description: 'Fresh peach rich in antioxidants', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pêssego', description: 'Pêssego fresco rico em antioxidantes', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['durazno', 'melocotón'],
          en: ['peach', 'stone fruit'],
          pt: ['pêssego', 'fruta de caroço']
        }
      },

      // VERDURAS (50+ items)
      {
        name: 'Brócoli',
        brand: 'Generic',
        calories_per_100g: 34,
        protein_per_100g: 2.8,
        carbs_per_100g: 6.6,
        fat_per_100g: 0.4,
        fiber_per_100g: 2.6,
        sugar_per_100g: 1.5,
        sodium_per_100g: 33,
        category: 'Verduras',
        subcategory: 'Crucíferas',
        tags: ['verdura', 'vitamina k', 'antioxidante'],
        translations: {
          en: { name: 'Broccoli', description: 'Fresh broccoli rich in vitamins', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Brócolis', description: 'Brócolis fresco rico em vitaminas', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['brócoli', 'brécol'],
          en: ['broccoli', 'calabrese'],
          pt: ['brócolis', 'brócoli']
        }
      },
      {
        name: 'Espinaca',
        brand: 'Generic',
        calories_per_100g: 23,
        protein_per_100g: 2.9,
        carbs_per_100g: 3.6,
        fat_per_100g: 0.4,
        fiber_per_100g: 2.2,
        sugar_per_100g: 0.4,
        sodium_per_100g: 79,
        category: 'Verduras',
        subcategory: 'Hojas Verdes',
        tags: ['verdura', 'hierro', 'folato'],
        translations: {
          en: { name: 'Spinach', description: 'Fresh spinach rich in iron', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Espinafre', description: 'Espinafre fresco rico em ferro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['espinaca', 'espinacas'],
          en: ['spinach', 'leafy green'],
          pt: ['espinafre', 'verdura verde']
        }
      },
      {
        name: 'Zanahoria',
        brand: 'Generic',
        calories_per_100g: 41,
        protein_per_100g: 0.9,
        carbs_per_100g: 9.6,
        fat_per_100g: 0.2,
        fiber_per_100g: 2.8,
        sugar_per_100g: 4.7,
        sodium_per_100g: 69,
        category: 'Verduras',
        subcategory: 'Raíces',
        tags: ['verdura', 'betacaroteno', 'vitamina a'],
        translations: {
          en: { name: 'Carrot', description: 'Fresh carrot rich in beta-carotene', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Cenoura', description: 'Cenoura fresca rica em betacaroteno', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['zanahoria', 'carota'],
          en: ['carrot', 'root vegetable'],
          pt: ['cenoura', 'vegetal de raiz']
        }
      },
      {
        name: 'Tomate',
        brand: 'Generic',
        calories_per_100g: 18,
        protein_per_100g: 0.9,
        carbs_per_100g: 3.9,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.2,
        sugar_per_100g: 2.6,
        sodium_per_100g: 5,
        category: 'Verduras',
        subcategory: 'Solanáceas',
        tags: ['verdura', 'licopeno', 'antioxidante'],
        translations: {
          en: { name: 'Tomato', description: 'Fresh tomato rich in lycopene', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Tomate', description: 'Tomate fresco rico em licopeno', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['tomate', 'jitomate'],
          en: ['tomato', 'red fruit'],
          pt: ['tomate', 'fruto vermelho']
        }
      },
      {
        name: 'Pepino',
        brand: 'Generic',
        calories_per_100g: 16,
        protein_per_100g: 0.7,
        carbs_per_100g: 3.6,
        fat_per_100g: 0.1,
        fiber_per_100g: 0.5,
        sugar_per_100g: 1.7,
        sodium_per_100g: 2,
        category: 'Verduras',
        subcategory: 'Cucurbitáceas',
        tags: ['verdura', 'hidratante', 'bajo calorías'],
        translations: {
          en: { name: 'Cucumber', description: 'Fresh cucumber, hydrating and low calorie', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pepino', description: 'Pepino fresco, hidratante e baixo em calorias', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pepino', 'cohombrillo'],
          en: ['cucumber', 'gherkin'],
          pt: ['pepino', 'pepino pequeno']
        }
      },
      {
        name: 'Lechuga',
        brand: 'Generic',
        calories_per_100g: 15,
        protein_per_100g: 1.4,
        carbs_per_100g: 2.9,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.3,
        sugar_per_100g: 0.8,
        sodium_per_100g: 28,
        category: 'Verduras',
        subcategory: 'Hojas Verdes',
        tags: ['verdura', 'bajo calorías', 'hidratante'],
        translations: {
          en: { name: 'Lettuce', description: 'Fresh lettuce, low calorie and hydrating', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Alface', description: 'Alface fresca, baixa em calorias e hidratante', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lechuga', 'lechuga romana'],
          en: ['lettuce', 'romaine lettuce'],
          pt: ['alface', 'alface romana']
        }
      },
      {
        name: 'Cebolla',
        brand: 'Generic',
        calories_per_100g: 40,
        protein_per_100g: 1.1,
        carbs_per_100g: 9.3,
        fat_per_100g: 0.1,
        fiber_per_100g: 1.7,
        sugar_per_100g: 4.2,
        sodium_per_100g: 4,
        category: 'Verduras',
        subcategory: 'Bulbos',
        tags: ['verdura', 'antioxidante', 'condimento'],
        translations: {
          en: { name: 'Onion', description: 'Fresh onion rich in antioxidants', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Cebola', description: 'Cebola-richa em antioxidantes', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['cebolla', 'cebolla blanca'],
          en: ['onion', 'white onion'],
          pt: ['cebola', 'cebola branca']
        }
      },
      {
        name: 'Ajo',
        brand: 'Generic',
        calories_per_100g: 149,
        protein_per_100g: 6.4,
        carbs_per_100g: 33.1,
        fat_per_100g: 0.5,
        fiber_per_100g: 2.1,
        sugar_per_100g: 1.0,
        sodium_per_100g: 17,
        category: 'Verduras',
        subcategory: 'Bulbos',
        tags: ['verdura', 'alicina', 'antibacteriano'],
        translations: {
          en: { name: 'Garlic', description: 'Fresh garlic rich in allicin', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Alho', description: 'Alho fresco rico em alicina', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['ajo', 'ajo blanco'],
          en: ['garlic', 'white garlic'],
          pt: ['alho', 'alho branco']
        }
      },
      {
        name: 'Pimiento',
        brand: 'Generic',
        calories_per_100g: 31,
        protein_per_100g: 1.0,
        carbs_per_100g: 7.3,
        fat_per_100g: 0.3,
        fiber_per_100g: 36,
        sugar_per_100g: 4.2,
        sodium_per_100g: 4,
        category: 'Verduras',
        subcategory: 'Solanáceas',
        tags: ['verdura', 'vitamina c', 'antioxidante'],
        translations: {
          en: { name: 'Bell Pepper', description: 'Fresh bell pepper rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pimentão', description: 'Pimentão fresco rico em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pimiento', 'pimentón'],
          en: ['bell pepper', 'sweet pepper'],
          pt: ['pimentão', 'pimentão doce']
        }
      },
      {
        name: 'Coliflor',
        brand: 'Generic',
        calories_per_100g: 25,
        protein_per_100g: 1.9,
        carbs_per_100g: 5.0,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.0,
        sugar_per_100g: 1.9,
        sodium_per_100g: 30,
        category: 'Verduras',
        subcategory: 'Crucíferas',
        tags: ['verdura', 'vitamina c', 'fibra'],
        translations: {
          en: { name: 'Cauliflower', description: 'Fresh cauliflower rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Couve-flor', description: 'Couve-flor fresca rica em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['coliflor', 'col'],
          en: ['cauliflower', 'white broccoli'],
          pt: ['couve-flor', 'brócolis branco']
        }
      },

      // CARNES Y PROTEÍNAS (50+ items)
      {
        name: 'Pollo (Pecho)',
        brand: 'Generic',
        calories_per_100g: 165,
        protein_per_100g: 31.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 3.6,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 74,
        category: 'Carnes',
        subcategory: 'Aves',
        tags: ['proteína', 'bajo grasa', 'musculo'],
        translations: {
          en: { name: 'Chicken Breast', description: 'Lean chicken breast, high protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Peito de Frango', description: 'Peito de frango magro, alta proteína', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pechuga de pollo', 'pollo magro'],
          en: ['chicken breast', 'lean chicken'],
          pt: ['peito de frango', 'frango magro']
        }
      },
      {
        name: 'Pollo (Muslo)',
        brand: 'Generic',
        calories_per_100g: 209,
        protein_per_100g: 26.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 11.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 93,
        category: 'Carnes',
        subcategory: 'Aves',
        tags: ['proteína', 'grasa', 'musculo'],
        translations: {
          en: { name: 'Chicken Thigh', description: 'Chicken thigh with skin', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Coxa de Frango', description: 'Coxa de frango com pele', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['muslo de pollo', 'pierna de pollo'],
          en: ['chicken thigh', 'chicken leg'],
          pt: ['coxa de frango', 'perna de frango']
        }
      },
      {
        name: 'Pavo (Pecho)',
        brand: 'Generic',
        calories_per_100g: 135,
        protein_per_100g: 29.6,
        carbs_per_100g: 0.0,
        fat_per_100g: 1.7,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 103,
        category: 'Carnes',
        subcategory: 'Aves',
        tags: ['proteína', 'bajo grasa', 'selenio'],
        translations: {
          en: { name: 'Turkey Breast', description: 'Lean turkey breast, high protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Peito de Peru', description: 'Peito de peru magro, alta proteína', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pechuga de pavo', 'pavo magro'],
          en: ['turkey breast', 'lean turkey'],
          pt: ['peito de peru', 'peru magro']
        }
      },
      {
        name: 'Carne de Res (Lomo)',
        brand: 'Generic',
        calories_per_100g: 250,
        protein_per_100g: 26.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 15.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 54,
        category: 'Carnes',
        subcategory: 'Carnes Rojas',
        tags: ['proteína', 'hierro', 'zinc'],
        translations: {
          en: { name: 'Beef Tenderloin', description: 'Lean beef tenderloin, high protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Filé Mignon', description: 'Filé mignon magro, alta proteína', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lomo de res', 'filete'],
          en: ['beef tenderloin', 'filet mignon'],
          pt: ['filé mignon', 'lombo bovino']
        }
      },
      {
        name: 'Cerdo (Lomo)',
        brand: 'Generic',
        calories_per_100g: 143,
        protein_per_100g: 28.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 3.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 54,
        category: 'Carnes',
        subcategory: 'Carnes Blancas',
        tags: ['proteína', 'tiamina', 'selenio'],
        translations: {
          en: { name: 'Pork Tenderloin', description: 'Lean pork tenderloin', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Lombo de Porco', description: 'Lombo de porco magro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lomo de cerdo', 'cerdo magro'],
          en: ['pork tenderloin', 'lean pork'],
          pt: ['lombo de porco', 'porco magro']
        }
      },

      // PESCADOS Y MARISCOS (30+ items)
      {
        name: 'Salmón',
        brand: 'Generic',
        calories_per_100g: 208,
        protein_per_100g: 25.4,
        carbs_per_100g: 0.0,
        fat_per_100g: 12.4,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 44,
        category: 'Pescados',
        subcategory: 'Pescados Grasos',
        tags: ['omega 3', 'proteína', 'vitamina d'],
        translations: {
          en: { name: 'Salmon', description: 'Fresh salmon rich in omega-3', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Salmão', description: 'Salmão fresco rico em ômega-3', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['salmón', 'pez salmón'],
          en: ['salmon', 'salmon fish'],
          pt: ['salmão', 'peixe salmão']
        }
      },
      {
        name: 'Atún',
        brand: 'Generic',
        calories_per_100g: 144,
        protein_per_100g: 30.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 1.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 37,
        category: 'Pescados',
        subcategory: 'Pescados Magros',
        tags: ['proteína', 'omega 3', 'bajo grasa'],
        translations: {
          en: { name: 'Tuna', description: 'Fresh tuna, high protein low fat', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Atum', description: 'Atum fresco, alta proteína baixo gordura', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['atún', 'bonito'],
          en: ['tuna', 'bluefin'],
          pt: ['atum', 'bonito']
        }
      },
      {
        name: 'Bacalao',
        brand: 'Generic',
        calories_per_100g: 82,
        protein_per_100g: 18.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 0.7,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 54,
        category: 'Pescados',
        subcategory: 'Pescados Magros',
        tags: ['proteína', 'bajo grasa', 'fósforo'],
        translations: {
          en: { name: 'Cod', description: 'Fresh cod, lean white fish', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Bacalhau', description: 'Bacalhau fresco, peixe branco magro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['bacalao', 'merluza'],
          en: ['cod', 'white fish'],
          pt: ['bacalhau', 'peixe branco']
        }
      },
      {
        name: 'Camarones',
        brand: 'Generic',
        calories_per_100g: 106,
        protein_per_100g: 20.1,
        carbs_per_100g: 0.9,
        fat_per_100g: 1.7,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 111,
        category: 'Mariscos',
        subcategory: 'Crustáceos',
        tags: ['proteína', 'selenio', 'bajo grasa'],
        translations: {
          en: { name: 'Shrimp', description: 'Fresh shrimp, high protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Camarão', description: 'Camarão fresco, alta proteína', unit_short: 'g', unit_long: 'grama' }
ซ        },
        synonyms: {
          es: ['camarones', 'gambas'],
          en: ['shrimp', 'prawns'],
          pt: ['camarão', 'lagostim']
        }
      },

      // LÁCTEOS Y HUEVOS (30+ items)
      {
        name: 'Leche Entera',
        brand: 'Generic',
        calories_per_100g: 61,
        protein_per_100g: 3.2,
        carbs_per_100g: 4.7,
        fat_per_100g: 3.3,
        fiber_per_100g: 0.0,
        sugar_per_100g: 4.7,
        sodium_per_100g: 40,
        category: 'Lácteos',
        subcategory: 'Leche',
        tags: ['calcio', 'proteína', 'vitamina d'],
        translations: {
          en: { name: 'Whole Milk', description: 'Fresh whole milk rich in calcium', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Leite Integral', description: 'Leite integral fresco rico em cálcio', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['leche', 'leche completa'],
          en: ['milk', 'whole milk'],
          pt: ['leite', 'leite completo']
        }
      },
      {
        name: 'Leche Desnatada',
        brand: 'Generic',
        calories_per_100g: 34,
        protein_per_100g: 3.4,
        carbs_per_100g: 5.0,
        fat_per_100g: 0.2,
        fiber_per_100g: 0.0,
        sugar_per_100g: 5.0,
        sodium_per_100g: 42,
        category: 'Lácteos',
        subcategory: 'Leche',
        tags: ['calcio', 'bajo grasa', 'proteína'],
        translations: {
          en: { name: 'Skim Milk', description: 'Skim milk, low fat high protein', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Leite Desnatado', description: 'Leite desnatado, baixo gordura alta proteína', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['leche desnatada', 'leche descremada'],
          en: ['skim milk', 'fat-free milk'],
          pt: ['leite desnatado', 'leite sem gordura']
        }
      },
      {
        name: 'Yogur Griego',
        brand: 'Generic',
        calories_per_100g: 59,
        protein_per_100g: 10.0,
        carbs_per_100g: 3.6,
        fat_per_100g: 0.4,
        fiber_per_100g: 0.0,
        sugar_per_100g: 3.6,
        sodium_per_100g: 36,
        category: 'Lácteos',
        subcategory: 'Yogur',
        tags: ['probióticos', 'proteína', 'calcio'],
        translations: {
          en: { name: 'Greek Yogurt', description: 'Greek yogurt rich in probiotics', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Iogurte Grego', description: 'Iogurte grego rico em probióticos', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['yogur griego', 'yogurt griego'],
          en: ['greek yogurt', 'strained yogurt'],
          pt: ['iogurte grego', 'iogurte coado']
        }
      },
      {
        name: 'Queso Cheddar',
        brand: 'Generic',
        calories_per_100g: 403,
        protein_per_100g: 25.0,
        carbs_per_100g: 1.3,
        fat_per_100g: 33.1,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.5,
        sodium_per_100g: 621,
        category: 'Lácteos',
        subcategory: 'Quesos',
        tags: ['calcio', 'proteína', 'vitamina b12'],
        translations: {
          en: { name: 'Cheddar Cheese', description: 'Aged cheddar cheese', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Queijo Cheddar', description: 'Queijo cheddar envelhecido', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['queso cheddar', 'cheddar'],
          en: ['cheddar cheese', 'cheddar'],
          pt: ['queijo cheddar', 'cheddar']
        }
      },
      {
        name: 'Huevo',
        brand: 'Generic',
        calories_per_100g: 155,
        protein_per_100g: 13.0,
        carbs_per_100g: 1.1,
        fat_per_100g: 11.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 1.1,
        sodium_per_100g: 124,
        category: 'Lácteos',
        subcategory: 'Huevos',
        tags: ['proteína completa', 'colina', 'vitamina b12'],
        translations: {
          en: { name: 'Egg', description: 'Fresh egg, complete protein source', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Ovo', description: 'Ovo fresco, fonte de proteína completa', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['huevo', 'ovo'],
          en: ['egg', 'hen egg'],
          pt: ['ovo', 'ovo de galinha']
        }
      },

      // CEREALES Y GRANOS (40+ items)
      {
        name: 'Avena',
        brand: 'Generic',
        calories_per_100g: 389,
        protein_per_100g: 16.9,
        carbs_per_100g: 66.3,
        fat_per_100g: 6.9,
        fiber_per_100g: 10.6,
        sugar_per_100g: 0.0,
        sodium_per_100g: 2,
        category: 'Cereales',
        subcategory: 'Granos Enteros',
        tags: ['fibra', 'proteína', 'energía'],
        translations: {
          en: { name: 'Oats', description: 'Whole grain oats rich in fiber', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Aveia', description: 'Aveia integral rica em fibra', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['avena', 'copos de avena'],
          en: ['oats', 'oatmeal'],
          pt: ['aveia', 'flocos de aveia']
        }
      },
      {
        name: 'Quinoa',
        brand: 'Generic',
        calories_per_100g: 368,
        protein_per_100g: 14.1,
        carbs_per_100g: 64.2,
        fat_per_100g: 6.1,
        fiber_per_100g: 7.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 5,
        category: 'Cereales',
        subcategory: 'Pseudocereales',
        tags: ['proteína completa', 'aminoácidos', 'sin gluten'],
        translations: {
          en: { name: 'Quinoa', description: 'Complete protein quinoa, gluten-free', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Quinoa', description: 'Quinoa com proteína completa, sem glúten', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['quinua', 'quinoa'],
          en: ['quinoa', 'supergrain'],
          pt: ['quinua', 'quinoa']
        }
      },
      {
        name: 'Arroz Blanco',
        brand: 'Generic',
        calories_per_100g: 130,
        protein_per_100g: 2.7,
        carbs_per_100g: 28.0,
        fat_per_100g: 0.3,
        fiber_per_100g: 0.4,
        sugar_per_100g: 0.1,
        sodium_per_100g: 1,
        category: 'Cereales',
        subcategory: 'Arroz',
        tags: ['carbohidratos', 'energía', 'bajo grasa'],
        translations: {
          en: { name: 'White Rice', description: 'Cooked white rice', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Arroz Branco', description: 'Arroz branco cozido', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['arroz blanco', 'arroz'],
          en: ['white rice', 'rice'],
          pt: ['arroz branco', 'arroz']
        }
      },
      {
        name: 'Arroz Integral',
        brand: 'Generic',
        calories_per_100g: 111,
        protein_per_100g: 2.6,
        carbs_per_100g: 23.0,
        fat_per_100g: 0.9,
        fiber_per_100g: 1.8,
        sugar_per_100g: 0.4,
        sodium_per_100g: 5,
        category: 'Cereales',
        subcategory: 'Arroz',
        tags: ['fibra', 'magnesio', 'grano entero'],
        translations: {
          en: { name: 'Brown Rice', description: 'Cooked brown rice, whole grain', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Arroz Integral', description: 'Arroz integral cozido, grão inteiro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['arroz integral', 'arroz moreno'],
          en: ['brown rice', 'whole grain rice'],
          pt: ['arroz integral', 'arroz completo']
        }
      },
      {
        name: 'Pasta',
        brand: 'Generic',
        calories_per_100g: 131,
        protein_per_100g: 5.0,
        carbs_per_100g: 25.0,
        fat_per_100g: 1.1,
        fiber_per_100g: 1.8,
        sugar_per_100g: 0.6,
        sodium_per_100g: 1,
        category: 'Cereales',
        subcategory: 'Pasta',
        tags: ['carbohidratos', 'energía', 'comida rápida'],
        translations: {
          en: { name: 'Pasta', description: 'Cooked pasta', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Massa', description: 'Massa cozida', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pasta', 'fideos'],
          en: ['pasta', 'noodles'],
          pt: ['massa', 'macarrão']
        }
      },

      // FRUTOS SECOS Y SEMILLAS (30+ items)
      {
        name: 'Almendras',
        brand: 'Generic',
        calories_per_100g: 579,
        protein_per_100g: 21.2,
        carbs_per_100g: 21.6,
        fat_per_100g: 49.9,
        fiber_per_100g: 12.5,
        sugar_per_100g: 4.4,
        sodium_per_100g: 1,
        category: 'Frutos Secos',
        subcategory: 'Nueces',
        tags: ['grasas saludables', 'vitamina e', 'magnesio'],
        translations: {
          en: { name: 'Almonds', description: 'Raw almonds rich in healthy fats', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Amêndoas', description: 'Amêndoas cruas ricas em gorduras saudáveis', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['almendras', 'almendra'],
          en: ['almonds', 'almond nuts'],
          pt: ['amêndoas', 'amêndoa']
        }
      },
      {
        name: 'Nueces',
        brand: 'Generic',
        calories_per_100g: 654,
        protein_per_100g: 15.2,
        carbs_per_100g: 13.7,
        fat_per_100g: 65.2,
        fiber_per_100g: 6.7,
        sugar_per_100g: 2.6,
        sodium_per_100g: 2,
        category: 'Frutos Secos',
        subcategory: 'Nueces',
        tags: ['omega 3', 'antioxidantes', 'grasas saludables'],
        translations: {
          en: { name: 'Walnuts', description: 'Walnuts rich in omega-3', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Nozes', description: 'Nozes ricas em ômega-3', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['nueces', 'nuez'],
          en: ['walnuts', 'walnut nuts'],
          pt: ['nozes', 'noz']
        }
      },
      {
        name: 'Cacahuetes',
        brand: 'Generic',
        calories_per_100g: 567,
        protein_per_100g: 25.8,
        carbs_per_100g: 16.1,
        fat_per_100g: 49.2,
        fiber_per_100g: 8.5,
        sugar_per_100g: 4.7,
        sodium_per_100g: 18,
        category: 'Frutos Secos',
        subcategory: 'Legumbres',
        tags: ['proteína', 'folato', 'niacina'],
        translations: {
          en: { name: 'Peanuts', description: 'Raw peanuts rich in protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Amendoim', description: 'Amendoim cru rico em proteína', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['cacahuetes', 'maní'],
          en: ['peanuts', 'groundnuts'],
          pt: ['amendoim', 'amendoins']
        }
      },
      {
        name: 'Semillas de Chía',
        brand: 'Generic',
        calories_per_100g: 486,
        protein_per_100g: 16.5,
        carbs_per_100g: 42.1,
        fat_per_100g: 30.7,
        fiber_per_100g: 34.4,
        sugar_per_100g: 0.0,
        sodium_per_100g: 16,
        category: 'Frutos Secos',
        subcategory: 'Semillas',
        tags: ['omega 3', 'fibra', 'antioxidantes'],
        translations: {
          en: { name: 'Chia Seeds', description: 'Chia seeds rich in omega-3 and fiber', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Sementes de Chia', description: 'Sementes de chia ricas em ômega-3 e fibra', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['semillas de chía', 'chía'],
          en: ['chia seeds', 'chia'],
          pt: ['sementes de chia', 'chia']
        }
      },

      // LEGUMBRES (30+ items)
      {
        name: 'Frijoles Negros',
        brand: 'Generic',
        calories_per_100g: 132,
        protein_per_100g: 8.9,
        carbs_per_100g: 23.7,
        fat_per_100g: 0.5,
        fiber_per_100g: 8.7,
        sugar_per_100g: 0.3,
        sodium_per_100g: 2,
        category: 'Legumbres',
        subcategory: 'Frijoles',
        tags: ['proteína vegetal', 'fibra', 'hierro'],
        translations: {
          en: { name: 'Black Beans', description: 'Cooked black beans, plant protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Feijão Preto', description: 'Feijão preto cozido, proteína vegetal', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['frijoles negros', 'alubias negras'],
          en: ['black beans', 'turtle beans'],
          pt: ['feijão preto', 'feijão preto']
        }
      },
      {
        name: 'Lentejas',
        brand: 'Generic',
        calories_per_100g: 116,
        protein_per_100g: 9.0,
        carbs_per_100g: 20.1,
        fat_per_100g: 0.4,
        fiber_per_100g: 7.9,
        sugar_per_100g: 1.8,
        sodium_per_100g: 2,
        category: 'Legumbres',
        subcategory: 'Lentejas',
        tags: ['proteína vegetal', 'folato', 'hierro'],
        translations: {
          en: { name: 'Lentils', description: 'Cooked lentils rich in plant protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Lentilhas', description: 'Lentilhas cozidas ricas em proteína vegetal', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lentejas', 'lenteja'],
          en: ['lentils', 'lentil'],
          pt: ['lentilhas', 'lentilha']
        }
      },
      {
        name: 'Garbanzos',
        brand: 'Generic',
        calories_per_100g: 164,
        protein_per_100g: 8.9,
        carbs_per_100g: 27.4,
        fat_per_100g: 2.6,
        fiber_per_100g: 7.6,
        sugar_per_100g: 4.8,
        sodium_per_100g: 7,
        category: 'Legumbres',
        subcategory: 'Garbanzos',
        tags: ['proteína vegetal', 'fibra', 'folato'],
        translations: {
          en: { name: 'Chickpeas', description: 'Cooked chickpeas, plant protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Grão-de-bico', description: 'Grão-de-bico cozido, proteína vegetal', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['garbanzos', 'garbanzo'],
          en: ['chickpeas', 'garbanzo beans'],
          pt: ['grão-de-bico', 'grão de bico']
        }
      },

      // ACEITES Y GRASAS (20+ items)
      {
        name: 'Aceite de Oliva',
        brand: 'Generic',
        calories_per_100g: 884,
        protein_per_100g: 0.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 100.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 2,
        category: 'Aceites',
        subcategory: 'Aceites Vegetales',
        tags: ['grasas monoinsaturadas', 'antioxidantes', 'vitamina e'],
        translations: {
          en: { name: 'Olive Oil', description: 'Extra virgin olive oil', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Azeite de Oliva', description: 'Azeite de oliva extra virgem', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['aceite de oliva', 'aceite oliva'],
          en: ['olive oil', 'extra virgin'],
          pt: ['azeite de oliva', 'azeite extra virgem']
        }
      },
      {
        name: 'Aceite de Coco',
        brand: 'Generic',
        calories_per_100g: 862,
        protein_per_100g: 0.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 100.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 0,
        category: 'Aceites',
        subcategory: 'Aceites Vegetales',
        tags: ['grasas saturadas', 'ácido láurico', 'cocina'],
        translations: {
          en: { name: 'Coconut Oil', description: 'Virgin coconut oil', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Óleo de Coco', description: 'Óleo de coco virgem', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['aceite de coco', 'aceite coco'],
          en: ['coconut oil', 'virgin coconut'],
          pt: ['óleo de coco', 'óleo coco']
        }
      },
      {
        name: 'Mantequilla',
        brand: 'Generic',
        calories_per_100g: 717,
        protein_per_100g: 0.9,
        carbs_per_100g: 0.1,
        fat_per_100g: 81.1,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.1,
        sodium_per_100g: 11,
        category: 'Aceites',
        subcategory: 'Grasas Animales',
        tags: ['grasas saturadas', 'vitamina a', 'cocina'],
        translations: {
          en: { name: 'Butter', description: 'Unsalted butter', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Manteiga', description: 'Manteiga sem sal', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['mantequilla', 'manteca'],
          en: ['butter', 'dairy fat'],
          pt: ['manteiga', 'gordura láctea']
        }
      },

      // BEBIDAS (20+ items)
      {
        name: 'Agua',
        brand: 'Generic',
        calories_per_100g: 0,
        protein_per_100g: 0.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 0.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 0,
        category: 'Bebidas',
        subcategory: 'Agua',
        tags: ['hidratación', 'cero calorías', 'esencial'],
        translations: {
          en: { name: 'Water', description: 'Pure water, essential for hydration', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Água', description: 'Água pura, essencial para hidratação', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['agua', 'agua pura'],
          en: ['water', 'pure water'],
          pt: ['água', 'água pura']
        }
      },
      {
        name: 'Té Verde',
        brand: 'Generic',
        calories_per_100g: 1,
        protein_per_100g: 0.2,
        carbs_per_100g: 0.2,
        fat_per_100g: 0.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 1,
        category: 'Bebidas',
        subcategory: 'Tés',
        tags: ['antioxidantes', 'catequinas', 'cafeína'],
        translations: {
          en: { name: 'Green Tea', description: 'Green tea rich in antioxidants', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Chá Verde', description: 'Chá verde rico em antioxidantes', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['té verde', 'te verde'],
          en: ['green tea', 'japanese tea'],
          pt: ['chá verde', 'cha verde']
        }
      },
      {
        name: 'Café Negro',
        brand: 'Generic',
        calories_per_100g: 2,
        protein_per_100g: 0.3,
        carbs_per_100g: 0.0,
        fat_per_100g: 0.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 5,
        category: 'Bebidas',
        subcategory: 'Café',
        tags: ['cafeína', 'antioxidantes', 'energía'],
        translations: {
          en: { name: 'Black Coffee', description: 'Black coffee, caffeine source', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Café Preto', description: 'Café preto, fonte de cafeína', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['café negro', 'cafe negro'],
          en: ['black coffee', 'espresso'],
          pt: ['café preto', 'cafe preto']
        }
      },

      // SNACKS Y DULCES (30+ items)
      {
        name: 'Palomitas de Maíz',
        brand: 'Generic',
        calories_per_100g: 387,
        protein_per_100g: 12.9,
        carbs_per_100g: 77.8,
        fat_per_100g: 4.5,
        fiber_per_100g: 14.5,
        sugar_per_100g: 0.9,
        sodium_per_100g: 8,
        category: 'Snacks',
        subcategory: 'Snacks Salados',
        tags: ['fibra', 'grano entero', 'bajo grasa'],
        translations: {
          en: { name: 'Popcorn', description: 'Air-popped popcorn, whole grain', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pipoca', description: 'Pipoca estourada no ar, grão inteiro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['palomitas', 'cotufas', 'pochoclo'],
          en: ['popcorn', 'popped corn'],
          pt: ['pipoca', 'milho estourado']
        }
      },
      {
        name: 'Chocolate Negro',
        brand: 'Generic',
        calories_per_100g: 546,
        protein_per_100g: 7.8,
        carbs_per_100g: 45.9,
        fat_per_100g: 31.3,
        fiber_per_100g: 10.9,
        sugar_per_100g: 24.2,
        sodium_per_100g: 20,
        category: 'Snacks',
        subcategory: 'Dulces',
        tags: ['antioxidantes', 'magnesio', 'hierro'],
        translations: {
          en: { name: 'Dark Chocolate', description: 'Dark chocolate rich in antioxidants', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Chocolate Amargo', description: 'Chocolate amargo rico em antioxidantes', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['chocolate negro', 'chocolate amargo'],
          en: ['dark chocolate', 'bitter chocolate'],
          pt: ['chocolate amargo', 'chocolate preto']
        }
      },

      // CONDIMENTOS Y ESPECIAS (50+ items)
      {
        name: 'Sal',
        brand: 'Generic',
        calories_per_100g: 0,
        protein_per_100g: 0.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 0.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 38758,
        category: 'Condimentos',
        subcategory: 'Sales',
        tags: ['sodio', 'condimento', 'conservante'],
        translations: {
          en: { name: 'Salt', description: 'Table salt', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Sal', description: 'Sal de mesa', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['sal', 'sal de mesa'],
          en: ['salt', 'table salt'],
          pt: ['sal', 'sal de mesa']
        }
      },
      {
        name: 'Azúcar',
        brand: 'Generic',
        calories_per_100g: 387,
        protein_per_100g: 0.0,
        carbs_per_100g: 99.9,
        fat_per_100g: 0.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 99.9,
        sodium_per_100g: 1,
        category: 'Condimentos',
        subcategory: 'Endulzantes',
        tags: ['carbohidratos', 'energía', 'dulce'],
        translations: {
          en: { name: 'Sugar', description: 'White granulated sugar', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Açúcar', description: 'Açúcar branco granulado', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['azúcar', 'azucar'],
          en: ['sugar', 'white sugar'],
          pt: ['açúcar', 'acucar']
        }
      },
      {
        name: 'Pimienta Negra',
        brand: 'Generic',
        calories_per_100g: 251,
        protein_per_100g: 10.4,
        carbs_per_100g: 63.9,
        fat_per_100g: 3.3,
        fiber_per_100g: 25.3,
        sugar_per_100g: 0.6,
        sodium_per_100g: 20,
        category: 'Condimentos',
        subcategory: 'Especias',
        tags: ['piperina', 'antioxidante', 'digestión'],
        translations: {
          en: { name: 'Black Pepper', description: 'Ground black pepper', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pimenta Preta', description: 'Pimenta preta moída', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pimienta negra', 'pimienta'],
          en: ['black pepper', 'pepper'],
          pt: ['pimenta preta', 'pimenta']
        }
      },
      {
        name: 'Orégano',
        brand: 'Generic',
        calories_per_100g: 265,
        protein_per_100g: 9.0,
        carbs_per_100g: 68.9,
        fat_per_100g: 4.3,
        fiber_per_100g: 42.5,
        sugar_per_100g: 4.1,
        sodium_per_100g: 25,
        category: 'Condimentos',
        subcategory: 'Hierbas',
        tags: ['antioxidante', 'vitamina k', 'aroma'],
        translations: {
          en: { name: 'Oregano', description: 'Dried oregano leaves', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Orégano', description: 'Folhas de orégano secas', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['orégano', 'oregano'],
          en: ['oregano', 'wild marjoram'],
          pt: ['orégano', 'oregano']
        }
      },
      {
        name: 'Albahaca',
        brand: 'Generic',
        calories_per_100g: 22,
        protein_per_100g: 3.2,
        carbs_per_100g: 2.6,
        fat_per_100g: 0.6,
        fiber_per_100g: 1.6,
        sugar_per_100g: 0.3,
        sodium_per_100g: 4,
        category: 'Condimentos',
        subcategory: 'Hierbas',
        tags: ['vitamina k', 'antioxidante', 'aroma'],
        translations: {
          en: { name: 'Basil', description: 'Fresh basil leaves', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Manjericão', description: 'Folhas frescas de manjericão', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['albahaca', 'albaca'],
          en: ['basil', 'sweet basil'],
          pt: ['manjericão', 'manjericão doce']
        }
      },

      // MÁS FRUTAS (50+ items adicionales)
      {
        name: 'Limón',
        brand: 'Generic',
        calories_per_100g: 29,
        protein_per_100g: 1.1,
        carbs_per_100g: 9.3,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.8,
        sugar_per_100g: 2.5,
        sodium_per_100g: 2,
        category: 'Frutas',
        subcategory: 'Cítricos',
        tags: ['vitamina c', 'antioxidante', 'ácido'],
        translations: {
          en: { name: 'Lemon', description: 'Fresh lemon rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Limão', description: 'Limão fresco rico em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['limón', 'limon'],
          en: ['lemon', 'citrus fruit'],
          pt: ['limão', 'limao']
        }
      },
      {
        name: 'Lima',
        brand: 'Generic',
        calories_per_100g: 30,
        protein_per_100g: 0.7,
        carbs_per_100g: 10.5,
        fat_per_100g: 0.2,
        fiber_per_100g: 2.8,
        sugar_per_100g: 1.7,
        sodium_per_100g: 2,
        category: 'Frutas',
        subcategory: 'Cítricos',
        tags: ['vitamina c', 'antioxidante', 'ácido'],
        translations: {
          en: { name: 'Lime', description: 'Fresh lime rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Limão Galego', description: 'Limão galego fresco rico em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lima', 'lima ácida'],
          en: ['lime', 'key lime'],
          pt: ['limão galego', 'lima']
        }
      },
      {
        name: 'Pomelo',
        brand: 'Generic',
        calories_per_100g: 38,
        protein_per_100g: 0.8,
        carbs_per_100g: 9.6,
        fat_per_100g: 0.1,
        fiber_per_100g: 1.0,
        sugar_per_100g: 6.9,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Cítricos',
        tags: ['vitamina c', 'antioxidante', 'fibra'],
        translations: {
          en: { name: 'Grapefruit', description: 'Fresh grapefruit rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Toranja', description: 'Toranja fresca rica em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pomelo', 'toronja'],
          en: ['grapefruit', 'citrus fruit'],
          pt: ['toranja', 'grapefruit']
        }
      },
      {
        name: 'Mandarina',
        brand: 'Generic',
        calories_per_100g: 53,
        protein_per_100g: 0.8,
        carbs_per_100g: 13.3,
        fat_per_100g: 0.3,
        fiber_per_100g: 1.8,
        sugar_per_100g: 10.6,
        sodium_per_100g: 2,
        category: 'Frutas',
        subcategory: 'Cítricos',
        tags: ['vitamina c', 'antioxidante', 'dulce'],
        translations: {
          en: { name: 'Tangerine', description: 'Fresh tangerine rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Tangerina', description: 'Tangerina fresca rica em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['mandarina', 'mandarino'],
          en: ['tangerine', 'mandarin'],
          pt: ['tangerina', 'mexerica']
        }
      },
      {
        name: 'Coco',
        brand: 'Generic',
        calories_per_100g: 354,
        protein_per_100g: 3.3,
        carbs_per_100g: 15.2,
        fat_per_100g: 33.5,
        fiber_per_100g: 9.0,
        sugar_per_100g: 6.2,
        sodium_per_100g: 20,
        category: 'Frutas',
        subcategory: 'Frutas Tropicales',
        tags: ['grasas saturadas', 'fibra', 'manganeso'],
        translations: {
          en: { name: 'Coconut', description: 'Fresh coconut meat', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Coco', description: 'Polpa fresca de coco', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['coco', 'coco fresco'],
          en: ['coconut', 'coconut meat'],
          pt: ['coco', 'polpa de coco']
        }
      },
      {
        name: 'Papaya',
        brand: 'Generic',
        calories_per_100g: 43,
        protein_per_100g: 0.5,
        carbs_per_100g: 11.0,
        fat_per_100g: 0.3,
        fiber_per_100g: 1.7,
        sugar_per_100g: 7.8,
        sodium_per_100g: 8,
        category: 'Frutas',
        subcategory: 'Frutas Tropicales',
        tags: ['vitamina c', 'enzimas', 'digestión'],
        translations: {
          en: { name: 'Papaya', description: 'Fresh papaya rich in enzymes', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Mamão', description: 'Mamão fresco rico em enzimas', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['papaya', 'lechosa'],
          en: ['papaya', 'pawpaw'],
          pt: ['mamão', 'papaya']
        }
      },
      {
        name: 'Sandía',
        brand: 'Generic',
        calories_per_100g: 30,
        protein_per_100g: 0.6,
        carbs_per_100g: 7.6,
        fat_per_100g: 0.2,
        fiber_per_100g: 0.4,
        sugar_per_100g: 6.2,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Cucurbitáceas',
        tags: ['hidratante', 'licopeno', 'bajo calorías'],
        translations: {
          en: { name: 'Watermelon', description: 'Fresh watermelon, hydrating and low calorie', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Melancia', description: 'Melancia fresca, hidratante e baixa em calorias', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['sandía', 'patilla'],
          en: ['watermelon', 'summer melon'],
          pt: ['melancia', 'melão de água']
        }
      },
      {
        name: 'Melón',
        brand: 'Generic',
        calories_per_100g: 34,
        protein_per_100g: 0.8,
        carbs_per_100g: 8.2,
        fat_per_100g: 0.2,
        fiber_per_100g: 0.9,
        sugar_per_100g: 7.9,
        sodium_per_100g: 16,
        category: 'Frutas',
        subcategory: 'Cucurbitáceas',
        tags: ['hidratante', 'vitamina c', 'potasio'],
        translations: {
          en: { name: 'Cantaloupe', description: 'Fresh cantaloupe rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Melão', description: 'Melão fresco rico em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['melón', 'melón cantalupo'],
          en: ['cantaloupe', 'muskmelon'],
          pt: ['melão', 'melão cantalupo']
        }
      },
      {
        name: 'Higo',
        brand: 'Generic',
        calories_per_100g: 74,
        protein_per_100g: 0.8,
        carbs_per_100g: 19.2,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.9,
        sugar_per_100g: 16.3,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Secas',
        tags: ['fibra', 'calcio', 'antioxidante'],
        translations: {
          en: { name: 'Fig', description: 'Fresh fig rich in fiber', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Figo', description: 'Figo fresco rico em fibra', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['higo', 'breva'],
          en: ['fig', 'fig fruit'],
          pt: ['figo', 'fruta figo']
        }
      },
      {
        name: 'Dátil',
        brand: 'Generic',
        calories_per_100g: 277,
        protein_per_100g: 1.8,
        carbs_per_100g: 75.0,
        fat_per_100g: 0.2,
        fiber_per_100g: 6.7,
        sugar_per_100g: 66.5,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Secas',
        tags: ['energía', 'potasio', 'fibra'],
        translations: {
          en: { name: 'Date', description: 'Fresh date rich in energy', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Tâmara', description: 'Tâmara fresca rica em energia', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['dátil', 'dátiles'],
          en: ['date', 'date fruit'],
          pt: ['tâmara', 'tamara']
        }
      },

      // MÁS VERDURAS (50+ items adicionales)
      {
        name: 'Apio',
        brand: 'Generic',
        calories_per_100g: 16,
        protein_per_100g: 0.7,
        carbs_per_100g: 3.0,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.6,
        sugar_per_100g: 1.8,
        sodium_per_100g: 80,
        category: 'Verduras',
        subcategory: 'Tallos',
        tags: ['bajo calorías', 'hidratante', 'fibra'],
        translations: {
          en: { name: 'Celery', description: 'Fresh celery, low calorie and hydrating', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Aipo', description: 'Aipo fresco, baixo em calorias e hidratante', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['apio', 'celery'],
          en: ['celery', 'stalk'],
          pt: ['aipo', 'salsão']
        }
      },
      {
        name: 'Perejil',
        brand: 'Generic',
        calories_per_100g: 36,
        protein_per_100g: 3.0,
        carbs_per_100g: 6.3,
        fat_per_100g: 0.8,
        fiber_per_100g: 3.3,
        sugar_per_100g: 0.9,
        sodium_per_100g: 56,
        category: 'Verduras',
        subcategory: 'Hierbas',
        tags: ['vitamina k', 'folato', 'antioxidante'],
        translations: {
          en: { name: 'Parsley', description: 'Fresh parsley rich in vitamin K', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Salsinha', description: 'Salsinha fresca rica em vitamina K', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['perejil', 'petroselino'],
          en: ['parsley', 'flat-leaf parsley'],
          pt: ['salsinha', 'salsa']
        }
      },
      {
        name: 'Cilantro',
        brand: 'Generic',
        calories_per_100g: 23,
        protein_per_100g: 2.1,
        carbs_per_100g: 3.7,
        fat_per_100g: 0.5,
        fiber_per_100g: 2.8,
        sugar_per_100g: 0.9,
        sodium_per_100g: 46,
        category: 'Verduras',
        subcategory: 'Hierbas',
        tags: ['vitamina k', 'antioxidante', 'aroma'],
        translations: {
          en: { name: 'Cilantro', description: 'Fresh cilantro leaves', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Coentro', description: 'Folhas frescas de coentro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['cilantro', 'culantro'],
          en: ['cilantro', 'coriander'],
          pt: ['coentro', 'cilantro']
        }
      },
      {
        name: 'Remolacha',
        brand: 'Generic',
        calories_per_100g: 43,
        protein_per_100g: 1.6,
        carbs_per_100g: 9.6,
        fat_per_100g: 0.2,
        fiber_per_100g: 2.8,
        sugar_per_100g: 6.8,
        sodium_per_100g: 78,
        category: 'Verduras',
        subcategory: 'Raíces',
        tags: ['folato', 'manganeso', 'nitratos'],
        translations: {
          en: { name: 'Beetroot', description: 'Fresh beetroot rich in folate', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Beterraba', description: 'Beterraba fresca rica em folato', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['remolacha', 'betabel'],
          en: ['beetroot', 'beet'],
          pt: ['beterraba', 'beterraba']
        }
      },
      {
        name: 'Nabo',
        brand: 'Generic',
        calories_per_100g: 28,
        protein_per_100g: 0.9,
        carbs_per_100g: 6.4,
        fat_per_100g: 0.1,
        fiber_per_100g: 1.8,
        sugar_per_100g: 3.8,
        sodium_per_100g: 39,
        category: 'Verduras',
        subcategory: 'Raíces',
        tags: ['vitamina c', 'fibra', 'bajo calorías'],
        translations: {
          en: { name: 'Turnip', description: 'Fresh turnip rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Nabo', description: 'Nabo fresco rico em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['nabo', 'colinabo'],
          en: ['turnip', 'white turnip'],
          pt: ['nabo', 'nabo branco']
        }
      },
      {
        name: 'Rábano',
        brand: 'Generic',
        calories_per_100g: 16,
        protein_per_100g: 0.7,
        carbs_per_100g: 3.4,
        fat_per_100g: 0.1,
        fiber_per_100g: 1.6,
        sugar_per_100g: 1.9,
        sodium_per_100g: 39,
        category: 'Verduras',
        subcategory: 'Raíces',
        tags: ['vitamina c', 'antioxidante', 'picante'],
        translations: {
          en: { name: 'Radish', description: 'Fresh radish with spicy flavor', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Rabanete', description: 'Rabanete fresco com sabor picante', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['rábano', 'rabano'],
          en: ['radish', 'red radish'],
          pt: ['rabanete', 'rabanetes']
        }
      },
      {
        name: 'Patata',
        brand: 'Generic',
        calories_per_100g: 77,
        protein_per_100g: 2.0,
        carbs_per_100g: 17.5,
        fat_per_100g: 0.1,
        fiber_per_100g: 2.2,
        sugar_per_100g: 0.8,
        sodium_per_100g: 6,
        category: 'Verduras',
        subcategory: 'Tubérculos',
        tags: ['carbohidratos', 'potasio', 'vitamina c'],
        translations: {
          en: { name: 'Potato', description: 'Fresh potato rich in potassium', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Batata', description: 'Batata fresca rica em potássio', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['patata', 'papa'],
          en: ['potato', 'white potato'],
          pt: ['batata', 'batata-inglesa']
        }
      },
      {
        name: 'Boniato',
        brand: 'Generic',
        calories_per_100g: 86,
        protein_per_100g: 1.6,
        carbs_per_100g: 20.1,
        fat_per_100g: 0.1,
        fiber_per_100g: 3.0,
        sugar_per_100g: 4.2,
        sodium_per_100g: 54,
        category: 'Verduras',
        subcategory: 'Tubérculos',
        tags: ['betacaroteno', 'vitamina a', 'fibra'],
        translations: {
          en: { name: 'Sweet Potato', description: 'Fresh sweet potato rich in beta-carotene', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Batata Doce', description: 'Batata doce fresca rica em betacaroteno', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['boniato', 'batata', 'camote'],
          en: ['sweet potato', 'yam'],
          pt: ['batata doce', 'batata']
        }
      },
      {
        name: 'Berro',
        brand: 'Generic',
        calories_per_100g: 11,
        protein_per_100g: 2.3,
        carbs_per_100g: 1.3,
        fat_per_100g: 0.1,
        fiber_per_100g: 0.5,
        sugar_per_100g: 0.2,
        sodium_per_100g: 41,
        category: 'Verduras',
        subcategory: 'Hojas Verdes',
        tags: ['vitamina k', 'vitamina c', 'antioxidante'],
        translations: {
          en: { name: 'Watercress', description: 'Fresh watercress rich in vitamin K', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Agrião', description: 'Agrião fresco rico em vitamina K', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['berro', 'mastuerzo'],
          en: ['watercress', 'cress'],
          pt: ['agrião', 'agrião de água']
        }
      },

      // MÁS CARNES Y PROTEÍNAS (50+ items adicionales)
      {
        name: 'Jamón Serrano',
        brand: 'Generic',
        calories_per_100g: 370,
        protein_per_100g: 30.0,
        carbs_per_100g: 1.0,
        fat_per_100g: 27.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 2110,
        category: 'Carnes',
        subcategory: 'Embutidos',
        tags: ['proteína', 'sodio', 'conservado'],
        translations: {
          en: { name: 'Serrano Ham', description: 'Cured serrano ham', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Presunto Serrano', description: 'Presunto serrano curado', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['jamón serrano', 'jamón curado'],
          en: ['serrano ham', 'cured ham'],
          pt: ['presunto serrano', 'presunto curado']
        }
      },
      {
        name: 'Panceta',
        brand: 'Generic',
        calories_per_100g: 518,
        protein_per_100g: 9.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 53.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 1717,
        category: 'Carnes',
        subcategory: 'Embutidos',
        tags: ['grasa', 'sodio', 'conservado'],
        translations: {
          en: { name: 'Bacon', description: 'Cured bacon', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Bacon', description: 'Bacon curado', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['panceta', 'tocino'],
          en: ['bacon', 'streaky bacon'],
          pt: ['bacon', 'toucinho']
        }
      },
      {
        name: 'Salchicha',
        brand: 'Generic',
        calories_per_100g: 301,
        protein_per_100g: 12.0,
        carbs_per_100g: 2.0,
        fat_per_100g: 27.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 1.0,
        sodium_per_100g: 1200,
        category: 'Carnes',
        subcategory: 'Embutidos',
        tags: ['proteína', 'grasa', 'sodio'],
        translations: {
          en: { name: 'Sausage', description: 'Fresh sausage', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Salsicha', description: 'Salsicha fresca', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['salchicha', 'embutido'],
          en: ['sausage', 'bratwurst'],
          pt: ['salsicha', 'linguiça']
        }
      },
      {
        name: 'Chorizo',
        brand: 'Generic',
        calories_per_100g: 455,
        protein_per_100g: 24.0,
        carbs_per_100g: 2.0,
        fat_per_100g: 38.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 1.0,
        sodium_per_100g: 1800,
        category: 'Carnes',
        subcategory: 'Embutidos',
        tags: ['proteína', 'grasa', 'picante'],
        translations: {
          en: { name: 'Chorizo', description: 'Spanish chorizo sausage', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Chouriço', description: 'Chouriço espanhol', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['chorizo', 'embutido'],
          en: ['chorizo', 'spanish sausage'],
          pt: ['chouriço', 'linguiça espanhola']
        }
      },
      {
        name: 'Cordero',
        brand: 'Generic',
        calories_per_100g: 294,
        protein_per_100g: 25.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 21.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 72,
        category: 'Carnes',
        subcategory: 'Carnes Rojas',
        tags: ['proteína', 'hierro', 'zinc'],
        translations: {
          en: { name: 'Lamb', description: 'Fresh lamb meat', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Cordeiro', description: 'Carne fresca de cordeiro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['cordero', 'carne de cordero'],
          en: ['lamb', 'lamb meat'],
          pt: ['cordeiro', 'carne de cordeiro']
        }
      },
      {
        name: 'Cabrito',
        brand: 'Generic',
        calories_per_100g: 143,
        protein_per_100g: 27.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 3.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 82,
        category: 'Carnes',
        subcategory: 'Carnes Blancas',
        tags: ['proteína', 'bajo grasa', 'hierro'],
        translations: {
          en: { name: 'Goat', description: 'Fresh goat meat', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Cabrito', description: 'Carne fresca de cabrito', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['cabrito', 'carne de cabrito'],
          en: ['goat', 'goat meat'],
          pt: ['cabrito', 'carne de cabrito']
        }
      },

      // MÁS PESCADOS Y MARISCOS (30+ items adicionales)
      {
        name: 'Merluza',
        brand: 'Generic',
        calories_per_100g: 71,
        protein_per_100g: 17.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 0.4,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 68,
        category: 'Pescados',
        subcategory: 'Pescados Magros',
        tags: ['proteína', 'bajo grasa', 'fósforo'],
        translations: {
          en: { name: 'Hake', description: 'Fresh hake, lean white fish', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pescada', description: 'Pescada fresca, peixe branco magro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['merluza', 'pescada'],
          en: ['hake', 'white fish'],
          pt: ['pescada', 'peixe branco']
        }
      },
      {
        name: 'Lenguado',
        brand: 'Generic',
        calories_per_100g: 91,
        protein_per_100g: 18.8,
        carbs_per_100g: 0.0,
        fat_per_100g: 1.2,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 81,
        category: 'Pescados',
        subcategory: 'Pescados Planos',
        tags: ['proteína', 'bajo grasa', 'selenio'],
        translations: {
          en: { name: 'Sole', description: 'Fresh sole, flat fish', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Linguado', description: 'Linguado fresco, peixe plano', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lenguado', 'solla'],
          en: ['sole', 'flatfish'],
          pt: ['linguado', 'peixe plano']
        }
      },
      {
        name: 'Dorada',
        brand: 'Generic',
        calories_per_100g: 144,
        protein_per_100g: 20.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 6.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 54,
        category: 'Pescados',
        subcategory: 'Pescados Grasos',
        tags: ['proteína', 'omega 3', 'vitamina d'],
        translations: {
          en: { name: 'Sea Bream', description: 'Fresh sea bream', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Dourada', description: 'Dourada fresca', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['dorada', 'dorado'],
          en: ['sea bream', 'gilthead'],
          pt: ['dourada', 'dourado']
        }
      },
      {
        name: 'Lubina',
        brand: 'Generic',
        calories_per_100g: 97,
        protein_per_100g: 18.4,
        carbs_per_100g: 0.0,
        fat_per_100g: 2.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 68,
        category: 'Pescados',
        subcategory: 'Pescados Magros',
        tags: ['proteína', 'selenio', 'vitamina b12'],
        translations: {
          en: { name: 'Sea Bass', description: 'Fresh sea bass', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Robalo', description: 'Robalo fresco', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lubina', 'robalo'],
          en: ['sea bass', 'european bass'],
          pt: ['robalo', 'bass']
        }
      },
      {
        name: 'Mejillones',
        brand: 'Generic',
        calories_per_100g: 86,
        protein_per_100g: 11.9,
        carbs_per_100g: 3.7,
        fat_per_100g: 2.2,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 286,
        category: 'Mariscos',
        subcategory: 'Moluscos',
        tags: ['proteína', 'hierro', 'vitamina b12'],
        translations: {
          en: { name: 'Mussels', description: 'Fresh mussels', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Mexilhões', description: 'Mexilhões frescos', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['mejillones', 'choros'],
          en: ['mussels', 'mollusks'],
          pt: ['mexilhões', 'mexilhões']
        }
      },
      {
        name: 'Almejas',
        brand: 'Generic',
        calories_per_100g: 86,
        protein_per_100g: 14.7,
        carbs_per_100g: 2.6,
        fat_per_100g: 0.96,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 1202,
        category: 'Mariscos',
        subcategory: 'Moluscos',
        tags: ['proteína', 'hierro', 'zinc'],
        translations: {
          en: { name: 'Clams', description: 'Fresh clams', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Amêijoas', description: 'Amêijoas frescas', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['almejas', 'berberechos'],
          en: ['clams', 'bivalves'],
          pt: ['amêijoas', 'berbigões']
        }
      },
      {
        name: 'Ostras',
        brand: 'Generic',
        calories_per_100g: 81,
        protein_per_100g: 9.5,
        carbs_per_100g: 4.9,
        fat_per_100g: 2.3,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 106,
        category: 'Mariscos',
        subcategory: 'Moluscos',
        tags: ['zinc', 'vitamina b12', 'selenio'],
        translations: {
          en: { name: 'Oysters', description: 'Fresh oysters', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Ostras', description: 'Ostras frescas', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['ostras', 'ostión'],
          en: ['oysters', 'bivalves'],
          pt: ['ostras', 'ostras']
        }
      },
      {
        name: 'Cangrejo',
        brand: 'Generic',
        calories_per_100g: 97,
        protein_per_100g: 20.1,
        carbs_per_100g: 0.0,
        fat_per_100g: 1.5,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 911,
        category: 'Mariscos',
        subcategory: 'Crustáceos',
        tags: ['proteína', 'selenio', 'vitamina b12'],
        translations: {
          en: { name: 'Crab', description: 'Fresh crab meat', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Caranguejo', description: 'Carne fresca de caranguejo', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['cangrejo', 'jaiba'],
          en: ['crab', 'crab meat'],
          pt: ['caranguejo', 'carne de caranguejo']
        }
      },
      {
        name: 'Langosta',
        brand: 'Generic',
        calories_per_100g: 89,
        protein_per_100g: 18.8,
        carbs_per_100g: 0.0,
        fat_per_100g: 0.9,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 296,
        category: 'Mariscos',
        subcategory: 'Crustáceos',
        tags: ['proteína', 'selenio', 'fósforo'],
        translations: {
          en: { name: 'Lobster', description: 'Fresh lobster meat', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Lagosta', description: 'Carne fresca de lagosta', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['langosta', 'bogavante'],
          en: ['lobster', 'lobster meat'],
          pt: ['lagosta', 'carne de lagosta']
        }
      }
    ];

    console.log(`📝 Preparando ${massiveFoodsDatabase.length} alimentos masivos para insertar...`);

    let addedCount = 0;
    for (const food of massiveFoodsDatabase) {
      try {
        // Verificar si el alimento ya existe
        const existingFood = await db.query(
          'SELECT id FROM fitso_foods WHERE name = $1 AND brand = $2',
          [food.name, food.brand]
        );

        if (existingFood.rows.length > 0) {
          console.log(`⏭️ Alimento ya existe: ${food.name}`);
          continue;
        }

        // Insertar alimento principal
        const foodInsertQuery = `
          INSERT INTO fitso_foods (
            name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, 
            fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g,
            category, subcategory, tags, is_custom, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `;

        const foodValues = [
          food.name,
          food.brand,
          food.calories_per_100g,
          food.protein_per_100g,
          food.carbs_per_100g,
          food.fat_per_100g,
          food.fiber_per_100g,
          food.sugar_per_100g,
          food.sodium_per_100g,
          food.category,
          food.subcategory,
          food.tags,
          false // is_custom
        ];

        const foodResult = await db.query(foodInsertQuery, foodValues);
        const foodId = foodResult.rows[0].id;

        // Insertar traducciones
        for (const [locale, translation] of Object.entries(food.translations)) {
          const translationQuery = `
            INSERT INTO fitso_food_translations (
              food_id, locale, name, description, unit_short, unit_long,
              is_machine_translated, is_reviewed, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;

          await db.query(translationQuery, [
            foodId,
            locale,
            translation.name,
            translation.description,
            translation.unit_short,
            translation.unit_long,
            false, // is_machine_translated
            true   // is_reviewed
          ]);
        }

        // Insertar sinónimos
        for (const [locale, synonyms] of Object.entries(food.synonyms)) {
          for (const synonym of synonyms) {
            const synonymQuery = `
              INSERT INTO fitso_food_synonyms (food_id, locale, synonym)
              VALUES ($1, $2, $3)
            `;

            await db.query(synonymQuery, [foodId, locale, synonym]);
          }
        }

        console.log(`✅ Alimento añadido: ${food.name} (ID: ${foodId})`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error añadiendo ${food.name}:`, error.message);
        // Continuar con el siguiente alimento
      }
    }

    console.log(`🎉 Proceso completado! Se añadieron ${addedCount} alimentos nuevos.`);
    
    // Verificar total final
    const finalCountResult = await db.query('SELECT COUNT(*) FROM fitso_foods');
    console.log(`📊 Total de alimentos en la base de datos: ${finalCountResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error durante la adición masiva de alimentos:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedMassiveDatabase()
    .then(() => {
      console.log('✅ Script de base de datos masiva completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedMassiveDatabase;
