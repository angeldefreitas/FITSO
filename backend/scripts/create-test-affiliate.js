require('dotenv').config();
const { query } = require('../src/config/database');

async function createTestAffiliate() {
  try {
    console.log('🔄 Creando código de afiliado de prueba...');
    
    const affiliateName = 'FITNESS_INFLUENCER';
    const email = 'influencer.test@fitso.com';
    const commissionPercentage = 30;
    
    // Generar código único
    const code = affiliateName.toUpperCase().replace(/\s+/g, '_');
    
    // Verificar si ya existe
    const existing = await query(
      'SELECT * FROM affiliate_codes WHERE code = $1',
      [code]
    );
    
    if (existing.rows.length > 0) {
      console.log('⚠️  El código ya existe:', code);
      console.log('📋 Datos del código existente:');
      console.log(existing.rows[0]);
      return;
    }
    
    // Crear código
    const result = await query(
      `INSERT INTO affiliate_codes 
       (code, affiliate_name, email, commission_percentage, is_active) 
       VALUES ($1, $2, $3, $4, true) 
       RETURNING *`,
      [code, affiliateName, email, commissionPercentage]
    );
    
    console.log('✅ Código de afiliado creado exitosamente:');
    console.log('');
    console.log('📋 DATOS DEL AFILIADO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Código: ${result.rows[0].code}`);
    console.log(`   Nombre: ${result.rows[0].affiliate_name}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Comisión: ${result.rows[0].commission_percentage}%`);
    console.log(`   Estado: ${result.rows[0].is_active ? 'Activo ✅' : 'Inactivo'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 PRÓXIMO PASO:');
    console.log(`   1. Registra un usuario con el código: ${code}`);
    console.log('   2. Haz que ese usuario compre premium');
    console.log('   3. Verifica que se genere la comisión');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

createTestAffiliate();

