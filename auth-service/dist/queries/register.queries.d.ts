export interface RegisterPayload {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    password: string;
    fecha_nacimiento: string;
    nro_tlf: string;
    estado: string;
    municipio: string;
    localidad: string;
    tipo_localidad: string;
    direccion: string;
    lugar_nacimiento: string;
    role: string;
    alumnoData?: {
        matricula: string;
        estatus: string;
        nacionalidad: string;
        instituto: string;
        instrumento_principal: string;
    };
    representanteData?: {
        ocupacion: string;
        parentesco: string;
    };
    profesorData?: {
        profesion: string;
        nacionalidad: string;
    };
    representantes?: number[];
}
export declare function registerUser(payload: RegisterPayload): Promise<{
    id_usuario: number;
}>;
//# sourceMappingURL=register.queries.d.ts.map