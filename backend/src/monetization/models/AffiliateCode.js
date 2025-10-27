const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

class AffiliateCode {
  constructor(data) {
    this.id = data.id;
    this.code = data.code;
    this.created_by = data.created_by;
    this.commission_percentage = data.commission_percentage;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear un nuevo código de afiliado
  static async create(affiliateData) {
    const { code, created_by, commission_percentage = 30 } = affiliateData;
    
    // Si no se proporciona código, generar uno único
    let finalCode = code;
    if (!finalCode) {
      finalCode = `AFF_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }

    const insertQuery = `
      INSERT INTO affiliate_codes (id, code, created_by, commission_percentage, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      uuidv4(),
      finalCode, 
      created_by, 
      commission_percentage, 
      true, 
      new Date(), 
      new Date()
    ];
    const result = await query(insertQuery, values);
    
    return new AffiliateCode(result.rows[0]);
  }

  // Buscar código por código
  static async findByCode(code) {
    const selectQuery = 'SELECT * FROM affiliate_codes WHERE code = $1 AND is_active = true';
    const result = await query(selectQuery, [code]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new AffiliateCode(result.rows[0]);
  }

  // Buscar código por ID
  static async findById(id) {
    const selectQuery = 'SELECT * FROM affiliate_codes WHERE id = $1';
    const result = await query(selectQuery, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new AffiliateCode(result.rows[0]);
  }

  // Buscar código por ID de afiliado (usuario que es afiliado)
  static async findByAffiliateId(affiliateId) {
    const selectQuery = 'SELECT * FROM affiliate_codes WHERE created_by = $1 AND is_active = true';
    const result = await query(selectQuery, [affiliateId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new AffiliateCode(result.rows[0]);
  }

  // Obtener todos los códigos activos
  static async findAllActive() {
    const selectQuery = `
      SELECT ac.*, 
             COUNT(ur.id) as total_referrals,
             COUNT(CASE WHEN ur.is_premium = true THEN 1 END) as premium_referrals,
             COALESCE(SUM(afc.commission_amount), 0) as total_commissions
      FROM affiliate_codes ac
      LEFT JOIN user_referrals ur ON ac.code = ur.affiliate_code
      LEFT JOIN affiliate_commissions afc ON ac.code = afc.affiliate_code
      WHERE ac.is_active = true
      GROUP BY ac.id
      ORDER BY ac.created_at DESC
    `;
    
    const result = await query(selectQuery);
    return result.rows.map(row => new AffiliateCode(row));
  }

  // Desactivar código
  async deactivate() {
    const updateQuery = `
      UPDATE affiliate_codes 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, [this.id]);
    this.is_active = result.rows[0].is_active;
    this.updated_at = result.rows[0].updated_at;
  }

  // Activar código
  async activate() {
    const updateQuery = `
      UPDATE affiliate_codes 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, [this.id]);
    this.is_active = result.rows[0].is_active;
    this.updated_at = result.rows[0].updated_at;
  }

  // Actualizar porcentaje de comisión
  async updateCommissionPercentage(newPercentage) {
    const updateQuery = `
      UPDATE affiliate_codes 
      SET commission_percentage = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(updateQuery, [newPercentage, this.id]);
    this.commission_percentage = result.rows[0].commission_percentage;
    this.updated_at = result.rows[0].updated_at;
  }

  // Obtener estadísticas del afiliado
  async getStats() {
    const statsQuery = `
      SELECT 
        COUNT(ur.id) as total_referrals,
        COALESCE(SUM(afc.commission_amount), 0) as total_commissions
      FROM affiliate_codes ac
      LEFT JOIN user_referrals ur ON ac.code = ur.affiliate_code
      LEFT JOIN affiliate_commissions afc ON ac.code = afc.affiliate_code
      WHERE ac.code = $1
      GROUP BY ac.id
    `;
    
    const result = await query(statsQuery, [this.code]);
    return result.rows[0] || { total_referrals: 0, total_commissions: 0 };
  }

  // Convertir a objeto público
  toPublicObject() {
    return {
      id: this.id,
      code: this.code,
      affiliate_name: this.affiliate_name,
      commission_percentage: this.commission_percentage,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = AffiliateCode;
