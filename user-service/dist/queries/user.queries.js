"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.checkExistingUser = checkExistingUser;
exports.getRoleId = getRoleId;
exports.assignUserRole = assignUserRole;
exports.deleteUser = deleteUser;
exports.insertAlumnoDatos = insertAlumnoDatos;
exports.insertRepresentanteDatos = insertRepresentanteDatos;
exports.insertProfesorDatos = insertProfesorDatos;
exports.insertAlumnoRepresentante = insertAlumnoRepresentante;
const database_1 = __importDefault(require("../config/database"));
async function createUser(data) {
    const client = await database_1.default.connect();
    console.log("Starting createUser with data:", data);
    try {
        await client.query("BEGIN");
        const { cedula, nombres, apellidos, correo, password, fecha_nacimiento, nro_tlf, 
        // ubicación
        estado, municipio, localidad, tipo_localidad, direccion, lugar_nacimiento } = data;
        // ============================
        // 1. ESTADO
        // ============================
        console.log("Processing estado:", estado);
        let estadoResult = await client.query("SELECT id_estado FROM estado WHERE nombre_estado = $1", [estado]);
        if (estadoResult.rows.length === 0) {
            estadoResult = await client.query("INSERT INTO estado (nombre_estado) VALUES ($1) RETURNING id_estado", [estado]);
        }
        const id_estado = estadoResult.rows[0].id_estado;
        // ============================
        // 2. MUNICIPIO
        // ============================
        console.log("Processing municipio:", municipio);
        let municipioResult = await client.query("SELECT id_municipio FROM municipio WHERE nombre_municipio = $1 AND id_estados = $2", [municipio, id_estado]);
        if (municipioResult.rows.length === 0) {
            municipioResult = await client.query("INSERT INTO municipio (id_estados, nombre_municipio) VALUES ($1, $2) RETURNING id_municipio", [id_estado, municipio]);
        }
        const id_municipio = municipioResult.rows[0].id_municipio;
        // ============================
        // 3. LOCALIDAD
        // ============================
        console.log("Processing localidad:", localidad);
        let localidadResult = await client.query("SELECT id_localidad FROM localidad WHERE nombre_localidad = $1 AND id_municipios = $2 AND tipo = $3", [localidad, id_municipio, tipo_localidad]);
        if (localidadResult.rows.length === 0) {
            localidadResult = await client.query("INSERT INTO localidad (id_municipios, nombre_localidad, tipo) VALUES ($1, $2, $3) RETURNING id_localidad", [id_municipio, localidad, tipo_localidad]);
        }
        const id_localidades = localidadResult.rows[0].id_localidad;
        // ============================
        // 4. UBICACION
        // ============================
        console.log("Inserting ubicacion");
        const ubicacionResult = await client.query(`INSERT INTO ubicacion (id_localidades, direccion, lugar_nacimiento)
             VALUES ($1, $2, $3)
             RETURNING id_ubicacion`, [id_localidades, direccion, lugar_nacimiento]);
        const id_ubicaciones = ubicacionResult.rows[0].id_ubicacion;
        // ============================
        // 5. USUARIO
        // ============================
        console.log("Inserting usuario"); // Added logging
        const usuarioResult = await client.query(`INSERT INTO usuario (
                id_ubicaciones, cedula, nombres, apellidos, correo, password, fecha_nacimiento, nro_tlf
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id_usuario`, [
            id_ubicaciones,
            cedula,
            nombres,
            apellidos,
            correo,
            password,
            fecha_nacimiento,
            nro_tlf
        ]);
        const id_usuario = usuarioResult.rows[0].id_usuario;
        await client.query("COMMIT");
        console.log("createUser completed successfully for user ID:", id_usuario);
        return {
            id_usuario,
            id_ubicaciones,
            estado,
            municipio,
            localidad
        };
    }
    catch (error) {
        console.error("Error in createUser:", error);
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function checkExistingUser(cedula) {
    const result = await database_1.default.query("SELECT id_usuario FROM usuario WHERE cedula = $1", [cedula]);
    return result.rows.length > 0;
}
async function getRoleId(roleName) {
    const result = await database_1.default.query("SELECT id_rol FROM roles WHERE nombre_rol = $1", [roleName]);
    return result.rows.length > 0 ? result.rows[0].id_rol : null;
}
async function assignUserRole(userId, roleId) {
    await database_1.default.query("INSERT INTO usuario_roles (usuarios_id, roles_id) VALUES ($1, $2)", [userId, roleId]);
}
async function deleteUser(userId) {
    await database_1.default.query("DELETE FROM usuario WHERE id_usuario = $1", [userId]);
}
//queries para gaurdar los datos de los diferentes roles
async function insertAlumnoDatos(userId, alumnoData) {
    await database_1.default.query("INSERT INTO Alumno_datos (id_alumnos, matricula, estatus, nacionalidad, instituto, instrumento_principal) VALUES ($1, $2, $3, $4, $5, $6)", [userId, alumnoData.matricula, alumnoData.estatus, alumnoData.nacionalidad, alumnoData.instituto, alumnoData.instrumento_principal]);
}
async function insertRepresentanteDatos(userId, representanteData) {
    await database_1.default.query("INSERT INTO Representante_datos (id_representantes, ocupacion, parentesco) VALUES ($1, $2, $3)", [userId, representanteData.ocupacion, representanteData.parentesco]);
}
async function insertProfesorDatos(userId, profesorData) {
    await database_1.default.query("INSERT INTO Profesor_datos (id_profesores, profesion, nacionalidad) VALUES ($1, $2, $3)", [userId, profesorData.profesion, profesorData.nacionalidad]);
}
async function insertAlumnoRepresentante(alumnoId, representantes) {
    for (const repId of representantes) {
        await database_1.default.query("INSERT INTO Alumno_Representante (alumnos_id, representantes_id) VALUES ($1, $2)", [alumnoId, repId]);
    }
}
//# sourceMappingURL=user.queries.js.map