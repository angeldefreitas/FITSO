#!/usr/bin/env node

/**
 * Script para inicializar solo las tablas de afiliados
 */

require('dotenv').config();
const { query } = require('../src/config/database');

async function initAffiliateTables() {
  try {
    console.log('🔍 Inicializando tablas de afiliados...');

    // Crear tabla affiliate_codes
    console.log('📋 Creando tabla affiliate_codes...');
    await query(`
      CREATE TABLE IF NOT EXISTS affiliate_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        affiliate_id UUID NOT NULL,
        commission_percentage DECIMAL(5,2) DEFAULT 30.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla user_referrals
    console.log('📋 Creando tabla user_referrals...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        affiliate_code_id UUID NOT NULL,
        referred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_code_id) REFERENCES affiliate_codes(id)
      )
    `);

    // Crear tabla affiliate_commissions
    console.log('📋 Creando tabla affiliate_commissions...');
    await query(`
      CREATE TABLE IF NOT EXISTS affiliate_commissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id UUID NOT NULL,
        user_id UUID NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        commission_percentage DECIMAL(5,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla affiliate_payments
    console.log('📋 Creando tabla affiliate_payments...');
    await query(`
      CREATE TABLE IF NOT EXISTS affiliate_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id UUID NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        payment_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Todas las tablas de afiliados creadas exitosamente!');

  } catch (error) {
    console.error('❌ Error inicializando tablas:', error.message);
    process.exit(1);
  }
}

initAffiliateTables()
  .then(() => {
    console.log('✅ Inicialización completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
