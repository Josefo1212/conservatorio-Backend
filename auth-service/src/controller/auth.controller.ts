import { Request, Response } from "express";
import authService from "../services/AuthService";
import { verifyRefreshToken, generateAccessToken } from "../middleware/token.utils";
import { getUserRolesList } from "../queries/auth.queries";

export async function login(req: Request, res: Response) {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) return res.status(400).json({ message: 'cedula y contraseña requeridos' });

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

    // No enviar id ni access token en el body
    res.status(200).json({
      message: 'Login exitoso',
      user: {
        rol,
        nombres,
        apellidos,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
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
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token requerido' });
    if (!role) return res.status(400).json({ message: 'Rol requerido' });

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return res.status(401).json({ message: 'Refresh token inválido' });

    const roles = await getUserRolesList(payload.userId);
    if (!roles.includes(role)) return res.status(403).json({ message: 'Rol no asignado al usuario' });

    // Emitir nuevo access token con el rol elegido
    const accessToken = generateAccessToken(payload.userId, role);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({ message: 'Rol seleccionado', role });
  } catch (error) {
    console.error('Error en selectRole:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
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
    if (!authenticatedUser || !['personal', 'master'].includes(authenticatedUser.rol)) {
      return res.status(403).json({ message: 'Acceso denegado: solo personal o master pueden registrar usuarios' });
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

    if (!cedula || !nombres || !apellidos || !correo || !password || !fecha_nacimiento || !nro_tlf || !estado || !municipio || !localidad || !tipo_localidad || !direccion || !lugar_nacimiento || !role) {
      return res.status(400).json({ message: 'Datos requeridos faltantes' });
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

    return res.status(201).json({ message: 'Usuario registrado correctamente', data: result });
  } catch (error: any) {
    console.error('REGISTER ERROR:', error);
    const msg = error?.message || 'Error interno del servidor';
    const status = msg.includes('Usuario ya registrado') || msg.includes('Rol especificado no existe') || msg.includes('Datos de') ? 400 : 500;
    return res.status(status).json({ message: msg });
  }
}