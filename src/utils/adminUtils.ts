import { isAdminEmail } from '../config/adminConfig';

/**
 * Utilidades para manejar administradores
 */

/**
 * Verificar si un usuario es administrador por email
 */
export const checkAdminByEmail = (email: string): boolean => {
  return isAdminEmail(email);
};

/**
 * Verificar si un usuario es administrador por ID (usando base de datos)
 */
export const checkAdminById = async (userId: string): Promise<boolean> => {
  try {
    // Aquí harías la llamada a tu API para verificar si es admin
    // const response = await apiService.get(`/api/users/${userId}/admin-status`);
    // return response.data.is_admin;
    
    // Por ahora simulamos
    return false;
  } catch (error) {
    console.error('Error checking admin by ID:', error);
    return false;
  }
};

/**
 * Convertir un usuario en administrador
 */
export const makeUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // Aquí harías la llamada a tu API para convertir en admin
    // const response = await apiService.post('/api/admin/make-admin', { email });
    // return response.success;
    
    console.log(`Usuario ${email} convertido en administrador`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

/**
 * Remover privilegios de administrador
 */
export const removeAdminPrivileges = async (email: string): Promise<boolean> => {
  try {
    // Aquí harías la llamada a tu API para remover admin
    // const response = await apiService.post('/api/admin/remove-admin', { email });
    // return response.success;
    
    console.log(`Privilegios de admin removidos para ${email}`);
    return true;
  } catch (error) {
    console.error('Error removing admin privileges:', error);
    return false;
  }
};
