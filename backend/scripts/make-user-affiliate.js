const { query } = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Script para hacer que un usuario existente sea afiliado
 * Esto le otorgará premium automáticamente
 */

async function makeUserAffiliate(userEmail, affiliateName, commissionPercentage = 30) {
  try {
    console.log('🔄 [AFFILIATE] Haciendo usuario afiliado:', userEmail);
    
    // 1. Buscar el usuario por email
    const userQuery = 'SELECT id, name, email FROM users WHERE email = $1';
    const userResult = await query(userQuery, [userEmail]);
    
    if (userResult.rows.length === 0) {
      throw new Error(`Usuario con email ${userEmail} no encontrado`);
    }
    
    const user = userResult.rows[0];
    console.log('👤 [AFFILIATE] Usuario encontrado:', user.name, user.email);
    
    // 2. Actualizar usuario para que sea afiliado
    const updateUserQuery = `
      UPDATE users 
      SET is_affiliate = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    await query(updateUserQuery, [user.id]);
    console.log('✅ [AFFILIATE] Usuario marcado como afiliado');
    
    // 3. Generar código de afiliado único
    const affiliateCode = `AFF_${user.name.toUpperCase().replace(/\s+/g, '')}_${Date.now().toString().slice(-4)}`;
    
    // 4. Crear código de afiliado
    const createCodeQuery = `
      INSERT INTO affiliate_codes (
        id, code, created_by, affiliate_name, commission_percentage, 
        is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    await query(createCodeQuery, [
      uuidv4(),
      affiliateCode,
      user.id,
      affiliateName || user.name,
      commissionPercentage,
      true
    ]);
    
    console.log('🎯 [AFFILIATE] Código de afiliado creado:', affiliateCode);
    
    // 5. Verificar que el usuario ahora tiene premium
    const premiumCheckQuery = 'SELECT is_affiliate, is_admin FROM users WHERE id = $1';
    const premiumResult = await query(premiumCheckQuery, [user.id]);
    const userData = premiumResult.rows[0];
    
    console.log('🎉 [AFFILIATE] Usuario convertido a afiliado exitosamente!');
    console.log('📊 [AFFILIATE] Datos del afiliado:');
    console.log('   - ID:', user.id);
    console.log('   - Nombre:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Código:', affiliateCode);
    console.log('   - Comisión:', commissionPercentage + '%');
    console.log('   - Es Afiliado:', userData.is_affiliate);
    console.log('   - Es Admin:', userData.is_admin);
    console.log('   - Premium Automático:', userData.is_affiliate || userData.is_admin ? '✅ SÍ' : '❌ NO');
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        affiliate_code: affiliateCode,
        commission_percentage: commissionPercentage,
        is_affiliate: userData.is_affiliate,
        is_admin: userData.is_admin,
        has_premium: userData.is_affiliate || userData.is_admin
      }
    };
    
  } catch (error) {
    console.error('❌ [AFFILIATE] Error haciendo usuario afiliado:', error);
    throw error;
  }
}

// Función para listar todos los afiliados
async function listAffiliates() {
  try {
    console.log('📋 [AFFILIATE] Listando todos los afiliados...');
    
    const affiliatesQuery = `
      SELECT 
        u.id, u.name, u.email, u.is_affiliate, u.is_admin,
        ac.code as affiliate_code, ac.affiliate_name, ac.commission_percentage,
        ac.is_active, ac.created_at
      FROM users u
      LEFT JOIN affiliate_codes ac ON u.id = ac.created_by
      WHERE u.is_affiliate = true OR u.is_admin = true
      ORDER BY ac.created_at DESC
    `;
    
    const result = await query(affiliatesQuery);
    
    console.log('👥 [AFFILIATE] Afiliados encontrados:', result.rows.length);
    result.rows.forEach((affiliate, index) => {
      console.log(`\n${index + 1}. ${affiliate.name} (${affiliate.email})`);
      console.log(`   - Código: ${affiliate.affiliate_code || 'N/A'}`);
      console.log(`   - Comisión: ${affiliate.commission_percentage || 'N/A'}%`);
      console.log(`   - Es Admin: ${affiliate.is_admin ? 'Sí' : 'No'}`);
      console.log(`   - Es Afiliado: ${affiliate.is_affiliate ? 'Sí' : 'No'}`);
      console.log(`   - Premium: ${(affiliate.is_affiliate || affiliate.is_admin) ? '✅ SÍ' : '❌ NO'}`);
    });
    
    return result.rows;
    
  } catch (error) {
    console.error('❌ [AFFILIATE] Error listando afiliados:', error);
    throw error;
  }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 [AFFILIATE] Uso del script:');
    console.log('   node make-user-affiliate.js <email> [nombre_afiliado] [comision_porcentaje]');
    console.log('   node make-user-affiliate.js list  (para listar afiliados)');
    console.log('\nEjemplos:');
    console.log('   node make-user-affiliate.js usuario@email.com "Mi Nombre" 25');
    console.log('   node make-user-affiliate.js admin@email.com "Admin" 30');
    console.log('   node make-user-affiliate.js list');
    process.exit(1);
  }
  
  if (args[0] === 'list') {
    listAffiliates()
      .then(() => {
        console.log('\n✅ [AFFILIATE] Lista completada');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ [AFFILIATE] Error:', error.message);
        process.exit(1);
      });
  } else {
    const email = args[0];
    const affiliateName = args[1] || null;
    const commissionPercentage = parseFloat(args[2]) || 30;
    
    makeUserAffiliate(email, affiliateName, commissionPercentage)
      .then((result) => {
        console.log('\n✅ [AFFILIATE] Proceso completado exitosamente');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ [AFFILIATE] Error:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { makeUserAffiliate, listAffiliates };


