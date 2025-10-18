const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'fitso_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fitso_db',
  password: process.env.DB_PASSWORD || 'fitso_password',
  port: process.env.DB_PORT || 5432,
});

async function checkWeightSync() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando sincronización de peso para angelfritas@gmail.com...\n');
    
    // 1. Obtener información del usuario
    const userQuery = `
      SELECT id, email, name, created_at 
      FROM users 
      WHERE email = 'angelfritas@gmail.com'
    `;
    const userResult = await client.query(userQuery);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`👤 Usuario: ${user.name} (${user.email})`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📅 Creado: ${user.created_at}\n`);
    
    // 2. Obtener datos biométricos del perfil
    const profileQuery = `
      SELECT age, gender, height, weight, activity_level, goal, target_weight, updated_at
      FROM user_profiles 
      WHERE user_id = $1
    `;
    const profileResult = await client.query(profileQuery, [user.id]);
    
    if (profileResult.rows.length === 0) {
      console.log('❌ No se encontró perfil de usuario');
      return;
    }
    
    const profile = profileResult.rows[0];
    console.log('📊 DATOS BIOMÉTRICOS:');
    console.log(`   - Edad: ${profile.age} años`);
    console.log(`   - Género: ${profile.gender}`);
    console.log(`   - Altura: ${profile.height} cm`);
    console.log(`   - Peso: ${profile.weight} kg`);
    console.log(`   - Nivel de actividad: ${profile.activity_level}`);
    console.log(`   - Objetivo: ${profile.goal}`);
    console.log(`   - Peso objetivo: ${profile.target_weight} kg`);
    console.log(`   - Última actualización: ${profile.updated_at}\n`);
    
    // 3. Obtener el último registro de peso en progress tracker
    const weightQuery = `
      SELECT id, weight, entry_date, created_at
      FROM weight_entries 
      WHERE user_id = $1 
      ORDER BY entry_date DESC, created_at DESC 
      LIMIT 1
    `;
    const weightResult = await client.query(weightQuery, [user.id]);
    
    if (weightResult.rows.length === 0) {
      console.log('❌ No se encontraron registros de peso en progress tracker');
      return;
    }
    
    const lastWeight = weightResult.rows[0];
    console.log('⚖️ ÚLTIMO REGISTRO DE PESO:');
    console.log(`   - Peso: ${lastWeight.weight} kg`);
    console.log(`   - Fecha: ${lastWeight.entry_date}`);
    console.log(`   - Creado: ${lastWeight.created_at}\n`);
    
    // 4. Verificar sincronización
    const profileWeight = parseFloat(profile.weight);
    const trackerWeight = parseFloat(lastWeight.weight);
    const isSynced = Math.abs(profileWeight - trackerWeight) < 0.01; // Tolerancia de 0.01 kg
    
    console.log('🔄 VERIFICACIÓN DE SINCRONIZACIÓN:');
    console.log(`   - Peso en perfil: ${profileWeight} kg`);
    console.log(`   - Peso en tracker: ${trackerWeight} kg`);
    console.log(`   - Diferencia: ${Math.abs(profileWeight - trackerWeight).toFixed(3)} kg`);
    console.log(`   - Estado: ${isSynced ? '✅ SINCRONIZADO' : '❌ NO SINCRONIZADO'}\n`);
    
    // 5. Obtener todos los registros de peso para análisis
    const allWeightsQuery = `
      SELECT weight, entry_date, created_at
      FROM weight_entries 
      WHERE user_id = $1 
      ORDER BY entry_date DESC, created_at DESC 
      LIMIT 10
    `;
    const allWeightsResult = await client.query(allWeightsQuery, [user.id]);
    
    console.log('📈 ÚLTIMOS 10 REGISTROS DE PESO:');
    allWeightsResult.rows.forEach((entry, index) => {
      const isToday = entry.entry_date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
      console.log(`   ${index + 1}. ${entry.weight} kg - ${entry.entry_date} ${isToday ? '(HOY)' : ''}`);
    });
    
    // 6. Verificar si hay peso de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayWeightQuery = `
      SELECT weight, created_at
      FROM weight_entries 
      WHERE user_id = $1 AND entry_date = $2
      ORDER BY created_at DESC
    `;
    const todayWeightResult = await client.query(todayWeightQuery, [user.id, today]);
    
    console.log(`\n📅 PESO DE HOY (${today}):`);
    if (todayWeightResult.rows.length > 0) {
      const todayWeight = todayWeightResult.rows[0];
      console.log(`   - Peso: ${todayWeight.weight} kg`);
      console.log(`   - Registrado: ${todayWeight.created_at}`);
      
      const isTodaySynced = Math.abs(profileWeight - parseFloat(todayWeight.weight)) < 0.01;
      console.log(`   - Estado: ${isTodaySynced ? '✅ SINCRONIZADO' : '❌ NO SINCRONIZADO'}`);
    } else {
      console.log('   - No hay registros de peso para hoy');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkWeightSync();
