-- Script para agregar la columna is_affiliate a la tabla users
-- Ejecutar este script en la base de datos de producción

-- Agregar columna is_affiliate a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar rendimiento en consultas de afiliados
CREATE INDEX IF NOT EXISTS idx_users_is_affiliate ON users(is_affiliate);

-- Verificar que la columna fue agregada correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_affiliate';
