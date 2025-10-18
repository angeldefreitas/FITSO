const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'fitso_user',
  host: 'localhost',
  database: 'fitso_db',
  password: 'fitso_password',
  port: 5432,
});

// Función para extraer datos de un archivo TypeScript
function extractFoodsFromTS(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar el array de comidas usando regex
    const arrayMatch = content.match(/export const \w+: FoodItem\[\] = \[([\s\S]*?)\];/);
    if (!arrayMatch) return [];
    
    const arrayContent = arrayMatch[1];
    
    // Extraer objetos individuales
    const objects = [];
    let currentObject = '';
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && arrayContent[i-1] !== '\\') {
        inString = false;
      } else if (!inString && char === '{') {
        braceCount++;
        if (braceCount === 1) currentObject = '';
      } else if (!inString && char === '}') {
        braceCount--;
        if (braceCount === 0) {
          objects.push(currentObject + '}');
          currentObject = '';
        }
      }
      
      if (braceCount > 0) {
        currentObject += char;
      }
    }
    
    // Convertir strings a objetos
    const foods = [];
    for (const objStr of objects) {
      try {
        // Limpiar el string y convertir a objeto
        const cleanStr = objStr
          .replace(/(\w+):/g, '"$1":') // Agregar comillas a las claves
          .replace(/'/g, '"') // Reemplazar comillas simples con dobles
          .replace(/(\w+):/g, '"$1":') // Asegurar que las claves tengan comillas
          .replace(/,(\s*[}\]])/g, '$1'); // Remover comas finales
        
        const food = JSON.parse(cleanStr);
        foods.push(food);
      } catch (e) {
        // Si falla el parsing, intentar extraer datos manualmente
        const nameMatch = objStr.match(/name:\s*['"]([^'"]+)['"]/);
        const caloriesMatch = objStr.match(/calories:\s*(\d+)/);
        const proteinMatch = objStr.match(/protein:\s*([\d.]+)/);
        const carbsMatch = objStr.match(/carbs:\s*([\d.]+)/);
        const fatMatch = objStr.match(/fat:\s*([\d.]+)/);
        const categoryMatch = objStr.match(/category:\s*['"]([^'"]+)['"]/);
        const subcategoryMatch = objStr.match(/subcategory:\s*['"]([^'"]+)['"]/);
        
        if (nameMatch && caloriesMatch) {
          // Generar UUID válido
          const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
          
          foods.push({
            id: uuid,
            name: nameMatch[1],
            calories: parseInt(caloriesMatch[1]),
            protein: parseFloat(proteinMatch ? proteinMatch[1] : 0),
            carbs: parseFloat(carbsMatch ? carbsMatch[1] : 0),
            fat: parseFloat(fatMatch ? fatMatch[1] : 0),
            fiber: 0,
            sugar: 0,
            sodium: 0,
            category: categoryMatch ? categoryMatch[1] : 'otros',
            subcategory: subcategoryMatch ? subcategoryMatch[1] : 'otros',
            servingSize: '100g',
            description: '',
            tags: []
          });
        }
      }
    }
    
    return foods;
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error.message);
    return [];
  }
}

async function importFoodsData() {
  try {
    console.log('🚀 Iniciando importación de datos de comidas desde archivos TypeScript...');
    
    // Limpiar tabla existente
    await pool.query('DELETE FROM foods');
    console.log('✅ Tabla foods limpiada');
    
    // Directorio de datos de comidas
    const foodsDir = path.join(__dirname, '../../src/data/foods');
    const categories = [
      'carnes', 'lacteos', 'frutos-secos', 'frutas', 'verduras', 
      'cereales', 'legumbres', 'pescados', 'mariscos', 'bebidas', 
      'snacks', 'condimentos', 'aceites'
    ];
    
    let allFoods = [];
    
    // Procesar cada categoría
    for (const category of categories) {
      const filePath = path.join(foodsDir, category, 'index.ts');
      if (fs.existsSync(filePath)) {
        console.log(`📂 Procesando ${category}...`);
        const foods = extractFoodsFromTS(filePath);
        allFoods = allFoods.concat(foods);
        console.log(`  ✅ ${foods.length} comidas extraídas de ${category}`);
      }
    }
    
    console.log(`📊 Total de comidas extraídas: ${allFoods.length}`);
    
    if (allFoods.length === 0) {
      console.log('❌ No se encontraron comidas para importar');
      return;
    }
    
    // Insertar datos en lotes
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < allFoods.length; i += batchSize) {
      const batch = allFoods.slice(i, i + batchSize);
      
      for (const food of batch) {
        try {
          const query = `
            INSERT INTO foods (
              id, name, brand, barcode, calories_per_100g, protein_per_100g, 
              carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, 
              sodium_per_100g, category, subcategory, description, serving_size, tags
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          `;
          
          await pool.query(query, [
            food.id,
            food.name,
            food.brand || '',
            food.barcode || '',
            food.calories,
            food.protein,
            food.carbs,
            food.fat,
            food.fiber || 0,
            food.sugar || 0,
            food.sodium || 0,
            food.category,
            food.subcategory,
            food.description || '',
            food.servingSize || '100g',
            food.tags || []
          ]);
          
          imported++;
        } catch (error) {
          console.error(`Error insertando ${food.name}:`, error.message);
        }
      }
      
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
