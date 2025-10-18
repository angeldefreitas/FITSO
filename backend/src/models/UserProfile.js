const { query } = require('../config/database');

class UserProfile {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.age = data.age;
    this.gender = data.gender;
    this.height = data.height; // en cm
    this.weight = data.weight; // en kg
    this.activity_level = data.activity_level;
    this.goal = data.goal;
    this.target_weight = data.target_weight;
    this.custom_nutrition_goals = data.custom_nutrition_goals;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear o actualizar perfil de usuario
  static async createOrUpdate(userId, profileData) {
    try {
      // Verificar si ya existe un perfil para este usuario
      const existingProfile = await UserProfile.findByUserId(userId);
      
      if (existingProfile) {
        // Actualizar perfil existente
        return await UserProfile.update(userId, profileData);
      } else {
        // Crear nuevo perfil
        return await UserProfile.create(userId, profileData);
      }
    } catch (error) {
      console.error('Error en createOrUpdate:', error);
      throw error;
    }
  }

  // Crear nuevo perfil
  static async create(userId, profileData) {
    const {
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      target_weight,
      custom_nutrition_goals
    } = profileData;

    const insertQuery = `
      INSERT INTO user_profiles (
        user_id, age, gender, height, weight, 
        activity_level, goal, target_weight, custom_nutrition_goals
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId,
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      target_weight,
      custom_nutrition_goals ? JSON.stringify(custom_nutrition_goals) : null
    ];

    const result = await query(insertQuery, values);
    return new UserProfile(result.rows[0]);
  }

  // Actualizar perfil existente
  static async update(userId, profileData) {
    const {
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      target_weight,
      custom_nutrition_goals
    } = profileData;

    const updateQuery = `
      UPDATE user_profiles 
      SET 
        age = COALESCE($1, age),
        gender = COALESCE($2, gender),
        height = COALESCE($3, height),
        weight = COALESCE($4, weight),
        activity_level = COALESCE($5, activity_level),
        goal = COALESCE($6, goal),
        target_weight = COALESCE($7, target_weight),
        custom_nutrition_goals = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $9
      RETURNING *
    `;

    const values = [
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      target_weight,
      custom_nutrition_goals ? JSON.stringify(custom_nutrition_goals) : null,
      userId
    ];

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('Perfil no encontrado');
    }

    return new UserProfile(result.rows[0]);
  }

  // Buscar perfil por ID de usuario
  static async findByUserId(userId) {
    const selectQuery = 'SELECT * FROM user_profiles WHERE user_id = $1';
    const result = await query(selectQuery, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new UserProfile(result.rows[0]);
  }

  // Buscar perfil por ID
  static async findById(profileId) {
    const selectQuery = 'SELECT * FROM user_profiles WHERE id = $1';
    const result = await query(selectQuery, [profileId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new UserProfile(result.rows[0]);
  }

  // Eliminar perfil
  static async delete(userId) {
    const deleteQuery = 'DELETE FROM user_profiles WHERE user_id = $1';
    const result = await query(deleteQuery, [userId]);
    return result.rowCount > 0;
  }

  // Convertir a objeto público (sin datos sensibles)
  toPublicObject() {
    return {
      id: this.id,
      user_id: this.user_id,
      age: this.age,
      gender: this.gender,
      height: this.height,
      weight: this.weight,
      activity_level: this.activity_level,
      goal: this.goal,
      target_weight: this.target_weight,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Obtener datos biométricos (para el modal de datos biométricos)
  getBiometricData() {
    return {
      age: this.age || 25,
      heightCm: this.height || 175,
      weightKg: this.weight || 70,
      gender: this.gender || 'male',
      activityLevel: this.activity_level || 'moderate'
    };
  }

  // Obtener datos de metas (para el modal de metas)
  getGoalsData() {
    return {
      goal: this.goal || 'lose_weight',
      weightGoalAmount: this.target_weight || 0.5,
      nutritionGoals: this.custom_nutrition_goals || null // Objetivos personalizados o null
    };
  }
}

module.exports = UserProfile;
