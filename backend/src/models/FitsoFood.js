const db = require('../config/database');

class FitsoFood {
  // Buscar alimentos con traducciones y sinónimos
  static async search({ query, category, limit = 20, offset = 0, userId, lang = 'es' }) {
    try {
      let sql = `
        WITH requested AS (
          SELECT 
            f.*,
            ft.name as t_name,
            ft.description as t_description,
            ft.unit_short as t_unit_short,
            ft.unit_long as t_unit_long
          FROM fitso_foods f
          LEFT JOIN fitso_food_translations ft 
            ON ft.food_id = f.id AND ft.locale = $1
        ), with_fallback AS (
          SELECT 
            r.*,
            COALESCE(r.t_name, ften.name, f.name) AS name_loc,
            COALESCE(r.t_description, ften.description) AS description_loc,
            COALESCE(r.t_unit_short, ften.unit_short, 'g') AS unit_short_loc,
            COALESCE(r.t_unit_long, ften.unit_long, 'gramos') AS unit_long_loc
          FROM requested r
          LEFT JOIN fitso_food_translations ften 
            ON ften.food_id = r.id AND ften.locale = 'en'
        )
        SELECT * FROM with_fallback WHERE 1=1
      `;
      const params = [lang];
      let paramCount = 0;

      // Filtro por categoría
      if (category) {
        paramCount++;
        sql += ` AND category = $${paramCount + 1}`;
        params.push(category);
      }

      // Filtro por búsqueda de texto
      if (query) {
        paramCount++;
        sql += ` AND (
          name_loc ILIKE $${paramCount + 1} OR 
          brand ILIKE $${paramCount + 1} OR
          EXISTS (
            SELECT 1 FROM unnest(tags) AS tag 
            WHERE tag ILIKE $${paramCount + 1}
          ) OR EXISTS (
            SELECT 1 FROM fitso_food_synonyms fs
            WHERE fs.food_id = id AND fs.locale = $1 AND fs.synonym ILIKE $${paramCount + 1}
          )
        )`;
        params.push(`%${query}%`);
      }

      // Ordenar por relevancia y nombre
      sql += ` ORDER BY 
        CASE WHEN created_by = $${paramCount + 2} THEN 0 ELSE 1 END,
        name_loc ASC
        LIMIT $${paramCount + 3} OFFSET $${paramCount + 4}`;
      
      params.push(userId, limit, offset);

      const result = await db.query(sql, params);
      return result.rows.map(row => ({
        ...row,
        name: row.name_loc || row.name,
        description: row.description_loc || row.description,
        unit_short: row.unit_short_loc || 'g',
        unit_long: row.unit_long_loc || 'gramos',
      }));
    } catch (error) {
      console.error('Error searching fitso foods:', error);
      throw error;
    }
  }

  // Buscar por ID con traducción
  static async findById(id, lang = 'es') {
    try {
      const sql = `
        WITH requested AS (
          SELECT 
            f.*,
            ft.name as t_name,
            ft.description as t_description,
            ft.unit_short as t_unit_short,
            ft.unit_long as t_unit_long
          FROM fitso_foods f
          LEFT JOIN fitso_food_translations ft 
            ON ft.food_id = f.id AND ft.locale = $2
        ), with_fallback AS (
          SELECT 
            r.*,
            COALESCE(r.t_name, ften.name, f.name) AS name_loc,
            COALESCE(r.t_description, ften.description) AS description_loc,
            COALESCE(r.t_unit_short, ften.unit_short, 'g') AS unit_short_loc,
            COALESCE(r.t_unit_long, ften.unit_long, 'gramos') AS unit_long_loc
          FROM requested r
          LEFT JOIN fitso_food_translations ften 
            ON ften.food_id = r.id AND ften.locale = 'en'
        )
        SELECT * FROM with_fallback WHERE id = $1
      `;
      const result = await db.query(sql, [id, lang]);
      const row = result.rows[0];
      
      if (!row) return null;
      
      return {
        ...row,
        name: row.name_loc || row.name,
        description: row.description_loc || row.description,
        unit_short: row.unit_short_loc || 'g',
        unit_long: row.unit_long_loc || 'gramos',
      };
    } catch (error) {
      console.error('Error finding fitso food by ID:', error);
      throw error;
    }
  }

  // Buscar por código de barras
  static async findByBarcode(barcode, lang = 'es') {
    try {
      const sql = `
        WITH requested AS (
          SELECT 
            f.*,
            ft.name as t_name,
            ft.description as t_description,
            ft.unit_short as t_unit_short,
            ft.unit_long as t_unit_long
          FROM fitso_foods f
          LEFT JOIN fitso_food_translations ft 
            ON ft.food_id = f.id AND ft.locale = $2
        ), with_fallback AS (
          SELECT 
            r.*,
            COALESCE(r.t_name, ften.name, f.name) AS name_loc,
            COALESCE(r.t_description, ften.description) AS description_loc,
            COALESCE(r.t_unit_short, ften.unit_short, 'g') AS unit_short_loc,
            COALESCE(r.t_unit_long, ften.unit_long, 'gramos') AS unit_long_loc
          FROM requested r
          LEFT JOIN fitso_food_translations ften 
            ON ften.food_id = r.id AND ften.locale = 'en'
        )
        SELECT * FROM with_fallback WHERE barcode = $1
      `;
      const result = await db.query(sql, [barcode, lang]);
      const row = result.rows[0];
      
      if (!row) return null;
      
      return {
        ...row,
        name: row.name_loc || row.name,
        description: row.description_loc || row.description,
        unit_short: row.unit_short_loc || 'g',
        unit_long: row.unit_long_loc || 'gramos',
      };
    } catch (error) {
      console.error('Error finding fitso food by barcode:', error);
      throw error;
    }
  }

  // Obtener categorías
  static async getCategories(lang = 'es') {
    try {
      const sql = `
        SELECT 
          f.category,
          COUNT(*) as count,
          COALESCE(ft.name, f.category) as category_name
        FROM fitso_foods f
        LEFT JOIN fitso_food_translations ft 
          ON ft.food_id = f.id AND ft.locale = $1
        WHERE f.category IS NOT NULL
        GROUP BY f.category, ft.name
        ORDER BY f.category
      `;
      const result = await db.query(sql, [lang]);
      return result.rows;
    } catch (error) {
      console.error('Error getting fitso categories:', error);
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
          COUNT(CASE WHEN barcode IS NOT NULL THEN 1 END) as foods_with_barcode,
          COUNT(DISTINCT ft.locale) as supported_languages
        FROM fitso_foods f
        LEFT JOIN fitso_food_translations ft ON ft.food_id = f.id
      `;
      const result = await db.query(sql);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting fitso food stats:', error);
      throw error;
    }
  }
}

module.exports = FitsoFood;
