import { Request, Response } from "express";
import userService from "../services/UserService";
import dbService from '../config/database';


export async function getUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(Number(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    } catch (error: any) {
        console.error('GET USER ERROR:', error);
        return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const result: any = await userService.updateUser(Number(id), updates);
        res.json(result);
    } catch (error: any) {
        console.error('UPDATE USER ERROR:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}

export async function assignRole(req: Request, res: Response) {
    try {
        const authUser = (req as any).user;
        if (!authUser || !['personal', 'master'].includes(authUser.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: se requiere rol personal o master' });
        }

        const { userId, role, alumnoData, representanteData, profesorData } = req.body || {};

        console.log('ASSIGN ROLE REQUEST:', { userId, role, alumnoData, representanteData, profesorData });

        if (!userId || !role) {
            return res.status(400).json({ message: 'userId y role son requeridos' });
        }

        // Verificar si el usuario existe
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener ID del rol
        const roleResult = await dbService.query(dbService.queries.auth.selectRoleIdByName, [role]);
        if (!roleResult.rows.length) {
            return res.status(400).json({ message: 'Rol especificado no existe' });
        }
        const roleId = roleResult.rows[0].id_rol;

        // Verificar si el rol ya está asignado
        const existingRole = await dbService.query(dbService.queries.auth.selectUsuarioRolExists, [userId, roleId]);
        if (existingRole.rows.length > 0) {
            return res.status(400).json({ message: 'El rol ya está asignado al usuario' });
        }

        console.log('Insertando rol en usuario_roles:', userId, roleId);
        // Insertar en usuario_roles
        await dbService.query(dbService.queries.auth.insertUsuarioRol, [userId, roleId]);

        // Si es alumno, insertar datos adicionales
        if (role === 'alumno' && alumnoData) {
            const { matricula, estatus, nacionalidad, instituto, instrumento_principal } = alumnoData;
            if (!matricula || !estatus || !nacionalidad || !instituto || !instrumento_principal) {
                return res.status(400).json({ message: 'Datos de alumno incompletos' });
            }
            console.log('Insertando datos de alumno:', userId, matricula, estatus, nacionalidad, instituto, instrumento_principal);
            await dbService.query(dbService.queries.auth.insertAlumnoDatos, [userId, matricula, estatus, nacionalidad, instituto, instrumento_principal]);
        }

        // Si es representante, insertar datos adicionales
        if (role === 'representante' && representanteData) {
            const { ocupacion, parentesco } = representanteData;
            if (!ocupacion || !parentesco) {
                return res.status(400).json({ message: 'Datos de representante incompletos' });
            }
            console.log('Insertando datos de representante:', userId, ocupacion, parentesco);
            await dbService.query(dbService.queries.auth.insertRepresentanteDatos, [userId, ocupacion, parentesco]);
        }

        // Si es profesor, insertar datos adicionales
        if (role === 'profesor' && profesorData) {
            const { profesion, nacionalidad } = profesorData;
            if (!profesion || !nacionalidad) {
                return res.status(400).json({ message: 'Datos de profesor incompletos' });
            }
            console.log('Insertando datos de profesor:', userId, profesion, nacionalidad);
            await dbService.query(dbService.queries.auth.insertProfesorDatos, [userId, profesion, nacionalidad]);
        }

        console.log('Rol asignado exitosamente:', role, 'a usuario:', userId);
        return res.json({ message: 'Rol asignado correctamente' });
    } catch (error: any) {
        console.error('ASSIGN ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error assigning role', error: error.message });
    }
}

export async function removeRole(req: Request, res: Response) {
    try {
        const authUser = (req as any).user;
        if (!authUser || !['personal', 'master'].includes(authUser.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: se requiere rol personal o master' });
        }

        const { userId, role } = req.body || {};

        if (!userId || !role) {
            return res.status(400).json({ message: 'userId y role son requeridos' });
        }

        // Verificar si el usuario existe
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener ID del rol
        const roleResult = await dbService.query(dbService.queries.auth.selectRoleIdByName, [role]);
        if (!roleResult.rows.length) {
            return res.status(400).json({ message: 'Rol especificado no existe' });
        }
        const roleId = roleResult.rows[0].id_rol;

        // Verificar si el rol está asignado
        const existingRole = await dbService.query(dbService.queries.auth.selectUsuarioRolExists, [userId, roleId]);
        if (existingRole.rows.length === 0) {
            return res.status(400).json({ message: 'El rol no está asignado al usuario' });
        }

        // Borrar de usuario_roles
        await dbService.query(dbService.queries.auth.deleteUsuarioRol, [userId, roleId]);

        // Si es alumno, borrar datos adicionales
        if (role === 'alumno') {
            await dbService.query(dbService.queries.auth.deleteAlumnoDatos, [userId]);
        }

        // Si es representante, borrar datos adicionales
        if (role === 'representante') {
            await dbService.query(dbService.queries.auth.deleteRepresentanteDatos, [userId]);
        }

        // Si es profesor, borrar datos adicionales
        if (role === 'profesor') {
            await dbService.query(dbService.queries.auth.deleteProfesorDatos, [userId]);
        }

        return res.json({ message: 'Rol removido correctamente' });
    } catch (error: any) {
        console.error('REMOVE ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error removing role', error: error.message });
    }
}

export async function designateRole(req: Request, res: Response) {
    try {
        const authUser = (req as any).user;
        if (!authUser || !['personal', 'master'].includes(authUser.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: se requiere rol personal o master' });
        }
        const { userId, role } = req.body;
        const result = await userService.designateRole(Number(userId), role);
        return res.json(result);
    } catch (error: any) {
        console.error('DESIGNATE ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error designating role', error: error.message });
    }
}
