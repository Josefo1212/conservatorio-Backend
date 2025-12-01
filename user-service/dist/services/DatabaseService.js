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
    async connect() {
        const client = await this.pool.connect();
        client.release();
    }
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
    async query(queryText, params = []) {
        if (!queryText) {
            throw new Error('Query text is empty or undefined.');
        }
        const result = await this.pool.query(queryText, params);
        return result;
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const queryWrapper = async (queryText, params = []) => client.query(queryText, params);
            const result = await callback(queryWrapper);
            await client.query('COMMIT');
            return result;
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
}
exports.DatabaseService = DatabaseService;
const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};
//# sourceMappingURL=DatabaseService.js.map