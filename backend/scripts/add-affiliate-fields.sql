-- Agregar campos de afiliado a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Hacer admin a angelfritas@gmail.com
UPDATE users SET is_admin = TRUE WHERE email = 'angelfritas@gmail.com';

-- Mostrar usuarios admin
SELECT id, email, name, is_admin, is_affiliate FROM users WHERE is_admin = TRUE;
