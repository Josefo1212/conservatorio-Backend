import { Request, Response } from "express";
import authService from "../services/AuthService";

export async function login(req: Request, res: Response) {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) return res.status(400).json({ message: 'cedula y contraseña requeridos' });

    const ipOrigen = req.ip || (req.connection as any).remoteAddress || 'unknown';
    const { accessToken, refreshToken, userId } = await authService.login(cedula, password, ipOrigen);

    res.cookie('refreshToken', refreshToken, { httpOnly: false, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ message: 'Login exitoso', accessToken, user: { id: userId } });
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
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
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