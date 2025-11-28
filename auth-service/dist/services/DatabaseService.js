"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class DatabaseService {
    pool;
    queries;
    constructor(config) {
        this.pool = new pg_1.Pool(config);
        this.queries = {};
    }
    getPool() {
        return this.pool;
    }
    /**
     * Verifica la conexión a la base de datos.
     */
    async connect() {
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
    loadQueries(filePath, namespace) {
        try {
            const absolutePath = path_1.default.isAbsolute(filePath)
                ? filePath
                : path_1.default.resolve(process.cwd(), filePath);
            if (!fs_1.default.existsSync(absolutePath)) {
                console.warn(`Query file not found: ${absolutePath}`);
                return;
            }
            const fileContent = fs_1.default.readFileSync(absolutePath, 'utf-8');
            const queriesObj = JSON.parse(fileContent);
            if (namespace) {
                if (!this.queries[namespace]) {
                    this.queries[namespace] = {};
                }
                Object.assign(this.queries[namespace], queriesObj);
            }
            else {
                Object.assign(this.queries, queriesObj);
            }
            console.log(`Queries loaded from ${filePath} ${namespace ? `into namespace '${namespace}'` : ''}`);
        }
        catch (error) {
            console.error(`Error loading queries from ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Ejecuta una query contra la base de datos.
     * @param queryText String SQL directo.
     * @param params Parámetros para la query.
     */
    async query(queryText, params = []) {
        if (!queryText) {
            throw new Error('Query text is empty or undefined.');
        }
        try {
            const start = Date.now();
            const result = await this.pool.query(queryText, params);
            const duration = Date.now() - start;
            return result;
        }
        catch (error) {
            console.error(`Error executing query`, error);
            throw error;
        }
    }
    /**
     * Ejecuta una serie de operaciones dentro de una transacción.
     * @param callback Función que recibe un ejecutor de queries transaccional.
     */
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const queryWrapper = async (queryText, params = []) => {
                if (!queryText)
                    throw new Error('Query text is empty');
                const start = Date.now();
                const result = await client.query(queryText, params);
                // console.log(`Transaction query executed (${Date.now() - start}ms)`);
                return result;
            };
            const result = await callback(queryWrapper);
            await client.query('COMMIT');
            return result;
        }
        catch (e) {
            await client.query('ROLLBACK');
            console.error('Transaction failed, rolled back.', e);
            throw e;
        }
        finally {
            client.release();
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map