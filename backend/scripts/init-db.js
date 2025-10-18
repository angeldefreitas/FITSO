const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('../src/config/database');

async function initializeDatabase() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.log('💡 Asegúrate de que PostgreSQL esté ejecutándose y las credenciales sean correctas');
      process.exit(1);
    }

    console.log('📖 Leyendo esquema de base de datos...');
    const schemaPath = path.join(__dirname, '../src/config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🏗️ Ejecutando esquema de base de datos...');
    await query(schema);

    console.log('✅ Base de datos inicializada correctamente');
    console.log('📊 Tablas creadas:');
    console.log('   - users');
    console.log('   - user_profiles');
    console.log('   - foods');
    console.log('   - food_entries');
    console.log('   - weight_entries');
    console.log('   - water_entries');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
