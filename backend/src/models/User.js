const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.password = data.password; // Para compatibilidad con el controlador
    this.name = data.name;
    this.is_verified = data.is_verified;
    this.is_affiliate = data.is_affiliate;
    this.verification_token = data.verification_token;
    this.reset_password_token = data.reset_password_token;
    this.reset_password_expires = data.reset_password_expires;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear un nuevo usuario
  static async create(userData) {
    const { email, password, name } = userData;
    
    // Verificar si el usuario ya existe
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Generar token de verificación
    const verification_token = uuidv4();

    const insertQuery = `
      INSERT INTO users (email, password_hash, name, verification_token)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [email, password_hash, name, verification_token];
    const result = await query(insertQuery, values);
    
    return new User(result.rows[0]);
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const selectQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await query(selectQuery, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Buscar usuario por ID
  static async findById(id) {
    const selectQuery = 'SELECT * FROM users WHERE id = $1';
    const result = await query(selectQuery, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Verificar contraseña
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Actualizar contraseña
  async updatePassword(newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(updateQuery, [password_hash, this.id]);
    this.password_hash = result.rows[0].password_hash;
    this.updated_at = result.rows[0].updated_at;
  }

  // Establecer token de reset de contraseña
  async setResetPasswordToken() {
    const reset_token = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hora
    
    const updateQuery = `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(updateQuery, [reset_token, expires, this.id]);
    this.reset_password_token = result.rows[0].reset_password_token;
    this.reset_password_expires = result.rows[0].reset_password_expires;
    
    return reset_token;
  }

  // Limpiar token de reset de contraseña
  async clearResetPasswordToken() {
    const updateQuery = `
      UPDATE users 
      SET reset_password_token = NULL, reset_password_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, [this.id]);
    this.reset_password_token = null;
    this.reset_password_expires = null;
  }

  // Verificar usuario
  async verify() {
    const updateQuery = `
      UPDATE users 
      SET is_verified = TRUE, verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, [this.id]);
    this.is_verified = result.rows[0].is_verified;
    this.verification_token = result.rows[0].verification_token;
  }

  // Marcar como verificado (alias para verify)
  async markAsVerified() {
    return await this.verify();
  }

  // Buscar por token de verificación
  static async findByVerificationToken(token) {
    const selectQuery = 'SELECT * FROM users WHERE verification_token = $1';
    const result = await query(selectQuery, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Buscar por token de reset de contraseña
  static async findByResetToken(token) {
    const selectQuery = `
      SELECT * FROM users 
      WHERE reset_password_token = $1 AND reset_password_expires > NOW()
    `;
    const result = await query(selectQuery, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Eliminar usuario
  async delete() {
    const deleteQuery = 'DELETE FROM users WHERE id = $1';
    await query(deleteQuery, [this.id]);
  }

  // Convertir a objeto público (sin datos sensibles)
  toPublicObject() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      is_verified: this.is_verified,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Guardar usuario (crear nuevo)
  async save() {
    const insertQuery = `
      INSERT INTO users (email, password_hash, name, is_verified, is_affiliate)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      this.email, 
      this.password_hash, 
      this.name, 
      this.is_verified || false, 
      this.is_affiliate || false
    ];
    
    const result = await query(insertQuery, values);
    return new User(result.rows[0]);
  }

  // Actualizar contraseña del usuario
  static async updatePassword(id, newPasswordHash) {
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, name
    `;

    const result = await query(updateQuery, [newPasswordHash, id]);
    
    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return result.rows[0];
  }
}

module.exports = User;
