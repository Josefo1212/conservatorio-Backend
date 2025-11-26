import { Request, Response } from "express";
import { getUserByCedula } from "../queries/auth.queries";

export async function login(req: Request, res: Response) {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) return res.status(400).json({ message: 'cedula y contraseña requeridos' });

    const { rows } = await getUserByCedula(cedula);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    res.status(200).json({ message: 'Login exitoso', user: { id: user.id_usuario } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}