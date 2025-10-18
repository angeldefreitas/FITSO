const { pool } = require('../config/database');

class CaloriesBurned {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.calories_burned = data.calories_burned;
    this.calories_goal = data.calories_goal;
    this.entry_date = data.entry_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Convertir a objeto público (sin datos sensibles)
  toPublicObject() {
    return {
      id: this.id,
      calories_burned: this.calories_burned,
      calories_goal: this.calories_goal,
      entry_date: this.entry_date,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Crear nueva entrada de calorías quemadas
  static async create(data) {
    try {
      const { user_id, calories_burned, calories_goal, entry_date } = data;
      
      const query = `
        INSERT INTO user_daily_calories (user_id, calories_burned, calories_goal, entry_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, entry_date) 
        DO UPDATE SET 
          calories_burned = EXCLUDED.calories_burned,
          calories_goal = EXCLUDED.calories_goal,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const values = [user_id, calories_burned, calories_goal, entry_date];
      const result = await pool.query(query, values);
      
      return new CaloriesBurned(result.rows[0]);
    } catch (error) {
      console.error('Error creating calories burned entry:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM user_daily_calories WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new CaloriesBurned(result.rows[0]);
    } catch (error) {
      console.error('Error finding calories burned by ID:', error);
      throw error;
    }
  }

  // Buscar por usuario y fecha
  static async findByUserAndDate(user_id, date) {
    try {
      const query = 'SELECT * FROM user_daily_calories WHERE user_id = $1 AND entry_date = $2';
      const result = await pool.query(query, [user_id, date]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new CaloriesBurned(result.rows[0]);
    } catch (error) {
      console.error('Error finding calories burned by user and date:', error);
      throw error;
    }
  }

  // Buscar por usuario y rango de fechas
  static async findByUserAndDateRange(user_id, start_date, end_date) {
    try {
      const query = `
        SELECT * FROM user_daily_calories 
        WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
        ORDER BY entry_date DESC
      `;
      const result = await pool.query(query, [user_id, start_date, end_date]);
      
      return result.rows.map(row => new CaloriesBurned(row));
    } catch (error) {
      console.error('Error finding calories burned by user and date range:', error);
      throw error;
    }
  }

  // Obtener historial de fechas con calorías quemadas
  static async getCaloriesBurnedHistoryDates(user_id, limit = 30) {
    try {
      const query = `
        SELECT entry_date, calories_burned, calories_goal
        FROM user_daily_calories 
        WHERE user_id = $1 
        ORDER BY entry_date DESC 
        LIMIT $2
      `;
      const result = await pool.query(query, [user_id, limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting calories burned history dates:', error);
      throw error;
    }
  }

  // Obtener estadísticas de calorías quemadas
  static async getCaloriesBurnedStats(user_id, start_date, end_date) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_entries,
          AVG(calories_burned) as avg_calories_burned,
          MAX(calories_burned) as max_calories_burned,
          MIN(calories_burned) as min_calories_burned,
          SUM(calories_burned) as total_calories_burned,
          AVG(calories_goal) as avg_calories_goal
        FROM user_daily_calories 
        WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
      `;
      const result = await pool.query(query, [user_id, start_date, end_date]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting calories burned stats:', error);
      throw error;
    }
  }

  // Obtener calorías quemadas promedio diarias
  static async getAverageDailyCaloriesBurned(user_id, start_date, end_date) {
    try {
      const query = `
        SELECT AVG(calories_burned) as average_daily_calories_burned
        FROM user_daily_calories 
        WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
      `;
      const result = await pool.query(query, [user_id, start_date, end_date]);
      
      return result.rows[0].average_daily_calories_burned || 0;
    } catch (error) {
      console.error('Error getting average daily calories burned:', error);
      throw error;
    }
  }

  // Actualizar entrada
  static async update(id, updateData) {
    try {
      const allowedFields = ['calories_burned', 'calories_goal', 'entry_date'];
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      const query = `
        UPDATE user_daily_calories 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      values.push(id);
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new CaloriesBurned(result.rows[0]);
    } catch (error) {
      console.error('Error updating calories burned entry:', error);
      throw error;
    }
  }

  // Eliminar entrada
  static async delete(id) {
    try {
      const query = 'DELETE FROM user_daily_calories WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting calories burned entry:', error);
      throw error;
    }
  }

  // Obtener o crear entrada para una fecha específica
  static async getOrCreateForDate(user_id, date, default_calories_burned = 0, default_calories_goal = 750) {
    try {
      // Intentar obtener entrada existente
      let entry = await this.findByUserAndDate(user_id, date);
      
      if (!entry) {
        // Crear nueva entrada si no existe
        entry = await this.create({
          user_id,
          calories_burned: default_calories_burned,
          calories_goal: default_calories_goal,
          entry_date: date
        });
      }
      
      return entry;
    } catch (error) {
      console.error('Error getting or creating calories burned entry:', error);
      throw error;
    }
  }
}

module.exports = CaloriesBurned;
