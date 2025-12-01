import { Pool, QueryResult, PoolConfig } from 'pg';
export declare class DatabaseService {
    private pool;
    queries: Record<string, any>;
    constructor(config: PoolConfig);
    getPool(): Pool;
    connect(): Promise<void>;
    loadQueries(filePath: string, namespace?: string): void;
    query(queryText: string, params?: any[]): Promise<QueryResult>;
    transaction<T>(callback: (query: (queryText: string, params?: any[]) => Promise<QueryResult>) => Promise<T>): Promise<T>;
}
//# sourceMappingURL=DatabaseService.d.ts.map