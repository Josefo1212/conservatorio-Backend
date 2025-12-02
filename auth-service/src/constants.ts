// Mensajes de error y éxito centralizados
export const MESSAGES = {
  // Errores generales
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  BAD_REQUEST: 'Solicitud incorrecta',
  VALIDATION_ERROR: 'Error de validación',

  // Autenticación
  LOGIN_SUCCESS: 'Login exitoso',
  LOGOUT_SUCCESS: 'Logout exitoso',
  TOKEN_VALID: 'Token válido',
  TOKEN_INVALID: 'Token inválido',
  REFRESH_SUCCESS: 'Token refrescado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  PASSWORD_RESET_SUCCESS: 'Contraseña actualizada exitosamente',
  USER_EXISTS: 'Usuario ya registrado',
  ROLE_NOT_FOUND: 'Rol especificado no existe',
  ACCESS_DENIED: 'Acceso denegado',
  ACCESS_DENIED_REGISTER: 'Acceso denegado: solo personal o master pueden registrar usuarios',
  ROLE_NOT_ASSIGNED: 'Rol no asignado al usuario',
  ROLE_SELECTED: 'Rol seleccionado',

  // Validaciones
  REQUIRED_FIELDS: 'Campos requeridos faltantes',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
  CEDULA_REQUIRED: 'Cédula requerida',
  ROLE_REQUIRED: 'Rol requerido',
  USER_ID_REQUIRED: 'userId requerido',

  // Registro
  REGISTER_SUCCESS: 'Usuario registrado correctamente',
  FORGOT_PASSWORD_EXISTS: 'Usuario encontrado, proceda a cambiar la contraseña',
};

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Roles permitidos
export const ALLOWED_ROLES = {
  REGISTER: ['personal', 'master'],
};