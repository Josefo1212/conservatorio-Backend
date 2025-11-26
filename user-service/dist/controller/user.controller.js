"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const user_queries_1 = require("../queries/user.queries");
const database_1 = __importDefault(require("../config/database"));
async function register(req, res) {
    console.log("Register request received:", req.body);
    try {
        // Check if user already exists by cedula or correo
        const existingUser = await database_1.default.query("SELECT id_usuario FROM usuario WHERE cedula = $1 OR correo = $2", [req.body.cedula, req.body.correo]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Usuario ya registrado con esos datos"
            });
        }
        const user = await (0, user_queries_1.createUser)(req.body);
        return res.status(201).json({
            message: "Usuario registrado correctamente",
            data: user
        });
    }
    catch (error) {
        console.error("REGISTER ERROR:", error); // Enhanced error logging
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
}
//# sourceMappingURL=user.controller.js.map