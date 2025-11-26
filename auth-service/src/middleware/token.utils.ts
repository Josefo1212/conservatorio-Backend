import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function generateAccessToken(userId: number, rol: string) {
  return jwt.sign({ userId, rol }, process.env.JWT_SECRET || 'tu_clave_secreta_aqui', { expiresIn: '15m' });
}

export function generateRefreshToken(userId: number) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'tu_clave_secreta_aqui', { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }
}
