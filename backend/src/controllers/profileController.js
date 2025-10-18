const UserProfile = require('../models/UserProfile');

// Obtener perfil completo del usuario
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar perfil del usuario
    const profile = await UserProfile.findByUserId(userId);
    
    if (!profile) {
      return res.json({
        success: true,
        data: {
          profile: null,
          biometricData: {
            age: 25,
            heightCm: 175,
            weightKg: 70,
            gender: 'male',
            activityLevel: 'moderate'
          },
          goalsData: {
            goal: 'lose_weight',
            weightGoalAmount: 0.5,
            nutritionGoals: null
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        profile: profile.toPublicObject(),
        biometricData: profile.getBiometricData(),
        goalsData: profile.getGoalsData()
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar datos biométricos
const updateBiometricData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { age, heightCm, weightKg, gender, activityLevel } = req.body;

    // Validar datos requeridos
    if (!age || !heightCm || !weightKg || !gender || !activityLevel) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar rangos
    if (age < 13 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'La edad debe estar entre 13 y 120 años'
      });
    }

    if (heightCm < 100 || heightCm > 250) {
      return res.status(400).json({
        success: false,
        message: 'La altura debe estar entre 100 y 250 cm'
      });
    }

    if (weightKg < 30 || weightKg > 300) {
      return res.status(400).json({
        success: false,
        message: 'El peso debe estar entre 30 y 300 kg'
      });
    }

    const validGenders = ['male', 'female'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Género inválido. Debe ser male o female'
      });
    }

    const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    if (!validActivityLevels.includes(activityLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Nivel de actividad inválido'
      });
    }

    // Crear o actualizar perfil
    const profileData = {
      age: parseInt(age),
      gender,
      height: parseInt(heightCm),
      weight: parseFloat(weightKg),
      activity_level: activityLevel
    };

    const profile = await UserProfile.createOrUpdate(userId, profileData);

    res.json({
      success: true,
      message: 'Datos biométricos actualizados correctamente',
      data: {
        profile: profile.toPublicObject(),
        biometricData: profile.getBiometricData()
      }
    });
  } catch (error) {
    console.error('Error actualizando datos biométricos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar datos de metas
const updateGoalsData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal, weightGoalAmount, nutritionGoals } = req.body;

    // Validar datos requeridos
    if (!goal) {
      return res.status(400).json({
        success: false,
        message: 'El objetivo es requerido'
      });
    }

    const validGoals = ['lose_weight', 'maintain_weight', 'gain_weight'];
    if (!validGoals.includes(goal)) {
      return res.status(400).json({
        success: false,
        message: 'Objetivo inválido'
      });
    }

    // Validar weightGoalAmount según el objetivo
    if (goal !== 'maintain_weight') {
      if (!weightGoalAmount || weightGoalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad objetivo es requerida para este tipo de meta'
        });
      }

      if (weightGoalAmount > 5) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad objetivo no puede ser mayor a 5 kg/semana'
        });
      }
    }

    // Crear o actualizar perfil
    const profileData = {
      goal,
      target_weight: goal === 'maintain_weight' ? 0 : parseFloat(weightGoalAmount),
      custom_nutrition_goals: nutritionGoals === null ? null : nutritionGoals // Manejar explícitamente null para limpiar objetivos personalizados
    };

    const profile = await UserProfile.createOrUpdate(userId, profileData);

    res.json({
      success: true,
      message: 'Metas actualizadas correctamente',
      data: {
        goalsData: profile.getGoalsData()
      }
    });
  } catch (error) {
    console.error('Error actualizando metas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil completo
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Validar que al menos un campo esté presente
    const allowedFields = ['age', 'gender', 'height', 'weight', 'activity_level', 'goal', 'target_weight'];
    const hasValidField = allowedFields.some(field => profileData[field] !== undefined);
    
    if (!hasValidField) {
      return res.status(400).json({
        success: false,
        message: 'Al menos un campo debe ser proporcionado'
      });
    }

    const profile = await UserProfile.createOrUpdate(userId, profileData);

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        profile: profile.toPublicObject(),
        biometricData: profile.getBiometricData(),
        goalsData: profile.getGoalsData()
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar perfil
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await UserProfile.delete(userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Perfil no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getProfile,
  updateBiometricData,
  updateGoalsData,
  updateProfile,
  deleteProfile
};
