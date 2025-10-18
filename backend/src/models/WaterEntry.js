const { query } = require('../config/database');

class WaterEntry {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.amount_ml = parseInt(data.amount_ml);
    this.entry_date = data.entry_date;
    this.created_at = data.created_at;
  }

  // Crear nueva entrada de agua
  static async create(waterData) {
    const {
      user_id,
      amount_ml,
      entry_date
    } = waterData;

    const insertQuery = `
      INSERT INTO water_entries (user_id, amount_ml, entry_date)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [user_id, amount_ml, entry_date];
    const result = await query(insertQuery, values);
    return new WaterEntry(result.rows[0]);
  }

  // Obtener entrada por ID
  static async findById(id) {
    const result = await query('SELECT * FROM water_entries WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return new WaterEntry(result.rows[0]);
    }
    return null;
  }

  // Obtener entradas de agua de un usuario para una fecha específica
  static async findByUserAndDate(userId, date) {
    const result = await query(
      'SELECT * FROM water_entries WHERE user_id = $1 AND entry_date = $2 ORDER BY created_at ASC',
      [userId, date]
    );
    return result.rows.map(row => new WaterEntry(row));
  }

  // Obtener entradas de agua de un usuario en un rango de fechas
  static async findByUserAndDateRange(userId, startDate, endDate) {
    const result = await query(
      'SELECT * FROM water_entries WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3 ORDER BY entry_date DESC, created_at ASC',
      [userId, startDate, endDate]
    );
    return result.rows.map(row => new WaterEntry(row));
  }

  // Obtener el total de agua consumida en una fecha específica
  static async getTotalWaterForDate(userId, date) {
    const result = await query(
      'SELECT SUM(amount_ml) as total_ml FROM water_entries WHERE user_id = $1 AND entry_date = $2',
      [userId, date]
    );
    
    const total = result.rows[0].total_ml;
    return total ? parseInt(total) : 0;
  }

  // Obtener el total de agua consumida en un rango de fechas
  static async getTotalWaterForDateRange(userId, startDate, endDate) {
    const result = await query(
      'SELECT SUM(amount_ml) as total_ml FROM water_entries WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3',
      [userId, startDate, endDate]
    );
    
    const total = result.rows[0].total_ml;
    return total ? parseInt(total) : 0;
  }

  // Obtener historial de fechas con entradas de agua
  static async getWaterHistoryDates(userId, limit = 30) {
    const result = await query(`
      SELECT DISTINCT entry_date, SUM(amount_ml) as total_ml, COUNT(*) as entry_count
      FROM water_entries 
      WHERE user_id = $1 
      GROUP BY entry_date 
      ORDER BY entry_date DESC 
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      date: row.entry_date,
      total_ml: parseInt(row.total_ml),
      entry_count: parseInt(row.entry_count)
    }));
  }

  // Obtener estadísticas de agua
  static async getWaterStats(userId, startDate, endDate) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(amount_ml) as total_ml,
        AVG(amount_ml) as avg_per_entry,
        MIN(amount_ml) as min_per_entry,
        MAX(amount_ml) as max_per_entry
      FROM water_entries 
      WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
    `, [userId, startDate, endDate]);

    const stats = result.rows[0];
    return {
      total_entries: parseInt(stats.total_entries),
      total_ml: stats.total_ml ? parseInt(stats.total_ml) : 0,
      avg_per_entry: stats.avg_per_entry ? parseFloat(stats.avg_per_entry) : 0,
      min_per_entry: stats.min_per_entry ? parseInt(stats.min_per_entry) : 0,
      max_per_entry: stats.max_per_entry ? parseInt(stats.max_per_entry) : 0
    };
  }

  // Obtener promedio diario de agua en un rango de fechas
  static async getAverageDailyWater(userId, startDate, endDate) {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT entry_date) as days_with_entries,
        SUM(amount_ml) as total_ml
      FROM water_entries 
      WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
    `, [userId, startDate, endDate]);

    const stats = result.rows[0];
    const daysWithEntries = parseInt(stats.days_with_entries);
    const totalMl = stats.total_ml ? parseInt(stats.total_ml) : 0;

    return {
      days_with_entries: daysWithEntries,
      total_ml: totalMl,
      average_daily_ml: daysWithEntries > 0 ? Math.round(totalMl / daysWithEntries) : 0
    };
  }

  // Actualizar entrada de agua
  static async update(id, updateData) {
    const { amount_ml, entry_date } = updateData;

    const updateQuery = `
      UPDATE water_entries 
      SET 
        amount_ml = COALESCE($1, amount_ml),
        entry_date = COALESCE($2, entry_date)
      WHERE id = $3
      RETURNING *
    `;

    const values = [amount_ml, entry_date, id];
    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('Entrada de agua no encontrada');
    }
    return new WaterEntry(result.rows[0]);
  }

  // Eliminar entrada de agua
  static async delete(id) {
    const result = await query('DELETE FROM water_entries WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      throw new Error('Entrada de agua no encontrada');
    }
    return new WaterEntry(result.rows[0]);
  }

  // Convertir mililitros a litros
  static mlToLiters(ml) {
    return Math.round(ml / 1000 * 10) / 10;
  }

  // Convertir litros a mililitros
  static litersToMl(liters) {
    return Math.round(liters * 1000);
  }

  // Convertir a objeto público
  toPublicObject() {
    return {
      id: this.id,
      user_id: this.user_id,
      amount_ml: this.amount_ml,
      amount_liters: WaterEntry.mlToLiters(this.amount_ml),
      entry_date: this.entry_date,
      created_at: this.created_at
    };
  }
}

module.exports = WaterEntry;
