"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.validate = validate;
exports.refresh = refresh;
exports.logout = logout;
const auth_queries_1 = require("../queries/auth.queries");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_utils_1 = require("../middleware/token.utils");
async function login(req, res) {
    try {
        const { cedula, password } = req.body;
        if (!cedula || !password)
            return res.status(400).json({ message: 'cedula y contraseña requeridos' });
        const { rows } = await (0, auth_queries_1.getUserByCedula)(cedula);
        const user = rows[0];
        if (!user)
            return res.status(401).json({ message: 'Credenciales inválidas' });
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ message: 'Credenciales inválidas' });
        // Consultar el rol del usuario
        const rol = await (0, auth_queries_1.getUserRole)(user.id_usuario);
        if (!rol)
            return res.status(403).json({ message: 'Usuario sin rol asignado' });
        console.log('Usuario autenticado, generando tokens...');
        // Generate tokens con rol incluido
        const accessToken = (0, token_utils_1.generateAccessToken)(user.id_usuario, rol);
        const refreshToken = (0, token_utils_1.generateRefreshToken)(user.id_usuario);
        const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        // Insert session
        const ipOrigen = req.ip || req.connection.remoteAddress || 'unknown';
        await (0, auth_queries_1.insertSession)(user.id_usuario, ipOrigen, refreshToken, refreshExp);
        console.log('Sesión insertada en BD');
        // Set cookies
        res.cookie('refreshToken', refreshToken, { httpOnly: false, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        console.log('Cookie de refresh token establecida');
        res.status(200).json({ message: 'Login exitoso', accessToken, user: { id: user.id_usuario } });
        console.log('Login completado exitosamente');
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function validate(req, res) {
    // Token already verified by middleware
    console.log('Token validado, usuario:', req.user);
    res.status(200).json({ message: 'Token válido', user: req.user });
}
async function refresh(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken)
            return res.status(401).json({ message: 'Refresh token requerido' });
        const payload = (0, token_utils_1.verifyRefreshToken)(refreshToken);
        if (!payload)
            return res.status(401).json({ message: 'Refresh token inválido' });
        const { rows } = await (0, auth_queries_1.getSessionByRefreshToken)(refreshToken);
        if (rows.length === 0)
            return res.status(401).json({ message: 'Sesión inválida' });
        console.log('Refresh token verificado, generando nuevo access token');
        const rol = await (0, auth_queries_1.getUserRole)(payload.userId); // Agregar consulta de rol
        const newAccessToken = (0, token_utils_1.generateAccessToken)(payload.userId, rol);
        res.status(200).json({ accessToken: newAccessToken });
        console.log('Nuevo access token enviado');
    }
    catch (error) {
        console.error('Error en refresh:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        console.log('Refresh token en logout:', refreshToken);
        if (refreshToken) {
            const { rows } = await (0, auth_queries_1.getSessionByRefreshToken)(refreshToken);
            console.log('Sesiones encontradas para refresh token:', rows.length);
            if (rows.length > 0) {
                await (0, auth_queries_1.updateSessionLogout)(rows[0].id_sesion);
            }
        }
        console.log('Sesión revocada, cookie limpiada');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logout exitoso' });
    }
    catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
//# sourceMappingURL=auth.controller.js.map