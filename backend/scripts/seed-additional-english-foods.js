const db = require('../src/config/database');

// Alimentos adicionales en inglés para probar
const additionalEnglishFoods = [
  {
    // Datos nutricionales base
    name: 'Chicken Breast',
    brand: null,
    barcode: null,
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 74,
    category: 'Proteins',
    subcategory: 'Meat',
    tags: ['chicken', 'poultry', 'meat', 'protein'],
    is_custom: false,
    created_by: null,
    // Traducciones
    translations: {
      es: {
        name: 'Pechuga de Pollo',
        description: 'Carne de ave magra, rica en proteínas',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Chicken Breast',
        description: 'Lean poultry meat, rich in protein',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Peito de Frango',
        description: 'Carne de ave magra, rica em proteínas',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    // Sinónimos por idioma
    synonyms: {
      es: ['pechuga', 'pollo', 'ave', 'carne de pollo'],
      en: ['chicken', 'poultry', 'breast', 'white meat'],
      pt: ['peito', 'frango', 'ave', 'carne de frango']
    }
  },
  {
    name: 'Brown Rice',
    brand: null,
    barcode: null,
    calories_per_100g: 111,
    protein_per_100g: 2.6,
    carbs_per_100g: 23,
    fat_per_100g: 0.9,
    fiber_per_100g: 1.8,
    sugar_per_100g: 0.4,
    sodium_per_100g: 5,
    category: 'Carbohydrates',
    subcategory: 'Grains',
    tags: ['rice', 'grain', 'carbohydrate', 'whole grain'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Arroz Integral',
        description: 'Cereal integral cocido, fuente de carbohidratos',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Brown Rice',
        description: 'Whole grain cereal, source of carbohydrates',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Arroz Integral',
        description: 'Cereal integral cozido, fonte de carboidratos',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['arroz', 'integral', 'cereal', 'grano'],
      en: ['rice', 'whole grain', 'cereal', 'grain'],
      pt: ['arroz', 'integral', 'cereal', 'grão']
    }
  },
  {
    name: 'Greek Yogurt',
    brand: null,
    barcode: null,
    calories_per_100g: 59,
    protein_per_100g: 10,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 0,
    sugar_per_100g: 3.6,
    sodium_per_100g: 36,
    category: 'Dairy',
    subcategory: 'Yogurt',
    tags: ['yogurt', 'dairy', 'protein', 'probiotic'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Yogur Griego',
        description: 'Yogur espeso rico en proteínas',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Greek Yogurt',
        description: 'Thick yogurt rich in protein',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Iogurte Grego',
        description: 'Iogurte espesso rico em proteínas',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['yogur', 'lácteo', 'proteína'],
      en: ['yogurt', 'dairy', 'protein', 'probiotic'],
      pt: ['iogurte', 'lácteo', 'proteína']
    }
  },
  {
    name: 'Sweet Potato',
    brand: null,
    barcode: null,
    calories_per_100g: 86,
    protein_per_100g: 1.6,
    carbs_per_100g: 20,
    fat_per_100g: 0.1,
    fiber_per_100g: 3,
    sugar_per_100g: 4.2,
    sodium_per_100g: 54,
    category: 'Vegetables',
    subcategory: 'Root Vegetables',
    tags: ['sweet potato', 'vegetable', 'carbohydrate', 'vitamin'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Batata',
        description: 'Tubérculo dulce rico en vitaminas',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Sweet Potato',
        description: 'Sweet tuber rich in vitamins',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Batata Doce',
        description: 'Tubérculo doce rico em vitaminas',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['batata', 'boniato', 'camote'],
      en: ['sweet potato', 'yam', 'tuber'],
      pt: ['batata doce', 'batata', 'tubérculo']
    }
  },
  {
    name: 'Avocado',
    brand: null,
    barcode: null,
    calories_per_100g: 160,
    protein_per_100g: 2,
    carbs_per_100g: 9,
    fat_per_100g: 15,
    fiber_per_100g: 7,
    sugar_per_100g: 0.7,
    sodium_per_100g: 7,
    category: 'Fruits',
    subcategory: 'Fresh Fruits',
    tags: ['avocado', 'fruit', 'healthy fat', 'fiber'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Aguacate',
        description: 'Fruta rica en grasas saludables',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Avocado',
        description: 'Fruit rich in healthy fats',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Abacate',
        description: 'Fruta rica em gorduras saudáveis',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['aguacate', 'palta', 'fruta'],
      en: ['avocado', 'fruit', 'healthy fat'],
      pt: ['abacate', 'fruta', 'gordura saudável']
    }
  }
];

async function seedAdditionalEnglishFoods() {
  try {
    console.log('🌱 Añadiendo alimentos adicionales en inglés...');
    
    for (const foodData of additionalEnglishFoods) {
      const { translations, synonyms, ...baseFoodData } = foodData;
      
      // Insertar alimento base en fitso_foods
      const foodInsertQuery = `
        INSERT INTO fitso_foods (
          name, brand, barcode, calories_per_100g, protein_per_100g, 
          carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, 
          sodium_per_100g, category, subcategory, tags, is_custom, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `;
      
      const foodParams = [
        baseFoodData.name,
        baseFoodData.brand,
        baseFoodData.barcode,
        baseFoodData.calories_per_100g,
        baseFoodData.protein_per_100g,
        baseFoodData.carbs_per_100g,
        baseFoodData.fat_per_100g,
        baseFoodData.fiber_per_100g,
        baseFoodData.sugar_per_100g,
        baseFoodData.sodium_per_100g,
        baseFoodData.category,
        baseFoodData.subcategory,
        baseFoodData.tags,
        baseFoodData.is_custom,
        baseFoodData.created_by
      ];
      
      const foodResult = await db.query(foodInsertQuery, foodParams);
      const foodId = foodResult.rows[0].id;
      
      console.log(`✅ Alimento insertado: ${baseFoodData.name} (ID: ${foodId})`);
      
      // Insertar traducciones
      for (const [locale, translation] of Object.entries(translations)) {
        const translationQuery = `
          INSERT INTO fitso_food_translations (
            food_id, locale, name, description, unit_short, unit_long,
            is_machine_translated, is_reviewed, source_lang
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        
        const translationParams = [
          foodId,
          locale,
          translation.name,
          translation.description,
          translation.unit_short,
          translation.unit_long,
          false, // is_machine_translated
          true,  // is_reviewed
          'en'   // source_lang
        ];
        
        await db.query(translationQuery, translationParams);
        console.log(`  📝 Traducción insertada: ${locale} - ${translation.name}`);
      }
      
      // Insertar sinónimos
      for (const [locale, localeSynonyms] of Object.entries(synonyms)) {
        for (const synonym of localeSynonyms) {
          const synonymQuery = `
            INSERT INTO fitso_food_synonyms (food_id, locale, synonym)
            VALUES ($1, $2, $3)
          `;
          
          await db.query(synonymQuery, [foodId, locale, synonym]);
        }
        console.log(`  🔍 Sinónimos insertados para ${locale}: ${localeSynonyms.join(', ')}`);
      }
    }
    
    console.log('🎉 Alimentos adicionales en inglés añadidos exitosamente!');
    
    // Mostrar estadísticas actualizadas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_foods,
        COUNT(DISTINCT ft.locale) as locales_count,
        COUNT(fs.id) as synonyms_count
      FROM fitso_foods f
      LEFT JOIN fitso_food_translations ft ON ft.food_id = f.id
      LEFT JOIN fitso_food_synonyms fs ON fs.food_id = f.id
    `;
    
    const stats = await db.query(statsQuery);
    console.log('📊 Estadísticas actualizadas:', stats.rows[0]);
    
  } catch (error) {
    console.error('❌ Error añadiendo alimentos en inglés:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedAdditionalEnglishFoods()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedAdditionalEnglishFoods;
