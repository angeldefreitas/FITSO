const AffiliateCode = require('../models/AffiliateCode');
const UserReferral = require('../models/UserReferral');
const AffiliateCommission = require('../models/AffiliateCommission');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

class AffiliateController {
  /**
   * Crear una cuenta de afiliado completa (Admin only)
   * POST /api/affiliates/create-account
   */
  async createAffiliateAccount(req, res) {
    try {
      const { email, name, password, referralCode, commissionPercentage = 30.0 } = req.body;

      // Validaciones
      if (!email || !name || !password || !referralCode) {
        return res.status(400).json({
          success: false,
          message: 'Email, nombre, contraseña y código de referido son requeridos'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          competition: false,
          message: 'Ya existe un usuario con este email'
        });
      }

      // Verificar si el código de referido ya existe
      const existingCode = await AffiliateCode.findByCode(referralCode);
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un código de referido con este nombre'
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = new User({
        email,
        name,
        password: hashedPassword,
        is_verified: true, // Los afiliados creados por admin están verificados
        is_affiliate: true // Marcar como afiliado
      });

      const createdUser = await user.save();
      console.log('✅ Usuario afiliado creado:', createdUser.id);

      // Crear código de afiliado
      const affiliateCode = new AffiliateCode({
        code: referralCode,
        affiliate_id: createdUser.id,
        commission_percentage: parseFloat(commissionPercentage)
      });

      const createdCode = await affiliateCode.save();
      console.log('✅ Código de afiliado creado:', createdCode.id);

      res.status(201).json({
        success: true,
        message: 'Cuenta de afiliado creada exitosamente',
        data: {
          user: {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            is_affiliate: true
          },
          affiliateCode: {
            id: createdCode.id,
            code: createdCode.code,
            commission_percentage: createdCode.commission_percentage
          }
        }
      });

    } catch (error) {
      console.error('❌ Error creando cuenta de afiliado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo código de afiliado
   * POST /api/affiliates/codes
   */
  async createAffiliateCode(req, res) {
    try {
      const { affiliate_name, email, commission_percentage = 30 } = req.body;
      const created_by = req.user.id; // Del middleware de autenticación

      if (!affiliate_name) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del afiliado es requerido'
        });
      }

      const affiliateCode = await AffiliateCode.create({
        affiliate_name,
        email,
        commission_percentage,
        created_by
      });

      res.status(201).json({
        success: true,
        message: 'Código de afiliado creado exitosamente',
        data: affiliateCode.toPublicObject()
      });

    } catch (error) {
      console.error('❌ Error creando código de afiliado:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener todos los códigos de afiliado
   * GET /api/affiliates/codes
   */
  async getAllAffiliateCodes(req, res) {
    try {
      const codes = await AffiliateCode.findAllActive();

      res.json({
        success: true,
        data: codes.map(code => code.toPublicObject())
      });

    } catch (error) {
      console.error('❌ Error obteniendo códigos de afiliado:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo códigos de afiliado'
      });
    }
  }

  /**
   * Registrar código de referencia para un usuario
   * POST /api/affiliates/referral
   */
  async registerReferralCode(req, res) {
    try {
      const { referral_code } = req.body;
      const user_id = req.user.id;

      if (!referral_code) {
        return res.status(400).json({
          success: false,
          message: 'El código de referencia es requerido'
        });
      }

      // Verificar que el usuario no tenga ya una referencia
      const existingReferral = await UserReferral.findByUserId(user_id);
      if (existingReferral) {
        return res.status(400).json({
          success: false,
          message: 'Ya tienes un código de referencia registrado'
        });
      }

      const referral = await UserReferral.create({
        user_id,
        affiliate_code: referral_code.toUpperCase()
      });

      res.status(201).json({
        success: true,
        message: 'Código de referencia registrado exitosamente',
        data: referral.toPublicObject()
      });

    } catch (error) {
      console.error('❌ Error registrando código de referencia:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener información de referencia del usuario
   * GET /api/affiliates/my-referral
   */
  async getMyReferral(req, res) {
    try {
      const user_id = req.user.id;
      const referral = await UserReferral.findByUserId(user_id);

      if (!referral) {
        return res.json({
          success: true,
          data: null,
          message: 'No tienes código de referencia registrado'
        });
      }

      res.json({
        success: true,
        data: referral.toPublicObject()
      });

    } catch (error) {
      console.error('❌ Error obteniendo referencia del usuario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información de referencia'
      });
    }
  }

  /**
   * Obtener estadísticas de un afiliado
   * GET /api/affiliates/stats/:code
   */
  async getAffiliateStats(req, res) {
    try {
      const { code } = req.params;
      
      const affiliateCode = await AffiliateCode.findByCode(code);
      if (!affiliateCode) {
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      const [stats, conversionStats, commissionStats] = await Promise.all([
        affiliateCode.getStats(),
        UserReferral.getConversionStats(code),
        AffiliateCommission.getStatsByAffiliate(code)
      ]);

      res.json({
        success: true,
        data: {
          affiliate: affiliateCode.toPublicObject(),
          referrals: stats,
          conversion: conversionStats,
          commissions: commissionStats
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del afiliado:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      });
    }
  }

  /**
   * Obtener referidos de un afiliado
   * GET /api/affiliates/referrals/:code
   */
  async getAffiliateReferrals(req, res) {
    try {
      const { code } = req.params;
      const { limit = 50, offset = 0, premium_only = false } = req.query;

      const referrals = await UserReferral.findByAffiliateCode(code, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        premium_only: premium_only === 'true'
      });

      res.json({
        success: true,
        data: referrals.map(referral => referral.toPublicObject())
      });

    } catch (error) {
      console.error('❌ Error obteniendo referidos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo referidos'
      });
    }
  }

  /**
   * Obtener comisiones de un afiliado
   * GET /api/affiliates/commissions/:code
   */
  async getAffiliateCommissions(req, res) {
    try {
      const { code } = req.params;
      const { 
        limit = 50, 
        offset = 0, 
        paid_only = false, 
        unpaid_only = false,
        date_from = null,
        date_to = null
      } = req.query;

      const commissions = await AffiliateCommission.findByAffiliateCode(code, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        paid_only: paid_only === 'true',
        unpaid_only: unpaid_only === 'true',
        date_from,
        date_to
      });

      res.json({
        success: true,
        data: commissions.map(commission => commission.toPublicObject())
      });

    } catch (error) {
      console.error('❌ Error obteniendo comisiones:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo comisiones'
      });
    }
  }

  /**
   * Cambiar contraseña de afiliado
   * POST /api/affiliates/change-password
   */
  async changeAffiliatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      // Obtener usuario actual
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Encriptar nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await User.updatePassword(userId, hashedNewPassword);

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Procesar pago de comisiones
   * POST /api/affiliates/payments
   */
  async processCommissionPayment(req, res) {
    try {
      const { 
        affiliate_code, 
        commission_ids, 
        payment_method, 
        payment_reference 
      } = req.body;

      if (!affiliate_code || !commission_ids || !payment_method) {
        return res.status(400).json({
          success: false,
          message: 'Código de afiliado, IDs de comisiones y método de pago son requeridos'
        });
      }

      const result = await AffiliateCommission.processBulkPayment(
        affiliate_code,
        commission_ids,
        { payment_method, payment_reference }
      );

      res.json({
        success: true,
        message: 'Pago procesado exitosamente',
        data: {
          commissions_paid: result.commissions.length,
          total_amount: result.payment.total_amount,
          payment: result.payment
        }
      });

    } catch (error) {
      console.error('❌ Error procesando pago:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error procesando pago'
      });
    }
  }

  /**
   * Obtener comisiones pendientes de pago
   * GET /api/affiliates/pending-payments
   */
  async getPendingPayments(req, res) {
    try {
      const { affiliate_code } = req.query;
      
      const pendingCommissions = await AffiliateCommission.findPendingPayments(affiliate_code);

      res.json({
        success: true,
        data: pendingCommissions.map(commission => commission.toPublicObject())
      });

    } catch (error) {
      console.error('❌ Error obteniendo pagos pendientes:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo pagos pendientes'
      });
    }
  }

  /**
   * Desactivar código de afiliado
   * DELETE /api/affiliates/codes/:id
   */
  async deactivateAffiliateCode(req, res) {
    try {
      const { id } = req.params;
      
      const affiliateCode = await AffiliateCode.findById(id);
      if (!affiliateCode) {
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      await affiliateCode.deactivate();

      res.json({
        success: true,
        message: 'Código de afiliado desactivado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error desactivando código de afiliado:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error desactivando código de afiliado'
      });
    }
  }
}

module.exports = new AffiliateController();
