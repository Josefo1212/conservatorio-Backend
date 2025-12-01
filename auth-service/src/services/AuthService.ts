import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/token.utils';
import { getUserByCedula, insertSession, updateSessionLogout, getSessionByRefreshToken, getUserRole, updateUserPassword } from '../queries/auth.queries';
import { registerUser, RegisterPayload } from '../queries/register.queries';

export class AuthService {
  public async login(cedula: string, password: string, ipOrigen: string) {
    const { rows } = await getUserByCedula(cedula);
    const user = rows[0];
    if (!user) throw new Error('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Credenciales inválidas');

    const rol = await getUserRole(user.id_usuario);
    if (!rol) throw new Error('Usuario sin rol asignado');

    const accessToken = generateAccessToken(user.id_usuario, rol);
    const refreshToken = generateRefreshToken(user.id_usuario);
    const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await insertSession(user.id_usuario, ipOrigen, refreshToken, refreshExp);

    return {
      accessToken,
      refreshToken,
      refreshExp,
      userId: user.id_usuario,
      rol,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,
    };
  }

  public async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) throw new Error('Refresh token inválido');

    const { rows } = await getSessionByRefreshToken(refreshToken);
    if (rows.length === 0) throw new Error('Sesión inválida');

    const rol = await getUserRole(payload.userId);
    const newAccessToken = generateAccessToken(payload.userId, rol);
    return { accessToken: newAccessToken };
  }

  public async logout(refreshToken: string) {
    const { rows } = await getSessionByRefreshToken(refreshToken);
    if (rows.length > 0) {
      await updateSessionLogout(rows[0].id_sesion);
    }
  }

  public async forgotPassword(cedula: string) {
    const { rows } = await getUserByCedula(cedula);
    return rows.length > 0;
  }

  public async resetPassword(cedula: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(cedula, hashedPassword);
  }

  public async register(payload: Omit<RegisterPayload, 'password'> & { password: string }) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    return registerUser({ ...payload, password: hashedPassword });
  }
}

const authService = new AuthService();
export default authService;
