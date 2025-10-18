const { query } = require('../src/config/database');

async function updateSchema() {
  try {
    console.log('🔄 Actualizando esquema de base de datos para aislamiento por usuario...');

    // Tabla de comidas diarias del usuario
    await query(`
      CREATE TABLE IF NOT EXISTS user_daily_meals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        calories DECIMAL(8,2) NOT NULL,
        protein DECIMAL(8,2) NOT NULL DEFAULT 0,
        carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
        fat DECIMAL(8,2) NOT NULL DEFAULT 0,
        fiber DECIMAL(8,2) DEFAULT 0,
        sugar DECIMAL(8,2) DEFAULT 0,
        sodium DECIMAL(8,2) DEFAULT 0,
        meal_type VARCHAR(20) CHECK (meal_type IN ('Desayuno', 'Almuerzo', 'Snacks', 'Cena')),
        source VARCHAR(20) CHECK (source IN ('manual', 'database', 'barcode', 'ai')),
        source_data JSONB,
        quantity DECIMAL(8,2) DEFAULT 1,
        entry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla user_daily_meals creada');

    // Tabla de historial de comidas del usuario
    await query(`
      CREATE TABLE IF NOT EXISTS user_meal_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        calories DECIMAL(8,2) NOT NULL,
        protein DECIMAL(8,2) NOT NULL DEFAULT 0,
        carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
        fat DECIMAL(8,2) NOT NULL DEFAULT 0,
        source VARCHAR(20) CHECK (source IN ('manual', 'database', 'barcode', 'ai')),
        source_data JSONB,
        times_used INTEGER DEFAULT 1,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla user_meal_history creada');

    // Tabla de comidas personalizadas del usuario
    await query(`
      CREATE TABLE IF NOT EXISTS user_custom_foods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        calories DECIMAL(8,2) NOT NULL,
        protein DECIMAL(8,2) NOT NULL DEFAULT 0,
        carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
        fat DECIMAL(8,2) NOT NULL DEFAULT 0,
        fiber DECIMAL(8,2) DEFAULT 0,
        sugar DECIMAL(8,2) DEFAULT 0,
        sodium DECIMAL(8,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla user_custom_foods creada');

    // Tabla de seguimiento de calorías diarias
    await query(`
      CREATE TABLE IF NOT EXISTS user_daily_calories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        calories_burned INTEGER NOT NULL DEFAULT 0,
        calories_goal INTEGER NOT NULL DEFAULT 750,
        entry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, entry_date)
      )
    `);
    console.log('✅ Tabla user_daily_calories creada');

    // Crear índices
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_daily_meals_user_date 
      ON user_daily_meals(user_id, entry_date)
    `);
    console.log('✅ Índice user_daily_meals creado');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_meal_history_user_last_used 
      ON user_meal_history(user_id, last_used)
    `);
    console.log('✅ Índice user_meal_history creado');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_custom_foods_user 
      ON user_custom_foods(user_id)
    `);
    console.log('✅ Índice user_custom_foods creado');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_daily_calories_user_date 
      ON user_daily_calories(user_id, entry_date)
    `);
    console.log('✅ Índice user_daily_calories creado');

    // Verificar tablas creadas
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'user_%'
      ORDER BY table_name
    `);

    console.log('\n📋 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n🎉 Esquema actualizado exitosamente!');
    console.log('💡 Ahora todos los datos están aislados por user_id');

  } catch (error) {
    console.error('❌ Error actualizando esquema:', error);
  } finally {
    process.exit(0);
  }
}

updateSchema();
