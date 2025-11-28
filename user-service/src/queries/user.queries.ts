import dbService from "../config/database";

// Nota: se retiraron todas las funciones relacionadas al registro de usuarios.
// Este módulo conserva operaciones generales de usuario que aún usa user-service.

export async function getUserById(id: number) {
    const sql = dbService.queries.user.getUserById;
    const result = await dbService.query(sql, [id]);
    return result.rows[0];
}

export async function updateUser(id: number, updates: any) {
    const userFields = ['nombres', 'apellidos', 'correo', 'fecha_nacimiento', 'nro_tlf'] as const;
    const provided = userFields.filter(f => updates[f] !== undefined);
    return dbService.transaction(async (query) => {
        if (provided.length > 0) {
            const placeholders = provided.map((_, idx) => `$${idx + 2}`).join(', ');
            const setParts = provided.map((f, idx) => `${f} = $${idx + 2}`).join(', ');
            const sql = dbService.queries.user.updateUserSet.replace('{SET_PARTS}', setParts);
            const values = provided.map(f => updates[f]);
            await query(sql, [id, ...values]);
        }
        if (updates.direccion !== undefined || updates.lugar_nacimiento !== undefined) {
            const sqlUb = dbService.queries.user.updateUbicacion;
            await query(sqlUb, [updates.direccion, updates.lugar_nacimiento, id]);
        }
        return { message: 'User updated successfully' };
    });
}

export async function updateUserRole(userId: number, roleName: string) {
    const roleId = await getRoleId(roleName);
    if (!roleId) throw new Error('Role not found');
    // Check if already assigned
    const existing = await dbService.query(dbService.queries.user.selectUsuarioRolExists, [userId, roleId]);
    if (existing.rows.length === 0) {
        await assignUserRole(userId, roleId);
    }
}

export async function getRoleId(roleName: string) {
    const result = await dbService.query(dbService.queries.user.selectRoleIdByName, [roleName]);
    return result.rows.length > 0 ? result.rows[0].id_rol : null;
}

export async function assignUserRole(userId: number, roleId: number) {
    await dbService.query(dbService.queries.user.insertUsuarioRol, [userId, roleId]);
}
