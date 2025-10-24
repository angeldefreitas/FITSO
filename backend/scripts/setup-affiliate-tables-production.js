const { query } = require('../src/config/database');

async function setupAffiliateTables() {
  console.log('🔧 Configurando tablas de afiliados en producción...\n');

  try {
    // 1. Verificar si la tabla affiliate_codes existe
    console.log('1️⃣ Verificando tabla affiliate_codes...');
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'affiliate_codes'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ Tabla affiliate_codes ya existe');
    } else {
      console.log('❌ Tabla affiliate_codes no existe. Creándola...');
      
      // Crear tabla affiliate_codes
      await query(`
        CREATE TABLE affiliate_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(50) UNIQUE NOT NULL,
          affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          commission_percentage DECIMAL(5,2) DEFAULT 30.00,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Crear índices
      await query('CREATE INDEX idx_affiliate_codes_code ON affiliate_codes(code);');
      await query('CREATE INDEX idx_affiliate_codes_affiliate_id ON affiliate_codes(affiliate_id);');
      await query('CREATE INDEX idx_affiliate_codes_is_active ON affiliate_codes(is_active);');
      
      console.log('✅ Tabla affiliate_codes creada');
    }

    // 2. Verificar si la tabla user_referrals existe
    console.log('\n2️⃣ Verificando tabla user_referrals...');
    const checkReferrals = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_referrals'
      );
    `);
    
    if (checkReferrals.rows[0].exists) {
      console.log('✅ Tabla user_referrals ya existe');
    } else {
      console.log('❌ Tabla user_referrals no existe. Creándola...');
      
      // Crear tabla user_referrals
      await query(`
        CREATE TABLE user_referrals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          affiliate_code_id UUID NOT NULL REFERENCES affiliate_codes(id) ON DELETE CASCADE,
          referred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Crear índices
      await query('CREATE INDEX idx_user_referrals_user_id ON user_referrals(user_id);');
      await query('CREATE INDEX idx_user_referrals_affiliate_code_id ON user_referrals(affiliate_code_id);');
      
      console.log('✅ Tabla user_referrals creada');
    }

    // 3. Verificar si la tabla affiliate_commissions existe
    console.log('\n3️⃣ Verificando tabla affiliate_commissions...');
    const checkCommissions = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'affiliate_commissions'
      );
    `);
    
    if (checkCommissions.rows[0].exists) {
      console.log('✅ Tabla affiliate_commissions ya existe');
    } else {
      console.log('❌ Tabla affiliate_commissions no existe. Creándola...');
      
      // Crear tabla affiliate_commissions
      await query(`
        CREATE TABLE affiliate_commissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount DECIMAL(10,2) NOT NULL,
          commission_percentage DECIMAL(5,2) NOT NULL,
          commission_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Crear índices
      await query('CREATE INDEX idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);');
      await query('CREATE INDEX idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);');
      await query('CREATE INDEX idx_affiliate_commissions_status ON affiliate_commissions(status);');
      
      console.log('✅ Tabla affiliate_commissions creada');
    }

    // 4. Verificar si el campo is_affiliate existe en la tabla users
    console.log('\n4️⃣ Verificando campo is_affiliate en tabla users...');
    const checkField = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_affiliate'
    `);
    
    if (checkField.rows.length > 0) {
      console.log('✅ Campo is_affiliate ya existe');
    } else {
      console.log('❌ Campo is_affiliate no existe. Agregándolo...');
      
      await query('ALTER TABLE users ADD COLUMN is_affiliate BOOLEAN DEFAULT FALSE;');
      await query('CREATE INDEX idx_users_is_affiliate ON users(is_affiliate);');
      
      console.log('✅ Campo is_affiliate agregado');
    }

    console.log('\n🎉 ¡Tablas de afiliados configuradas exitosamente en producción!');

  } catch (error) {
    console.error('❌ Error configurando tablas de afiliados:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la configuración
setupAffiliateTables();
