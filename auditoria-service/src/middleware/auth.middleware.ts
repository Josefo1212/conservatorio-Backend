import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function verifyMaster(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req.cookies?.accessToken) || (req.headers.authorization?.replace('Bearer ', ''));
    if (!token) return res.status(401).json({ message: 'Token requerido' });

    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload || payload.rol !== 'master') {
      return res.status(403).json({ message: 'Acceso denegado: requiere rol master' });
    }

    (req as any).user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
