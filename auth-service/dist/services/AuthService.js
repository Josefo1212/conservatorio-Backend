"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_utils_1 = require("../middleware/token.utils");
const auth_queries_1 = require("../queries/auth.queries");
const register_queries_1 = require("../queries/register.queries");
class AuthService {
    async login(cedula, password, ipOrigen) {
        const { rows } = await (0, auth_queries_1.getUserByCedula)(cedula);
        const user = rows[0];
        if (!user)
            throw new Error('Credenciales inválidas');
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid)
            throw new Error('Credenciales inválidas');
        const rol = await (0, auth_queries_1.getUserRole)(user.id_usuario);
        if (!rol)
            throw new Error('Usuario sin rol asignado');
        const accessToken = (0, token_utils_1.generateAccessToken)(user.id_usuario, rol);
        const refreshToken = (0, token_utils_1.generateRefreshToken)(user.id_usuario);
        const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await (0, auth_queries_1.insertSession)(user.id_usuario, ipOrigen, refreshToken, refreshExp);
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
    async refresh(refreshToken) {
        const payload = (0, token_utils_1.verifyRefreshToken)(refreshToken);
        if (!payload)
            throw new Error('Refresh token inválido');
        const { rows } = await (0, auth_queries_1.getSessionByRefreshToken)(refreshToken);
        if (rows.length === 0)
            throw new Error('Sesión inválida');
        const rol = await (0, auth_queries_1.getUserRole)(payload.userId);
        const newAccessToken = (0, token_utils_1.generateAccessToken)(payload.userId, rol);
        return { accessToken: newAccessToken };
    }
    async logout(refreshToken) {
        const { rows } = await (0, auth_queries_1.getSessionByRefreshToken)(refreshToken);
        if (rows.length > 0) {
            await (0, auth_queries_1.updateSessionLogout)(rows[0].id_sesion);
        }
    }
    async forgotPassword(cedula) {
        const { rows } = await (0, auth_queries_1.getUserByCedula)(cedula);
        return rows.length > 0;
    }
    async resetPassword(cedula, newPassword) {
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await (0, auth_queries_1.updateUserPassword)(cedula, hashedPassword);
    }
    async register(payload) {
        const hashedPassword = await bcrypt_1.default.hash(payload.password, 10);
        return (0, register_queries_1.registerUser)({ ...payload, password: hashedPassword });
    }
}
exports.AuthService = AuthService;
const authService = new AuthService();
exports.default = authService;
//# sourceMappingURL=AuthService.js.map