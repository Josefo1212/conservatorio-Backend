import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Preferir cookie accessToken; fallback al header Authorization
    let token: string | undefined = (req as any).cookies?.accessToken;
    if (!token) {
        const authHeader = req.header('Authorization');
        token = authHeader?.replace('Bearer ', '');
    }
    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui') as any;
        (req as any).user = decoded; // { userId, rol }
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};
