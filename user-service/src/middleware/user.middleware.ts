import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui') as any;
        (req as any).user = decoded; // Poblar req.user con el payload (ej. { userId, rol })
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};
