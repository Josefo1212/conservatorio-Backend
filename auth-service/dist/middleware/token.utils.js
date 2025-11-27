"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function generateAccessToken(userId, rol) {
    return jsonwebtoken_1.default.sign({ userId, rol }, process.env.JWT_SECRET || 'tu_clave_secreta_aqui', { expiresIn: '15m' });
}
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'tu_clave_secreta_aqui', { expiresIn: '7d' });
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=token.utils.js.map