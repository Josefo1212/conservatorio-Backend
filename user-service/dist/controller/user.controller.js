"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.assignRole = assignRole;
const user_queries_1 = require("../queries/user.queries");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function register(req, res) {
    console.log("Register request received:", req.body);
    try {
        // Verificar permisos: solo "personal" o "master" pueden registrar
        const authenticatedUser = req.user;
        if (!authenticatedUser || !['personal', 'master'].includes(authenticatedUser.rol)) {
            return res.status(403).json({
                message: "Acceso denegado: solo personal o master pueden registrar usuarios"
            });
        }
        const existingUser = await (0, user_queries_1.checkExistingUser)(req.body.cedula);
        if (existingUser) {
            return res.status(400).json({
                message: "Usuario ya registrado con esos datos"
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(req.body.password, 10);
        const userData = { ...req.body, password: hashedPassword };
        const user = await (0, user_queries_1.createUser)(userData);
        // Asignar rol al nuevo usuario en la tabla intermedia usuario_roles
        const roleId = await (0, user_queries_1.getRoleId)(req.body.role);
        if (!roleId) {
            // Revertir creación si el rol no existe
            await (0, user_queries_1.deleteUser)(user.id_usuario);
            return res.status(400).json({
                message: "Rol especificado no existe"
            });
        }
        await (0, user_queries_1.assignUserRole)(user.id_usuario, roleId);
        // Insertar datos adicionales según el rol
        if (req.body.role === 'estudiante') {
            if (!req.body.alumnoData) {
                await (0, user_queries_1.deleteUser)(user.id_usuario);
                return res.status(400).json({
                    message: "Datos de estudiante requeridos"
                });
            }
            await (0, user_queries_1.insertAlumnoDatos)(user.id_usuario, req.body.alumnoData);
            if (req.body.representantes && Array.isArray(req.body.representantes)) {
                await (0, user_queries_1.insertAlumnoRepresentante)(user.id_usuario, req.body.representantes);
            }
        }
        else if (req.body.role === 'representante') {
            if (!req.body.representanteData) {
                await (0, user_queries_1.deleteUser)(user.id_usuario);
                return res.status(400).json({
                    message: "Datos de representante requeridos"
                });
            }
            await (0, user_queries_1.insertRepresentanteDatos)(user.id_usuario, req.body.representanteData);
        }
        else if (req.body.role === 'profesor') {
            if (!req.body.profesorData) {
                await (0, user_queries_1.deleteUser)(user.id_usuario);
                return res.status(400).json({
                    message: "Datos de profesor requeridos"
                });
            }
            await (0, user_queries_1.insertProfesorDatos)(user.id_usuario, req.body.profesorData);
        }
        // Para "personal" o "master", no hay datos adicionales
        return res.status(201).json({
            message: "Usuario registrado correctamente",
            data: user
        });
    }
    catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
}
async function getUser(req, res) {
    try {
        const { id } = req.params;
        const user = await (0, user_queries_1.getUserById)(Number(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    }
    catch (error) {
        console.error('GET USER ERROR:', error);
        return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const result = await (0, user_queries_1.updateUser)(Number(id), updates);
        res.json(result);
    }
    catch (error) {
        console.error('UPDATE USER ERROR:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}
async function assignRole(req, res) {
    try {
        const { userId, role } = req.body;
        await (0, user_queries_1.updateUserRole)(userId, role);
        return res.json({ message: 'Role assigned successfully' });
    }
    catch (error) {
        console.error('ASSIGN ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error assigning role', error: error.message });
    }
}
//# sourceMappingURL=user.controller.js.map