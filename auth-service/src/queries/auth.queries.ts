import pool from "../config/database";

export async function getUserByCedula(cedula: string) {
  const result = await pool.query('SELECT id_usuario, password FROM usuario WHERE cedula = $1', [cedula]);
  console.log('Usuario consultado por cédula:', cedula, 'encontrado:', result.rows.length > 0);
  return result;
}

export async function insertSession(idUsuario: number, ipOrigen: string, refreshToken: string, refreshExp: Date) {
  const result = await pool.query(
    'INSERT INTO sesion (id_usuarios, fecha_inicio, ip_origen, refresh_token, refresh_exp, is_revoked) VALUES ($1, NOW(), $2, $3, $4, false) RETURNING id_sesion',
    [idUsuario, ipOrigen, refreshToken, refreshExp]
  );
  console.log('Sesión insertada para usuario:', idUsuario);
  return result;
}

export async function updateSessionLogout(idSesion: number) {
  const result = await pool.query('UPDATE sesion SET fecha_fin = NOW(), is_revoked = true WHERE id_sesion = $1', [idSesion]);
  console.log('Sesión revocada:', idSesion, 'filas afectadas:', result.rowCount);
  return result;
}

export async function getSessionByRefreshToken(refreshToken: string) {
  const result = await pool.query('SELECT * FROM sesion WHERE refresh_token = $1 AND is_revoked = false AND refresh_exp > NOW()', [refreshToken]);
  console.log('Sesión consultada por refresh token, encontrada:', result.rows.length > 0);
  return result;
}

export async function getUserById(idUsuario: number) {
  const result = await pool.query('SELECT id_usuario, cedula FROM usuario WHERE id_usuario = $1', [idUsuario]);
  console.log('Usuario consultado por ID:', idUsuario, 'encontrado:', result.rows.length > 0);
  return result;
}
