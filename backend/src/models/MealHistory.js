const db = require('../config/database');

class MealHistory {
  // Agregar al historial (con lógica de duplicados)
  static async addToHistory(historyData) {
    try {
      const {
        user_id,
        name,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        source,
        source_data
      } = historyData;

      // Crear nombre base para detectar duplicados (sin cantidad)
      const baseName = name.replace(/\s*\(\d+g\)$/, '').toLowerCase().trim();

      // Buscar si ya existe una entrada similar
      const existingSql = `
        SELECT * FROM meal_history 
        WHERE user_id = $1 
        AND LOWER(REGEXP_REPLACE(name, '\\s*\\(\\d+g\\)$', '')) = $2
      `;
      const existingResult = await db.query(existingSql, [user_id, baseName]);

      if (existingResult.rows.length > 0) {
        // Actualizar entrada existente
        const existing = existingResult.rows[0];
        const updateSql = `
          UPDATE meal_history 
          SET 
            name = $2,
            calories = $3,
            protein = $4,
            carbs = $5,
            fat = $6,
            fiber = $7,
            sugar = $8,
            sodium = $9,
            source = $10,
            source_data = $11,
            times_used = times_used + 1,
            last_used = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;

        const updateParams = [
          existing.id,
          name,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium,
          source,
          JSON.stringify(source_data)
        ];

        const result = await db.query(updateSql, updateParams);
        return result.rows[0];
      } else {
        // Crear nueva entrada
        const insertSql = `
          INSERT INTO meal_history (
            user_id, name, calories, protein, carbs, fat, 
            fiber, sugar, sodium, source, source_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;

        const insertParams = [
          user_id,
          name,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium,
          source,
          JSON.stringify(source_data)
        ];

        const result = await db.query(insertSql, insertParams);
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error adding to meal history:', error);
      throw error;
    }
  }

  // Obtener historial por usuario
  static async getByUserId(userId, limit = 30) {
    try {
      const sql = `
        SELECT *
        FROM meal_history
        WHERE user_id = $1
        ORDER BY last_used DESC
        LIMIT $2
      `;

      const result = await db.query(sql, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting meal history by user:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM meal_history WHERE id = $1';
      const result = await db.query(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding meal history by ID:', error);
      throw error;
    }
  }

  // Actualizar elemento del historial
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
        UPDATE meal_history 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating meal history:', error);
      throw error;
    }
  }

  // Eliminar elemento del historial
  static async delete(id) {
    try {
      const sql = 'DELETE FROM meal_history WHERE id = $1';
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting meal history:', error);
      throw error;
    }
  }

  // Obtener estadísticas del historial
  static async getStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual_items,
          COUNT(CASE WHEN source = 'database' THEN 1 END) as database_items,
          COUNT(CASE WHEN source = 'barcode' THEN 1 END) as barcode_items,
          COUNT(CASE WHEN source = 'ai' THEN 1 END) as ai_items,
          AVG(times_used) as avg_times_used,
          MAX(last_used) as last_used
        FROM meal_history
        WHERE user_id = $1
      `;

      const result = await db.query(sql, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting meal history stats:', error);
      throw error;
    }
  }

  // Limpiar historial antiguo (más de X días)
  static async cleanOldHistory(userId, daysOld = 90) {
    try {
      const sql = `
        DELETE FROM meal_history 
        WHERE user_id = $1 
        AND last_used < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
      `;

      const result = await db.query(sql, [userId]);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning old meal history:', error);
      throw error;
    }
  }
}

module.exports = MealHistory;
