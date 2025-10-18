const { query } = require('../config/database');

class WeightEntry {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.weight = parseFloat(data.weight);
    this.entry_date = data.entry_date;
    this.notes = data.notes;
    this.created_at = data.created_at;
  }

  // Crear nueva entrada de peso
  static async create(weightData) {
    const {
      user_id,
      weight,
      entry_date,
      notes = null
    } = weightData;

    const insertQuery = `
      INSERT INTO weight_entries (user_id, weight, entry_date, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [user_id, weight, entry_date, notes];
    const result = await query(insertQuery, values);
    return new WeightEntry(result.rows[0]);
  }

  // Obtener entrada por ID
  static async findById(id) {
    const result = await query('SELECT * FROM weight_entries WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return new WeightEntry(result.rows[0]);
    }
    return null;
  }

  // Obtener entradas de peso de un usuario para una fecha específica
  static async findByUserAndDate(userId, date) {
    const result = await query(
      'SELECT * FROM weight_entries WHERE user_id = $1 AND entry_date = $2 ORDER BY created_at DESC',
      [userId, date]
    );
    return result.rows.map(row => new WeightEntry(row));
  }

  // Obtener entradas de peso de un usuario en un rango de fechas
  static async findByUserAndDateRange(userId, startDate, endDate) {
    const result = await query(
      'SELECT * FROM weight_entries WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3 ORDER BY entry_date DESC, created_at DESC',
      [userId, startDate, endDate]
    );
    return result.rows.map(row => new WeightEntry(row));
  }

  // Obtener la entrada de peso más reciente de un usuario
  static async findLatestByUser(userId) {
    const result = await query(
      'SELECT * FROM weight_entries WHERE user_id = $1 ORDER BY entry_date DESC, created_at DESC LIMIT 1',
      [userId]
    );
    if (result.rows.length > 0) {
      return new WeightEntry(result.rows[0]);
    }
    return null;
  }

  // Obtener historial de fechas con entradas de peso
  static async getWeightHistoryDates(userId, limit = 30) {
    const result = await query(`
      SELECT DISTINCT entry_date, COUNT(*) as entry_count
      FROM weight_entries 
      WHERE user_id = $1 
      GROUP BY entry_date 
      ORDER BY entry_date DESC 
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      date: row.entry_date,
      entry_count: parseInt(row.entry_count)
    }));
  }

  // Obtener estadísticas de peso
  static async getWeightStats(userId, startDate, endDate) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_entries,
        AVG(weight) as avg_weight,
        MIN(weight) as min_weight,
        MAX(weight) as max_weight,
        STDDEV(weight) as weight_stddev
      FROM weight_entries 
      WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
    `, [userId, startDate, endDate]);

    const stats = result.rows[0];
    return {
      total_entries: parseInt(stats.total_entries),
      avg_weight: stats.avg_weight ? parseFloat(stats.avg_weight) : null,
      min_weight: stats.min_weight ? parseFloat(stats.min_weight) : null,
      max_weight: stats.max_weight ? parseFloat(stats.max_weight) : null,
      weight_stddev: stats.weight_stddev ? parseFloat(stats.weight_stddev) : null
    };
  }

  // Calcular cambio de peso entre dos fechas
  static async getWeightChange(userId, startDate, endDate) {
    const startResult = await query(
      'SELECT weight FROM weight_entries WHERE user_id = $1 AND entry_date = $2 ORDER BY created_at ASC LIMIT 1',
      [userId, startDate]
    );
    
    const endResult = await query(
      'SELECT weight FROM weight_entries WHERE user_id = $1 AND entry_date = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, endDate]
    );

    const startWeight = startResult.rows.length > 0 ? parseFloat(startResult.rows[0].weight) : null;
    const endWeight = endResult.rows.length > 0 ? parseFloat(endResult.rows[0].weight) : null;

    if (startWeight === null || endWeight === null) {
      return null;
    }

    return {
      start_weight: startWeight,
      end_weight: endWeight,
      change: endWeight - startWeight,
      change_percentage: ((endWeight - startWeight) / startWeight) * 100
    };
  }

  // Actualizar entrada de peso
  static async update(id, updateData) {
    const { weight, entry_date, notes } = updateData;

    const updateQuery = `
      UPDATE weight_entries 
      SET 
        weight = COALESCE($1, weight),
        entry_date = COALESCE($2, entry_date),
        notes = COALESCE($3, notes)
      WHERE id = $4
      RETURNING *
    `;

    const values = [weight, entry_date, notes, id];
    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('Entrada de peso no encontrada');
    }
    return new WeightEntry(result.rows[0]);
  }

  // Eliminar entrada de peso
  static async delete(id) {
    const result = await query('DELETE FROM weight_entries WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      throw new Error('Entrada de peso no encontrada');
    }
    return new WeightEntry(result.rows[0]);
  }

  // Convertir a objeto público
  toPublicObject() {
    return {
      id: this.id,
      user_id: this.user_id,
      weight: this.weight,
      entry_date: this.entry_date,
      notes: this.notes,
      created_at: this.created_at
    };
  }
}

module.exports = WeightEntry;
