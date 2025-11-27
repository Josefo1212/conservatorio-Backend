"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByCedula = getUserByCedula;
exports.insertSession = insertSession;
exports.updateSessionLogout = updateSessionLogout;
exports.getSessionByRefreshToken = getSessionByRefreshToken;
exports.getUserById = getUserById;
exports.getUserRole = getUserRole;
const database_1 = __importDefault(require("../config/database"));
async function getUserByCedula(cedula) {
    const result = await database_1.default.query('SELECT id_usuario, password FROM usuario WHERE cedula = $1', [cedula]);
    console.log('Usuario consultado por cédula:', cedula, 'encontrado:', result.rows.length > 0);
    return result;
}
async function insertSession(idUsuario, ipOrigen, refreshToken, refreshExp) {
    const result = await database_1.default.query('INSERT INTO sesion (id_usuarios, fecha_inicio, ip_origen, refresh_token, refresh_exp, is_revoked) VALUES ($1, NOW(), $2, $3, $4, false) RETURNING id_sesion', [idUsuario, ipOrigen, refreshToken, refreshExp]);
    console.log('Sesión insertada para usuario:', idUsuario);
    return result;
}
async function updateSessionLogout(idSesion) {
    const result = await database_1.default.query('UPDATE sesion SET fecha_fin = NOW(), is_revoked = true WHERE id_sesion = $1', [idSesion]);
    console.log('Sesión revocada:', idSesion, 'filas afectadas:', result.rowCount);
    return result;
}
async function getSessionByRefreshToken(refreshToken) {
    const result = await database_1.default.query('SELECT * FROM sesion WHERE refresh_token = $1 AND is_revoked = false AND refresh_exp > NOW()', [refreshToken]);
    console.log('Sesión consultada por refresh token, encontrada:', result.rows.length > 0);
    return result;
}
async function getUserById(idUsuario) {
    const result = await database_1.default.query('SELECT id_usuario, cedula FROM usuario WHERE id_usuario = $1', [idUsuario]);
    console.log('Usuario consultado por ID:', idUsuario, 'encontrado:', result.rows.length > 0);
    return result;
}
async function getUserRole(userId) {
    const result = await database_1.default.query("SELECT r.nombre_rol FROM usuario_roles ur JOIN Roles r ON ur.roles_id = r.id_rol WHERE ur.usuarios_id = $1", [userId]);
    console.log('Rol consultado para usuario:', userId, 'rol encontrado:', result.rows[0]?.nombre_rol);
    return result.rows[0]?.nombre_rol;
}
//# sourceMappingURL=auth.queries.js.map