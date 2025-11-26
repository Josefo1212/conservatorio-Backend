import pool from "../config/database";

export async function getUserByCedula(cedula: string) {
  return await pool.query('SELECT id_usuario, password FROM usuario WHERE cedula = $1', [cedula]);
}
