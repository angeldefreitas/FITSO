const { query } = require('../src/config/database');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * Script para verificar usuarios y suscripciones
 * Verifica que cada usuario tenga su propia suscripción y no estén compartidas
 */

async function checkUsersAndSubscriptions() {
  try {
    console.log('🔍 Verificando usuarios y suscripciones...\n');

    // Verificar qué columnas existen
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('is_affiliate', 'is_admin')
    `;
    const columnsResult = await query(checkColumnsQuery);
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    const hasIsAffiliate = existingColumns.includes('is_affiliate');
    const hasIsAdmin = existingColumns.includes('is_admin');

    // 1. Información de usuarios
    console.log('📋 1. Información de Usuarios:');
    console.log('='.repeat(80));
    
    let selectColumns = 'id, email, name, created_at';
    if (hasIsAffiliate) selectColumns += ', is_affiliate';
    if (hasIsAdmin) selectColumns += ', is_admin';
    
    const usersQuery = `SELECT ${selectColumns} FROM users WHERE email IN ('test1@gmail.com', 'test2@gmail.com') ORDER BY email`;
    const usersResult = await query(usersQuery);
    
    if (usersResult.rows.length === 0) {
      console.log('⚠️ No se encontraron usuarios test1@gmail.com o test2@gmail.com');
      return;
    }

    const users = {};
    for (const user of usersResult.rows) {
      console.log(`\n👤 Usuario: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.name || 'N/A'}`);
      if (hasIsAffiliate) console.log(`   Es Afiliado: ${user.is_affiliate ? 'Sí' : 'No'}`);
      if (hasIsAdmin) console.log(`   Es Admin: ${user.is_admin ? 'Sí' : 'No'}`);
      console.log(`   Creado: ${user.created_at}`);
      users[user.email] = user;
    }

    // Verificar si tabla subscriptions existe
    const checkTableQuery = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions')`;
    const tableResult = await query(checkTableQuery);
    const hasSubscriptionsTable = tableResult.rows[0].exists;

    // 2. Suscripciones
    console.log('\n\n📋 2. Suscripciones por Usuario:');
    console.log('='.repeat(80));
    
    if (!hasSubscriptionsTable) {
      console.log('⚠️ La tabla "subscriptions" NO EXISTE en la base de datos');
      console.log('⚠️ Esto significa que las suscripciones NO se están guardando en BD');
      console.log('⚠️ El webhook necesita crear esta tabla primero');
    } else {
      const subsQuery = `
        SELECT s.*, u.email
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        WHERE u.email IN ('test1@gmail.com', 'test2@gmail.com')
        ORDER BY u.email, s.created_at DESC
      `;
      const subsResult = await query(subsQuery);
      
      if (subsResult.rows.length === 0) {
        console.log('⚠️ No se encontraron suscripciones para estos usuarios');
      } else {
        console.log(`\n📊 Total suscripciones: ${subsResult.rows.length}\n`);
        
        const byUser = {};
        for (const sub of subsResult.rows) {
          if (!byUser[sub.email]) byUser[sub.email] = [];
          byUser[sub.email].push(sub);
        }

        for (const email of Object.keys(byUser)) {
          const userSubs = byUser[email];
          const active = userSubs.filter(s => s.is_active);
          const inactive = userSubs.filter(s => !s.is_active);
          
          console.log(`\n👤 ${email}:`);
          console.log(`   Total: ${userSubs.length} | Activas: ${active.length} | Inactivas: ${inactive.length}`);
          
          if (active.length > 0) {
            console.log('\n   📦 ACTIVAS:');
            for (const sub of active) {
              console.log(`      Producto: ${sub.product_id}`);
              console.log(`      Transaction ID: ${sub.transaction_id}`);
              console.log(`      Comprado: ${sub.purchase_date}`);
              console.log(`      Expira: ${sub.expires_date}`);
            }
          }
        }
      }

      // 3. Verificar duplicados
      console.log('\n\n📋 3. Verificación de Duplicados:');
      console.log('='.repeat(80));
      
      const dupQuery = `
        SELECT transaction_id, COUNT(*) as count, STRING_AGG(DISTINCT u.email, ', ') as usuarios
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        WHERE u.email IN ('test1@gmail.com', 'test2@gmail.com')
        GROUP BY transaction_id
        HAVING COUNT(*) > 1
      `;
      const dupResult = await query(dupQuery);
      
      if (dupResult.rows.length > 0) {
        console.log('❌ PROBLEMA: Transaction IDs duplicados!\n');
        for (const dup of dupResult.rows) {
          console.log(`   Transaction ID: ${dup.transaction_id}`);
          console.log(`   Usado por: ${dup.usuarios} (${dup.count} veces)`);
        }
      } else {
        console.log('✅ No hay transaction_ids duplicados');
      }

      // 4. Múltiples suscripciones activas
      console.log('\n\n📋 4. Múltiples Suscripciones Activas:');
      console.log('='.repeat(80));
      
      const multiQuery = `
        SELECT u.email, COUNT(*) as count
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        WHERE u.email IN ('test1@gmail.com', 'test2@gmail.com') AND s.is_active = true
        GROUP BY u.email
        HAVING COUNT(*) > 1
      `;
      const multiResult = await query(multiQuery);
      
      if (multiResult.rows.length > 0) {
        console.log('⚠️ ADVERTENCIA: Usuarios con múltiples suscripciones activas:\n');
        for (const m of multiResult.rows) {
          console.log(`   ${m.email}: ${m.count} suscripciones activas`);
        }
      } else {
        console.log('✅ Cada usuario tiene máximo 1 suscripción activa (o ninguna)');
      }
    }

    // Resumen
    console.log('\n\n📋 RESUMEN:');
    console.log('='.repeat(80));
    
    for (const email of Object.keys(users)) {
      const user = users[email];
      console.log(`\n👤 ${email} (${user.id}):`);
      
      if (hasSubscriptionsTable) {
        const countQuery = `
          SELECT 
            COUNT(CASE WHEN is_active THEN 1 END) as active,
            COUNT(*) as total
          FROM subscriptions 
          WHERE user_id = $1
        `;
        const countResult = await query(countQuery, [user.id]);
        const counts = countResult.rows[0];
        
        console.log(`   Suscripciones activas: ${counts.active || 0}`);
        console.log(`   Total suscripciones: ${counts.total || 0}`);
        
        if (counts.active > 1) {
          console.log(`   ⚠️ PROBLEMA: Tiene ${counts.active} suscripciones activas (debe ser máximo 1)`);
        } else if (counts.active === 1) {
          console.log(`   ✅ Estado: Premium activo`);
        } else {
          console.log(`   ℹ️ Estado: No premium`);
        }
      } else {
        console.log(`   ⚠️ No se puede verificar - tabla subscriptions no existe`);
      }
    }

    console.log('\n✅ Verificación completada\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkUsersAndSubscriptions();
