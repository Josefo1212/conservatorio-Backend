import dbService from "../config/database";

export async function getUserByCedula(cedula: string) {
  const result = await dbService.query(dbService.queries.auth.getUserByCedula, [cedula]);
  console.log('Usuario consultado por cédula:', cedula, 'encontrado:', result.rows.length > 0);
  return result;
}

export async function insertSession(idUsuario: number, ipOrigen: string, refreshToken: string, refreshExp: Date) {
  const result = await dbService.query(dbService.queries.auth.insertSession, [idUsuario, ipOrigen, refreshToken, refreshExp]);
  console.log('Sesión insertada para usuario:', idUsuario);
  return result;
}

export async function updateSessionLogout(idSesion: number) {
  const result = await dbService.query(dbService.queries.auth.updateSessionLogout, [idSesion]);
  console.log('Sesión revocada:', idSesion, 'filas afectadas:', result.rowCount);
  return result;
}

export async function getSessionByRefreshToken(refreshToken: string) {
  const result = await dbService.query(dbService.queries.auth.getSessionByRefreshToken, [refreshToken]);
  console.log('Sesión consultada por refresh token, encontrada:', result.rows.length > 0);
  return result;
}

export async function getUserById(idUsuario: number) {
  const result = await dbService.query(dbService.queries.auth.getUserById, [idUsuario]);
  console.log('Usuario consultado por ID:', idUsuario, 'encontrado:', result.rows.length > 0);
  return result;
}

export async function getUserRole(userId: number) {
  const result = await dbService.query(dbService.queries.auth.getUserRole, [userId]);
  console.log('Rol consultado para usuario:', userId, 'rol encontrado:', result.rows[0]?.nombre_rol);
  return result.rows[0]?.nombre_rol;
}

export async function updateUserPassword(cedula: string, hashedPassword: string) {
  const result = await dbService.query(dbService.queries.auth.updateUserPassword, [hashedPassword, cedula]);
  console.log('Contraseña actualizada para cédula:', cedula, 'filas afectadas:', result.rowCount);
  return result;
}
