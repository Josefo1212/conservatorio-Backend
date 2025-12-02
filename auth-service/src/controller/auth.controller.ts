import { Request, Response } from "express";
import authService from "../services/AuthService";
import { verifyRefreshToken, generateAccessToken } from "../middleware/token.utils";
import { getUserRolesList } from "../queries/auth.queries";
import { MESSAGES, HTTP_STATUS, ALLOWED_ROLES } from "../constants";
import { successResponse, errorResponse, validateRequired, hasRequiredRole } from "../utils";

export async function login(req: Request, res: Response) {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) return errorResponse(res, MESSAGES.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST);

    const ipOrigen = req.ip || (req.connection as any).remoteAddress || 'unknown';
    const { accessToken, refreshToken, rol, nombres, apellidos } = await authService.login(cedula, password, ipOrigen);

    // Guardar ambos tokens en cookies (httpOnly)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // No enviar id, rol ni access token en el body
    return successResponse(res, MESSAGES.LOGIN_SUCCESS, {
      user: {
        nombres,
        apellidos,
      },
    }, HTTP_STATUS.OK);
  } catch (error) {
    console.error('Error en login:', error);
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR);
  }
}

export async function validate(req: Request, res: Response) {
  // Token already verified by middleware
  console.log('Token validado, usuario:', (req as any).user);
  res.status(200).json({ message: 'Token válido', user: (req as any).user });
}

export async function refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token requerido' });

    const { accessToken } = await authService.refresh(refreshToken);
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) await authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Devuelve todos los roles disponibles del usuario autenticado (vía refresh cookie)
export async function getAvailableRoles(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token requerido' });
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return res.status(401).json({ message: 'Refresh token inválido' });
    const roles = await getUserRolesList(payload.userId);
    return res.status(200).json({ roles });
  } catch (error) {
    console.error('Error en getAvailableRoles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Establece el rol activo del usuario re-emitiendo el accessToken en cookie
export async function selectRole(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const { role } = req.body || {};
    if (!refreshToken) return errorResponse(res, MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    if (!role) return errorResponse(res, MESSAGES.ROLE_REQUIRED, HTTP_STATUS.BAD_REQUEST);

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return errorResponse(res, MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);

    const roles = await getUserRolesList(payload.userId);

    // Verificar que el usuario tenga permisos (personal o master)
    if (!hasRequiredRole('personal', roles) && !hasRequiredRole('master', roles)) {
      return errorResponse(res, MESSAGES.ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
    }

    if (!roles.includes(role)) return errorResponse(res, MESSAGES.ROLE_NOT_ASSIGNED, HTTP_STATUS.FORBIDDEN);

    // Emitir nuevo access token con el rol elegido
    const accessToken = generateAccessToken(payload.userId, role);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    return successResponse(res, MESSAGES.ROLE_SELECTED, { role });
  } catch (error) {
    console.error('Error en selectRole:', error);
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { cedula } = req.body;
    if (!cedula) return res.status(400).json({ message: 'Cédula requerida' });

    const exists = await authService.forgotPassword(cedula);
    if (!exists) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json({ message: 'Usuario encontrado, proceda a cambiar la contraseña' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { cedula, newPassword, confirmPassword } = req.body;
    if (!cedula || !newPassword || !confirmPassword) return res.status(400).json({ message: 'Cédula, nueva contraseña y confirmación requeridas' });

    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    const exists = await authService.forgotPassword(cedula);
    if (!exists) return res.status(404).json({ message: 'Usuario no encontrado' });

    await authService.resetPassword(cedula, newPassword);

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || !hasRequiredRole(authenticatedUser.rol, ALLOWED_ROLES.REGISTER)) {
      return errorResponse(res, MESSAGES.ACCESS_DENIED_REGISTER, HTTP_STATUS.FORBIDDEN);
    }

    const {
      cedula,
      nombres,
      apellidos,
      correo,
      password,
      fecha_nacimiento,
      nro_tlf,
      estado,
      municipio,
      localidad,
      tipo_localidad,
      direccion,
      lugar_nacimiento,
      role,
      alumnoData,
      representanteData,
      profesorData,
      representantes
    } = req.body || {};

    const requiredFields = ['cedula', 'nombres', 'apellidos', 'correo', 'password', 'fecha_nacimiento', 'nro_tlf', 'estado', 'municipio', 'localidad', 'tipo_localidad', 'direccion', 'lugar_nacimiento', 'role'];
    const validationError = validateRequired(req.body, requiredFields);
    if (validationError) {
      return errorResponse(res, validationError, HTTP_STATUS.BAD_REQUEST);
    }

    const result = await authService.register({
      cedula,
      nombres,
      apellidos,
      correo,
      password,
      fecha_nacimiento,
      nro_tlf,
      estado,
      municipio,
      localidad,
      tipo_localidad,
      direccion,
      lugar_nacimiento,
      role,
      alumnoData,
      representanteData,
      profesorData,
      representantes,
    });

    return successResponse(res, MESSAGES.REGISTER_SUCCESS, result, HTTP_STATUS.CREATED);
  } catch (error: any) {
    console.error('REGISTER ERROR:', error);
    const msg = error?.message || MESSAGES.INTERNAL_SERVER_ERROR;
    const status = msg.includes('Usuario ya registrado') || msg.includes('Rol especificado no existe') || msg.includes('Datos de') ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return errorResponse(res, msg, status);
  }
}