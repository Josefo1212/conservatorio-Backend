"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
        req.user = decoded; // Poblar req.user con el payload (ej. { userId, rol })
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=user.middleware.js.map