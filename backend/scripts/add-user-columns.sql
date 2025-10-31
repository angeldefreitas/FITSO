-- Agregar columnas is_admin e is_affiliate a la tabla users

DO $$ 
BEGIN
    -- Agregar columna is_admin si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna is_admin agregada a users';
    ELSE
        RAISE NOTICE 'Columna is_admin ya existe en users';
    END IF;

    -- Agregar columna is_affiliate si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_affiliate'
    ) THEN
        ALTER TABLE users ADD COLUMN is_affiliate BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna is_affiliate agregada a users';
    ELSE
        RAISE NOTICE 'Columna is_affiliate ya existe en users';
    END IF;
END $$;

-- Marcar usuario angelfritas@gmail.com como admin
UPDATE users 
SET is_admin = true 
WHERE email = 'angelfritas@gmail.com';

-- Verificar que las columnas se agregaron
SELECT 
    column_name, 
    data_type, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('is_admin', 'is_affiliate');




