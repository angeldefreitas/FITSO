const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initAffiliateTables() {
  try {
    console.log('🔧 Iniciando creación de tablas de afiliados...');
    
    // 1. Crear tabla affiliate_codes
    console.log('📝 Creando tabla affiliate_codes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        affiliate_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. Crear tabla user_referrals
    console.log('📝 Creando tabla user_referrals...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE SET NULL,
        referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_premium BOOLEAN DEFAULT FALSE,
        premium_conversion_date TIMESTAMP,
        UNIQUE(user_id)
      )
    `);
    
    // 3. Crear tabla affiliate_commissions
    console.log('📝 Creando tabla affiliate_commissions...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_commissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
        commission_amount DECIMAL(10,2) NOT NULL,
        commission_percentage DECIMAL(5,2) NOT NULL,
        subscription_amount DECIMAL(10,2) NOT NULL,
        payment_period_start DATE NOT NULL,
        payment_period_end DATE NOT NULL,
        is_paid BOOLEAN DEFAULT FALSE,
        paid_date TIMESTAMP,
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 4. Crear tabla affiliate_payments
    console.log('📝 Creando tabla affiliate_payments...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
        total_amount DECIMAL(10,2) NOT NULL,
        commission_count INTEGER NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_reference VARCHAR(255),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 5. Crear índices
    console.log('📝 Creando índices...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
      CREATE INDEX IF NOT EXISTS idx_affiliate_codes_active ON affiliate_codes(is_active);
      CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_referrals_affiliate_code ON user_referrals(affiliate_code);
      CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_code ON affiliate_commissions(affiliate_code);
      CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_is_paid ON affiliate_commissions(is_paid);
      CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate_code ON affiliate_payments(affiliate_code);
    `);
    
    // 6. Verificar que las tablas se crearon
    console.log('🔍 Verificando tablas creadas...');
    const tables = ['affiliate_codes', 'user_referrals', 'affiliate_commissions', 'affiliate_payments'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      console.log(`✅ Tabla ${table}: ${result.rows[0].exists ? 'CREADA' : 'ERROR'}`);
    }
    
    console.log('🎉 Tablas de afiliados creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando tablas de afiliados:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initAffiliateTables()
    .then(() => {
      console.log('🎉 Inicialización completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initAffiliateTables };
