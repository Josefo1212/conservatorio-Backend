"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.validate = validate;
exports.refresh = refresh;
exports.logout = logout;
exports.getAvailableRoles = getAvailableRoles;
exports.selectRole = selectRole;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.register = register;
const AuthService_1 = __importDefault(require("../services/AuthService"));
const token_utils_1 = require("../middleware/token.utils");
const auth_queries_1 = require("../queries/auth.queries");
async function login(req, res) {
    try {
        const { cedula, password } = req.body;
        if (!cedula || !password)
            return res.status(400).json({ message: 'cedula y contraseña requeridos' });
        const ipOrigen = req.ip || req.connection.remoteAddress || 'unknown';
        const { accessToken, refreshToken, rol, nombres, apellidos } = await AuthService_1.default.login(cedula, password, ipOrigen);
        // Guardar ambos tokens en cookies (httpOnly)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutos
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });
        // No enviar id ni access token en el body
        res.status(200).json({
            message: 'Login exitoso',
            user: {
                rol,
                nombres,
                apellidos,
            },
        });
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
        const { accessToken } = await AuthService_1.default.refresh(refreshToken);
        res.status(200).json({ accessToken });
    }
    catch (error) {
        console.error('Error en refresh:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken)
            await AuthService_1.default.logout(refreshToken);
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.status(200).json({ message: 'Logout exitoso' });
    }
    catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
// Devuelve todos los roles disponibles del usuario autenticado (vía refresh cookie)
async function getAvailableRoles(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken)
            return res.status(401).json({ message: 'Refresh token requerido' });
        const payload = (0, token_utils_1.verifyRefreshToken)(refreshToken);
        if (!payload)
            return res.status(401).json({ message: 'Refresh token inválido' });
        const roles = await (0, auth_queries_1.getUserRolesList)(payload.userId);
        return res.status(200).json({ roles });
    }
    catch (error) {
        console.error('Error en getAvailableRoles:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
// Establece el rol activo del usuario re-emitiendo el accessToken en cookie
async function selectRole(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        const { role } = req.body || {};
        if (!refreshToken)
            return res.status(401).json({ message: 'Refresh token requerido' });
        if (!role)
            return res.status(400).json({ message: 'Rol requerido' });
        const payload = (0, token_utils_1.verifyRefreshToken)(refreshToken);
        if (!payload)
            return res.status(401).json({ message: 'Refresh token inválido' });
        const roles = await (0, auth_queries_1.getUserRolesList)(payload.userId);
        if (!roles.includes(role))
            return res.status(403).json({ message: 'Rol no asignado al usuario' });
        // Emitir nuevo access token con el rol elegido
        const accessToken = (0, token_utils_1.generateAccessToken)(payload.userId, role);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });
        return res.status(200).json({ message: 'Rol seleccionado', role });
    }
    catch (error) {
        console.error('Error en selectRole:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function forgotPassword(req, res) {
    try {
        const { cedula } = req.body;
        if (!cedula)
            return res.status(400).json({ message: 'Cédula requerida' });
        const exists = await AuthService_1.default.forgotPassword(cedula);
        if (!exists)
            return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario encontrado, proceda a cambiar la contraseña' });
    }
    catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function resetPassword(req, res) {
    try {
        const { cedula, newPassword, confirmPassword } = req.body;
        if (!cedula || !newPassword || !confirmPassword)
            return res.status(400).json({ message: 'Cédula, nueva contraseña y confirmación requeridas' });
        if (newPassword !== confirmPassword)
            return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        const exists = await AuthService_1.default.forgotPassword(cedula);
        if (!exists)
            return res.status(404).json({ message: 'Usuario no encontrado' });
        await AuthService_1.default.resetPassword(cedula, newPassword);
        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    }
    catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function register(req, res) {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser || !['personal', 'master'].includes(authenticatedUser.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: solo personal o master pueden registrar usuarios' });
        }
        const { cedula, nombres, apellidos, correo, password, fecha_nacimiento, nro_tlf, estado, municipio, localidad, tipo_localidad, direccion, lugar_nacimiento, role, alumnoData, representanteData, profesorData, representantes } = req.body || {};
        if (!cedula || !nombres || !apellidos || !correo || !password || !fecha_nacimiento || !nro_tlf || !estado || !municipio || !localidad || !tipo_localidad || !direccion || !lugar_nacimiento || !role) {
            return res.status(400).json({ message: 'Datos requeridos faltantes' });
        }
        const result = await AuthService_1.default.register({
            cedula,
            nombres,
            apellidos,
            correo,
            password,
            fecha_nacimiento,
            nro_tlf,
            estado,
            municipio,
            localidad,
            tipo_localidad,
            direccion,
            lugar_nacimiento,
            role,
            alumnoData,
            representanteData,
            profesorData,
            representantes,
        });
        return res.status(201).json({ message: 'Usuario registrado correctamente', data: result });
    }
    catch (error) {
        console.error('REGISTER ERROR:', error);
        const msg = error?.message || 'Error interno del servidor';
        const status = msg.includes('Usuario ya registrado') || msg.includes('Rol especificado no existe') || msg.includes('Datos de') ? 400 : 500;
        return res.status(status).json({ message: msg });
    }
}
//# sourceMappingURL=auth.controller.js.map