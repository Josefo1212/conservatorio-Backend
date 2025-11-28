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
exports.updateUserPassword = updateUserPassword;
const database_1 = __importDefault(require("../config/database"));
async function getUserByCedula(cedula) {
    const result = await database_1.default.query(database_1.default.queries.auth.getUserByCedula, [cedula]);
    console.log('Usuario consultado por cédula:', cedula, 'encontrado:', result.rows.length > 0);
    return result;
}
async function insertSession(idUsuario, ipOrigen, refreshToken, refreshExp) {
    const result = await database_1.default.query(database_1.default.queries.auth.insertSession, [idUsuario, ipOrigen, refreshToken, refreshExp]);
    console.log('Sesión insertada para usuario:', idUsuario);
    return result;
}
async function updateSessionLogout(idSesion) {
    const result = await database_1.default.query(database_1.default.queries.auth.updateSessionLogout, [idSesion]);
    console.log('Sesión revocada:', idSesion, 'filas afectadas:', result.rowCount);
    return result;
}
async function getSessionByRefreshToken(refreshToken) {
    const result = await database_1.default.query(database_1.default.queries.auth.getSessionByRefreshToken, [refreshToken]);
    console.log('Sesión consultada por refresh token, encontrada:', result.rows.length > 0);
    return result;
}
async function getUserById(idUsuario) {
    const result = await database_1.default.query(database_1.default.queries.auth.getUserById, [idUsuario]);
    console.log('Usuario consultado por ID:', idUsuario, 'encontrado:', result.rows.length > 0);
    return result;
}
async function getUserRole(userId) {
    const result = await database_1.default.query(database_1.default.queries.auth.getUserRole, [userId]);
    console.log('Rol consultado para usuario:', userId, 'rol encontrado:', result.rows[0]?.nombre_rol);
    return result.rows[0]?.nombre_rol;
}
async function updateUserPassword(cedula, hashedPassword) {
    const result = await database_1.default.query(database_1.default.queries.auth.updateUserPassword, [hashedPassword, cedula]);
    console.log('Contraseña actualizada para cédula:', cedula, 'filas afectadas:', result.rowCount);
    return result;
}
//# sourceMappingURL=auth.queries.js.map