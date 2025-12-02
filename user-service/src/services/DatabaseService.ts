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

    public async connect(): Promise<void> {
        const client = await this.pool.connect();
        client.release();
    }

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

    public async query(queryText: string, params: any[] = []): Promise<QueryResult> {
        if (!queryText) {
            throw new Error('Query text is empty or undefined.');
        }
        const result = await this.pool.query(queryText, params);
        return result;
    }

    public async transaction<T>(callback: (query: (queryText: string, params?: any[]) => Promise<QueryResult>) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const queryWrapper = async (queryText: string, params: any[] = []) => client.query(queryText, params);
            const result = await callback(queryWrapper);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

const config: PoolConfig = {
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`,
};


