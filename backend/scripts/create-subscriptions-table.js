const { query } = require('../src/config/database');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * Script para crear la tabla subscriptions si no existe
 */

async function createSubscriptionsTable() {
  try {
    console.log('🔍 Verificando si la tabla subscriptions existe...\n');

    // Verificar si existe
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
      );
    `;
    
    const checkResult = await query(checkQuery);
    const exists = checkResult.rows[0].exists;

    if (exists) {
      console.log('✅ La tabla subscriptions ya existe');
      return;
    }

    console.log('📝 Creando tabla subscriptions...');

    // Crear la tabla
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(255) UNIQUE NOT NULL,
        original_transaction_id VARCHAR(255) NOT NULL,
        purchase_date TIMESTAMP NOT NULL,
        expires_date TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_trial_period BOOLEAN DEFAULT false,
        is_in_intro_offer_period BOOLEAN DEFAULT false,
        auto_renew_status BOOLEAN DEFAULT true,
        environment VARCHAR(20) DEFAULT 'production',
        receipt_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_transaction_id ON subscriptions(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON subscriptions(user_id, is_active);
    `;

    await query(createTableQuery);
    
    console.log('✅ Tabla subscriptions creada exitosamente');
    console.log('✅ Índices creados');

  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createSubscriptionsTable();

