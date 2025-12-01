import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    // Preferir cookie accessToken; fallback al Authorization header
    let token = (req as any).cookies?.accessToken as string | undefined;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado." });
        }
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Token malformado." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; rol?: string };
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
}
