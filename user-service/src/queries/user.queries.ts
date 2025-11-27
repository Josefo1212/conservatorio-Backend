import pool from "../config/database";

export async function createUser(data: any) {
    const client = await pool.connect();
    console.log("Starting createUser with data:", data);

    try {
        await client.query("BEGIN");

        const {
            cedula,
            nombres,
            apellidos,
            correo,
            password,
            fecha_nacimiento,
            nro_tlf,

            // ubicación
            estado,
            municipio,
            localidad,
            tipo_localidad,
            direccion,
            lugar_nacimiento

        } = data;

        // ============================
        // 1. ESTADO
        // ============================
        console.log("Processing estado:", estado);
        let estadoResult = await client.query(
            "SELECT id_estado FROM estado WHERE nombre_estado = $1",
            [estado]
        );

        if (estadoResult.rows.length === 0) {
            estadoResult = await client.query(
                "INSERT INTO estado (nombre_estado) VALUES ($1) RETURNING id_estado",
                [estado]
            );
        }

        const id_estado = estadoResult.rows[0].id_estado;

        // ============================
        // 2. MUNICIPIO
        // ============================
        console.log("Processing municipio:", municipio);
        let municipioResult = await client.query(
            "SELECT id_municipio FROM municipio WHERE nombre_municipio = $1 AND id_estados = $2",
            [municipio, id_estado]
        );

        if (municipioResult.rows.length === 0) {
            municipioResult = await client.query(
                "INSERT INTO municipio (id_estados, nombre_municipio) VALUES ($1, $2) RETURNING id_municipio",
                [id_estado, municipio]
            );
        }

        const id_municipio = municipioResult.rows[0].id_municipio;

        // ============================
        // 3. LOCALIDAD
        // ============================
        console.log("Processing localidad:", localidad);
        let localidadResult = await client.query(
            "SELECT id_localidad FROM localidad WHERE nombre_localidad = $1 AND id_municipios = $2 AND tipo = $3",
            [localidad, id_municipio, tipo_localidad]
        );

        if (localidadResult.rows.length === 0) {
            localidadResult = await client.query(
                "INSERT INTO localidad (id_municipios, nombre_localidad, tipo) VALUES ($1, $2, $3) RETURNING id_localidad",
                [id_municipio, localidad, tipo_localidad]
            );
        }

        const id_localidades = localidadResult.rows[0].id_localidad;

        // ============================
        // 4. UBICACION
        // ============================
        console.log("Inserting ubicacion");
        const ubicacionResult = await client.query(
            `INSERT INTO ubicacion (id_localidades, direccion, lugar_nacimiento)
             VALUES ($1, $2, $3)
             RETURNING id_ubicacion`,
            [id_localidades, direccion, lugar_nacimiento]
        );

        const id_ubicaciones = ubicacionResult.rows[0].id_ubicacion;

        // ============================
        // 5. USUARIO
        // ============================
        console.log("Inserting usuario"); // Added logging
        const usuarioResult = await client.query(
            `INSERT INTO usuario (
                id_ubicaciones, cedula, nombres, apellidos, correo, password, fecha_nacimiento, nro_tlf
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id_usuario`,
            [
                id_ubicaciones,
                cedula,
                nombres,
                apellidos,
                correo,
                password,
                fecha_nacimiento,
                nro_tlf
            ]
        );

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

    } catch (error) {
        console.error("Error in createUser:", error);
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function checkExistingUser(cedula: string) {
    const result = await pool.query(
        "SELECT id_usuario FROM usuario WHERE cedula = $1",
        [cedula]
    );
    return result.rows.length > 0;
}

export async function getRoleId(roleName: string) {
    const result = await pool.query("SELECT id_rol FROM roles WHERE nombre_rol = $1", [roleName]);
    return result.rows.length > 0 ? result.rows[0].id_rol : null;
}

export async function assignUserRole(userId: number, roleId: number) {
    await pool.query("INSERT INTO usuario_roles (usuarios_id, roles_id) VALUES ($1, $2)", [userId, roleId]);
}

export async function deleteUser(userId: number) {
    await pool.query("DELETE FROM usuario WHERE id_usuario = $1", [userId]);
}
//queries para gaurdar los datos de los diferentes roles
export async function insertAlumnoDatos(userId: number, alumnoData: { matricula: string; estatus: string; nacionalidad: string; instituto: string; instrumento_principal: string }) {
    await pool.query(
        "INSERT INTO Alumno_datos (id_alumnos, matricula, estatus, nacionalidad, instituto, instrumento_principal) VALUES ($1, $2, $3, $4, $5, $6)",
        [userId, alumnoData.matricula, alumnoData.estatus, alumnoData.nacionalidad, alumnoData.instituto, alumnoData.instrumento_principal]
    );
}

export async function insertRepresentanteDatos(userId: number, representanteData: { ocupacion: string; parentesco: string }) {
    await pool.query(
        "INSERT INTO Representante_datos (id_representantes, ocupacion, parentesco) VALUES ($1, $2, $3)",
        [userId, representanteData.ocupacion, representanteData.parentesco]
    );
}

export async function insertProfesorDatos(userId: number, profesorData: { profesion: string; nacionalidad: string }) {
    await pool.query(
        "INSERT INTO Profesor_datos (id_profesores, profesion, nacionalidad) VALUES ($1, $2, $3)",
        [userId, profesorData.profesion, profesorData.nacionalidad]
    );
}

export async function insertAlumnoRepresentante(alumnoId: number, representantes: number[]) {
    for (const repId of representantes) {
        await pool.query(
            "INSERT INTO Alumno_Representante (alumnos_id, representantes_id) VALUES ($1, $2)",
            [alumnoId, repId]
        );
    }
}

export async function getUserById(id: number) {
    const result = await pool.query(`
        SELECT u.*, e.nombre_estado, m.nombre_municipio, l.nombre_localidad, l.tipo as tipo_localidad, ub.direccion, ub.lugar_nacimiento, r.nombre_rol
        FROM usuario u
        JOIN ubicacion ub ON u.id_ubicaciones = ub.id_ubicacion
        JOIN localidad l ON ub.id_localidades = l.id_localidad
        JOIN municipio m ON l.id_municipios = m.id_municipio
        JOIN estado e ON m.id_estados = e.id_estado
        LEFT JOIN usuario_roles ur ON u.id_usuario = ur.usuarios_id
        LEFT JOIN roles r ON ur.roles_id = r.id_rol
        WHERE u.id_usuario = $1
    `, [id]);
    return result.rows[0];
}

export async function updateUser(id: number, updates: any) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        // Actualizar usuario (campos básicos)
        const userFields = ['nombres', 'apellidos', 'correo', 'fecha_nacimiento', 'nro_tlf'];
        const setParts = userFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = userFields.map(field => updates[field]).filter(val => val !== undefined);
        if (values.length > 0) {
            await client.query(`UPDATE usuario SET ${setParts} WHERE id_usuario = $1`, [id, ...values]);
        }
        // Actualizar ubicación si se proporciona
        if (updates.direccion || updates.lugar_nacimiento) {
            await client.query(`UPDATE ubicacion SET direccion = $1, lugar_nacimiento = $2 WHERE id_ubicacion = (SELECT id_ubicaciones FROM usuario WHERE id_usuario = $3)`, [updates.direccion, updates.lugar_nacimiento, id]);
        }
        await client.query("COMMIT");
        return { message: 'User updated successfully' };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function updateUserRole(userId: number, roleName: string) {
    const roleId = await getRoleId(roleName);
    if (!roleId) throw new Error('Role not found');
    await pool.query('DELETE FROM usuario_roles WHERE usuarios_id = $1', [userId]);
    await assignUserRole(userId, roleId);
}
