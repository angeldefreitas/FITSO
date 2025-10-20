const db = require('../src/config/database');

async function deployFitsoFoods() {
  try {
    console.log('🚀 Iniciando despliegue de sistema FITSO Foods...');
    
    // 1. Crear tablas
    console.log('📋 Creando tablas...');
    const createTablesSQL = `
      -- Tabla principal de alimentos FITSO
      CREATE TABLE IF NOT EXISTS fitso_foods (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          brand VARCHAR(255),
          barcode VARCHAR(50) UNIQUE,
          calories_per_100g DECIMAL(8,2) NOT NULL,
          protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
          carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
          fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
          fiber_per_100g DECIMAL(8,2) DEFAULT 0,
          sugar_per_100g DECIMAL(8,2) DEFAULT 0,
          sodium_per_100g DECIMAL(8,2) DEFAULT 0,
          category VARCHAR(50),
          subcategory VARCHAR(50),
          tags TEXT[],
          is_custom BOOLEAN DEFAULT FALSE,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de traducciones
      CREATE TABLE IF NOT EXISTS fitso_food_translations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          food_id UUID REFERENCES fitso_foods(id) ON DELETE CASCADE,
          locale VARCHAR(10) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          unit_short VARCHAR(20),
          unit_long VARCHAR(50),
          is_machine_translated BOOLEAN DEFAULT FALSE,
          is_reviewed BOOLEAN DEFAULT TRUE,
          source_lang VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(food_id, locale)
      );

      -- Tabla de sinónimos
      CREATE TABLE IF NOT EXISTS fitso_food_synonyms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          food_id UUID REFERENCES fitso_foods(id) ON DELETE CASCADE,
          locale VARCHAR(10) NOT NULL,
          synonym VARCHAR(255) NOT NULL
      );
    `;
    
    await db.query(createTablesSQL);
    console.log('✅ Tablas creadas exitosamente');
    
    // 2. Crear índices
    console.log('🔍 Creando índices...');
    const createIndexesSQL = `
      -- Índices para fitso_foods
      CREATE INDEX IF NOT EXISTS idx_fitso_foods_name ON fitso_foods(name);
      CREATE INDEX IF NOT EXISTS idx_fitso_foods_category ON fitso_foods(category);
      CREATE INDEX IF NOT EXISTS idx_fitso_foods_barcode ON fitso_foods(barcode);
      CREATE INDEX IF NOT EXISTS idx_fitso_foods_created_by ON fitso_foods(created_by);
      CREATE INDEX IF NOT EXISTS idx_fitso_foods_is_custom ON fitso_foods(is_custom);
      
      -- Índices para fitso_food_translations
      CREATE INDEX IF NOT EXISTS idx_fitso_translations_food_id ON fitso_food_translations(food_id);
      CREATE INDEX IF NOT EXISTS idx_fitso_translations_locale ON fitso_food_translations(locale);
      CREATE INDEX IF NOT EXISTS idx_fitso_translations_name ON fitso_food_translations(name);
      
      -- Índices para fitso_food_synonyms
      CREATE INDEX IF NOT EXISTS idx_fitso_synonyms_food_id ON fitso_food_synonyms(food_id);
      CREATE INDEX IF NOT EXISTS idx_fitso_synonyms_locale ON fitso_food_synonyms(locale);
      CREATE INDEX IF NOT EXISTS idx_fitso_synonyms_synonym ON fitso_food_synonyms(synonym);
    `;
    
    await db.query(createIndexesSQL);
    console.log('✅ Índices creados exitosamente');
    
    // 3. Crear triggers para updated_at
    console.log('⚡ Creando triggers...');
    const createTriggersSQL = `
      -- Trigger para fitso_foods
      CREATE OR REPLACE FUNCTION update_fitso_foods_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS trigger_update_fitso_foods_updated_at ON fitso_foods;
      CREATE TRIGGER trigger_update_fitso_foods_updated_at
          BEFORE UPDATE ON fitso_foods
          FOR EACH ROW
          EXECUTE FUNCTION update_fitso_foods_updated_at();

      -- Trigger para fitso_food_translations
      CREATE OR REPLACE FUNCTION update_fitso_translations_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS trigger_update_fitso_translations_updated_at ON fitso_food_translations;
      CREATE TRIGGER trigger_update_fitso_translations_updated_at
          BEFORE UPDATE ON fitso_food_translations
          FOR EACH ROW
          EXECUTE FUNCTION update_fitso_translations_updated_at();
    `;
    
    await db.query(createTriggersSQL);
    console.log('✅ Triggers creados exitosamente');
    
    // 4. Verificar si ya hay datos
    const checkData = await db.query('SELECT COUNT(*) FROM fitso_foods');
    const foodCount = parseInt(checkData.rows[0].count);
    
    if (foodCount === 0) {
      console.log('🌱 Sembrando datos iniciales...');
      
      // Ejecutar scripts de seed
      const seedFoodTranslations = require('./seed-food-translations');
      const seedAdditionalEnglishFoods = require('./seed-additional-english-foods');
      const seedComprehensiveFoods = require('./seed-comprehensive-foods');
      
      await seedFoodTranslations();
      await seedAdditionalEnglishFoods();
      await seedComprehensiveFoods();
      
      console.log('✅ Datos iniciales sembrados exitosamente');
    } else {
      console.log(`ℹ️ Ya existen ${foodCount} alimentos en la base de datos`);
    }
    
    console.log('🎉 Despliegue de sistema FITSO Foods completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el despliegue:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  deployFitsoFoods()
    .then(() => {
      console.log('✅ Script de despliegue completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = deployFitsoFoods;
