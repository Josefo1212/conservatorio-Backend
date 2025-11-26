import { Request, Response } from "express";
import { getUserByCedula, insertSession, updateSessionLogout, getSessionByRefreshToken } from "../queries/auth.queries";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../middleware/token.utils";

export async function login(req: Request, res: Response) {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) return res.status(400).json({ message: 'cedula y contraseña requeridos' });

    const { rows } = await getUserByCedula(cedula);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Credenciales inválidas' });

    console.log('Usuario autenticado, generando tokens...');
    // Generate tokens
    const accessToken = generateAccessToken(user.id_usuario);
    const refreshToken = generateRefreshToken(user.id_usuario);
    const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Insert session
    const ipOrigen = req.ip || req.connection.remoteAddress || 'unknown';
    await insertSession(user.id_usuario, ipOrigen, refreshToken, refreshExp);
    console.log('Sesión insertada en BD');

    // Set cookies
    res.cookie('refreshToken', refreshToken, { httpOnly: false, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    console.log('Cookie de refresh token establecida');

    res.status(200).json({ message: 'Login exitoso', accessToken, user: { id: user.id_usuario } });
    console.log('Login completado exitosamente');
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

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return res.status(401).json({ message: 'Refresh token inválido' });

    const { rows } = await getSessionByRefreshToken(refreshToken);
    if (rows.length === 0) return res.status(401).json({ message: 'Sesión inválida' });

    console.log('Refresh token verificado, generando nuevo access token');
    const newAccessToken = generateAccessToken(payload.userId);
    res.status(200).json({ accessToken: newAccessToken });
    console.log('Nuevo access token enviado');
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    console.log('Refresh token en logout:', refreshToken);
    if (refreshToken) {
      const { rows } = await getSessionByRefreshToken(refreshToken);
      console.log('Sesiones encontradas para refresh token:', rows.length);
      if (rows.length > 0) {
        await updateSessionLogout(rows[0].id_sesion);
      }
    }
    console.log('Sesión revocada, cookie limpiada');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}