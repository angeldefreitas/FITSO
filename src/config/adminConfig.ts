/**
 * Configuración de Administradores
 * 
 * Agrega aquí los emails de los usuarios que deben tener acceso de administrador
 */

export const ADMIN_EMAILS = [
  'angelfritas@gmail.com',  // Tu email principal
  'admin@fitso.com',        // Email de administración
  'developer@fitso.com',    // Email de desarrollo
];

/**
 * Verificar si un email es de administrador
 */
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Agregar un nuevo administrador
 */
export const addAdminEmail = (email: string): void => {
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    ADMIN_EMAILS.push(email.toLowerCase());
  }
};

/**
 * Remover un administrador
 */
export const removeAdminEmail = (email: string): void => {
  const index = ADMIN_EMAILS.indexOf(email.toLowerCase());
  if (index > -1) {
    ADMIN_EMAILS.splice(index, 1);
  }
};
