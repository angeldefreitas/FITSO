const { query } = require('../../config/database');

class AffiliateCommission {
  constructor(data) {
    this.id = data.id;
    this.affiliate_code = data.affiliate_code;
    this.user_id = data.user_id;
    this.subscription_id = data.subscription_id;
    this.commission_amount = data.commission_amount;
    this.commission_percentage = data.commission_percentage;
    this.subscription_amount = data.subscription_amount;
    this.payment_period_start = data.payment_periodsub_start;
    this.payment_period_end = data.payment_period_end;
    this.is_paid = data.is_paid;
    this.paid_date = data.paid_date;
    this.payment_method = data.payment_method;
    this.payment_reference = data.payment_reference;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear una nueva comisión
  static async create(commissionData) {
    const {
      affiliate_code,
      user_id,
      subscription_id,
      subscription_amount,
      commission_percentage,
      payment_period_start,
      payment_period_end
    } = commissionData;

    // Calcular monto de comisión
    const commission_amount = (subscription_amount * commission_percentage) / 100;

    const insertQuery = `
      INSERT INTO affiliate_commissions (
        affiliate_code, user_id, subscription_id, commission_amount,
        commission_percentage, subscription_amount, payment_period_start,
        payment_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      affiliate_code, user_id, subscription_id, commission_amount,
      commission_percentage, subscription_amount, payment_period_start,
      payment_period_end
    ];

    const result = await query(insertQuery, values);
    return new AffiliateCommission(result.rows[0]);
  }

  // Obtener comisiones por código de afiliado
  static async findByAffiliateCode(affiliateCode, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      paid_only = false, 
      unpaid_only = false,
      date_from = null,
      date_to = null
    } = options;

    let whereClause = 'WHERE ac.affiliate_code = $1';
    const params = [affiliateCode];

    if (paid_only) {
      whereClause += ' AND ac.is_paid = true';
    } else if (unpaid_only) {
      whereClause += ' AND ac.is_paid = false';
    }

    if (date_from) {
      whereClause += ' AND ac.payment_period_start >= $' + (params.length + 1);
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND ac.payment_period_end <= $' + (params.length + 1);
      params.push(date_to);
    }

    const selectQuery = `
      SELECT 
        ac.*,
        u.name as user_name,
        u.email as user_email,
        afc.affiliate_name
      FROM affiliate_commissions ac
      JOIN users u ON ac.user_id = u.id
      JOIN affiliate_codes afc ON ac.affiliate_code = afc.code
      ${whereClause}
      ORDER BY ac.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const result = await query(selectQuery, params);

    return result.rows.map(row => new AffiliateCommission(row));
  }

  // Obtener comisiones pendientes de pago
  static async findPendingPayments(affiliateCode = null) {
    let whereClause = 'WHERE ac.is_paid = false';
    const params = [];

    if (affiliateCode) {
      whereClause += ' AND ac.affiliate_code = $1';
      params.push(affiliateCode);
    }

    const selectQuery = `
      SELECT 
        ac.*,
        u.name as user_name,
        afc.affiliate_name,
        afc.email as affiliate_email
      FROM affiliate_commissions ac
      JOIN users u ON ac.user_id = u.id
      JOIN affiliate_codes afc ON ac.affiliate_code = afc.code
      ${whereClause}
      ORDER BY ac.payment_period_end ASC
    `;

    const result = await query(selectQuery, params);
    return result.rows.map(row => new AffiliateCommission(row));
  }

  // Marcar comisión como pagada
  async markAsPaid(paymentData) {
    const { payment_method, payment_reference } = paymentData;

    const updateQuery = `
      UPDATE affiliate_commissions 
      SET is_paid = true, 
          paid_date = CURRENT_TIMESTAMP,
          payment_method = $1,
          payment_reference = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateQuery, [payment_method, payment_reference, this.id]);
    this.is_paid = result.rows[0].is_paid;
    this.paid_date = result.rows[0].paid_date;
    this.payment_method = result.rows[0].payment_method;
    this.payment_reference = result.rows[0].payment_reference;
    this.updated_at = result.rows[0].updated_at;
  }

  // Obtener estadísticas de comisiones por afiliado
  static async getStatsByAffiliate(affiliateCode, dateFrom = null, dateTo = null) {
    let whereClause = 'WHERE ac.affiliate_code = $1';
    const params = [affiliateCode];

    if (dateFrom) {
      whereClause += ' AND ac.payment_period_start >= $' + (params.length + 1);
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND ac.payment_period_end <= $' + (params.length + 1);
      params.push(dateTo);
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_commissions,
        SUM(ac.commission_amount) as total_commission_amount,
        SUM(CASE WHEN ac.is_paid = true THEN ac.commission_amount ELSE 0 END) as paid_commission_amount,
        SUM(CASE WHEN ac.is_paid = false THEN ac.commission_amount ELSE 0 END) as pending_commission_amount,
        AVG(ac.commission_percentage) as avg_commission_percentage,
        COUNT(CASE WHEN ac.is_paid = true THEN 1 END) as paid_commissions_count,
        COUNT(CASE WHEN ac.is_paid = false THEN 1 END) as pending_commissions_count
      FROM affiliate_commissions ac
      ${whereClause}
    `;

    const result = await query(statsQuery, invoice);
    return result.rows[0];
  }

  // Procesar pago de múltiples comisiones
  static async processBulkPayment(affiliateCode, commissionIds, paymentData) {
    const { payment_method, payment_reference } = paymentData;

    const updateQuery = `
      UPDATE affiliate_commissions 
      SET is_paid = true, 
          paid_date = CURRENT_TIMESTAMP,
          payment_method = $1,
          payment_reference = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE affiliate_code = $3 
      AND id = ANY($4)
      RETURNING *
    `;

    const result = await query(updateQuery, [payment_method, payment_reference, affiliateCode, commissionIds]);
    
    // Crear registro de pago
    const totalAmount = result.rows.reduce((sum, row) => sum + parseFloat(row.commission_amount), 0);
    
    const insertPaymentQuery = `
      INSERT INTO affiliate_payments (
        affiliate_code, total_amount, commission_count, 
        payment_method, payment_reference
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const paymentResult = await query(insertPaymentQuery, [
      affiliateCode, totalAmount, result.rows.length, payment_method, payment_reference
    ]);

    return {
      commissions: result.rows,
      payment: paymentResult.rows[0]
    };
  }

  // Convertir a objeto público
  toPublicObject() {
    return {
      id: this.id,
      affiliate_code: this.affiliate_code,
      user_id: this.user_id,
      subscription_id: this.subscription_id,
      commission_amount: this.commission_amount,
      commission_percentage: this.commission_percentage,
      subscription_amount: this.subscription_amount,
      payment_period_start: this.payment_period_start,
      payment_period_end: this.payment_period_end,
      is_paid: this.is_paid,
      paid_date: this.paid_date,
      payment_method: this.payment_method,
      payment_reference: this.payment_reference,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = AffiliateCommission;
