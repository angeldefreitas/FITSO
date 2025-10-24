-- Agregar campo is_affiliate a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_is_affiliate ON users(is_affiliate);

-- Actualizar usuarios existentes que tienen códigos de afiliado
UPDATE users 
SET is_affiliate = TRUE 
WHERE id IN (
  SELECT DISTINCT created_by 
  FROM affiliate_codes 
  WHERE created_by IS NOT NULL
);
