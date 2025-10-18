const db = require('../config/database');

class FoodEntry {
  // Crear entrada de comida
  static async create(entryData) {
    try {
      const {
        user_id,
        food_id,
        quantity,
        meal_type,
        entry_date,
        notes
      } = entryData;

      const sql = `
        INSERT INTO food_entries (user_id, food_id, quantity, meal_type, entry_date, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const params = [user_id, food_id, quantity, meal_type, entry_date, notes];
      const result = await db.query(sql, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating food entry:', error);
      throw error;
    }
  }

  // Obtener entradas por fecha
  static async getByDate(userId, date) {
    try {
      const sql = `
        SELECT 
          fe.*,
          f.name as food_name,
          f.brand as food_brand,
          f.calories_per_100g,
          f.protein_per_100g,
          f.carbs_per_100g,
          f.fat_per_100g,
          f.fiber_per_100g,
          f.sugar_per_100g,
          f.sodium_per_100g,
          f.category as food_category,
          f.subcategory as food_subcategory,
          f.tags as food_tags,
          -- Calcular valores nutricionales basados en la cantidad
          ROUND((f.calories_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_calories,
          ROUND((f.protein_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_protein,
          ROUND((f.carbs_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_carbs,
          ROUND((f.fat_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_fat,
          ROUND((f.fiber_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_fiber,
          ROUND((f.sugar_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_sugar,
          ROUND((f.sodium_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_sodium
        FROM food_entries fe
        JOIN foods f ON fe.food_id = f.id
        WHERE fe.user_id = $1 AND fe.entry_date = $2
        ORDER BY fe.created_at ASC
      `;

      const result = await db.query(sql, [userId, date]);
      return result.rows;
    } catch (error) {
      console.error('Error getting food entries by date:', error);
      throw error;
    }
  }

  // Obtener entradas por rango de fechas
  static async getByDateRange(userId, startDate, endDate) {
    try {
      const sql = `
        SELECT 
          fe.*,
          f.name as food_name,
          f.brand as food_brand,
          f.calories_per_100g,
          f.protein_per_100g,
          f.carbs_per_100g,
          f.fat_per_100g,
          f.fiber_per_100g,
          f.sugar_per_100g,
          f.sodium_per_100g,
          f.category as food_category,
          f.subcategory as food_subcategory,
          f.tags as food_tags,
          f.is_custom as food_is_custom,
          -- Calcular valores nutricionales basados en la cantidad
          ROUND((f.calories_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_calories,
          ROUND((f.protein_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_protein,
          ROUND((f.carbs_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_carbs,
          ROUND((f.fat_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_fat,
          ROUND((f.fiber_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_fiber,
          ROUND((f.sugar_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_sugar,
          ROUND((f.sodium_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_sodium
        FROM food_entries fe
        JOIN foods f ON fe.food_id = f.id
        WHERE fe.user_id = $1 AND fe.entry_date BETWEEN $2 AND $3
        ORDER BY fe.entry_date DESC, fe.created_at ASC
      `;

      const result = await db.query(sql, [userId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error getting food entries by date range:', error);
      throw error;
    }
  }

  // Actualizar entrada
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
        UPDATE food_entries 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating food entry:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM food_entries WHERE id = $1';
      const result = await db.query(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding food entry by ID:', error);
      throw error;
    }
  }

  // Eliminar entrada
  static async delete(id) {
    try {
      const sql = 'DELETE FROM food_entries WHERE id = $1';
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting food entry:', error);
      throw error;
    }
  }

  // Obtener estadísticas nutricionales por fecha
  static async getNutritionStats(userId, date) {
    try {
      const sql = `
        SELECT 
          SUM(ROUND((f.calories_per_100g * fe.quantity / 100)::numeric, 2)) as total_calories,
          SUM(ROUND((f.protein_per_100g * fe.quantity / 100)::numeric, 2)) as total_protein,
          SUM(ROUND((f.carbs_per_100g * fe.quantity / 100)::numeric, 2)) as total_carbs,
          SUM(ROUND((f.fat_per_100g * fe.quantity / 100)::numeric, 2)) as total_fat,
          SUM(ROUND((f.fiber_per_100g * fe.quantity / 100)::numeric, 2)) as total_fiber,
          SUM(ROUND((f.sugar_per_100g * fe.quantity / 100)::numeric, 2)) as total_sugar,
          SUM(ROUND((f.sodium_per_100g * fe.quantity / 100)::numeric, 2)) as total_sodium,
          COUNT(*) as total_entries
        FROM food_entries fe
        JOIN foods f ON fe.food_id = f.id
        WHERE fe.user_id = $1 AND fe.entry_date = $2
      `;

      const result = await db.query(sql, [userId, date]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting nutrition stats:', error);
      throw error;
    }
  }

  // Obtener historial de comidas (últimas N entradas)
  static async getHistory(userId, limit = 30) {
    try {
      const sql = `
        SELECT 
          fe.*,
          f.name as food_name,
          f.brand as food_brand,
          f.calories_per_100g,
          f.protein_per_100g,
          f.carbs_per_100g,
          f.fat_per_100g,
          f.fiber_per_100g,
          f.sugar_per_100g,
          f.sodium_per_100g,
          f.category as food_category,
          f.subcategory as food_subcategory,
          f.tags as food_tags,
          f.is_custom as food_is_custom,
          -- Calcular valores nutricionales basados en la cantidad
          ROUND((f.calories_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_calories,
          ROUND((f.protein_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_protein,
          ROUND((f.carbs_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_carbs,
          ROUND((f.fat_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_fat,
          ROUND((f.fiber_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_fiber,
          ROUND((f.sugar_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_sugar,
          ROUND((f.sodium_per_100g * fe.quantity / 100)::numeric, 2) as nutrition_sodium
        FROM food_entries fe
        JOIN foods f ON fe.food_id = f.id
        WHERE fe.user_id = $1
        ORDER BY fe.entry_date DESC, fe.created_at DESC
        LIMIT $2
      `;

      const result = await db.query(sql, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting food history:', error);
      throw error;
    }
  }

  // Crear entrada de comida directamente con datos del frontend
  static async createDirect(entryData) {
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
        quantity,
        meal_type,
        entry_date,
        source,
        source_data
      } = entryData;

      // Crear un food_id temporal usando el nombre como identificador
      const tempFoodId = `temp_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;

      const sql = `
        INSERT INTO food_entries (
          user_id, 
          food_id, 
          quantity, 
          meal_type, 
          entry_date,
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
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
      
      const params = [
        user_id,
        tempFoodId,
        quantity,
        meal_type,
        entry_date,
        name,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        source,
        source_data ? JSON.stringify(source_data) : null
      ];

      const result = await db.query(sql, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating direct food entry:', error);
      throw error;
    }
  }
}

module.exports = FoodEntry;
