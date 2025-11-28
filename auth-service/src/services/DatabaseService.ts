import { Pool, QueryResult, PoolConfig, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';

export class DatabaseService {
    private pool: Pool;
    public queries: Record<string, any>;

    constructor(config: PoolConfig) {
        this.pool = new Pool(config);
        this.queries = {};
    }

    public getPool(): Pool {
        return this.pool;
    }

    /**
     * Verifica la conexión a la base de datos.
     */
    public async connect(): Promise<void> {
        const client = await this.pool.connect();
        client.release();
    }

    /**
     * Carga queries desde un archivo JSON.
     * El archivo debe contener un objeto donde las claves son los nombres de las queries
     * y los valores son las strings SQL.
     * @param filePath Ruta al archivo JSON (relativa o absoluta)
     * @param namespace Opcional: nombre del namespace bajo el cual guardar las queries (ej: 'auth')
     */
    public loadQueries(filePath: string, namespace?: string): void {
        try {
            const absolutePath = path.isAbsolute(filePath) 
                ? filePath 
                : path.resolve(process.cwd(), filePath);
            
            if (!fs.existsSync(absolutePath)) {
                console.warn(`Query file not found: ${absolutePath}`);
                return;
            }

            const fileContent = fs.readFileSync(absolutePath, 'utf-8');
            const queriesObj = JSON.parse(fileContent);
            
            if (namespace) {
                if (!this.queries[namespace]) {
                    this.queries[namespace] = {};
                }
                Object.assign(this.queries[namespace], queriesObj);
            } else {
                Object.assign(this.queries, queriesObj);
            }
            
            console.log(`Queries loaded from ${filePath} ${namespace ? `into namespace '${namespace}'` : ''}`);
        } catch (error) {
            console.error(`Error loading queries from ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Ejecuta una query contra la base de datos.
     * @param queryText String SQL directo.
     * @param params Parámetros para la query.
     */
    public async query(queryText: string, params: any[] = []): Promise<QueryResult> {
        if (!queryText) {
            throw new Error('Query text is empty or undefined.');
        }

        try {
            const start = Date.now();
            const result = await this.pool.query(queryText, params);
            const duration = Date.now() - start;
            return result;
        } catch (error) {
            console.error(`Error executing query`, error);
            throw error;
        }
    }

    /**
     * Ejecuta una serie de operaciones dentro de una transacción.
     * @param callback Función que recibe un ejecutor de queries transaccional.
     */
    public async transaction<T>(callback: (query: (queryText: string, params?: any[]) => Promise<QueryResult>) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            const queryWrapper = async (queryText: string, params: any[] = []) => {
                 if (!queryText) throw new Error('Query text is empty');
                 const start = Date.now();
                 const result = await client.query(queryText, params);
                 // console.log(`Transaction query executed (${Date.now() - start}ms)`);
                 return result;
            };

            const result = await callback(queryWrapper);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Transaction failed, rolled back.', e);
            throw e;
        } finally {
            client.release();
        }
    }
}
