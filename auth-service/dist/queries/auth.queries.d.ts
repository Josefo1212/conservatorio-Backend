export declare function getUserByCedula(cedula: string): Promise<import("pg").QueryResult<any>>;
export declare function insertSession(idUsuario: number, ipOrigen: string, refreshToken: string, refreshExp: Date): Promise<import("pg").QueryResult<any>>;
export declare function updateSessionLogout(idSesion: number): Promise<import("pg").QueryResult<any>>;
export declare function getSessionByRefreshToken(refreshToken: string): Promise<import("pg").QueryResult<any>>;
export declare function getUserById(idUsuario: number): Promise<import("pg").QueryResult<any>>;
export declare function getUserRole(userId: number): Promise<any>;
//# sourceMappingURL=auth.queries.d.ts.map