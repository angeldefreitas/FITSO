-- Agregar columna stripe_account_id a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);

-- Crear tabla de pagos de afiliados
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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_user_id ON affiliate_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate_code ON affiliate_payments(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_status ON affiliate_payments(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_created_at ON affiliate_payments(created_at);

-- Agregar columna is_cancelled a affiliate_commissions si no existe
ALTER TABLE affiliate_commissions ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE;
ALTER TABLE affiliate_commissions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Crear índice para is_cancelled
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_cancelled ON affiliate_commissions(is_cancelled);

-- Comentarios para documentación
COMMENT ON TABLE affiliate_payments IS 'Registro de pagos realizados a afiliados';
COMMENT ON COLUMN affiliate_payments.amount IS 'Monto del pago en USD';
COMMENT ON COLUMN affiliate_payments.stripe_transfer_id IS 'ID de la transferencia en Stripe';
COMMENT ON COLUMN affiliate_payments.status IS 'Estado del pago: pending, paid, failed, cancelled';
COMMENT ON COLUMN affiliate_payments.paid_at IS 'Fecha y hora cuando se completó el pago';

COMMENT ON COLUMN affiliate_commissions.is_cancelled IS 'Indica si la comisión fue cancelada por cancelación de suscripción';
COMMENT ON COLUMN affiliate_commissions.paid_at IS 'Fecha y hora cuando se pagó la comisión';
