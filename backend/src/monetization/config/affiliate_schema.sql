-- Esquema para Sistema de Afiliados de Fitso
-- Ejecutar después del schema principal

-- Tabla de códigos de referencia (afiliados)
CREATE TABLE IF NOT EXISTS affiliate_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Código único del afiliado
    affiliate_name VARCHAR(255) NOT NULL, -- Nombre del influencer/afiliado
    email VARCHAR(255), -- Email del afiliado (opcional)
    commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- % de comisión
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Quien creó el código
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de referencias de usuarios (tracking de referidos)
CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE SET NULL,
    referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_premium BOOLEAN DEFAULT FALSE, -- Si el usuario se convirtió a premium
    premium_conversion_date TIMESTAMP, -- Cuándo se convirtió a premium
    UNIQUE(user_id) -- Un usuario solo puede tener una referencia
);

-- Tabla de comisiones ganadas
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    commission_amount DECIMAL(10,2) NOT NULL, -- Monto de la comisión
    commission_percentage DECIMAL(5,2) NOT NULL, -- % aplicado
    subscription_amount DECIMAL(10,2) NOT NULL, -- Monto total de la suscripción
    payment_period_start DATE NOT NULL, -- Inicio del período de pago
    payment_period_end DATE NOT NULL, -- Fin del período de pago
    is_paid BOOLEAN DEFAULT FALSE, -- Si la comisión ya fue pagada
    paid_date TIMESTAMP, -- Cuándo fue pagada
    payment_method VARCHAR(50), -- Método de pago (paypal, transferencia, etc.)
    payment_reference VARCHAR(255), -- Referencia del pago
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos a afiliados
CREATE TABLE IF NOT EXISTS affiliate_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL, -- Monto total del pago
    commission_count INTEGER NOT NULL, -- Número de comisiones incluidas
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_active ON affiliate_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_affiliate_code ON user_referrals(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_code ON affiliate_commissions(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_is_paid ON affiliate_commissions(is_paid);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_payment_period ON affiliate_commissions(payment_period_start, payment_period_end);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate_code ON affiliate_payments(affiliate_code);

-- Triggers para actualizar updated_at
CREATE TRIGGER update_affiliate_codes_updated_at BEFORE UPDATE ON affiliate_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_referrals_updated_at BEFORE UPDATE ON user_referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at BEFORE UPDATE ON affiliate_commissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar código de referencia único
CREATE OR REPLACE FUNCTION generate_affiliate_code(affiliate_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 1;
BEGIN
    -- Crear código base a partir del nombre
    base_code := UPPER(REGEXP_REPLACE(affiliate_name, '[^A-Za-z0-9]', '', 'g'));
    
    -- Limitar a 8 caracteres máximo
    IF LENGTH(base_code) > 8 THEN
        base_code := LEFT(base_code, 8);
    END IF;
    
    -- Si está vacío, usar código genérico
    IF base_code = '' THEN
        base_code := 'AFFILIATE';
    END IF;
    
    final_code := base_code;
    
    -- Verificar que el código sea único, si no, agregar números
    WHILE EXISTS (SELECT 1 FROM affiliate_codes WHERE code = final_code) LOOP
        final_code := base_code || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular comisión
CREATE OR REPLACE FUNCTION calculate_commission(
    subscription_amount DECIMAL,
    commission_percentage DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (subscription_amount * commission_percentage) / 100;
END;
$$ LANGUAGE plpgsql;
