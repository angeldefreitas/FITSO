const db = require('../src/config/database');

// Alimentos comunes con traducciones
const foodsWithTranslations = [
  {
    // Datos nutricionales base (universales)
    name: 'Pollo',
    brand: null,
    barcode: null,
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 74,
    category: 'Proteínas',
    subcategory: 'Carnes',
    tags: ['pollo', 'ave', 'carne', 'proteína'],
    is_custom: false,
    created_by: null,
    // Traducciones
    translations: {
      es: {
        name: 'Pollo',
        description: 'Carne de ave magra, rica en proteínas',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Chicken',
        description: 'Lean poultry meat, rich in protein',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Frango',
        description: 'Carne de ave magra, rica em proteínas',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    // Sinónimos por idioma
    synonyms: {
      es: ['gallina', 'ave', 'carne de pollo', 'pechuga'],
      en: ['poultry', 'chicken breast', 'chicken meat'],
      pt: ['galinha', 'ave', 'carne de frango', 'peito']
    }
  },
  {
    name: 'Arroz blanco',
    brand: null,
    barcode: null,
    calories_per_100g: 130,
    protein_per_100g: 2.7,
    carbs_per_100g: 28,
    fat_per_100g: 0.3,
    fiber_per_100g: 0.4,
    sugar_per_100g: 0.1,
    sodium_per_100g: 1,
    category: 'Carbohidratos',
    subcategory: 'Cereales',
    tags: ['arroz', 'cereal', 'carbohidrato', 'grano'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Arroz blanco',
        description: 'Cereal cocido, fuente de carbohidratos',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'White rice',
        description: 'Cooked cereal, source of carbohydrates',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Arroz branco',
        description: 'Cereal cozido, fonte de carboidratos',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['arroz', 'cereal', 'grano'],
      en: ['rice', 'cereal', 'grain'],
      pt: ['arroz', 'cereal', 'grão']
    }
  },
  {
    name: 'Manzana',
    brand: null,
    barcode: null,
    calories_per_100g: 52,
    protein_per_100g: 0.3,
    carbs_per_100g: 14,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.4,
    sugar_per_100g: 10,
    sodium_per_100g: 1,
    category: 'Frutas',
    subcategory: 'Frutas frescas',
    tags: ['manzana', 'fruta', 'vitamina', 'fibra'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Manzana',
        description: 'Fruta fresca rica en fibra y vitaminas',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Apple',
        description: 'Fresh fruit rich in fiber and vitamins',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Maçã',
        description: 'Fruta fresca rica em fibras e vitaminas',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['fruta', 'poma'],
      en: ['fruit', 'red apple', 'green apple'],
      pt: ['fruta', 'maçã vermelha', 'maçã verde']
    }
  },
  {
    name: 'Pan integral',
    brand: null,
    barcode: null,
    calories_per_100g: 247,
    protein_per_100g: 13,
    carbs_per_100g: 41,
    fat_per_100g: 4.2,
    fiber_per_100g: 7,
    sugar_per_100g: 5,
    sodium_per_100g: 681,
    category: 'Carbohidratos',
    subcategory: 'Panadería',
    tags: ['pan', 'integral', 'fibra', 'cereal'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Pan integral',
        description: 'Pan elaborado con harina integral',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Whole wheat bread',
        description: 'Bread made with whole wheat flour',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Pão integral',
        description: 'Pão feito com farinha integral',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['pan', 'pan de trigo', 'pan de grano entero'],
      en: ['bread', 'whole grain bread', 'wheat bread'],
      pt: ['pão', 'pão de trigo', 'pão de grão inteiro']
    }
  },
  {
    name: 'Leche entera',
    brand: null,
    barcode: null,
    calories_per_100g: 61,
    protein_per_100g: 3.2,
    carbs_per_100g: 4.8,
    fat_per_100g: 3.3,
    fiber_per_100g: 0,
    sugar_per_100g: 4.8,
    sodium_per_100g: 40,
    category: 'Lácteos',
    subcategory: 'Leche',
    tags: ['leche', 'lácteo', 'calcio', 'proteína'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Leche entera',
        description: 'Leche con toda su grasa natural',
        unit_short: 'ml',
        unit_long: 'mililitros'
      },
      en: {
        name: 'Whole milk',
        description: 'Milk with all its natural fat',
        unit_short: 'ml',
        unit_long: 'milliliters'
      },
      pt: {
        name: 'Leite integral',
        description: 'Leite com toda sua gordura natural',
        unit_short: 'ml',
        unit_long: 'mililitros'
      }
    },
    synonyms: {
      es: ['leche', 'lácteo', 'leche de vaca'],
      en: ['milk', 'dairy', 'cow milk'],
      pt: ['leite', 'lácteo', 'leite de vaca']
    }
  },
  {
    name: 'Huevo',
    brand: null,
    barcode: null,
    calories_per_100g: 155,
    protein_per_100g: 13,
    carbs_per_100g: 1.1,
    fat_per_100g: 11,
    fiber_per_100g: 0,
    sugar_per_100g: 1.1,
    sodium_per_100g: 124,
    category: 'Proteínas',
    subcategory: 'Huevos',
    tags: ['huevo', 'proteína', 'colina', 'vitamina'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Huevo',
        description: 'Huevo de gallina, rico en proteínas',
        unit_short: 'un',
        unit_long: 'unidad'
      },
      en: {
        name: 'Egg',
        description: 'Chicken egg, rich in protein',
        unit_short: 'pc',
        unit_long: 'piece'
      },
      pt: {
        name: 'Ovo',
        description: 'Ovo de galinha, rico em proteínas',
        unit_short: 'un',
        unit_long: 'unidade'
      }
    },
    synonyms: {
      es: ['huevo de gallina', 'huevo entero'],
      en: ['chicken egg', 'whole egg'],
      pt: ['ovo de galinha', 'ovo inteiro']
    }
  },
  {
    name: 'Aceite de oliva',
    brand: null,
    barcode: null,
    calories_per_100g: 884,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 100,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 2,
    category: 'Grasas',
    subcategory: 'Aceites',
    tags: ['aceite', 'oliva', 'grasa', 'monoinsaturada'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Aceite de oliva',
        description: 'Aceite extraído de aceitunas',
        unit_short: 'ml',
        unit_long: 'mililitros'
      },
      en: {
        name: 'Olive oil',
        description: 'Oil extracted from olives',
        unit_short: 'ml',
        unit_long: 'milliliters'
      },
      pt: {
        name: 'Azeite de oliva',
        description: 'Óleo extraído de azeitonas',
        unit_short: 'ml',
        unit_long: 'mililitros'
      }
    },
    synonyms: {
      es: ['aceite', 'oliva', 'aceite virgen'],
      en: ['oil', 'olive', 'virgin oil'],
      pt: ['azeite', 'oliva', 'azeite virgem']
    }
  },
  {
    name: 'Plátano',
    brand: null,
    barcode: null,
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.6,
    sugar_per_100g: 12,
    sodium_per_100g: 1,
    category: 'Frutas',
    subcategory: 'Frutas frescas',
    tags: ['plátano', 'banana', 'fruta', 'potasio'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Plátano',
        description: 'Fruta rica en potasio y carbohidratos',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Banana',
        description: 'Fruit rich in potassium and carbohydrates',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Banana',
        description: 'Fruta rica em potássio e carboidratos',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['banana', 'plátano', 'fruta'],
      en: ['banana', 'fruit'],
      pt: ['banana', 'fruta']
    }
  },
  {
    name: 'Salmón',
    brand: null,
    barcode: null,
    calories_per_100g: 208,
    protein_per_100g: 25,
    carbs_per_100g: 0,
    fat_per_100g: 12,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 44,
    category: 'Proteínas',
    subcategory: 'Pescados',
    tags: ['salmón', 'pescado', 'omega3', 'proteína'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Salmón',
        description: 'Pescado rico en omega-3 y proteínas',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Salmon',
        description: 'Fish rich in omega-3 and protein',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Salmão',
        description: 'Peixe rico em ômega-3 e proteínas',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['pescado', 'pez', 'salmón atlántico'],
      en: ['fish', 'atlantic salmon'],
      pt: ['peixe', 'salmão atlântico']
    }
  },
  {
    name: 'Brócoli',
    brand: null,
    barcode: null,
    calories_per_100g: 34,
    protein_per_100g: 2.8,
    carbs_per_100g: 7,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.6,
    sugar_per_100g: 1.5,
    sodium_per_100g: 33,
    category: 'Verduras',
    subcategory: 'Crucíferas',
    tags: ['brócoli', 'verdura', 'vitamina', 'fibra'],
    is_custom: false,
    created_by: null,
    translations: {
      es: {
        name: 'Brócoli',
        description: 'Verdura crucífera rica en vitaminas',
        unit_short: 'g',
        unit_long: 'gramos'
      },
      en: {
        name: 'Broccoli',
        description: 'Cruciferous vegetable rich in vitamins',
        unit_short: 'g',
        unit_long: 'grams'
      },
      pt: {
        name: 'Brócolis',
        description: 'Vegetal crucífero rico em vitaminas',
        unit_short: 'g',
        unit_long: 'gramas'
      }
    },
    synonyms: {
      es: ['verdura', 'crucífera', 'brócoli'],
      en: ['vegetable', 'cruciferous', 'broccoli'],
      pt: ['vegetal', 'crucífero', 'brócolis']
    }
  }
];

async function seedFoodTranslations() {
  try {
    console.log('🌱 Iniciando seed de alimentos con traducciones...');
    
    for (const foodData of foodsWithTranslations) {
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
          'es'   // source_lang
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
    
    console.log('🎉 Seed completado exitosamente!');
    
    // Mostrar estadísticas
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
    console.log('📊 Estadísticas:', stats.rows[0]);
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedFoodTranslations()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedFoodTranslations;
