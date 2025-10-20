-- Migración para añadir soporte de traducciones a alimentos
-- Solo añade las nuevas tablas sin modificar la estructura existente

-- Traducciones de alimentos por idioma
CREATE TABLE IF NOT EXISTS food_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS food_synonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    synonym VARCHAR(255) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_food_translations_food_id ON food_translations(food_id);
CREATE INDEX IF NOT EXISTS idx_food_translations_locale ON food_translations(locale);
CREATE INDEX IF NOT EXISTS idx_food_translations_name ON food_translations(name);
CREATE INDEX IF NOT EXISTS idx_food_synonyms_food_id ON food_synonyms(food_id);
CREATE INDEX IF NOT EXISTS idx_food_synonyms_locale ON food_synonyms(locale);
CREATE INDEX IF NOT EXISTS idx_food_synonyms_synonym ON food_synonyms(synonym);

-- Trigger para actualizar updated_at en food_translations
CREATE TRIGGER update_food_translations_updated_at BEFORE UPDATE ON food_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
