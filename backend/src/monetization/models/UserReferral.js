const { query } = require('../../config/database');

class UserReferral {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.affiliate_code = data.affiliate_code;
    this.referral_date = data.referral_date;
    this.is_premium = data.is_premium;
    this.premium_conversion_date = data.premium_conversion_date;
  }

  // Crear una nueva referencia de usuario
  static async create(referralData) {
    const { user_id, affiliate_code } = referralData;
    
    // Verificar que el usuario no tenga ya una referencia
    const existingReferral = await this.findByUserId(user_id);
    if (existingReferral) {
      throw new Error('El usuario ya tiene un código de referencia asignado');
    }

    // Verificar que el código de afiliado existe y está activo
    const affiliateExists = await query(
      'SELECT id FROM affiliate_codes WHERE code = $1 AND is_active = true',
      [affiliate_code]
    );
    
    if (affiliateExists.rows.length === 0) {
      throw new Error('Código de referencia inválido o inactivo');
    }

    const insertQuery = `
      INSERT INTO user_referrals (user_id, affiliate_code)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [user_id, affiliate_code];
    const result = await query(insertQuery, values);
    
    return new UserReferral(result.rows[0]);
  }

  // Buscar referencia por ID de usuario
  static async findByUserId(userId) {
    const selectQuery = `
      SELECT ur.*, ac.affiliate_name, ac.commission_percentage
      FROM user_referrals ur
      LEFT JOIN affiliate_codes ac ON ur.affiliate_code = ac.code
      WHERE ur.user_id = $1
    `;
    
    const result = await query(selectQuery, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    const referral = new UserReferral(row);
    referral.affiliate_name = row.affiliate_name;
    referral.commission_percentage = row.commission_percentage;
    return referral;
  }

  // Marcar usuario como premium (conversión)
  async markAsPremium() {
    const updateQuery = `
      UPDATE user_referrals 
      SET is_premium = true, 
          premium_conversion_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, [this.id]);
    this.is_premium = result.rows[0].is_premium;
    this.premium_conversion_date = result.rows[0].premium_conversion_date;
  }

  // Obtener todas las referencias de un afiliado
  static async findByAffiliateCode(affiliateCode, options = {}) {
    const { limit = 50, offset = 0, premium_only = false } = options;
    
    let whereClause = 'WHERE ur.affiliate_code = $1';
    const params = [affiliateCode];
    
    if (premium_only) {
      whereClause += ' AND ur.is_premium = true';
    }

    const selectQuery = `
      SELECT ur.*, u.name as user_name, u.email as user_email
      FROM user_referrals ur
      JOIN users u ON ur.user_id = u.id
      ${whereClause}
      ORDER BY ur.referral_date DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const result = await query(selectQuery, params);
    
    return result.rows.map(row => {
      const referral = new UserReferral(row);
      // Agregar los campos adicionales al objeto
      referral.user_name = row.user_name;
      referral.user_email = row.user_email;
      return referral;
    });
  }

  // Obtener estadísticas de conversión por afiliado
  static async getConversionStats(affiliateCode) {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN is_premium = true THEN 1 END) as premium_conversions,
        ROUND(
          (COUNT(CASE WHEN is_premium = true THEN 1 END) * 100.0) / COUNT(*), 2
        ) as conversion_rate,
        AVG(
          CASE 
            WHEN is_premium = true 
            THEN EXTRACT(EPOCH FROM (premium_conversion_date - referral_date)) / 86400
          END
        ) as avg_days_to_conversion
      FROM user_referrals 
      WHERE affiliate_code = $1
    `;
    
    const result = await query(statsQuery, [affiliateCode]);
    return result.rows[0];
  }

  // Convertir a objeto público
  toPublicObject() {
    return {
      id: this.id,
      user_id: this.user_id,
      affiliate_code: this.affiliate_code,
      referral_date: this.referral_date,
      is_premium: this.is_premium,
      premium_conversion_date: this.premium_conversion_date,
      user_name: this.user_name,
      user_email: this.user_email
    };
  }
}

module.exports = UserReferral;
