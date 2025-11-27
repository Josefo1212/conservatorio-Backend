"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
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
//# sourceMappingURL=user.controller.js.map