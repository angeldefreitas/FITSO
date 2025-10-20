const db = require('../config/database');

class Food {
  // Buscar alimentos
  static async search({ query, category, limit = 20, offset = 0, userId, lang = 'es' }) {
    try {
      let sql = `
        WITH requested AS (
          SELECT 
            f.*,
            ft.name as t_name,
            ft.description as t_description
          FROM foods f
          LEFT JOIN food_translations ft 
            ON ft.food_id = f.id AND ft.locale = $1
        ), with_fallback AS (
          SELECT 
            r.*,
            COALESCE(r.t_name, ften.name, f.name) AS name_loc,
            COALESCE(r.t_description, ften.description) AS description_loc
          FROM requested r
          LEFT JOIN food_translations ften 
            ON ften.food_id = r.id AND ften.locale = 'en'
        )
        SELECT * FROM with_fallback WHERE 1=1
      `;
      const params = [lang];
      let paramCount = 0;

      // Filtro por categoría
      if (category) {
        paramCount++;
        sql += ` AND f.category = $${paramCount}`;
        params.push(category);
      }

      // Filtro por búsqueda de texto
      if (query) {
        paramCount++;
        sql += ` AND (
          name_loc ILIKE $${paramCount} OR 
          brand ILIKE $${paramCount} OR
          EXISTS (
            SELECT 1 FROM unnest(tags) AS tag 
            WHERE tag ILIKE $${paramCount}
          ) OR EXISTS (
            SELECT 1 FROM food_synonyms fs
            WHERE fs.food_id = id AND fs.locale = $1 AND fs.synonym ILIKE $${paramCount}
          )
        )`;
        params.push(`%${query}%`);
      }

      // Ordenar por relevancia y nombre
      sql += ` ORDER BY 
        CASE WHEN created_by = $2 THEN 0 ELSE 1 END,
        name_loc ASC
        LIMIT $${paramCount + 2} OFFSET $${paramCount + 3}`;
      
      params.push(userId, limit, offset);

      const result = await db.query(sql, params);
      return result.rows.map(row => ({
        ...row,
        name: row.name_loc || row.name,
        description: row.description_loc || row.description,
      }));
    } catch (error) {
      console.error('Error searching foods:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM foods WHERE id = $1';
      const result = await db.query(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding food by ID:', error);
      throw error;
    }
  }

  // Crear alimento
  static async create(foodData) {
    try {
      const {
        name,
        brand,
        barcode,
        calories_per_100g,
        protein_per_100g,
        carbs_per_100g,
        fat_per_100g,
        fiber_per_100g,
        sugar_per_100g,
        sodium_per_100g,
        category,
        subcategory,
        tags,
        is_custom,
        created_by
      } = foodData;

      const sql = `
        INSERT INTO foods (
          name, brand, barcode, calories_per_100g, protein_per_100g, 
          carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, 
          sodium_per_100g, category, subcategory, tags, is_custom, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const params = [
        name, brand, barcode, calories_per_100g, protein_per_100g,
        carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g,
        sodium_per_100g, category, subcategory, tags, is_custom, created_by
      ];

      const result = await db.query(sql, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating food:', error);
      throw error;
    }
  }

  // Actualizar alimento
  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 0;

      // Construir query dinámicamente
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          paramCount++;
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      paramCount++;
      values.push(id);

      const sql = `
        UPDATE foods 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating food:', error);
      throw error;
    }
  }

  // Eliminar alimento
  static async delete(id) {
    try {
      const sql = 'DELETE FROM foods WHERE id = $1';
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting food:', error);
      throw error;
    }
  }

  // Obtener categorías
  static async getCategories() {
    try {
      const sql = `
        SELECT 
          category,
          COUNT(*) as count
        FROM foods 
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY category
      `;
      const result = await db.query(sql);
      return result.rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_foods,
          COUNT(CASE WHEN is_custom = true THEN 1 END) as custom_foods,
          COUNT(CASE WHEN is_custom = false THEN 1 END) as system_foods,
          COUNT(CASE WHEN barcode IS NOT NULL THEN 1 END) as foods_with_barcode
        FROM foods
      `;
      const result = await db.query(sql);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting food stats:', error);
      throw error;
    }
  }

  // Buscar por código de barras
  static async findByBarcode(barcode) {
    try {
      const sql = 'SELECT * FROM foods WHERE barcode = $1';
      const result = await db.query(sql, [barcode]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding food by barcode:', error);
      throw error;
    }
  }
}

module.exports = Food;
