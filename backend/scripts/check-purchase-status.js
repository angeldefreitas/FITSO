/**
 * Script para verificar el estado de una compra y comisiones generadas
 */

const axios = require('axios');
require('dotenv').config();
const { query } = require('../src/config/database');

const BACKEND_URL = process.env.BACKEND_URL || 'https://fitso.onrender.com';
const USER_EMAIL = 'test9@gmail.com';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[33m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkUserStatus() {
  try {
    log('\n👤 Verificando usuario en BD...', 'cyan');
    
    const userResult = await query(
      'SELECT id, email, name, is_affiliate, created_at FROM users WHERE email = $1',
      [USER_EMAIL]
    );
    
    if (userResult.rows.length === 0) {
      log('❌ Usuario no encontrado', 'red');
      return null;
    }
    
    const user = userResult.rows[0];
    log(`✅ Usuario encontrado:`, 'green');
    log(`   ID: ${user.id}`, 'blue');
    log(`   Email: ${user.email}`, 'blue');
    log(`   Nombre: ${user.name}`, 'blue');
    log(`   Afiliado: ${user.is_affiliate ? 'Sí' : 'No'}`, 'blue');
    
    return user;
  } catch (error) {
    log(`❌ Error consultando usuario: ${error.message}`, 'red');
    return null;
  }
}

async function checkReferrals(userId) {
  try {
    log('\n🔗 Verificando referidos...', 'cyan');
    
    const referralResult = await query(
      'SELECT * FROM user_referrals WHERE user_id = $1',
      [userId]
    );
    
    if (referralResult.rows.length === 0) {
      log('ℹ️ Usuario no tiene código de referencia', 'yellow');
      return null;
    }
    
    const referral = referralResult.rows[0];
    log(`✅ Código de referencia encontrado:`, 'green');
    log(`   Código: ${referral.affiliate_code}`, 'blue');
    log(`   Es Premium: ${referral.is_premium ? 'Sí' : 'No'}`, 'blue');
    log(`   Fecha: ${referral.created_at}`, 'blue');
    
    return referral;
  } catch (error) {
    log(`⚠️ Error consultando referidos: ${error.message}`, 'yellow');
    return null;
  }
}

async function checkCommissions(userId, affiliateCode = null) {
  try {
    log('\n💰 Verificando comisiones...', 'cyan');
    
    let commissionQuery;
    let params;
    
    if (affiliateCode) {
      commissionQuery = `
        SELECT 
          ac.*,
          af.affiliate_name
        FROM affiliate_commissions ac
        LEFT JOIN affiliate_codes af ON ac.affiliate_code = af.code
        WHERE ac.user_id = $1 AND ac.affiliate_code = $2
        ORDER BY ac.created_at DESC
      `;
      params = [userId, affiliateCode];
    } else {
      commissionQuery = `
        SELECT 
          ac.*,
          af.affiliate_name
        FROM affiliate_commissions ac
        LEFT JOIN affiliate_codes af ON ac.affiliate_code = af.code
        WHERE ac.user_id = $1
        ORDER BY ac.created_at DESC
      `;
      params = [userId];
    }
    
    const commissionResult = await query(commissionQuery, params);
    
    if (commissionResult.rows.length === 0) {
      log('ℹ️ No se encontraron comisiones para este usuario', 'yellow');
      return [];
    }
    
    log(`✅ Comisiones encontradas: ${commissionResult.rows.length}`, 'green');
    
    commissionResult.rows.forEach((commission, index) => {
      log(`\n   Comisión #${index + 1}:`, 'cyan');
      log(`   ID: ${commission.id}`, 'blue');
      log(`   Afiliado: ${commission.affiliate_code} (${commission.affiliate_name || 'N/A'})`, 'blue');
      log(`   Monto: $${commission.commission_amount}`, 'blue');
      log(`   Porcentaje: ${commission.commission_percentage}%`, 'blue');
      log(`   Pagado: ${commission.is_paid ? 'Sí ✅' : 'No ⏳'}`, commission.is_paid ? 'green' : 'yellow');
      log(`   Fecha: ${commission.created_at}`, 'blue');
      if (commission.payment_period_start && commission.payment_period_end) {
        log(`   Período: ${commission.payment_period_start.toISOString().split('T')[0]} a ${commission.payment_period_end.toISOString().split('T')[0]}`, 'blue');
      }
    });
    
    return commissionResult.rows;
  } catch (error) {
    log(`❌ Error consultando comisiones: ${error.message}`, 'red');
    return [];
  }
}

async function checkBackendStatus() {
  try {
    log('\n🌐 Verificando estado del backend...', 'cyan');
    
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 10000 });
    
    log(`✅ Backend funcionando`, 'green');
    log(`   Database: ${response.data.database}`, 'blue');
    log(`   Environment: ${response.data.environment}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Backend no disponible: ${error.message}`, 'red');
    return false;
  }
}

async function checkSubscriptionStatus(userId) {
  try {
    log('\n📱 Verificando estado de suscripción...', 'cyan');
    
    // Intentar obtener desde el backend
    try {
      const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: USER_EMAIL,
        password: '211299'
      });
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.data.token;
        
        const statusResponse = await axios.get(
          `${BACKEND_URL}/api/subscriptions/status/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (statusResponse.data.success) {
          const status = statusResponse.data.data;
          log(`✅ Estado de suscripción:`, 'green');
          log(`   Premium: ${status.isPremium ? 'Sí ✅' : 'No ❌'}`, status.isPremium ? 'green' : 'yellow');
          log(`   Tipo: ${status.subscriptionType || 'N/A'}`, 'blue');
          log(`   Expira: ${status.expiresAt || 'N/A'}`, 'blue');
        }
      }
    } catch (error) {
      log(`⚠️ No se pudo verificar estado vía API (puede ser normal)`, 'yellow');
    }
    
    // Verificar en BD directamente si existe tabla subscriptions
    try {
      const subResult = await query(
        `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      
      if (subResult.rows.length > 0) {
        const sub = subResult.rows[0];
        log(`✅ Suscripción en BD:`, 'green');
        log(`   Tipo: ${sub.subscription_type}`, 'blue');
        log(`   Estado: ${sub.status}`, 'blue');
        log(`   Creada: ${sub.created_at}`, 'blue');
      } else {
        log(`ℹ️ No hay suscripciones registradas en BD (normal si se usa solo RevenueCat)`, 'yellow');
      }
    } catch (error) {
      // La tabla puede no existir, es normal
      log(`ℹ️ Tabla subscriptions no disponible (normal)`, 'yellow');
    }
  } catch (error) {
    log(`⚠️ Error verificando suscripción: ${error.message}`, 'yellow');
  }
}

async function main() {
  log('\n🎯 === VERIFICACIÓN DE ESTADO DE COMPRA ===', 'magenta');
  
  // 1. Verificar backend
  const backendOk = await checkBackendStatus();
  if (!backendOk) {
    log('\n⚠️ Continuando sin verificación del backend...', 'yellow');
  }
  
  // 2. Verificar usuario
  const user = await checkUserStatus();
  if (!user) {
    log('\n❌ Usuario no encontrado. Abortando...', 'red');
    process.exit(1);
  }
  
  // 3. Verificar referidos
  const referral = await checkReferrals(user.id);
  
  // 4. Verificar comisiones
  await checkCommissions(user.id, referral?.affiliate_code);
  
  // 5. Verificar estado de suscripción
  await checkSubscriptionStatus(user.id);
  
  log('\n✅ === VERIFICACIÓN COMPLETADA ===', 'green');
  log('\n📝 Para ver logs en Render:', 'cyan');
  log('   1. Ve a: https://dashboard.render.com', 'blue');
  log('   2. Selecciona: fitso-backend', 'blue');
  log('   3. Pestaña: Logs', 'blue');
  log('   4. Busca: [REVENUECAT]', 'blue');
}

// Ejecutar
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { checkUserStatus, checkCommissions, checkReferrals };

