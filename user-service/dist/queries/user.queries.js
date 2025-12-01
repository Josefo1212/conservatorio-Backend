"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.updateUserRole = updateUserRole;
exports.getRoleId = getRoleId;
exports.assignUserRole = assignUserRole;
const database_1 = __importDefault(require("../config/database"));
// Nota: se retiraron todas las funciones relacionadas al registro de usuarios.
// Este módulo conserva operaciones generales de usuario que aún usa user-service.
async function getUserById(id) {
    const sql = database_1.default.queries.user.getUserById;
    const result = await database_1.default.query(sql, [id]);
    return result.rows[0];
}
async function updateUser(id, updates) {
    const userFields = ['nombres', 'apellidos', 'correo', 'fecha_nacimiento', 'nro_tlf'];
    const provided = userFields.filter(f => updates[f] !== undefined);
    return database_1.default.transaction(async (query) => {
        if (provided.length > 0) {
            const placeholders = provided.map((_, idx) => `$${idx + 2}`).join(', ');
            const setParts = provided.map((f, idx) => `${f} = $${idx + 2}`).join(', ');
            const sql = database_1.default.queries.user.updateUserSet.replace('{SET_PARTS}', setParts);
            const values = provided.map(f => updates[f]);
            await query(sql, [id, ...values]);
        }
        if (updates.direccion !== undefined || updates.lugar_nacimiento !== undefined) {
            const sqlUb = database_1.default.queries.user.updateUbicacion;
            await query(sqlUb, [updates.direccion, updates.lugar_nacimiento, id]);
        }
        return { message: 'User updated successfully' };
    });
}
async function updateUserRole(userId, roleName) {
    const roleId = await getRoleId(roleName);
    if (!roleId)
        throw new Error('Role not found');
    // Check if already assigned
    const existing = await database_1.default.query(database_1.default.queries.user.selectUsuarioRolExists, [userId, roleId]);
    if (existing.rows.length === 0) {
        await assignUserRole(userId, roleId);
    }
}
async function getRoleId(roleName) {
    const result = await database_1.default.query(database_1.default.queries.user.selectRoleIdByName, [roleName]);
    return result.rows.length > 0 ? result.rows[0].id_rol : null;
}
async function assignUserRole(userId, roleId) {
    await database_1.default.query(database_1.default.queries.user.insertUsuarioRol, [userId, roleId]);
}
//# sourceMappingURL=user.queries.js.map