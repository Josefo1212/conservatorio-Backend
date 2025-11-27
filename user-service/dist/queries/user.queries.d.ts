export declare function createUser(data: any): Promise<{
    id_usuario: any;
    id_ubicaciones: any;
    estado: any;
    municipio: any;
    localidad: any;
}>;
export declare function checkExistingUser(cedula: string): Promise<boolean>;
export declare function getRoleId(roleName: string): Promise<any>;
export declare function assignUserRole(userId: number, roleId: number): Promise<void>;
export declare function deleteUser(userId: number): Promise<void>;
export declare function insertAlumnoDatos(userId: number, alumnoData: {
    matricula: string;
    estatus: string;
    nacionalidad: string;
    instituto: string;
    instrumento_principal: string;
}): Promise<void>;
export declare function insertRepresentanteDatos(userId: number, representanteData: {
    ocupacion: string;
    parentesco: string;
}): Promise<void>;
export declare function insertProfesorDatos(userId: number, profesorData: {
    profesion: string;
    nacionalidad: string;
}): Promise<void>;
export declare function insertAlumnoRepresentante(alumnoId: number, representantes: number[]): Promise<void>;
export declare function getUserById(id: number): Promise<any>;
export declare function updateUser(id: number, updates: any): Promise<{
    message: string;
}>;
export declare function updateUserRole(userId: number, roleName: string): Promise<void>;
//# sourceMappingURL=user.queries.d.ts.map