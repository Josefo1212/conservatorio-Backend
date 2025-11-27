import { Request, Response } from "express";
import { createUser, checkExistingUser, getRoleId, assignUserRole, deleteUser, insertAlumnoDatos, insertRepresentanteDatos, insertProfesorDatos, insertAlumnoRepresentante, getUserById, updateUser as updateUserQuery, updateUserRole } from "../queries/user.queries";
import bcrypt from "bcrypt";

export async function register(req: Request, res: Response) {
    console.log("Register request received:", req.body);
    try {
        // Verificar permisos: solo "personal" o "master" pueden registrar
        const authenticatedUser = (req as any).user; 
        if (!authenticatedUser || !['personal', 'master'].includes(authenticatedUser.rol)) {
            return res.status(403).json({
                message: "Acceso denegado: solo personal o master pueden registrar usuarios"
            });
        }

        const existingUser = await checkExistingUser(req.body.cedula);
        if (existingUser) {
            return res.status(400).json({
                message: "Usuario ya registrado con esos datos"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userData = { ...req.body, password: hashedPassword };

        const user = await createUser(userData);

        // Asignar rol al nuevo usuario en la tabla intermedia usuario_roles
        const roleId = await getRoleId(req.body.role);
        if (!roleId) {
            // Revertir creación si el rol no existe
            await deleteUser(user.id_usuario);
            return res.status(400).json({
                message: "Rol especificado no existe"
            });
        }
        await assignUserRole(user.id_usuario, roleId);

        // Insertar datos adicionales según el rol
        if (req.body.role === 'estudiante') {
            if (!req.body.alumnoData) {
                await deleteUser(user.id_usuario);
                return res.status(400).json({
                    message: "Datos de estudiante requeridos"
                });
            }
            await insertAlumnoDatos(user.id_usuario, req.body.alumnoData);
            if (req.body.representantes && Array.isArray(req.body.representantes)) {
                await insertAlumnoRepresentante(user.id_usuario, req.body.representantes);
            }
        } else if (req.body.role === 'representante') {
            if (!req.body.representanteData) {
                await deleteUser(user.id_usuario);
                return res.status(400).json({
                    message: "Datos de representante requeridos"
                });
            }
            await insertRepresentanteDatos(user.id_usuario, req.body.representanteData);
        } else if (req.body.role === 'profesor') {
            if (!req.body.profesorData) {
                await deleteUser(user.id_usuario);
                return res.status(400).json({
                    message: "Datos de profesor requeridos"
                });
            }
            await insertProfesorDatos(user.id_usuario, req.body.profesorData);
        }
        // Para "personal" o "master", no hay datos adicionales

        return res.status(201).json({
            message: "Usuario registrado correctamente",
            data: user
        });
    } catch (error: any) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function getUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const user = await getUserById(Number(id));
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
        const result: any = await updateUserQuery(Number(id), updates);
        res.json(result);
    } catch (error: any) {
        console.error('UPDATE USER ERROR:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}

export async function assignRole(req: Request, res: Response) {
    try {
        const { userId, role } = req.body;
        await updateUserRole(userId, role);
        return res.json({ message: 'Role assigned successfully' });
    } catch (error: any) {
        console.error('ASSIGN ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error assigning role', error: error.message });
    }
}
