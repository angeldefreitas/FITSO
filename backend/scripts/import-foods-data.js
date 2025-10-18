const { Pool } = require('pg');
const path = require('path');

// Importar todos los datos de comidas
const { 
  carnes, 
  lacteos, 
  frutosSecos, 
  frutas, 
  verduras, 
  cereales, 
  legumbres, 
  pescados, 
  mariscos, 
  bebidas, 
  snacks, 
  condimentos, 
  aceites 
} = require('../../src/data/foods');

const pool = new Pool({
  user: 'fitso_user',
  host: 'localhost',
  database: 'fitso_db',
  password: 'fitso_password',
  port: 5432,
});

async function importFoodsData() {
  try {
    console.log('🚀 Iniciando importación de datos de comidas...');
    
    // Limpiar tabla existente
    await pool.query('DELETE FROM foods');
    console.log('✅ Tabla foods limpiada');
    
    // Combinar todos los datos
    const allFoods = [
      ...carnes,
      ...lacteos,
      ...frutosSecos,
      ...frutas,
      ...verduras,
      ...cereales,
      ...legumbres,
      ...pescados,
      ...mariscos,
      ...bebidas,
      ...snacks,
      ...condimentos,
      ...aceites
    ];
    
    console.log(`📊 Total de comidas a importar: ${allFoods.length}`);
    
    // Insertar datos en lotes
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < allFoods.length; i += batchSize) {
      const batch = allFoods.slice(i, i + batchSize);
      
      const values = batch.map(food => {
        return `(
          '${food.id}',
          '${food.name.replace(/'/g, "''")}',
          '${food.brand || ''}',
          '${food.barcode || ''}',
          ${food.calories},
          ${food.protein},
          ${food.carbs},
          ${food.fat},
          ${food.fiber || 0},
          ${food.sugar || 0},
          ${food.sodium || 0},
          '${food.category}',
          '${food.subcategory}',
          '${(food.description || '').replace(/'/g, "''")}',
          '${food.servingSize || '100g'}',
          ${food.tags ? `ARRAY[${food.tags.map(tag => `'${tag.replace(/'/g, "''")}'`).join(',')}]` : 'NULL'}
        )`;
      }).join(',');
      
      const query = `
        INSERT INTO foods (
          id, name, brand, barcode, calories_per_100g, protein_per_100g, 
          carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, 
          sodium_per_100g, category, subcategory, description, serving_size, tags
        ) VALUES ${values}
      `;
      
      await pool.query(query);
      imported += batch.length;
      console.log(`✅ Importados ${imported}/${allFoods.length} comidas`);
    }
    
    // Verificar importación
    const result = await pool.query('SELECT COUNT(*) FROM foods');
    const totalImported = parseInt(result.rows[0].count);
    
    console.log(`🎉 Importación completada! Total de comidas en la base de datos: ${totalImported}`);
    
    // Mostrar estadísticas por categoría
    const stats = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM foods 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Estadísticas por categoría:');
    stats.rows.forEach(stat => {
      console.log(`  - ${stat.category}: ${stat.count} comidas`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

importFoodsData();
