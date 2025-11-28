import { Pool, QueryResult, PoolConfig } from 'pg';
export declare class DatabaseService {
    private pool;
    queries: Record<string, any>;
    constructor(config: PoolConfig);
    getPool(): Pool;
    /**
     * Verifica la conexión a la base de datos.
     */
    connect(): Promise<void>;
    /**
     * Carga queries desde un archivo JSON.
     * El archivo debe contener un objeto donde las claves son los nombres de las queries
     * y los valores son las strings SQL.
     * @param filePath Ruta al archivo JSON (relativa o absoluta)
     * @param namespace Opcional: nombre del namespace bajo el cual guardar las queries (ej: 'auth')
     */
    loadQueries(filePath: string, namespace?: string): void;
    /**
     * Ejecuta una query contra la base de datos.
     * @param queryText String SQL directo.
     * @param params Parámetros para la query.
     */
    query(queryText: string, params?: any[]): Promise<QueryResult>;
    /**
     * Ejecuta una serie de operaciones dentro de una transacción.
     * @param callback Función que recibe un ejecutor de queries transaccional.
     */
    transaction<T>(callback: (query: (queryText: string, params?: any[]) => Promise<QueryResult>) => Promise<T>): Promise<T>;
}
//# sourceMappingURL=DatabaseService.d.ts.map