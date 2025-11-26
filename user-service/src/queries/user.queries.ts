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
