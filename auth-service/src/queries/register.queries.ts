import dbService from "../config/database";
import { QueryResult } from "pg";

export interface RegisterPayload {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  password: string; // hashed
  fecha_nacimiento: string;
  nro_tlf: string;
  estado: string;
  municipio: string;
  localidad: string;
  tipo_localidad: string;
  direccion: string;
  lugar_nacimiento: string;
  role: string;
  alumnoData?: { matricula: string; estatus: string; nacionalidad: string; instituto: string; instrumento_principal: string };
  representanteData?: { ocupacion: string; parentesco: string };
  profesorData?: { profesion: string; nacionalidad: string };
  representantes?: number[];
}

export async function registerUser(payload: RegisterPayload): Promise<{ id_usuario: number }>{
  return dbService.transaction(async (query) => {
    const q = dbService.queries.auth;

    // verificar existencia
    const existing = await query(q.selectUserIdByCedula, [payload.cedula]);
    if (existing.rows.length > 0) {
      throw new Error('Usuario ya registrado con esos datos');
    }

    // estado
    let estadoRes: QueryResult = await query(q.selectEstadoByNombre, [payload.estado]);
    if (estadoRes.rows.length === 0) {
      estadoRes = await query(q.insertEstado, [payload.estado]);
    }
    const id_estado = estadoRes.rows[0].id_estado;

    // municipio
    let muniRes: QueryResult = await query(q.selectMunicipioByNombre, [payload.municipio, id_estado]);
    if (muniRes.rows.length === 0) {
      muniRes = await query(q.insertMunicipio, [id_estado, payload.municipio]);
    }
    const id_municipio = muniRes.rows[0].id_municipio;

    // localidad
    let locRes: QueryResult = await query(q.selectLocalidadByNombre, [payload.localidad, id_municipio, payload.tipo_localidad]);
    if (locRes.rows.length === 0) {
      locRes = await query(q.insertLocalidad, [id_municipio, payload.localidad, payload.tipo_localidad]);
    }
    const id_localidades = locRes.rows[0].id_localidad;

    // ubicacion
    const ubRes = await query(q.insertUbicacion, [id_localidades, payload.direccion, payload.lugar_nacimiento]);
    const id_ubicaciones = ubRes.rows[0].id_ubicacion;

    // usuario
    const userRes = await query(q.insertUsuario, [
      id_ubicaciones,
      payload.cedula,
      payload.nombres,
      payload.apellidos,
      payload.correo,
      payload.password,
      payload.fecha_nacimiento,
      payload.nro_tlf
    ]);
    const id_usuario: number = userRes.rows[0].id_usuario;

    // rol
    const roleRes = await query(q.selectRoleIdByName, [payload.role]);
    if (roleRes.rows.length === 0) {
      throw new Error('Rol especificado no existe');
    }
    await query(q.insertUsuarioRol, [id_usuario, roleRes.rows[0].id_rol]);

    // datos adicionales
    if (payload.role === 'estudiante') {
      if (!payload.alumnoData) throw new Error('Datos de estudiante requeridos');
      await query(q.insertAlumnoDatos, [
        id_usuario,
        payload.alumnoData.matricula,
        payload.alumnoData.estatus,
        payload.alumnoData.nacionalidad,
        payload.alumnoData.instituto,
        payload.alumnoData.instrumento_principal,
      ]);
      if (Array.isArray(payload.representantes) && payload.representantes.length > 0) {
        for (const repId of payload.representantes) {
          await query(q.insertAlumnoRepresentante, [id_usuario, repId]);
        }
      }
    } else if (payload.role === 'representante') {
      if (!payload.representanteData) throw new Error('Datos de representante requeridos');
      await query(q.insertRepresentanteDatos, [
        id_usuario,
        payload.representanteData.ocupacion,
        payload.representanteData.parentesco,
      ]);
    } else if (payload.role === 'profesor') {
      if (!payload.profesorData) throw new Error('Datos de profesor requeridos');
      await query(q.insertProfesorDatos, [
        id_usuario,
        payload.profesorData.profesion,
        payload.profesorData.nacionalidad,
      ]);
    }

    return { id_usuario };
  });
}
