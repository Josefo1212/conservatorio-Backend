import { Request, Response } from "express";
import { createUser } from "../queries/user.queries";
import bcrypt from "bcrypt";
import pool from "../config/database";

export async function register(req: Request, res: Response) {
    console.log("Register request received:", req.body);
    try {
        const existingUser = await pool.query(
            "SELECT id_usuario FROM usuario WHERE cedula = $1 OR correo = $2",
            [req.body.cedula, req.body.correo]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Usuario ya registrado con esos datos"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userData = { ...req.body, password: hashedPassword };

        const user = await createUser(userData);

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
