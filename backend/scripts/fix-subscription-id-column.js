const { query, closePool } = require('../src/config/database');

async function fixSubscriptionIdColumn() {
  try {
    console.log('🔄 Corrigiendo tipo de columna subscription_id...\n');

    // 1. Cambiar tipo de columna
    await query(`
      ALTER TABLE affiliate_commissions 
      ALTER COLUMN subscription_id TYPE TEXT USING subscription_id::TEXT
    `);
    
    console.log('✅ Columna actualizada de UUID a TEXT\n');

    // 2. Verificar el cambio
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'affiliate_commissions' 
        AND column_name = 'subscription_id'
    `);

    console.log('📊 Estado de la columna:');
    console.log(result.rows[0]);
    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

fixSubscriptionIdColumn();

