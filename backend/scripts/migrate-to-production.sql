-- =====================================================
-- MIGRACIÓN A PRODUCCIÓN - SISTEMA DE AFILIADOS
-- =====================================================
-- Este script crea todas las tablas necesarias para el sistema de afiliados
-- Ejecutar en Render PostgreSQL antes de configurar Stripe

-- 1. Agregar columna stripe_account_id a users si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'stripe_account_id'
    ) THEN
        ALTER TABLE users ADD COLUMN stripe_account_id VARCHAR(255);
        RAISE NOTICE 'Columna stripe_account_id agregada a users';
    ELSE
        RAISE NOTICE 'Columna stripe_account_id ya existe en users';
    END IF;
END $$;

-- 2. Crear tabla affiliate_codes si no existe
CREATE TABLE IF NOT EXISTS affiliate_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    created_by UUID NOT NULL,
    affiliate_name VARCHAR(255) NOT NULL,
    commission_percentage DECIMAL(5,2) DEFAULT 30.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Crear tabla user_referrals si no existe
CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    affiliate_code VARCHAR(50) NOT NULL,
    referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_premium BOOLEAN DEFAULT false,
    premium_conversion_date TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (affiliate_code) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
    UNIQUE(user_id, affiliate_code)
);

-- 4. Crear tabla affiliate_commissions si no existe
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_code VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL,
    subscription_id VARCHAR(255),
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    is_cancelled BOOLEAN DEFAULT false,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (affiliate_code) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Crear tabla affiliate_payments si no existe
CREATE TABLE IF NOT EXISTS affiliate_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_code VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    stripe_transfer_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    
    FOREIGN KEY (affiliate_code) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_created_by ON affiliate_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_active ON affiliate_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_affiliate_code ON user_referrals(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_user_referrals_premium ON user_referrals(is_premium);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_code ON affiliate_commissions(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_paid ON affiliate_commissions(is_paid);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_cancelled ON affiliate_commissions(is_cancelled);

CREATE INDEX IF NOT EXISTS idx_affiliate_payments_user_id ON affiliate_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_code ON affiliate_payments(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_status ON affiliate_payments(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_created_at ON affiliate_payments(created_at);

-- 7. Agregar comentarios para documentación
COMMENT ON TABLE affiliate_codes IS 'Códigos de afiliados creados por usuarios';
COMMENT ON TABLE user_referrals IS 'Referencias de usuarios a códigos de afiliados';
COMMENT ON TABLE affiliate_commissions IS 'Comisiones generadas por referidos premium';
COMMENT ON TABLE affiliate_payments IS 'Pagos realizados a afiliados';

COMMENT ON COLUMN affiliate_codes.commission_percentage IS 'Porcentaje de comisión (ej: 30.00 = 30%)';
COMMENT ON COLUMN user_referrals.is_premium IS 'Indica si el usuario referido se suscribió a premium';
COMMENT ON COLUMN affiliate_commissions.commission_amount IS 'Monto de la comisión en USD';
COMMENT ON COLUMN affiliate_commissions.is_cancelled IS 'Indica si la comisión fue cancelada por cancelación de suscripción';
COMMENT ON COLUMN affiliate_payments.amount IS 'Monto del pago en USD';
COMMENT ON COLUMN affiliate_payments.stripe_transfer_id IS 'ID de la transferencia en Stripe';
COMMENT ON COLUMN affiliate_payments.status IS 'Estado del pago: pending, paid, failed, cancelled';

-- 8. Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('affiliate_codes', 'user_referrals', 'affiliate_commissions', 'affiliate_payments');
    
    IF table_count = 4 THEN
        RAISE NOTICE '✅ Todas las tablas del sistema de afiliados se crearon correctamente';
    ELSE
        RAISE NOTICE '⚠️ Solo se crearon % de 4 tablas esperadas', table_count;
    END IF;
END $$;

-- 9. Mostrar resumen de la migración
SELECT 
    'affiliate_codes' as tabla,
    COUNT(*) as registros
FROM affiliate_codes
UNION ALL
SELECT 
    'user_referrals' as tabla,
    COUNT(*) as registros
FROM user_referrals
UNION ALL
SELECT 
    'affiliate_commissions' as tabla,
    COUNT(*) as registros
FROM affiliate_commissions
UNION ALL
SELECT 
    'affiliate_payments' as tabla,
    COUNT(*) as registros
FROM affiliate_payments;

-- =====================================================
-- MIGRACIÓN COMPLETADA
-- =====================================================
-- Próximos pasos:
-- 1. Configurar variables de entorno de Stripe en Render
-- 2. Configurar webhooks en Stripe Dashboard
-- 3. Probar el sistema con cuentas de prueba
-- =====================================================


