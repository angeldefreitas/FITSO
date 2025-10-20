-- Crear tabla específica para alimentos FITSO con traducciones
-- Dejamos la tabla 'foods' original intacta para datos locales

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

-- Traducciones de alimentos FITSO por idioma
CREATE TABLE IF NOT EXISTS fitso_food_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID REFERENCES fitso_foods(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL, -- 'es', 'en', 'pt', ...
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_short VARCHAR(20),
    unit_long VARCHAR(50),
    is_machine_translated BOOLEAN DEFAULT FALSE,
    is_reviewed BOOLEAN DEFAULT FALSE,
    source_lang VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(food_id, locale)
);

-- Sinónimos para mejorar búsqueda por idioma
CREATE TABLE IF NOT EXISTS fitso_food_synonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID REFERENCES fitso_foods(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    synonym VARCHAR(255) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_fitso_foods_name ON fitso_foods(name);
CREATE INDEX IF NOT EXISTS idx_fitso_foods_barcode ON fitso_foods(barcode);
CREATE INDEX IF NOT EXISTS idx_fitso_foods_category ON fitso_foods(category);
CREATE INDEX IF NOT EXISTS idx_fitso_foods_is_custom ON fitso_foods(is_custom);

CREATE INDEX IF NOT EXISTS idx_fitso_food_translations_food_id ON fitso_food_translations(food_id);
CREATE INDEX IF NOT EXISTS idx_fitso_food_translations_locale ON fitso_food_translations(locale);
CREATE INDEX IF NOT EXISTS idx_fitso_food_translations_name ON fitso_food_translations(name);

CREATE INDEX IF NOT EXISTS idx_fitso_food_synonyms_food_id ON fitso_food_synonyms(food_id);
CREATE INDEX IF NOT EXISTS idx_fitso_food_synonyms_locale ON fitso_food_synonyms(locale);
CREATE INDEX IF NOT EXISTS idx_fitso_food_synonyms_synonym ON fitso_food_synonyms(synonym);

-- Triggers para actualizar updated_at
CREATE TRIGGER update_fitso_foods_updated_at BEFORE UPDATE ON fitso_foods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitso_food_translations_updated_at BEFORE UPDATE ON fitso_food_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
