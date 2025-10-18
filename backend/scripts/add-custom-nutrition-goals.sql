-- Migración para añadir columna custom_nutrition_goals
-- Ejecutar este script para actualizar la base de datos existente

-- Añadir columna custom_nutrition_goals a la tabla user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS custom_nutrition_goals JSONB;

-- Comentario para documentar la columna
COMMENT ON COLUMN user_profiles.custom_nutrition_goals IS 'Objetivos nutricionales personalizados del usuario (calorías, proteínas, carbohidratos, grasas)';
