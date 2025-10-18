-- Script para actualizar el esquema de base de datos con aislamiento completo por usuario
-- Ejecutar: psql -U fitso_user -d fitso_db -f update-schema-user-isolation.sql

-- Tabla de comidas diarias del usuario
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
);

-- Tabla de historial de comidas del usuario
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
);

-- Tabla de comidas personalizadas del usuario
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
);

-- Tabla de seguimiento de calorías diarias
CREATE TABLE IF NOT EXISTS user_daily_calories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    calories_burned INTEGER NOT NULL DEFAULT 0,
    calories_goal INTEGER NOT NULL DEFAULT 750,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entry_date)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_daily_meals_user_date ON user_daily_meals(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_user_meal_history_user_last_used ON user_meal_history(user_id, last_used);
CREATE INDEX IF NOT EXISTS idx_user_custom_foods_user ON user_custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_calories_user_date ON user_daily_calories(user_id, entry_date);

-- Comentarios
COMMENT ON TABLE user_daily_meals IS 'Comidas diarias específicas por usuario';
COMMENT ON TABLE user_meal_history IS 'Historial de comidas específico por usuario';
COMMENT ON TABLE user_custom_foods IS 'Comidas personalizadas específicas por usuario';
COMMENT ON TABLE user_daily_calories IS 'Seguimiento de calorías específico por usuario';

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'user_%'
ORDER BY table_name;
