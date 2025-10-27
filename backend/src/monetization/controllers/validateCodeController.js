const { query } = require('../../config/database');

class ValidateCodeController {
  /**
   * Validar código de afiliado (endpoint público)
   * GET /api/affiliates/validate/:code
   */
  async validateCode(req, res) {
    try {
      const { code } = req.params;
      
      console.log(`🔍 [VALIDATE] Validando código: ${code}`);

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Código requerido'
        });
      }

      // Buscar código en la base de datos
      const result = await query(`
        SELECT 
          code,
          affiliate_name,
          commission_percentage,
          is_active,
          created_at
        FROM affiliate_codes
        WHERE UPPER(code) = UPPER($1)
      `, [code]);

      if (result.rows.length === 0) {
        console.log(`❌ [VALIDATE] Código no encontrado: ${code}`);
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      const affiliateCode = result.rows[0];

      if (!affiliateCode.is_active) {
        console.log(`⚠️ [VALIDATE] Código inactivo: ${code}`);
        return res.status(400).json({
          success: false,
          message: 'Este código de afiliado no está activo'
        });
      }

      console.log(`✅ [VALIDATE] Código válido: ${code}`);
      res.json({
        success: true,
        message: 'Código válido',
        data: {
          code: affiliateCode.code,
          affiliate_name: affiliateCode.affiliate_name,
          commission_percentage: parseFloat(affiliateCode.commission_percentage),
          is_active: affiliateCode.is_active
        }
      });

    } catch (error) {
      console.error('❌ [VALIDATE] Error validando código:', error);
      res.status(500).json({
        success: false,
        message: 'Error validando código de afiliado'
      });
    }
  }
}

module.exports = new ValidateCodeController();

